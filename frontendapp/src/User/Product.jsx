import { useState, useEffect } from 'react';
import { FiShoppingCart, FiShare2, FiChevronLeft, FiHeart } from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import BackendURL from '../BackendURL';
import { toast, ToastContainer } from 'react-toastify';
import { userApi } from '../Api';

export default function Product() {
  const { id } = useParams();
  const productId = id;
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [quantity, setQuantity] = useState(1);
  // const [selectedImage, setSelectedImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productResponse = await userApi.get(`${BackendURL.User}/getProduct/${productId}`);
        setProduct(productResponse.data.product);
        
        if (productResponse.data.product.sellerId) {
          const sellerResponse = await userApi.get(`${BackendURL.User}/getSeller/${productResponse.data.product.sellerId}`);
          setSellerInfo(sellerResponse.data.seller);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        toast.error('Failed to fetch product details');
      }
    };

    fetchProduct();
  }, [productId]);

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!user) {
        toast.error('Please login to add items to cart');
        navigate('/login');
        return;
      }

      if (product.productStatus !== 'Available') {
        toast.error('This product is currently unavailable');
        return;
      }

      const response = await userApi.post(`${BackendURL.User}/addtocart/${user.userId}`, {
        productId: product.productId,
        quantity: quantity
      });

      if (response.data.success) {
        toast.success(`${quantity} ${product.productName} added to cart!`);
      } else {
        toast.error(response.data.message || 'Failed to add to cart');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    setIsBuyingNow(true);
    try {
      navigate('/user/checkout', { state: { product: product, quantity: quantity } });
    } catch (err) {
      toast.error('Failed to proceed to checkout');
    } finally {
      setIsBuyingNow(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.productName,
        text: `Check out this ${product.productName} on our store!`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.info('Link copied to clipboard!');
    }
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(!isWishlisted ? 'Added to wishlist' : 'Removed from wishlist');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Product not found</h2>
          <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <FiChevronLeft /> Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <FiChevronLeft /> Back
          </button>
          <div className="text-sm text-gray-500 hidden sm:block">
            Home / {product.productCategory} / <span className="text-gray-700">{product.productName}</span>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 md:p-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl overflow-hidden mb-4 h-80 md:h-96 flex items-center justify-center p-4 border border-gray-200">
                {product.productImage ? (
                  <img 
                    src={product.productImage} 
                    alt={product.productName} 
                    className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="text-gray-400">No image available</div>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.productName}</h1>
                  {sellerInfo && (
                    <p className="text-sm text-gray-500 mt-1">Sold by {sellerInfo.sellerName}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={toggleWishlist}
                    className={`p-2 rounded-full ${isWishlisted ? 'text-red-500' : 'text-gray-400'} hover:bg-gray-100 transition-colors`}
                  >
                    <FiHeart className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={handleShare}
                    className="p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
                  >
                    <FiShare2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{product.productPrice.toLocaleString('en-IN')}
                  </span>
                  {product.originalPrice && (
                    <span className="ml-2 text-lg text-gray-500 line-through">
                      ₹{product.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <span className={`px-3 py-1 text-sm rounded-full ${
                  product.productStatus === 'Available' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.productStatus}
                </span>
              </div>

              {product.productDescription && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <div className="prose prose-sm text-gray-600">
                    <p>{product.productDescription}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm mt-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-medium text-gray-500">Category</h4>
                  <p className="text-gray-900 font-medium mt-1">{product.productCategory}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-medium text-gray-500">Seller</h4>
                  <p className="text-gray-900 font-medium mt-1">{sellerInfo?.sellerName || 'Unknown Seller'}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center gap-4 mb-6">
                  <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button 
                      onClick={decrementQuantity}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-4 py-2 text-center w-12 border-x border-gray-300">{quantity}</span>
                    <button 
                      onClick={incrementQuantity}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || product.productStatus !== 'Available'}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white ${
                      isAddingToCart ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                    } ${product.productStatus !== 'Available' ? 'opacity-50 cursor-not-allowed' : 'transition-colors'}`}
                  >
                    {isAddingToCart ? (
                      'Adding...'
                    ) : (
                      <>
                        <FiShoppingCart className="h-5 w-5" />
                        Add to Cart
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={isBuyingNow || product.productStatus !== 'Available'}
                    className={`flex-1 px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white ${
                      isBuyingNow ? 'bg-gray-600' : 'bg-gray-800 hover:bg-gray-900'
                    } ${product.productStatus !== 'Available' ? 'opacity-50 cursor-not-allowed' : 'transition-colors'}`}
                  >
                    {isBuyingNow ? 'Processing...' : 'Buy Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}