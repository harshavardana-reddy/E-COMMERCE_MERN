/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { FiShoppingBag, FiPackage, FiTruck, FiCreditCard, FiStar, FiTrendingUp } from "react-icons/fi";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import ProductCard from "./ProductCard";
import BackendURL from "../BackendURL";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { userApi } from '../Api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function UserHome() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user,setUser] = useState({});

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real app, you would get userId from auth context
        const user = JSON.parse(localStorage.getItem("user"));
        setUser(user)
        const response = await userApi.get(`${BackendURL.User}/dashboard/${user.userId}`);
        setDashboardData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format data for charts
  const spendingData = {
    labels: dashboardData?.charts.monthlySpending.map(item => 
      new Date(0, item._id - 1).toLocaleString('default', { month: 'short' })
    ),
    datasets: [
      {
        label: 'Monthly Spending ($)',
        data: dashboardData?.charts.monthlySpending.map(item => item.total),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  const categoryData = {
    labels: dashboardData?.charts.spendingByCategory.map(item => item._id),
    datasets: [
      {
        data: dashboardData?.charts.spendingByCategory.map(item => item.total),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(156, 163, 175, 0.8)'
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(156, 163, 175, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const handleAddToCart = async (productId) => {
    try {
      const userId = JSON.parse(localStorage.getItem("user")).userId;
      const response = await userApi.post(`${BackendURL.User}/addtocart/${userId}`, { productId, quantity: 1 });
      // Show success notification or update cart count
      if (response.data.success) {
              toast.success(`added to cart!`);
            } else {
              toast.error(response.data.message || 'Failed to add to cart');
            }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(error.response?.data?.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {user.userName}</h1>
        <p className="mt-2 opacity-90">Here&apos;s what&apos;s happening with your account today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard 
          icon={<FiShoppingBag className="text-purple-600" size={24} />} 
          title="Total Orders" 
          value={dashboardData.stats.totalOrders} 
          change="+12% from last month" 
          color="purple"
        />
        <StatCard 
          icon={<FiPackage className="text-blue-600" size={24} />} 
          title="Pending Orders" 
          value={dashboardData.stats.pendingOrders} 
          change="+2 from last week" 
          color="blue"
        />
        <StatCard 
          icon={<FiTruck className="text-green-600" size={24} />} 
          title="Delivered" 
          value={dashboardData.stats.deliveredOrders} 
          change="+5 from last month" 
          color="green"
        />
        <StatCard 
          icon={<FiCreditCard className="text-yellow-600" size={24} />} 
          title="Cart Items" 
          value={dashboardData.stats.cartItems} 
          change="Ready to checkout" 
          color="yellow"
        />
        <StatCard 
          icon={<FiStar className="text-pink-600" size={24} />} 
          title="Wishlist" 
          value={dashboardData.stats.wishlistItems} 
          change="+3 new items" 
          color="pink"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Monthly Spending</h2>
            <div className="flex items-center text-sm text-gray-500">
              <FiTrendingUp className="mr-1 text-green-500" />
              <span>23% increase</span>
            </div>
          </div>
          <Bar 
            data={spendingData} 
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }} 
          />
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Spending by Category</h2>
          <div className="h-64">
            <Pie
              data={categoryData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'right',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardData.recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.orderId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.products[0].productId.productName}
                    {order.products.length > 1 && ` + ${order.products.length - 1} more`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                         order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 
                         'bg-yellow-100 text-yellow-800'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${order.totalPrice.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t text-right">
          <Link to="/user/orders" className="text-purple-600 hover:text-purple-800 font-medium">
            View All Orders →
          </Link>
        </div>
      </div>

      {/* Recommended Products */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Recommended For You</h2>
          <p className="text-sm text-gray-500 mt-1">Based on your browsing history and preferences</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {dashboardData.recommendedProducts.map((product) => (
              <ProductCard 
                key={product._id}
                id={product.productId}
                name={product.productName}
                price={product.productPrice}
                rating={product.productRating || 4.0}
                image={product.productImage}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// StatCard component remains the same as before

function StatCard({ icon, title, value, change, color }) {
  const colorClasses = {
    purple: 'bg-purple-50',
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    yellow: 'bg-yellow-50',
    pink: 'bg-pink-50'
  };

  const textColors = {
    purple: 'text-purple-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    pink: 'text-pink-600'
  };

  return (
    <div className={`${colorClasses[color]} p-4 rounded-xl shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
          <p className={`text-xs mt-1 ${textColors[color]}`}>{change}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <ToastContainer/>
    </div>
  );
}