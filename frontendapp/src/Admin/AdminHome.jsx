import { useEffect, useState } from "react";
import { adminApi } from "../Api";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { FiTrendingUp, FiUsers, FiShoppingBag, FiDollarSign } from "react-icons/fi";
import BackendURL from "../BackendURL"

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const getDashboardStats = async () => {
  try {
    const response = await adminApi.get(`${BackendURL.Admin}/dashboard`)
    return response.data.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export default function AdminHome() {
  const [stats, setStats] = useState({
    sellers: 0,
    users: 0,
    orders: 0,
    payments: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [barChartData, setBarChartData] = useState({
    labels: [],
    datasets: []
  });
  
  const [lineChartData, setLineChartData] = useState({
    labels: [],
    datasets: []
  });

  const [recentActivity,setRecentActivity] = useState([]);
  

  // Mock data - in a real app, you would fetch this from your API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        console.log(data)
        setRecentActivity(data.recentActivities )
        console.log(recentActivity)
        setStats({
          sellers: data.stats.sellers,
          users: data.stats.users,
          orders: data.stats.orders,
          payments: data.stats.payments,
          revenue: data.stats.revenue,
        });
        
        // Update chart data with real data
        setBarChartData({
          labels: data.charts.userGrowth.labels,
          datasets: [
            {
              label: "Users",
              data: data.charts.userGrowth.users,
              backgroundColor: "rgba(99, 102, 241, 0.7)",
              borderColor: "rgba(99, 102, 241, 1)",
              borderWidth: 1,
              borderRadius: 6,
            },
            {
              label: "Sellers",
              data: data.charts.userGrowth.sellers,
              backgroundColor: "rgba(236, 72, 153, 0.7)",
              borderColor: "rgba(236, 72, 153, 1)",
              borderWidth: 1,
              borderRadius: 6,
            },
          ],
        });
  
        setLineChartData({
          labels: data.charts.dailyOrders.labels,
          datasets: [
            {
              label: "Daily Orders",
              data: data.charts.dailyOrders.data,
              fill: true,
              backgroundColor: "rgba(79, 70, 229, 0.1)",
              borderColor: "rgba(79, 70, 229, 1)",
              borderWidth: 2,
              tension: 0.4,
              pointBackgroundColor: "rgba(79, 70, 229, 1)",
              pointRadius: 3,
              pointHoverRadius: 5,
            },
          ],
        });
  
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  // // Data for bar chart (Users vs Sellers)
  // const barChartData = {
  //   labels: ["January", "February", "March", "April", "May", "June"],
  //   datasets: [
  //     {
  //       label: "Users",
  //       data: [120, 190, 300, 500, 700, 856],
  //       backgroundColor: "rgba(99, 102, 241, 0.7)",
  //       borderColor: "rgba(99, 102, 241, 1)",
  //       borderWidth: 1,
  //       borderRadius: 6,
  //     },
  //     {
  //       label: "Sellers",
  //       data: [20, 40, 60, 80, 100, 124],
  //       backgroundColor: "rgba(236, 72, 153, 0.7)",
  //       borderColor: "rgba(236, 72, 153, 1)",
  //       borderWidth: 1,
  //       borderRadius: 6,
  //     },
  //   ],
  // };

  // // Data for line chart (Daily orders)
  // const lineChartData = {
  //   labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
  //   datasets: [
  //     {
  //       label: "Daily Orders",
  //       data: [
  //         5, 8, 7, 10, 12, 15, 14, 18, 20, 22, 25, 24, 28, 30, 32, 35, 38, 40,
  //         42, 45, 44, 48, 50, 52, 55, 54, 58, 60, 62, 65,
  //       ],
  //       fill: true,
  //       backgroundColor: "rgba(79, 70, 229, 0.1)",
  //       borderColor: "rgba(79, 70, 229, 1)",
  //       borderWidth: 2,
  //       tension: 0.4,
  //       pointBackgroundColor: "rgba(79, 70, 229, 1)",
  //       pointRadius: 3,
  //       pointHoverRadius: 5,
  //     },
  //   ],
  // };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: "Users vs Sellers Growth",
        font: {
          size: 16,
        },
      },
    },
  };

  const lineChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: "Daily Orders Trend (Last 30 Days)",
        font: {
          size: 16,
        },
      },
    },
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="p-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {/* Stats Cards */}
        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
            <div className="p-3 rounded-lg bg-indigo-100 text-indigo-600 mr-4">
              <FiUsers size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Users</p>
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
              ) : (
                <h3 className="text-2xl font-bold text-gray-800">
                  <CountUp end={stats.users} duration={1.5} />
                </h3>
              )}
              <p className="text-green-500 text-xs flex items-center mt-1">
                <FiTrendingUp className="mr-1" /> 12% from last month
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
            <div className="p-3 rounded-lg bg-pink-100 text-pink-600 mr-4">
              <FiUsers size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Sellers</p>
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
              ) : (
                <h3 className="text-2xl font-bold text-gray-800">
                  <CountUp end={stats.sellers} duration={1.5} />
                </h3>
              )}
              <p className="text-green-500 text-xs flex items-center mt-1">
                <FiTrendingUp className="mr-1" /> 8% from last month
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600 mr-4">
              <FiShoppingBag size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Orders</p>
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
              ) : (
                <h3 className="text-2xl font-bold text-gray-800">
                  <CountUp end={stats.orders} duration={1.5} />
                </h3>
              )}
              <p className="text-green-500 text-xs flex items-center mt-1">
                <FiTrendingUp className="mr-1" /> 15% from last month
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
            <div className="p-3 rounded-lg bg-green-100 text-green-600 mr-4">
              <FiDollarSign size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
              ) : (
                <h3 className="text-2xl font-bold text-gray-800">
                  $<CountUp end={stats.revenue} duration={1.5} decimals={2} />
                </h3>
              )}
              <p className="text-green-500 text-xs flex items-center mt-1">
                <FiTrendingUp className="mr-1" /> 22% from last month
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
      >
        <div className="bg-white p-6 rounded-xl shadow-md">
          <Bar data={barChartData} options={barChartOptions} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <Line data={lineChartData} options={lineChartOptions} />
        </div>
      </motion.div>

      {/* Recent Activity Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-md p-6"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0"
            >
              <div
                className={`flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 ${activity.color} text-xl mr-4`}
              >
                {activity.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">{activity.title}</h4>
                <p className="text-sm text-gray-600">{activity.description}</p>
                <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}