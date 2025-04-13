/* eslint-disable no-undef */
import { useState, useEffect } from 'react';
import {  FiChevronLeft, FiCheckCircle, FiLoader } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import BackendURL from '../BackendURL';
import { toast, ToastContainer } from 'react-toastify';
import logo from "../assets/logo.png"
import { userApi } from '../Api';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [user, setUser] = useState(null);

  // Calculate order totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 1000 ? 0 : 99;
  const total = subtotal + shipping;

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    
    if (!userData) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }

    // If coming from cart, fetch cart items
    if (location.state?.product)  {
      // console.log(location)
      setCartItems([{
        ...location.state.product,
        quantity: location.state.quantity || 1,
        price: location.state.product.productPrice
      }]);
      setLoading(false);
    } else  {
      // If coming from buy now, use that single product
      fetchCartItems(userData.userId);
      
      setLoading(false);
    }
  }, [location]);

  const fetchCartItems = async (userId) => {
    try {
      const response = await userApi.get(`${BackendURL.User}/fetchcart/${userId}`);
      if (response.data.cart && response.data.cart.items) {
        setCartItems(response.data.cart.items);
        console.log(cartItems)
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return false;
    }
    return true;
  };

  // const loadRazorpayScript = () => {
  //   return new Promise((resolve) => {
  //     const script = document.createElement('script');
  //     script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  //     script.onload = () => {
  //       resolve(true);
  //     };
  //     script.onerror = () => {
  //       resolve(false);
  //     };
  //     document.body.appendChild(script);
  //   });
  // };

  const handlePayment = async () => {
    if (!validateForm()) return;
    setProcessing(true);
  
    try {
      // Create order on backend
      const orderResponse = await userApi.post(`${BackendURL.User}/makepayment`, {
        userId: user.userId,
        products: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        totalPrice: total
      });
  
      const { order, dbOrder } = orderResponse.data;
      // console.log(order,dbOrder);
  
      // Razorpay options
      const options = {
        key: import.meta.env.VITE_APP_RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency,
        name: 'E-Commerce Store',
        description: `Order #${dbOrder.orderId}`,
        image: logo,
        order_id:order.id,
        handler: async function(response) {
          try {
            // console.log("Full Razorpay response:", response);
            
            // Verify we have all required fields
            if (!response.razorpay_order_id || !response.razorpay_payment_id || !response.razorpay_signature) {
              throw new Error("Incomplete Razorpay response");
            }
  
            const verifyResponse = await userApi.post(`${BackendURL.User}/verifyorder`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: dbOrder._id // Pass the database order ID
            });
  
            if (verifyResponse.data.success) {
              setOrderSuccess(true);
              setOrderId(dbOrder.orderId);
              // Clear cart if needed
              if (location.pathname === '/checkout') {
                await userApi.delete(`${BackendURL.User}/clearcart/${user.userId}`);
              }
            } else {
              toast.error(verifyResponse.data.message || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error(error.response?.data?.message || error.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: user.userName,
          email: user.userEmail,
          contact: user.userPhone || ''
        },
        notes: {
          address: `${user.userAddress}, ${user.userCity}, ${user.userState}, ${user.userCountry}`
        },
        theme: {
          color: '#4f46e5'
        }
      };
  
      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function(response) {
        console.error("Payment failed:", response.error);
        // Notify backend about failed payment
        userApi.post(`${BackendURL.User}/paymentfailed`, {
          razorpay_order_id: response.error.metadata.order_id,
          error: response.error
        });
        toast.error(`Payment failed: ${response.error.description}`);
      });
      
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                <FiCheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-gray-900">Order Placed Successfully!</h2>
              <p className="mt-2 text-gray-600">
                Your order #{orderId} has been placed and payment is confirmed.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/user/orders')}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  View Order Details
                </button>
              </div>
              <div className="mt-6 text-sm text-gray-500">
                We&apos;ve sent a confirmation email to {user?.userEmail}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <ToastContainer position="bottom-right" autoClose={3000} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-indigo-600 hover:text-indigo-800 mr-4"
          >
            <FiChevronLeft className="mr-2" /> Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Shipping and Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Shipping Address</h2>
              </div>
              <div className="p-6">
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="font-medium">{user?.userName}</p>
                  <p className="text-gray-700">{user?.userAddress}</p>
                  <p className="text-gray-700">{user?.userCity}, {user?.userState}</p>
                  <p className="text-gray-700">{user?.userCountry}</p>
                  <p className="text-gray-700">Phone: {user?.userPhone}</p>
                </div>
                <button
                  onClick={() => navigate('/user/profile')}
                  className="mt-4 text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Update address in profile
                </button>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Payment Method</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      id="razorpay"
                      name="paymentMethod"
                      type="radio"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <label htmlFor="razorpay" className="ml-3 block text-sm font-medium text-gray-700">
                      Razorpay (Credit/Debit Cards, UPI, Net Banking)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="cod"
                      name="paymentMethod"
                      type="radio"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <label htmlFor="cod" className="ml-3 block text-sm font-medium text-gray-700">
                      Cash on Delivery
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Order Summary */}
          <div>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item.productId} className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden">
                          <img
                            src={item.productImage||item.image || 'https://via.placeholder.com/150'}
                            alt={item.productName || item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h3>{item.productName||item.name || 'Product'}</h3>
                            <p>₹{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Totals */}
                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between text-base font-medium text-gray-900 pt-2 border-t border-gray-200">
                      <span>Total</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Place Order Button */}
                <div className="mt-6">
                  <button
                    onClick={handlePayment}
                    disabled={processing || cartItems.length === 0}
                    className={`w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${
                      processing ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                    } ${cartItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {processing ? (
                      <>
                        <FiLoader className="animate-spin mr-2 h-5 w-5" />
                        Processing...
                      </>
                    ) : paymentMethod === 'cod' ? (
                      `Place Order (₹${total.toFixed(2)})`
                    ) : (
                      `Pay ₹${total.toFixed(2)}`
                    )}
                  </button>
                </div>

                {paymentMethod === 'razorpay' && (
                  <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
                    <svg
                      className="h-5 w-5 text-gray-400 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Secure payment powered by Razorpay</span>
                  </div>
                )}
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-sm font-medium text-gray-900">Need help with your order?</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Contact our customer support team at support@ecommerce.com or call +91 9876543210
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}