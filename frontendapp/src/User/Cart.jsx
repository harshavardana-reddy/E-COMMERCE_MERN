import { useState, useEffect } from 'react';
import { FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import BackendURL from '../BackendURL';
import { userApi } from '../Api';

export default function Cart() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Get user from localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    if (userData) {
      fetchCartItems(userData.userId);
    }
  }, []);

  const fetchCartItems = async (userId) => {
    setIsLoading(true);
    try {
      const response = await userApi.get(`${BackendURL.User}/fetchcart/${userId}`);
      if (response.data.cart && response.data.cart.items) {
        setCartItems(response.data.cart.items);
        // console.log('Cart items:', cartItems);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart items');
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    if (!user) return;

    setIsUpdating(true);
    try {
      await userApi.put(`${BackendURL.User}/updatecart/${user.userId}/${productId}`, {
        quantity: newQuantity
      });
      
      // Optimistically update the UI
      setCartItems(cartItems.map(item => 
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    } finally {
      setIsUpdating(false);
    }
  };

  const removeItem = async (productId) => {
    if (!user) return;

    setIsUpdating(true);
    try {
      await userApi.delete(`${BackendURL.User}/deletecartitem/${user.userId}/${productId}`);
      
      // Optimistically update the UI
      setCartItems(cartItems.filter(item => item.productId !== productId));
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    } finally {
      setIsUpdating(false);
    }
  };

  const checkout = () => {
    if (!user) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }
    
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    toast.success('Proceeding to checkout');
    navigate('/user/checkout');
  };

  // Calculate cart totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 1000 ? 0 : 99;
  // const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + shipping;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-indigo-600 hover:text-indigo-800 mr-4"
          >
            <FiArrowLeft className="mr-2" /> Continue Shopping
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Your Shopping Cart</h1>
        </div>

        {!user ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <FiShoppingCart className="mx-auto h-16 w-16 text-gray-400" />
            <h2 className="mt-4 text-xl font-medium text-gray-900">Please login to view your cart</h2>
            <button
              onClick={() => navigate('/login')}
              className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Login
            </button>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <FiShoppingCart className="mx-auto h-16 w-16 text-gray-400" />
            <h2 className="mt-4 text-xl font-medium text-gray-900">Your cart is empty</h2>
            <p className="mt-2 text-gray-600">Start adding some items to your cart</p>
            <button
              onClick={() => navigate('/user/products')}
              className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    // {console.log(item)}
                    <div key={item.productId} className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row">
                        <div className="flex-shrink-0 mb-4 sm:mb-0">
                          <img
                            src={item.image || 'https://via.placeholder.com/150'}
                            alt={item.productId?.productName}
                            className="w-32 h-32 object-contain rounded-md"
                          />
                        </div>
                        <div className="ml-0 sm:ml-6 flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {item.name || 'Product'}
                              </h3>
                            </div>
                            <button
                              onClick={() => removeItem(item.productId)}
                              disabled={isUpdating}
                              className="text-gray-400 hover:text-red-500 disabled:opacity-50"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center">
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                disabled={isUpdating || item.quantity <= 1}
                                className="p-1 text-gray-500 hover:text-indigo-600 disabled:opacity-50"
                              >
                                <FiMinus className="h-4 w-4" />
                              </button>
                              <span className="mx-3 text-gray-700">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                disabled={isUpdating}
                                className="p-1 text-gray-500 hover:text-indigo-600 disabled:opacity-50"
                              >
                                <FiPlus className="h-4 w-4" />
                              </button>
                            </div>
                            <p className="text-lg font-medium text-gray-900">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">
                      {shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-4 flex justify-between">
                    <span className="text-lg font-medium text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">₹{total.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={checkout}
                  disabled={isUpdating || cartItems.length === 0}
                  className="mt-6 w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Processing...' : 'Checkout'}
                </button>
                <p className="mt-4 text-center text-sm text-gray-500">
                  or{' '}
                  <button
                    onClick={() => navigate('/')}
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Continue Shopping
                  </button>
                </p>
              </div>

              {/* Promo Code */}
              <div className="mt-6 bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Apply Promo Code</h3>
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}