import React, { useEffect, useState } from "react";
import {
  FiTruck,
  FiPackage,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiDollarSign,
  FiUser,
  FiShoppingCart,
  FiX,
  FiSearch,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import BackendURL from "../BackendURL";
import { sellerApi } from "../Api";

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800",
  Confirmed: "bg-blue-100 text-blue-800",
  Shipped: "bg-purple-100 text-purple-800",
  Delivered: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

const statusIcons = {
  Pending: <FiClock className="mr-1" />,
  Confirmed: <FiCheckCircle className="mr-1" />,
  Shipped: <FiTruck className="mr-1" />,
  Delivered: <FiPackage className="mr-1" />,
  Cancelled: <FiXCircle className="mr-1" />,
};

export default function ViewOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [logisticDetails, setLogisticDetails] = useState({
    logisticName: "DTDC",
    trackingNumber: "",
  });
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const seller = JSON.parse(localStorage.getItem("seller"));
        const response = await sellerApi.get(
          `${BackendURL.Seller}/fetchorders/${seller.sellerId}`
        );
        setOrders(response.data.data);
      } catch (error) {
        toast.error("Failed to fetch orders");
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders =
    filter === "All"
      ? orders
      : orders.filter((order) => order.status === filter);

  const searchedOrders = filteredOrders.filter((order) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      order.orderId.toLowerCase().includes(searchLower) ||
      order.userId.userName.toLowerCase().includes(searchLower) ||
      order.userId.userEmail.toLowerCase().includes(searchLower) ||
      order.products.some((product) =>
        product.productId.productName.toLowerCase().includes(searchLower)
      )
    );
  });

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setIsUpdatingStatus(true);
  
      if (newStatus === "Shipped") {
        if (!logisticDetails.logisticName) {
          toast.error("Please select a logistic provider");
          return;
        }
      }
  
      const seller = JSON.parse(localStorage.getItem("seller"));
      const payload = {
        orderId: orderId,
        sellerId: seller.sellerId,
        status: newStatus,
        ...(newStatus === "Shipped" && logisticDetails),
      };
  
      await sellerApi.patch(`${BackendURL.Seller}/updatestatus`, payload);
  
      toast.success(`Order status updated to ${newStatus}`);
      window.location.reload(); // Refresh immediately after success
    } catch (error) {
      toast.error("Failed to update order status");
      console.error("Error updating order status:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };
  const fetchLogisticDetails = async (orderId) => {
    try {
        const response = await sellerApi.get(`${BackendURL.Seller}/logistics/${orderId}`);
        // console.log(response.data.logisticDetails)
        return response.data.logisticDetails;
    } catch (error) {
        console.error("Error fetching logistic details:", error);
        return null;
    }
};

// Then modify the modal opening to fetch logistic details
const handleViewOrder = async (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
    
    // Fetch logistic details if order is shipped or delivered
    if (order.status === "Shipped" || order.status === "Delivered") {
        const details = await fetchLogisticDetails(order.orderId);
        if (details) {
            setLogisticDetails({
                logisticName: details.logisticName,
                trackingNumber: details.trackingNumber || ""
            });
        }
    }
};

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 md:mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          Your Orders
        </h1>
        <p className="text-gray-600">Manage and track all customer orders</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-lg md:rounded-xl shadow-sm md:shadow-md p-4 md:p-6 flex items-center"
        >
          <div className="p-2 md:p-3 rounded-full bg-blue-100 text-blue-600 mr-3 md:mr-4">
            <FiShoppingCart size={20} className="md:size-6" />
          </div>
          <div>
            <p className="text-xs md:text-sm text-gray-500">Total Orders</p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {orders.length}
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-lg md:rounded-xl shadow-sm md:shadow-md p-4 md:p-6 flex items-center"
        >
          <div className="p-2 md:p-3 rounded-full bg-green-100 text-green-600 mr-3 md:mr-4">
            <FiDollarSign size={20} className="md:size-6" />
          </div>
          <div>
            <p className="text-xs md:text-sm text-gray-500">Total Revenue</p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              ₹{totalRevenue.toLocaleString()}
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-lg md:rounded-xl shadow-sm md:shadow-md p-4 md:p-6 flex items-center"
        >
          <div className="p-2 md:p-3 rounded-full bg-purple-100 text-purple-600 mr-3 md:mr-4">
            <FiUser size={20} className="md:size-6" />
          </div>
          <div>
            <p className="text-xs md:text-sm text-gray-500">Unique Customers</p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {new Set(orders.map((order) => order.userId.userId)).size}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search orders by ID, customer or product..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 md:gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter("All")}
              className={`px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium ${
                filter === "All"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Orders
            </motion.button>
            {Object.keys(statusColors).map((status) => (
              <motion.button
                key={status}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium flex items-center ${
                  filter === status
                    ? statusColors[status]
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {statusIcons[status]}
                {status}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg md:rounded-xl shadow-sm md:shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-4 py-3 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-4 py-3 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {searchedOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No orders found matching your criteria
                  </td>
                </tr>
              ) : (
                searchedOrders.map((order) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ backgroundColor: "rgba(249, 250, 251, 1)" }}
                    className="transition-colors"
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900">
                      #{order.orderId.slice(-8)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {order.userId.userName.charAt(0)}
                        </div>
                        <div className="ml-2 md:ml-4">
                          <div className="text-xs md:text-sm font-medium text-gray-900 truncate max-w-[100px] md:max-w-[150px]">
                            {order.userId.userName}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-[100px] md:max-w-[150px]">
                            {order.userId.userEmail}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        {order.products.slice(0, 2).map((product, index) => (
                          <div
                            key={index}
                            className="relative"
                            style={{ marginLeft: index > 0 ? "-8px" : "0" }}
                          >
                            <img
                              src={
                                product.productId.productImage ||
                                "https://via.placeholder.com/40"
                              }
                              alt={product.productId.productName}
                              className="h-8 w-8 md:h-10 md:w-10 rounded-md border-2 border-white object-cover"
                            />
                            {index === 1 && order.products.length > 2 && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-md flex items-center justify-center text-white text-xs font-bold">
                                +{order.products.length - 2}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs md:text-sm text-gray-900">
                      ₹{order.totalPrice.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${
                          statusColors[order.status]
                        }`}
                      >
                        {React.cloneElement(statusIcons[order.status], {
                          className: "mr-1",
                        })}
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-xs md:text-sm font-medium">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewOrder(order)}
                        className="text-blue-600 hover:text-blue-900 mr-2 md:mr-3 text-xs md:text-sm"
                      >
                        View
                      </motion.button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40"></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200"
            >
              <div className="p-4 md:p-6">
                <div className="flex justify-between items-start mb-4 md:mb-6">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                      Order Details
                    </h2>
                    <p className="text-gray-600">#{selectedOrder.orderId}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setLogisticDetails({ logisticName: "DTDC", trackingNumber: "" });
                    }}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                  <div>
                    <h3 className="text-md md:text-lg font-medium text-gray-900 mb-2 md:mb-4">
                      Customer Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                      <div className="flex items-center mb-2 md:mb-3">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold mr-3 md:mr-4">
                          {selectedOrder.userId.userName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {selectedOrder.userId.userName}
                          </p>
                          <p className="text-xs md:text-sm text-gray-500">
                            {selectedOrder.userId.userEmail}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1 md:space-y-2">
                        <p className="text-xs md:text-sm">
                          <span className="font-medium text-gray-700">Phone:</span>{" "}
                          {selectedOrder.userId.userPhone || "N/A"}
                        </p>
                        <p className="text-xs md:text-sm">
                          <span className="font-medium text-gray-700">
                            Order Date:
                          </span>{" "}
                          {formatDate(selectedOrder.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-md md:text-lg font-medium text-gray-900 mb-2 md:mb-4">
                      Order Summary
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                      <div className="flex justify-between mb-1 md:mb-2">
                        <span className="text-xs md:text-sm text-gray-600">
                          Subtotal
                        </span>
                        <span className="text-xs md:text-sm font-medium">
                          ₹{selectedOrder.totalPrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between mb-1 md:mb-2">
                        <span className="text-xs md:text-sm text-gray-600">
                          Shipping
                        </span>
                        <span className="text-xs md:text-sm font-medium">₹0</span>
                      </div>
                      <div className="flex justify-between mb-1 md:mb-2">
                        <span className="text-xs md:text-sm text-gray-600">Tax</span>
                        <span className="text-xs md:text-sm font-medium">₹0</span>
                      </div>
                      <div className="border-t border-gray-200 my-1 md:my-2"></div>
                      <div className="flex justify-between font-bold text-md md:text-lg">
                        <span>Total</span>
                        <span>₹{selectedOrder.totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6 md:mb-8">
                  <h3 className="text-md md:text-lg font-medium text-gray-900 mb-2 md:mb-4">
                    Products
                  </h3>
                  <div className="space-y-3 md:space-y-4">
                    {selectedOrder.products.map((product, index) => (
                      <div
                        key={index}
                        className="flex items-start border-b border-gray-100 pb-3 md:pb-4"
                      >
                        <img
                          src={
                            product.productId.productImage ||
                            "https://via.placeholder.com/80"
                          }
                          alt={product.productId.productName}
                          className="h-12 w-12 md:h-16 md:w-16 object-cover rounded-md mr-3 md:mr-4"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm md:text-base font-medium text-gray-900 truncate">
                            {product.productId.productName}
                          </h4>
                          <p className="text-xs md:text-sm text-gray-500 line-clamp-2">
                            {product.productId.productDescription}
                          </p>
                        </div>
                        <div className="text-right ml-2 md:ml-4">
                          <p className="text-sm md:text-base font-medium">
                            ₹{product.price.toLocaleString()}
                          </p>
                          <p className="text-xs md:text-sm text-gray-500">
                            Qty: {product.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6 md:mb-8">
                  <h3 className="text-md md:text-lg font-medium text-gray-900 mb-2 md:mb-4">
                    Payment Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <p className="text-xs md:text-sm text-gray-600">
                          Payment Method
                        </p>
                        <p className="text-sm md:text-base font-medium">
                          {selectedOrder.payment?.paymentMethod || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs md:text-sm text-gray-600">
                          Transaction ID
                        </p>
                        <p className="text-sm md:text-base font-medium">
                          {selectedOrder.payment?.transactionId || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs md:text-sm text-gray-600">
                          Payment Status
                        </p>
                        <p className="text-sm md:text-base font-medium">
                          {selectedOrder.payment?.status || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs md:text-sm text-gray-600">
                          Payment Date
                        </p>
                        <p className="text-sm md:text-base font-medium">
                          {selectedOrder.payment?.paymentDate
                            ? formatDate(selectedOrder.payment.paymentDate)
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-md md:text-lg font-medium text-gray-900 mb-2 md:mb-4">
                    Update Order Status
                  </h3>
                  <div className="flex flex-wrap gap-2 md:gap-3 mb-4">
                    {Object.keys(statusColors).map((status) => (
                      <motion.button
                        key={status}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          if (status === "Shipped") {
                            // Don't immediately update, show logistic form
                          } else {
                            updateOrderStatus(selectedOrder.orderId, status);
                          }
                        }}
                        disabled={
                          selectedOrder.status === status || isUpdatingStatus
                        }
                        className={`px-3 py-1 md:px-4 md:py-2 rounded-lg flex items-center text-xs md:text-sm ${
                          selectedOrder.status === status
                            ? "bg-gray-200 text-gray-700 cursor-not-allowed"
                            : "bg-white border border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {statusIcons[status]}
                        {status}
                      </motion.button>
                    ))}
                  </div>

                  {/* Logistic Details Form (shown only when Shipped is selected) */}
                  {selectedOrder.status !== "Shipped" &&
                    selectedOrder.status !== "Delivered" && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h4 className="text-sm font-medium text-blue-800 mb-3">
                          Shipping Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Logistic Provider
                            </label>
                            <select
                              value={logisticDetails.logisticName}
                              onChange={(e) =>
                                setLogisticDetails({
                                  ...logisticDetails,
                                  logisticName: e.target.value,
                                })
                              }
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="DTDC">DTDC</option>
                              <option value="DELHIVERY">Delhivery</option>
                              <option value="BLUE-DART">Blue Dart</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tracking Number (Optional)
                            </label>
                            <input
                              type="text"
                              value={logisticDetails.trackingNumber}
                              onChange={(e) =>
                                setLogisticDetails({
                                  ...logisticDetails,
                                  trackingNumber: e.target.value,
                                })
                              }
                              placeholder="Enter tracking number"
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() =>
                              updateOrderStatus(selectedOrder.orderId, "Shipped")
                            }
                            disabled={isUpdatingStatus}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
                          >
                            {isUpdatingStatus ? (
                              <>
                                <svg
                                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Updating...
                              </>
                            ) : (
                              <>
                                <FiTruck className="mr-2" />
                                Mark as Shipped
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>
                    )}

                  {/* Show logistic info if already shipped */}
                  {selectedOrder.status === "Shipped" && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <h4 className="text-sm font-medium text-green-800 mb-2">
                        Shipping Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Carrier:</span>{" "}
                            {logisticDetails.logisticName || "Not specified"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Tracking #:</span>{" "}
                            {logisticDetails.trackingNumber || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}