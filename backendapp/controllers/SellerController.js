const productModel = require('../models/Product');
const userModel = require('../models/User');
const orderModel = require('../models/Order');
const paymentModel = require('../models/Payment');
const sellerModel = require('../models/Seller');
const logisticModel = require('../models/Logistic');
const mongoose = require('mongoose');

const imageMimeTypes = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
};

const saveImage = async(image)=>{
    if(image === null) return;

    const img = JSON.parse(image);
    if(img && imageMimeTypes.includes(img.type)){
        const buffer = new Buffer.from(img.data, 'base64');
        return buffer;
    }
}

const addProduct = async(req,res)=>{
    const { productName,productPrice,productDescription,productCategory,sellerId,productImage,productImageType } = req.body;
    //console.log(req.body);
    // const productImage = await saveImage(req.body.productImage);
    

    if (!productName || !productPrice || !productDescription || !productCategory || !sellerId) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required',
        });
    }

    try {
        const existingProduct = await productModel.findOne({ productName:productName,sellerId:sellerId });

        if (existingProduct) {
            return res.status(409).json({
                success: false,
                message: 'Product already exists',
            });
        }

        const newProduct = new productModel({
            ...req.body,
            productImage,
            productImageType,
            _id: new mongoose.Types.ObjectId() // your custom ID if needed
        });
        console.log(newProduct);
        await newProduct.save();

        return res.status(201).json({
            success: true,
            message: 'Product added successfully',
    
        });
    } catch (error) {
        console.error('Error adding product: ', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error '+error.message
        });
    }
}

const getProducts = async(req,res)=>{
    const { id } = req.params;
    try {
        const products = await productModel.find({sellerId:id},{__v:0,_id:0});
        return res.status(200).json({
            success: true,
            message: 'Products fetched successfully',
            data: products,
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'+error.message
        });
    }
}

const updateProduct = async(req,res)=>{
    const { id } = req.params;
    const { productDescription,productPrice,productStatus } = req.body;
    if (!productDescription || !productPrice || !productStatus) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required',
        });
    }
    try {
        const product = await productModel.findOne({productId:id});

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        product.productDescription = productDescription;
        product.productPrice = productPrice;
        product.productStatus = productStatus;

        await product.save();

        return res.status(200).json({
            success: true,
            message: 'Product updated successfully',
        });
    } catch (error) {
        console.error('Error updating product:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'+error.message
        });
    }
}
const getOrders = async (req, res) => {
    try {
        const { sellerId } = req.params;
        
        // Validate userId
        if (!sellerId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        // Check if user exists
        const seller = await sellerModel.findOne({ sellerId });
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Find all orders for the user and populate product details
        const orders = await orderModel.find({ sellerId })
            .populate({
                path: 'products.productId',
                model: 'Product',
                select: 'productName productDescription productImage',
                localField: 'products.productId',
                foreignField: 'productId',
                justOne: true
            })
        
            .populate({
                path: 'userId',
                model: 'User',
                select: 'userName userEmail userPhone',
                localField: 'userId',
                foreignField: 'userId',
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

const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, sellerId, status, logisticName, trackingNumber } = req.body;

        if (!orderId || !sellerId || !status) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        const order = await orderModel.findOne({ orderId: orderId, sellerId: sellerId });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "No Order Found"
            });
        }

        // If status is being updated to Shipped, create logistic entry
        if (status === "Shipped" && logisticName) {
            const logisticDetails = new logisticModel({
                orderId: orderId,
                logisticName: logisticName,
                trackingNumber: trackingNumber || "",
                logisticStatus: "Shipped"
            });
            await logisticDetails.save();
        }

        if(status === "Delivered"){
            const logisticDetails = await logisticModel.findOne({orderId:orderId});
            logisticDetails.logisticStatus = status;
            await logisticDetails.save();
        }

        if(status === "Cancelled"){
            const logisticDetails = await logisticModel.findOne({orderId:orderId});
            logisticDetails.logisticStatus = status;
            await logisticDetails.save();
        }

        order.status = status;
        await order.save();

        return res.status(200).json({
            success: true,
            message: "Status Updated Successfully!",
        });

    } catch (error) {
        console.error("Error ", error);
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


const updatePassword = async (req, res) => {
    try {
      const { sellerId } = req.params;
      const { oldPassword, newPassword } = req.body;
  
      // Validate password length
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters long"
        });
      }
  
      const user = await sellerModel.findOne( { sellerId:sellerId });
  
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  // Get dashboard statistics
  const getDashboardStats = async (req, res) => {
    try {
      const { sellerId } = req.params;
  
      // Validate sellerId
      if (!sellerId) {
        return res.status(400).json({
          success: false,
          message: "Seller ID is required"
        });
      }
  
      // Get current date and calculate 6 months ago
      const now = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 6);
  
      // Get counts in parallel for better performance
      const [
        totalProducts,
        totalOrders,
        pendingOrders,
        customers,
        payments,
        monthlySales,
        orderStatus,
        recentOrdersRaw,
        recentProducts
      ] = await Promise.all([
        productModel.countDocuments({ sellerId }),
        orderModel.countDocuments({ sellerId }),
        orderModel.countDocuments({ sellerId, status: 'Pending' }),
        orderModel.distinct('userId', { sellerId }),
        paymentModel.find({ 
          orderId: { $in: await orderModel.distinct('_id', { sellerId }) }
        }),
        // Monthly sales aggregation
        orderModel.aggregate([
          {
            $match: {
              sellerId,
              createdAt: { $gte: sixMonthsAgo },
              status: { $ne: 'Cancelled' }
            }
          },
          {
            $project: {
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" },
              totalPrice: 1
            }
          },
          {
            $group: {
              _id: {
                month: "$month",
                year: "$year"
              },
              total: { $sum: "$totalPrice" },
              count: { $sum: 1 }
            }
          },
          {
            $sort: { "_id.year": 1, "_id.month": 1 }
          }
        ]),
        // Order status aggregation
        orderModel.aggregate([
          {
            $match: { sellerId }
          },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 }
            }
          }
        ]),
        // Recent orders
        orderModel.find({ sellerId })
          .sort({ createdAt: -1 })
          .limit(5),
        // Recent products
        productModel.find({ sellerId })
          .sort({ createdAt: -1 })
          .limit(5)
      ]);
  
      // Calculate total revenue
      const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
  
      // Process recent orders with user names
      const userIds = recentOrdersRaw.map(order => order.userId);
      const usersMap = await userModel.find({ userId: { $in: userIds } })
        .select('userId userName')
        .then(users => {
          const map = {};
          users.forEach(user => {
            map[user.userId] = user.userName;
          });
          return map;
        });
  
      const recentOrders = recentOrdersRaw.map(order => ({
        ...order._doc,
        userName: usersMap[order.userId] || 'customer'
      }));
  
      // Format recent activities
      const recentActivities = [
        ...recentOrders.map(order => ({
          type: 'order',
          id: order.orderId,
          title: 'New order received',
          description: `Order #${order.orderId} placed by ${order.userName}`,
          date: order.createdAt,
          icon: 'shopping-bag'
        })),
        ...recentProducts.map(product => ({
          type: 'product',
          id: product.productId,
          title: 'Product added to inventory',
          description: `New product "${product.productName}" added to ${product.productCategory} category`,
          date: product.createdAt,
          icon: 'package'
        }))
      ].sort((a, b) => b.date - a.date).slice(0, 8);
  
      // Format monthly sales data for chart
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Create a map of all months in the last 6 months with their sales data
      const salesMap = {};
      monthlySales.forEach(sale => {
        const monthName = months[sale._id.month - 1];
        const key = `${sale._id.year}-${sale._id.month}`;
        salesMap[key] = {
          month: sale._id.month,
          year: sale._id.year,
          total: sale.total,
          monthName: monthName
        };
      });
  
      // Generate data for the last 6 months including current month
      const salesChartData = [];
      const labels = [];
      
      for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.getMonth() + 1; // JavaScript months are 0-indexed
        const year = date.getFullYear();
        const key = `${year}-${month}`;
        
        labels.unshift(months[month - 1]);
        salesChartData.unshift(salesMap[key]?.total || 0);
      }
  
      // Format order status for pie chart
      const statusChartData = {
        Delivered: 0,
        Shipped: 0,
        Pending: 0,
        Cancelled: 0
      };
      
      orderStatus.forEach(status => {
        statusChartData[status._id] = status.count;
      });
  
      return res.status(200).json({
        success: true,
        data: {
          stats: {
            totalUsers: customers.length,
            totalRevenue: formatCurrency(totalRevenue),
            totalRevenueRaw: totalRevenue,
            totalProducts,
            totalOrders,
            pendingOrders
          },
          charts: {
            sales: {
              labels: labels,
              data: salesChartData
            },
            orderStatus: statusChartData
          },
          recentActivities
        }
      });
  
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  };
  

module.exports = { addProduct, getProducts, updateProduct, getOrders, updateOrderStatus, getLogisticDetails, updatePassword,getDashboardStats };