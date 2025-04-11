const adminModel = require('../models/Admin');
const sellerModel = require('../models/Seller');
const userModel = require('../models/User');
const productModel = require('../models/Product');
const orderModel = require('../models/Order');
const paymentModel = require('../models/Payment');

const addSeller = async (req,res)=>{
    const { sellerEmail,sellerPhone,sellerAddress,sellerCity,sellerCountry,sellerName,sellerId,sellerState } = req.body;

    if ( !sellerEmail || !sellerAddress || !sellerCity || !sellerCountry || !sellerName || !sellerId || !sellerState || !sellerPhone) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required',
        });
    }

    try {
        const existingSeller = await sellerModel.findOne({ $or:[{sellerEmail:sellerEmail},{sellerPhone:sellerPhone}] });

        if (existingSeller) {
            return res.status(409).json({
                success: false,
                message: 'Seller Account already exists',
            });
        }

        const newSeller = new sellerModel(req.body);
        await newSeller.save();

        return res.status(201).json({
            success: true,
            message: 'Seller added successfully',
            data: newSeller,
        });
    } catch (error) {
        console.error('Error adding seller:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'+error.message
        });
    }
}

const getAllSellers = async (req,res)=>{
    try {
        const sellers = await sellerModel.find({},{__v:0,password:0,_id:0});
        return res.status(200).json({
            success: true,
            message: 'Sellers fetched successfully',
            data: sellers,
        });
    } catch (error) {
        console.error('Error fetching sellers:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'+error.message
        });
    }
}

const getAllUsers = async (req,res)=>{
    try {
        const users = await userModel.find({},{__v:0,password:0,_id:0});
        return res.status(200).json({
            success: true,
            message: 'Users fetched successfully',
            data: users,
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'+error.message
        });
    }
}

const updateSeller = async (req,res) => {
    try {
        const { id } = req.params;
        const existingSeller = await sellerModel.findOne({ sellerId:id });
        existingSeller.set(req.body);
        await existingSeller.save();
        return res.status(200).json({
            success: true,
            message: 'Seller updated successfully',
            data: existingSeller,
        });
    } catch (error) {
        console.error('Error :', error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'+error.message
        });
    }
}

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

const getPayments = async(req,res) => {
    try {
        const payments = await paymentModel.find({},{__v:0,_id:0});
        return res.status(200).json({
            success: true,
            message: 'Payments fetched successfully',
            data: payments,
        });
    } catch (error) {
        console.error('Error :', error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'+error.message
        });
    }
}

const getOrders = async (req,res) => {
    try {
        const orders = await orderModel.find({},{__v:0,_id:0});
        return res.status(200).json({
            success: true,
            message: 'Orders fetched successfully',
            data: orders,
        });
    } catch (error) {
        console.error('Error :', error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'+error.message
        });
    }
}

const getSellerByID = async (req,res) => {
    const { id } = req.params;
    try {
        const seller = await sellerModel.findOne({ sellerId:id },{__v:0,password:0,_id:0});
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found',
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Seller fetched successfully',
            data: seller,
        });
    } catch (error) {
        console.error('Error fetching seller:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'+error.message
        });
    }
}

const getDashboardStats = async (req, res) => {
    try {
      // Count all documents (using Promise.all for parallel execution)
      const [usersCount, sellersCount, ordersCount, paymentsCount] = await Promise.all([
        userModel.countDocuments(),
        sellerModel.countDocuments(),
        orderModel.countDocuments(),
        paymentModel.countDocuments(),
      ]);
  
      // Calculate total revenue
      const revenueResult = await paymentModel.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' }
          }
        }
      ]);
      const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
  
      // Get user growth data (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const userGrowth = await userModel.aggregate([
        {
          $match: {
            createdAt: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 6 }
      ]);
  
      // Get seller growth data (last 6 months)
      const sellerGrowth = await sellerModel.aggregate([
        {
          $match: {
            createdAt: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 6 }
      ]);
  
      // Get daily orders for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const dailyOrders = await orderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: {
              day: { $dayOfMonth: '$createdAt' },
              month: { $month: '$createdAt' },
              year: { $year: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]);
  
      // Get recent activities
      const recentOrders = await orderModel.find()
        .sort({ createdAt: -1 })
        .limit(2)
        .lean();
      
      // Manually populate user data for orders
      const orderUserIds = recentOrders.map(order => order.userId).filter(Boolean);
      const orderUsers = await userModel.find({ userId: { $in: orderUserIds } })
        .select('userName userEmail')
        .lean();
      
      const userMap = orderUsers.reduce((acc, user) => {
        acc[user.userId] = user; // Changed from _id to userId
        return acc;
      }, {});

      const populatedOrders = recentOrders.map(order => ({
        ...order,
        userId: userMap[order.userId] || null
      }));

      // Get recent payments with manual population
      const recentPayments = await paymentModel.find()
        .sort({ paymentDate: -1 })
        .limit(1)
        .lean();
      
      const paymentUserIds = recentPayments.map(payment => payment.userId).filter(Boolean);
      const paymentUsers = await userModel.find({ userId: { $in: paymentUserIds } })
        .select('userName')
        .lean();
      
      const paymentUserMap = paymentUsers.reduce((acc, user) => {
        acc[user.userId] = user; // Changed from _id to userId
        return acc;
      }, {});

      const populatedPayments = recentPayments.map(payment => ({
        ...payment,
        userId: paymentUserMap[payment.userId] || null
      }));

      const recentSellers = await sellerModel.find()
        .sort({ createdAt: -1 })
        .limit(1)
        .lean();
  
      const recentUsers = await userModel.find()
        .sort({ createdAt: -1 })
        .limit(1)
        .lean();
  
      // Format recent activities
      const recentActivities = [
        ...populatedOrders.map(order => ({
          type: 'order',
          title: 'New order received',
          description: `Order #${order.orderId} from ${order.userId?.userName || 'a customer'}`,
          time: order.createdAt,
          icon: '🛒',
          color: 'blue'
        })),
        ...populatedPayments.map(payment => ({
          type: 'payment',
          title: 'Payment processed',
          description: `Payment of $${payment.amount.toFixed(2)} for Order #${payment.orderId}`,
          time: payment.paymentDate,
          icon: '💳',
          color: 'green'
        })),
        ...recentSellers.map(seller => ({
          type: 'seller',
          title: 'New seller registered',
          description: `${seller.sellerName} joined as a new seller`,
          time: seller.createdAt,
          icon: '👤',
          color: 'purple'
        })),
        ...recentUsers.map(user => ({
          type: 'user',
          title: 'New user registered',
          description: `${user.userName} created an account`,
          time: user.createdAt,
          icon: '👤',
          color: 'indigo'
        }))
      ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 4);
  
      // Prepare growth data for charts
      const months = ['January', 'February', 'March', 'April', 'May', 'June'];
      const userGrowthData = Array(6).fill(0);
      const sellerGrowthData = Array(6).fill(0);
  
      userGrowth.forEach(item => {
        const monthIndex = (new Date().getMonth() + 6 - (item._id.month - 1)) % 6;
        userGrowthData[monthIndex] = item.count;
      });
  
      sellerGrowth.forEach(item => {
        const monthIndex = (new Date().getMonth() + 6 - (item._id.month - 1)) % 6;
        sellerGrowthData[monthIndex] = item.count;
      });
  
      // Prepare daily orders data
      const dailyOrdersData = Array(30).fill(0);
      const today = new Date();
      
      dailyOrders.forEach(item => {
        const itemDate = new Date(item._id.year, item._id.month - 1, item._id.day);
        const dayDiff = Math.floor((today - itemDate) / (1000 * 60 * 60 * 24));
        const dayIndex = 29 - dayDiff; // Most recent day at the end
        if (dayIndex >= 0 && dayIndex < 30) {
          dailyOrdersData[dayIndex] = item.count;
        }
      });
  
      res.status(200).json({
        status: 'success',
        data: {
          stats: {
            users: usersCount,
            sellers: sellersCount,
            orders: ordersCount,
            payments: paymentsCount,
            revenue: totalRevenue
          },
          charts: {
            userGrowth: {
              labels: months.slice(-6), // Last 6 months
              users: userGrowthData,
              sellers: sellerGrowthData
            },
            dailyOrders: {
              labels: Array.from({ length: 30 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (29 - i));
                return `${date.getDate()}/${date.getMonth() + 1}`;
              }),
              data: dailyOrdersData
            }
          },
          recentActivities
        }
      });
  
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch dashboard statistics'
      });
    }
};

module.exports = {addSeller,getAllSellers,getAllUsers,updateSeller,getProducts,getPayments,getOrders,getSellerByID,getDashboardStats};