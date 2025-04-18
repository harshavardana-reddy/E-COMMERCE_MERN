const productModel = require("../models/Product");
const userModel = require("../models/User");
const orderModel = require("../models/Order");
const paymentModel = require("../models/Payment");
const sellerModel = require("../models/Seller");
const cartModel = require("../models/Cart");
const logisticModel = require("../models/Logistic");
const {
  razorpay,
  generateOrder,
  verifySignature,
} = require("../utils/razorpay/razorpay");

const getProducts = async (req,res) => {
    try {
        const products = await productModel.find({},{__v:0,_id:0});
        return res.status(200).json({
            success: true,
            message: 'Products fetched successfully',
            data: products,
        });
    } catch (error) {
        console.error('Error :', error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'+error.message
        });
    }
}

const getProduct = async (req, res) => {
  const productId = req.params.id;
  // console.log(productId)
  try {
    const product = await productModel.findOne({ productId: productId });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json({
      message: "Product found",
      product: product,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getSeller = async (req, res) => {
  const sellerId = req.params.id;
  try {
    const seller = await sellerModel.findOne(
      { sellerId },
      { _id: 0, __v: 0, password: 0 }
    );
    return res.status(200).json({
      message: "Seller found",
      seller: seller,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const buyNow = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.params.id;

  try {
    // Validate inputs
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "Invalid product or quantity" });
    }

    // Get user and product details
    const user = await userModel.findOne({ userId });
    const product = await productModel.findOne({ productId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.productStatus !== "Available") {
      return res.status(400).json({ message: "Product is not available" });
    }
    // Note: You might want to add stock management in your product schema
    // Currently using productStatus as availability indicator

    // Calculate total amount
    const totalAmount = product.productPrice * quantity;

    // Create Razorpay order
    const razorpayOrder = await generateOrder(totalAmount);

    // Create order in database (status will be Pending until payment verification)
    const order = new orderModel({
      orderId: razorpayOrder.id,
      userId: user.userId,
      products: [
        {
          productId: product.productId,
          quantity,
          price: product.productPrice,
        },
      ],
      sellerId: product.sellerId,
      totalPrice: totalAmount,
      status: "Pending",
    });
    await order.save();

    // Update product status if needed (if you implement stock management)
    // await productModel.updateOne({ productId }, { $inc: { stock: -quantity } });

    // Return Razorpay order details to client
    res.status(200).json({
      message: "Order created successfully",
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
        productDetails: {
          name: product.productName,
          image: product.productImage,
          category: product.productCategory,
        },
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const buyFromCart = async (req, res) => {
  const userId = req.params.id;

  try {
    // Get user and their cart items
    const cartItems = await cartModel.find({ userId }).populate("productId");

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Validate cart items and calculate total amount
    let totalAmount = 0;
    const products = [];
    const sellerIds = new Set();
    const itemsToRemove = [];

    for (const item of cartItems) {
      const product = item.productId;
      if (!product) {
        itemsToRemove.push(item._id); // Remove invalid cart items
        continue;
      }

      if (product.productStatus !== "Available") {
        return res.status(400).json({
          message: `Product ${product.productName} is not available`,
          productId: product.productId,
        });
      }

      totalAmount += product.productPrice * item.quantity;
      products.push({
        productId: product.productId,
        quantity: item.quantity,
        price: product.productPrice,
      });

      sellerIds.add(product.sellerId);
      itemsToRemove.push(item._id);
    }

    // For simplicity, assuming all products are from same seller
    if (sellerIds.size > 1) {
      return res.status(400).json({
        message: "All items in cart must be from the same seller",
      });
    }

    // Create Razorpay order
    const razorpayOrder = await generateOrder(totalAmount);

    // Create order in database
    const order = new orderModel({
      orderId: razorpayOrder.id,
      userId: userId,
      products: products,
      sellerId: Array.from(sellerIds)[0],
      totalPrice: totalAmount,
      status: "Pending",
    });
    await order.save();

    // Remove purchased items from cart
    await cartModel.deleteMany({ _id: { $in: itemsToRemove } });

    // Return Razorpay order details to client
    res.status(200).json({
      message: "Order created successfully",
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
        productCount: products.length,
      },
      cartItemsRemoved: itemsToRemove.length,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Updated verifyOrderPayment to work with product schema
const verifyOrderPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  try {
    // Verify payment
    const isValid = verifyPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Update order status
    const order = await orderModel.findOneAndUpdate(
      { orderId: razorpay_order_id },
      { status: "Shipped" },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Create payment record
    const payment = new paymentModel({
      userId: order.userId,
      orderId: order._id,
      amount: order.totalPrice,
      transactionId: razorpay_payment_id,
      paymentMethod: "Razorpay",
      status: "Completed",
    });
    await payment.save();

    // Update product statuses (if you implement stock management)
    // const bulkOps = order.products.map(product => ({
    //     updateOne: {
    //         filter: { productId: product.productId },
    //         update: { $inc: { stock: -product.quantity } }
    //     }
    // }));
    // await productModel.bulkWrite(bulkOps);

    res.status(200).json({
      message: "Payment verified successfully",
      order,
      payment,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const addToCart = async (req, res) => {
  const { userId } = req.params;
  const { productId, quantity } = req.body;
  // console.log(userId)
  try {
    // Validate input
    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid product or quantity" });
    }

    // Get product details
    const product = await productModel.findOne({ productId });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.productStatus !== "Available") {
      return res.status(400).json({ message: "Product is not available" });
    }

    // Find or create cart for user
    let cart = await cartModel.findOne({ userId: userId });

    if (!cart) {
      cart = new cartModel({
        userId,
        items: [],
      });
    }

    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );

    if (existingItemIndex > -1) {
      // Return error if product already in cart
      return res.status(400).json({
        success: false,
        message: "Product is already in your cart",
        cart: {
          userId: cart.userId,
          itemCount: cart.items.length,
          totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        },
      });
    } else {
      // Add new item to cart
      cart.items.push({
        productId,
        quantity,
        price: product.productPrice,
        name: product.productName, // Adding product name might be useful
        image: product.productImage, // Adding first image if available
      });
    }

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      cart: {
        userId: cart.userId,
        itemCount: cart.items.length,
        totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const fetchCart = async (req, res) => {
  const { userId } = req.params;

  try {
    const cart = await cartModel.findOne({ userId: userId });
    if (!cart || cart.items.length === 0) {
      return res.status(200).json({
        message: "Your cart is empty",
        cart: {
          userId,
          items: [],
          total: 0,
        },
      });
    }

    // Calculate cart total and validate availability
    let cartTotal = 0;
    const validItems = [];
    const outOfStockItems = [];

    for (const item of cart.items) {
      // console.log(item)
      const product = item.productId;
      const fetchProduct = await productModel.findOne({ productId: product });
      // console.log(product)
      console.log(product);
      if (product && fetchProduct.productStatus === "Available") {
        cartTotal += product.productPrice * item.quantity;
        validItems.push({
          productId: fetchProduct.productId,
          name: fetchProduct.productName,
          price: fetchProduct.productPrice,
          image: fetchProduct.productImage,
          quantity: item.quantity,
          itemTotal: fetchProduct.productPrice * item.quantity,
        });
      } else {
        outOfStockItems.push(item.productId);
      }
    }

    // Return response with cart details
    // console.log(cart)
    // console.log(validItems)
    return res.status(200).json({
      message: "Cart retrieved successfully",
      cart: {
        userId: cart.userId,
        items: validItems,
        itemCount: validItems.length,
        total: cartTotal,
        outOfStockItems:
          outOfStockItems.length > 0 ? outOfStockItems : undefined,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Additional useful methods

const updateCartItem = async (req, res) => {
  const { userId, productId } = req.params;
  const { quantity } = req.body;

  try {
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const cart = await cartModel.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    return res.status(200).json({
      message: "Cart item updated successfully",
      updatedItem: {
        productId,
        quantity,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const removeFromCart = async (req, res) => {
  const { userId, productId } = req.params;

  try {
    const cart = await cartModel.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter((item) => item.productId !== productId);

    if (cart.items.length === initialLength) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    await cart.save();

    return res.status(200).json({
      message: "Item removed from cart successfully",
      remainingItems: cart.items.length,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const paymentController = {
  /**
   * Create a Razorpay order and initialize payment
   */
  initiatePayment: async (req, res) => {
    const { userId, products, totalPrice } = req.body;

    try {
      // Validate required fields
      if (!totalPrice || !userId || !products || !Array.isArray(products)) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields or invalid products array",
        });
      }

      // Validate each product
      for (const product of products) {
        if (!product.productId || !product.quantity || !product.price) {
          return res.status(400).json({
            success: false,
            message: "Each product must have productId, quantity, and price",
          });
        }
      }

      // Get seller ID from the first product
      const firstProduct = await productModel.findOne({
        productId: products[0].productId,
      });
      if (!firstProduct) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Create Razorpay order (amount in paise)
      const razorpayOrder = await generateOrder(totalPrice);

      // Create order in database
      const order = new orderModel({
        orderId: razorpayOrder.id, // Razorpay order ID
        userId,
        products: products.map((p) => ({
          productId: p.productId,
          quantity: p.quantity,
          price: p.price,
        })),
        sellerId: firstProduct.sellerId,
        totalPrice,
        status: "Pending",
      });
      await order.save();
      console.log(order, razorpayOrder);
      res.status(200).json({
        order: razorpayOrder,
        dbOrder: order, // The order you saved in MongoDB
      });
    } catch (error) {
      console.error("Payment initiation error:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },

  /**
   * Verify Razorpay payment and update order status
   */
  verifyPayment: async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    console.log("Verification request received:", {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      signature: razorpay_signature ? "present" : "missing",
    });

    try {
      // Validate required fields
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: "Missing required Razorpay verification fields",
        });
      }

      // Verify payment signature
      const isValid = verifySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );

      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment signature",
        });
      }

      // Find and update the order
      const order = await orderModel.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { status: "Confirmed" },
        { new: true }
      );

      if (!order) {
        return res.status(404).json({
          success: false,
          message: `Order not found with ID: ${razorpay_order_id}`,
        });
      }

      // Create payment record
      const payment = await paymentModel.create({
        userId: order.userId,
        orderId: order._id,
        amount: order.totalPrice,
        transactionId: razorpay_payment_id,
        paymentMethod: "Razorpay",
        status: "Completed",
      });

      res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        paymentId: payment._id,
        orderId: order._id,
      });
    } catch (error) {
      console.error("Payment verification error:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },

  /**
   * Handle payment failure
   */
  handlePaymentFailure: async (req, res) => {
    const { razorpay_order_id, error } = req.body;

    try {
      const order = await orderModel.findOneAndUpdate(
        { orderId: razorpay_order_id },
        {
          status: "Cancelled",
          cancellationReason: error?.description || "Payment failed",
        },
        { new: true }
      );

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Order cancelled due to payment failure",
        orderId: order._id,
        reason: error?.description,
      });
    } catch (err) {
      console.error("Payment failure handling error:", err);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: err.message,
      });
    }
  },
};

const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
        success: false,
      });
    }

    // Find and delete the cart
    const result = await cartModel.findOneAndDelete({ userId });

    if (!result) {
      return res.status(404).json({
        message: "Cart not found or already empty",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Cart cleared successfully",
      success: true,
      deletedCount: result.items ? result.items.length : 0,
    });
  } catch (error) {
    console.error("Error clearing cart:", error.message);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      success: false,
    });
  }
};

const makeCOD = async (req, res) => {
  try {
    const { userId, products, sellerId, totalPrice } = req.body;

    // Validate required fields
    if (
      !userId ||
      !products ||
      !Array.isArray(products) ||
      !sellerId ||
      !totalPrice
    ) {
      return res.status(400).json({
        message: "Missing required fields",
        success: false,
      });
    }

    // Validate each product in the array
    for (const product of products) {
      if (!product.productId || !product.quantity || !product.price) {
        return res.status(400).json({
          message: "Each product must have productId, quantity, and price",
          success: false,
        });
      }
    }

    // Generate a unique order ID for COD
    const codOrderId = `COD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create order in database with COD status
    const order = new orderModel({
      orderId: codOrderId,
      userId: userId,
      products: products,
      sellerId: sellerId,
      totalPrice: totalPrice,
      status: "Confirmed", // Or 'Confirmed' depending on your workflow
      paymentMethod: "COD",
    });

    await order.save();

    // If this was from cart, you might want to clear the cart here
    // await cartModel.findOneAndDelete({ userId });

    return res.status(200).json({
      message: "COD order created successfully",
      success: true,
      order: {
        orderId: order.orderId,
        status: order.status,
        totalPrice: order.totalPrice,
        products: order.products,
      },
    });
  } catch (error) {
    console.error("Error creating COD order:", error.message);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      success: false,
    });
  }
};

const getOrders = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Validate userId
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        // Check if user exists
        const user = await userModel.findOne({ userId });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Find all orders for the user and populate product details
        const orders = await orderModel.find({ userId })
            .populate({
                path: 'products.productId',
                model: 'Product',
                select: 'productName productDescription productImage',
                localField: 'products.productId',
                foreignField: 'productId',
                justOne: true
            })
        
            .populate({
                path: 'sellerId',
                model: 'Seller',
                select: 'sellerName sellerEmail',
                localField: 'sellerId',
                foreignField: 'sellerId',
                justOne: true
            })
            
            .sort({ createdAt: -1 }); // Sort by most recent first

        // Get payment details for each order
        const ordersWithPayments = await Promise.all(orders.map(async (order) => {
            const payment = await paymentModel.findOne({ orderId: order._id });
            return {
                ...order.toObject(),
                payment
            };
        }));

        return res.status(200).json({
            success: true,
            message: "Orders fetched successfully",
            data: ordersWithPayments
        });

    } catch (error) {
        console.error("Error fetching orders:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
const getOrderById = async (req, res) => {
    try {
        // const { userId } = req.params;
        const { orderId } = req.params;

        // Validate orderId
        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required"
            });
        }

        // Find the order and populate all necessary details
        const order = await orderModel.findOne({ orderId })
            .populate({
                path: 'products.productId',
                model: 'Product',
                select: 'name description images category' // Include relevant product fields
            })
            .populate({
                path: 'sellerId',
                model: 'Seller',
                select: 'sellerName sellerEmail sellerPhone sellerAddress' // Include relevant seller fields
            });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Get payment details for this order
        const payment = await paymentModel.findOne({ orderId });

        // Combine order and payment data
        const orderDetails = {
            ...order.toObject(),
            payment
        };

        return res.status(200).json({
            success: true,
            message: "Order fetched successfully",
            data: orderDetails
        });

    } catch (error) {
        console.error("Error fetching order:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

const getLogisticDetails = async (req, res) => {
    try {
        const { orderId } = req.params;
        
        // Find the logistic record for this order
        const log = await logisticModel.findOne({ orderId: orderId });
        
        if (!log) {
            return res.status(404).json({
                success: false,
                message: "Logistic record not found"
            });
        }
        
        return res.status(200).json({
            success: true,
            message: "Logistic details fetched successfully",
            logisticDetails: log
        });
        
    } catch (error) {
        console.error("Error fetching logistic details: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

const updateProfile = async (req, res) => {
  try {
      const { userId } = req.params;
      const updates = req.body;
      
      // // Validate if there are updates
      if (!updates || Object.keys(updates).length === 0) {
          return res.status(400).json({
              success: false,
              message: "No updates provided"
          });
      }

      // List of allowed fields to update
      // const allowedUpdates = [
      //     'userName',
      //     'userEmail',
      //     'userPhone',
      //     'userGender',
      //     'userAddress',
      //     'userCity',
      //     'userState',
      //     'userCountry',
      //     'password',
      //     'userImage'
      // ];
      // console.log(req.body)
      // Check if any invalid field is being updated
      // const isValidOperation = Object.keys(updates).every(update => 
      //     allowedUpdates.includes(update)
      // );

      // if (!isValidOperation) {
      //     return res.status(400).json({
      //         success: false,
      //         message: "Invalid updates!",
      //         allowedUpdates: allowedUpdates
      //     });
      // }

      // Find and update the user
      const user = await userModel.findOneAndUpdate(
          { userId: userId },
          updates,
          { new: true, runValidators: true }
      );

      if (!user) {
          return res.status(404).json({
              success: false,
              message: "User not found"
          });
      }

      // Return updated user (you might want to omit sensitive data like password)
      const userObject = user.toObject();
      delete userObject.password;
      delete userObject._id;
      delete userObject.__v;

      res.status(200).json({
          success: true,
          message: "Profile updated successfully",
          user: userObject
      });

  } catch (error) {
      console.error("Error updating profile:", error);
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
          const errors = Object.values(error.errors).map(err => err.message);
          return res.status(400).json({
              success: false,
              message: "Validation error",
              errors: errors
          });
      }

      // Handle duplicate key error (for unique fields like userId or email)
      if (error.code === 11000) {
          return res.status(400).json({
              success: false,
              message: "Duplicate field value entered",
              field: Object.keys(error.keyPattern)[0]
          });
      }

      res.status(500).json({
          success: false,
          message: "Internal server error",
          error: error.message
      });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { oldPassword, newPassword } = req.body;

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    const user = await userModel.findOne( { userId:userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Compare old password (you should use bcrypt.compare in a real app)
    if (user.password !== oldPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid current password"
      });
    }

    // Update password (in a real app, you should hash the new password)
    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully!"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

const getUserDashboardStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get order stats
    const orders = await orderModel.find({ userId });
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Confirmed').length;
    const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;

    // Get cart items count
    const cart = await cartModel.findOne({ userId });
    const cartItems = cart ? cart.items.length : 0;

    // Get total spending
    const payments = await paymentModel.find({ userId });
    const totalSpending = payments.reduce((sum, payment) => sum + payment.amount, 0);

    // Get monthly spending data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySpending = await paymentModel.aggregate([
      {
        $match: {
          userId,
          paymentDate: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { $month: "$paymentDate" },
          total: { $sum: "$amount" }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    // Get spending by category
    const spendingByCategory = await orderModel.aggregate([
      { $match: { userId: userId } },
      { $unwind: "$products" },
      {
        $lookup: {
          from: "product_table", // Use your actual collection name
          localField: "products.productId",
          foreignField: "productId",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails.productCategory",
          total: { 
            $sum: { 
              $multiply: ["$products.quantity", "$products.price"] 
            } 
          }
        }
      }
    ]);

    // Get recent orders
    const recentOrders = await orderModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: 'products.productId',
                model: 'Product',
                select: 'productName productDescription',
                localField: 'products.productId',
                foreignField: 'productId',
                justOne: true
      });

    // Get recommended products (in a real app, this would be based on user behavior)
    const recommendedProducts = await productModel.aggregate([
      { $sample: { size: 4 } },
      { $project: { 
        productId: 1,
        productName: 1,
        productPrice: 1,
        productImage: 1,
        productRating: 1
      }}
    ]);

    res.status(200).json({
      stats: {
        totalOrders,
        pendingOrders,
        deliveredOrders,
        cartItems,
        wishlistItems: 0, // You would implement wishlist functionality separately
        totalSpending
      },
      charts: {
        monthlySpending,
        spendingByCategory
      },
      recentOrders,
      recommendedProducts
    });

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  buyNow,
  buyFromCart,
  verifyOrderPayment,
  getProduct,
  getSeller,
  addToCart,
  fetchCart,
  updateCartItem,
  removeFromCart,
  paymentController,
  makeCOD,
  clearCart,
  getOrders,
  getOrderById,
  getLogisticDetails,
  updateProfile,
  updatePassword,
  getUserDashboardStats,
  getProducts
};
