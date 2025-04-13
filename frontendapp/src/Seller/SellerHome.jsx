import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiUsers,
  FiPackage,
  FiShoppingBag,
  FiClock,
  FiTrendingUp,
  FiPieChart
} from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Tooltip as ReactTooltip } from "react-tooltip";
import { toast } from "react-toastify";
import BackendURL from "../BackendURL";
import { sellerApi } from "../Api";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function SellerHome() {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalUsers: 0,
      totalRevenue: 0,
      totalProducts: 0,
      totalOrders: 0,
      pendingOrders: 0
    },
    charts: {
      sales: {
        labels: [],
        data: []
      },
      orderStatus: {
        Delivered: 0,
        Shipped: 0,
        Pending: 0,
        Cancelled: 0
      }
    },
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const seller = JSON.parse(localStorage.getItem("seller"));
        if (!seller || !seller.sellerId) {
          throw new Error("Seller information not found");
        }

        const response = await sellerApi.get(`${BackendURL.Seller}/dashboard/${seller.sellerId}`);
        
        if (response.data.success) {
          setDashboardData(response.data.data);
        } else {
          throw new Error(response.data.message || "Failed to fetch dashboard data");
        }
      } catch (error) {
        console.error("Dashboard error:", error);
        toast.error(error.response?.data?.message || error.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Sales data for the bar chart
  const salesData = {
    labels: dashboardData.charts.sales.labels,
    datasets: [
      {
        label: 'Sales (₹)',
        data: dashboardData.charts.sales.data,
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  // Order status data for the pie chart
  const orderStatusData = {
    labels: ['Delivered', 'Shipped', 'Pending', 'Cancelled'],
    datasets: [
      {
        data: [
          dashboardData.charts.orderStatus.Delivered,
          dashboardData.charts.orderStatus.Shipped,
          dashboardData.charts.orderStatus.Pending,
          dashboardData.charts.orderStatus.Cancelled
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(239, 68, 68, 0.7)'
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // const formatCurrency = (amount) => {
  //   return new Intl.NumberFormat('en-IN', {
  //     style: 'currency',
  //     currency: 'INR',
  //     minimumFractionDigits: 0
  //   }).format(amount);
  // };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening with your store today.</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {/* Total Unique Users */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          data-tooltip-id="stats-tooltip"
          data-tooltip-content="Total unique customers who purchased from you"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              {loading ? (
                <div className="h-8 w-20 bg-gray-200 rounded mt-2 animate-pulse"></div>
              ) : (
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{dashboardData.stats.totalUsers}</h3>
              )}
            </div>
            <div className="p-3 rounded-full bg-indigo-50 text-indigo-600">
              <FiUsers size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <FiTrendingUp className="mr-1" />
            <span>12.5% from last month</span>
          </div>
        </motion.div>

        {/* Total Revenue */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          data-tooltip-id="stats-tooltip"
          data-tooltip-content="Total revenue generated from your products"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              {loading ? (
                <div className="h-8 w-24 bg-gray-200 rounded mt-2 animate-pulse"></div>
              ) : (
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{  dashboardData.stats.totalRevenue}</h3>
              )}
            </div>
            <div className="p-3 rounded-full bg-green-50 text-green-600">
              <FaRupeeSign size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <FiTrendingUp className="mr-1" />
            <span>8.3% from last month</span>
          </div>
        </motion.div>

        {/* Products Added */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          data-tooltip-id="stats-tooltip"
          data-tooltip-content="Total products in your inventory"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Products Added</p>
              {loading ? (
                <div className="h-8 w-20 bg-gray-200 rounded mt-2 animate-pulse"></div>
              ) : (
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{dashboardData.stats.totalProducts}</h3>
              )}
            </div>
            <div className="p-3 rounded-full bg-blue-50 text-blue-600">
              <FiPackage size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <FiTrendingUp className="mr-1" />
            <span>3 new this month</span>
          </div>
        </motion.div>

        {/* Total Orders */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          data-tooltip-id="stats-tooltip"
          data-tooltip-content="Total orders received"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              {loading ? (
                <div className="h-8 w-20 bg-gray-200 rounded mt-2 animate-pulse"></div>
              ) : (
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{dashboardData.stats.totalOrders}</h3>
              )}
            </div>
            <div className="p-3 rounded-full bg-purple-50 text-purple-600">
              <FiShoppingBag size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <FiTrendingUp className="mr-1" />
            <span>5.2% from last month</span>
          </div>
        </motion.div>

        {/* Pending Orders */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          data-tooltip-id="stats-tooltip"
          data-tooltip-content="Orders awaiting processing"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Orders</p>
              {loading ? (
                <div className="h-8 w-20 bg-gray-200 rounded mt-2 animate-pulse"></div>
              ) : (
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{dashboardData.stats.pendingOrders}</h3>
              )}
            </div>
            <div className="p-3 rounded-full bg-yellow-50 text-yellow-600">
              <FiClock size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-red-600">
            <span>Requires attention</span>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Monthly Sales</h2>
            <div className="flex items-center text-sm text-gray-500">
              <FiTrendingUp className="mr-1 text-green-500" />
              <span>12.5% increase</span>
            </div>
          </div>
          <div className="h-64">
            {dashboardData.charts.sales.data.length > 0 ? (
              <Bar 
                data={salesData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleFont: { size: 14 },
                      bodyFont: { size: 12 },
                      padding: 10,
                      cornerRadius: 6,
                      callbacks: {
                        label: function(context) {
                          return `₹${context.raw}`;
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        drawBorder: false
                      },
                      ticks: {
                        callback: function(value) {
                          return `₹${value}`;
                        }
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      }
                    }
                  }
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No sales data available
              </div>
            )}
          </div>
        </motion.div>

        {/* Order Status Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Order Status</h2>
            <div className="flex items-center text-sm text-gray-500">
              <FiPieChart className="mr-1 text-indigo-500" />
              <span>Distribution</span>
            </div>
          </div>
          <div className="h-64">
            {dashboardData.charts.orderStatus ? (
              <Pie
                data={orderStatusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleFont: { size: 14 },
                      bodyFont: { size: 12 },
                      padding: 10,
                      cornerRadius: 6
                    }
                  }
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No order data available
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {loading ? (
            [1, 2, 3].map((item) => (
              <div key={item} className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 animate-pulse mr-3"></div>
                <div className="flex-1 min-w-0">
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse ml-4"></div>
              </div>
            ))
          ) : dashboardData.recentActivities.length > 0 ? (
            dashboardData.recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mr-3">
                  {activity.type === 'order' ? <FiShoppingBag size={18} /> : <FiPackage size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                </div>
                <div className="text-xs text-gray-500 ml-4 whitespace-nowrap">
                  {formatDate(activity.date)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">
              No recent activities found
            </div>
          )}
        </div>
      </motion.div>

      <ReactTooltip 
        id="stats-tooltip" 
        place="top" 
        effect="solid" 
        className="z-50"
      />
    </div>
  );
}