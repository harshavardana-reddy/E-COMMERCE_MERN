import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FiPackage, 
  FiTruck, 
  FiCheckCircle, 
  FiXCircle, 
  FiClock, 
  FiChevronRight,
  FiMapPin,
  FiCreditCard,
  FiBox,
  FiInfo,
  FiX
} from "react-icons/fi";
import { motion } from "framer-motion";
import moment from "moment";
import BackendURL from "../BackendURL";
import { userApi } from '../Api';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logisticDetails, setLogisticDetails] = useState(null);
  const [loadingLogistics, setLoadingLogistics] = useState(false);
  const [user,setUser] = useState({})

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setUser(user)
    const fetchOrders = async () => {
      try {
        if (!user || !user.userId) {
          throw new Error("User ID not found. Please log in again.");
        }
        
        const response = await userApi.get(`${BackendURL.User}/fetchorders/${user.userId}`);
        setOrders(response.data.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch orders. Please try again later.");
        setLoading(false);
        console.error("Error fetching orders:", err);
      }
    };

    fetchOrders();
  }, []);

  const fetchLogisticDetails = async (orderId) => {
    setLoadingLogistics(true);
    try {
      const response = await userApi.get(`${BackendURL.User}/logistics/${orderId}`);
      setLogisticDetails(response.data.logisticDetails);
    } catch (err) {
      console.error("Error fetching logistic details:", err);
      setLogisticDetails(null);
    } finally {
      setLoadingLogistics(false);
    }
  };

  const handleViewDetails = async (order) => {
    setSelectedOrder(order);
    await fetchLogisticDetails(order.orderId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
    setLogisticDetails(null);
  };

  const filteredOrders = activeTab === "all" 
    ? orders 
    : orders.filter(order => order.status.toLowerCase() === activeTab.toLowerCase());

  const getStatusIcon = (status) => {
    switch (status) {
      case "Delivered":
        return <FiCheckCircle className="text-green-500" />;
      case "Shipped":
        return <FiTruck className="text-blue-500" />;
      case "Pending":
        return <FiClock className="text-yellow-500" />;
      case "Cancelled":
        return <FiXCircle className="text-red-500" />;
      default:
        return <FiPackage className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Shipped":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <FiXCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="mt-2 text-sm text-gray-600">
          View and manage your order history
        </p>
      </div>

      {/* Order Status Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-4" aria-label="Tabs">
          {["All", "Pending", "Shipped", "Delivered", "Cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === tab.toLowerCase()
                  ? "bg-purple-100 text-purple-700"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab}
              {tab !== "All" && (
                <span className="ml-1 bg-white text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {orders.filter(o => o.status.toLowerCase() === tab.toLowerCase()).length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No orders found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {activeTab === "all"
              ? "You haven't placed any orders yet."
              : `You don't have any ${activeTab} orders.`}
          </p>
          <div className="mt-6">
            <Link
              to="/user/products"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <motion.div
              key={order.orderId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white shadow overflow-hidden rounded-lg"
            >
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div className="flex items-center">
                    <span className="mr-3">{getStatusIcon(order.status)}</span>
                    <div>
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Order #{order.orderId}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Placed on {moment(order.createdAt).format("MMMM D, YYYY")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200">
                {order.products.map((product) => (
                  <div
                    key={product._id}
                    className="px-4 py-5 sm:px-6 flex items-start"
                  >
                    <div className="flex-shrink-0">
                      <img
                        className="h-20 w-20 rounded-md object-cover"
                        src={product.productId.productImage}
                        alt={product.productId.productName}
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {product.productId.productName}
                      </h4>
                      <p className="mt-1 text-sm text-gray-500">
                        {product.productId.productDescription}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Qty: {product.quantity} × ₹{product.price}
                      </p>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        ₹{(product.quantity * product.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-4 py-4 sm:px-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">
                    Sold by:{" "}
                    <span className="font-medium text-gray-900">
                      {order.sellerId.sellerName}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Payment:{" "}
                    <span className="font-medium text-gray-900">
                      {order.payment?.paymentMethod} ({order.payment?.status})
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-xl font-bold text-gray-900">
                    ₹{order.totalPrice.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="px-4 py-3 sm:px-6 bg-gray-50 text-right">
                <button
                  onClick={() => handleViewDetails(order)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  View Details <FiChevronRight className="ml-1" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity" 
              aria-hidden="true"
              onClick={closeModal}
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            {/* Modal container */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Order #{selectedOrder.orderId}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Placed on {moment(selectedOrder.createdAt).format("MMMM D, YYYY")}
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <FiX className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Order Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <FiBox className="mr-2" /> Order Summary
                    </h4>
                    <div className="space-y-4">
                      {selectedOrder.products.map((product) => (
                        <div key={product._id} className="flex">
                          <div className="flex-shrink-0">
                            <img
                              className="h-16 w-16 rounded-md object-cover"
                              src={product.productId.productImage}
                              alt={product.productId.productName}
                            />
                          </div>
                          <div className="ml-4 flex-1">
                            <h5 className="text-sm font-medium text-gray-900">
                              {product.productId.productName}
                            </h5>
                            <p className="text-sm text-gray-500">
                              Qty: {product.quantity} × ₹{product.price}
                            </p>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">
                              ₹{(product.quantity * product.price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">Subtotal</span>
                        <span className="text-sm text-gray-900">₹{selectedOrder.totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-sm font-medium text-gray-500">Shipping</span>
                        <span className="text-sm text-gray-900">Free</span>
                      </div>
                      <div className="flex justify-between mt-2 font-medium">
                        <span className="text-sm">Total</span>
                        <span className="text-sm">₹{selectedOrder.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping and Payment */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <FiMapPin className="mr-2" /> Shipping Information
                      </h4>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-900">
                          {user.userName || "N/A"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {user.userAddress || "N/A"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {user.userCity}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.postalCode}
                        </p>
                        <p className="text-sm text-gray-500">
                          {user.userCountry}
                        </p>
                        <p className="text-sm text-gray-500">
                          Phone: {user.userPhone || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <FiCreditCard className="mr-2" /> Payment Information
                      </h4>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-900">
                          Method: {selectedOrder.payment?.paymentMethod || "N/A"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Status: <span className={`${selectedOrder.payment?.status === "Completed" ? "text-green-500" : "text-yellow-500"}`}>
                            {selectedOrder.payment?.status || "N/A"}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500">
                          Amount: ₹{selectedOrder.totalPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tracking Information */}
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FiTruck className="mr-2" /> Tracking Information
                  </h4>
                  {loadingLogistics ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                  ) : logisticDetails ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Courier</p>
                          <p className="text-sm text-gray-900">{logisticDetails.logisticName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Tracking Number</p>
                          <p className="text-sm text-gray-900">{logisticDetails.trackingNumber}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <div className="mt-1 flex items-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(logisticDetails.logisticStatus)}`}>
                            {logisticDetails.logisticStatus}
                          </span>
                        </div>
                      </div>
                      {/* Timeline */}
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-500 mb-2">Order Timeline</p>
                        <div className="relative">
                          {/* Timeline line */}
                          <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200" aria-hidden="true"></div>
                          
                          {/* Timeline items */}
                          <ul className="space-y-4">
                            <li className="relative flex items-start">
                              <div className="absolute left-4 h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                                <FiCheckCircle className="h-4 w-4 text-purple-600" />
                              </div>
                              <div className="ml-12">
                                <p className="text-sm font-medium text-gray-900">Order placed</p>
                                <p className="text-sm text-gray-500">{moment(selectedOrder.createdAt).format("MMM D, YYYY h:mm A")}</p>
                              </div>
                            </li>
                            {selectedOrder.status !== "Pending" && (
                              <li className="relative flex items-start">
                                <div className="absolute left-4 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <FiTruck className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="ml-12">
                                  <p className="text-sm font-medium text-gray-900">Order shipped</p>
                                  <p className="text-sm text-gray-500">
                                    {logisticDetails.updatedAt ? 
                                      moment(logisticDetails.updatedAt).format("MMM D, YYYY h:mm A") : 
                                      "Processing"}
                                  </p>
                                </div>
                              </li>
                            )}
                            {selectedOrder.status === "Delivered" && (
                              <li className="relative flex items-start">
                                <div className="absolute left-4 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                  <FiCheckCircle className="h-4 w-4 text-green-600" />
                                </div>
                                <div className="ml-12">
                                  <p className="text-sm font-medium text-gray-900">Order delivered</p>
                                  <p className="text-sm text-gray-500">
                                    {logisticDetails.updatedAt ? 
                                      moment(logisticDetails.updatedAt).format("MMM D, YYYY h:mm A") : 
                                      "Completed"}
                                  </p>
                                </div>
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <FiInfo className="mx-auto h-5 w-5 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">
                        No tracking information available yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeModal}
                >
                  Close
                </button>
                {logisticDetails && (
                  <a
                    href={`https://www.${logisticDetails.logisticName.toLowerCase()}.com/track/${logisticDetails.trackingNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Track on {logisticDetails.logisticName}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}