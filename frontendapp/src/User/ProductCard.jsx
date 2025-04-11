import { FiShoppingCart, FiHeart, FiEye, FiStar } from "react-icons/fi";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const ProductCard = ({ id, name, price, rating, image, onAddToCart, onAddToWishlist }) => {
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart && onAddToCart(id);
  };

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToWishlist && onAddToWishlist(id);
  };

  return (
    <motion.div 
      whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      <Link to={`/product/${id}`} className="block">
        <div className="relative pb-[100%] bg-gray-100 overflow-hidden">
          <img 
            src={image} 
            alt={name} 
            className="absolute h-full w-full object-cover hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md">
            <span className="text-xs font-semibold text-yellow-600 flex items-center">
              <FiStar className="mr-1 fill-yellow-400 text-yellow-400" />
              {rating}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/product/${id}`} className="block">
          <h3 className="text-lg font-medium text-gray-800 mb-1 truncate hover:text-purple-600 transition-colors">
            {name}
          </h3>
          <p className="text-lg font-bold text-purple-600 mb-3">${price.toFixed(2)}</p>
        </Link>

        <div className="flex justify-between items-center">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg flex items-center justify-center transition-colors"
          >
            <FiShoppingCart className="mr-2" />
            <span className="text-sm">Add to Cart</span>
          </motion.button>

          <div className="flex ml-2 space-x-1">
            <button 
              onClick={handleAddToWishlist}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-pink-500 transition-colors"
              aria-label="Add to wishlist"
            >
              <FiHeart />
            </button>
            <Link 
              to={`/user/product/${id}`}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-blue-500 transition-colors"
              aria-label="View details"
            >
              <FiEye />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;