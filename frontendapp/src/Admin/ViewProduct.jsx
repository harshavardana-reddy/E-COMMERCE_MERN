/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { FiSearch, FiEye, FiStar, FiFilter, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import BackendURL from '../BackendURL';
import { adminApi } from "../Api";

// Constants
const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Home Appliances', 'Books'];
const RATINGS = ['All', '5 Stars', '4 Stars & Up', '3 Stars & Up'];
const ITEMS_PER_PAGE = 8;
const PRICE_RANGE_LIMITS = [0, 100000];

export default function ViewProduct() {
  // State management
  const [state, setState] = useState({
    products: [],
    filteredProducts: [],
    currentItems: [],
    isLoading: true,
    searchTerm: '',
    selectedCategory: 'All',
    selectedRating: 'All',
    priceRange: PRICE_RANGE_LIMITS,
    showFilters: false,
    currentPage: 1,
    totalPages: 1,
    selectedProduct: null,
    isViewModalOpen: false,
    sellerNames: {} // Add this to store seller names
  });

  // Derived values
  const {
    products, filteredProducts, currentItems, isLoading,
    searchTerm, selectedCategory, selectedRating, priceRange,
    showFilters, currentPage, totalPages, selectedProduct,
    isViewModalOpen
  } = state;

  // Helper functions
  const updateState = (newState) => setState(prev => ({ ...prev, ...newState }));

  const fetchProducts = async () => {
    updateState({ isLoading: true });
    try {
      const response = await adminApi.get(`${BackendURL.Admin}/getproducts`);
      const products = response.data.data;
      
      // Create a unique set of seller IDs
      const sellerIds = [...new Set(products.map(p => p.sellerId))];
      
      // Fetch all seller names in parallel
      const sellerNamePromises = sellerIds.map(id => 
        adminApi.get(`${BackendURL.Admin}/getseller/${id}`)
          .then(res => ({ id, name: res.data.data.sellerName }))
          .catch(() => ({ id, name: 'Unknown Seller' }))
      );
      
      const sellerNamesArray = await Promise.all(sellerNamePromises);
      const sellerNames = sellerNamesArray.reduce((acc, curr) => {
        acc[curr.id] = curr.name;
        return acc;
      }, {});
      
      updateState({
        products,
        filteredProducts: products,
        isLoading: false,
        sellerNames
      });
    } catch (error) {
      toast.error('Failed to fetch products');
      console.error('Error:', error);
      updateState({ isLoading: false });
    }
  };

  const getSellerName = async(sellerId) => {
    try {
      const response = await adminApi.get(`${BackendURL.Admin}/getseller/${sellerId}`);
      return response.data.data.sellerName;
    } catch (error) {
      console.error('Error fetching seller name:', error);
      return 'Unknown Seller';
    }
  }

  const applyFilters = () => {
    let results = products;

    if (searchTerm) {
      results = results.filter(product =>
        product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.productDescription.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      results = results.filter(product => product.productCategory === selectedCategory);
    }

    if (selectedRating !== 'All') {
      const minRating = parseInt(selectedRating[0]);
      results = results.filter(product => product.averageRating >= minRating);
    }

    results = results.filter(product => 
      product.productPrice >= priceRange[0] && product.productPrice <= priceRange[1]
    );

    updateState({ 
      filteredProducts: results,
      currentPage: 1 
    });
  };

  const updatePagination = () => {
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    updateState({
      currentItems: filteredProducts.slice(indexOfFirstItem, indexOfLastItem),
      totalPages: Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FiStar key={i} className="text-yellow-400 fill-current" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FiStar key={i} className="text-yellow-400 fill-current opacity-50" />);
      } else {
        stars.push(<FiStar key={i} className="text-gray-300" />);
      }
    }
    return stars;
  };

  // Event handlers
  const handlePageChange = (pageNumber) => {
    updateState({ currentPage: pageNumber });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handleViewProduct = (product) => {
    updateState({
      selectedProduct: product,
      isViewModalOpen: true
    });
  };

  const resetFilters = () => {
    updateState({
      searchTerm: '',
      selectedCategory: 'All',
      selectedRating: 'All',
      priceRange: PRICE_RANGE_LIMITS
    });
  };

  // Effects
  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedCategory, selectedRating, priceRange, products]);

  useEffect(() => {
    updatePagination();
  }, [filteredProducts, currentPage]);

  // Render components
  const renderPagination = () => (
    <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-4">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium ${
            currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Previous
        </button>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium ${
            currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}
            </span>{' '}
            of <span className="font-medium">{filteredProducts.length}</span> results
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''
              }`}
            >
              <span className="sr-only">Previous</span>
              <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  aria-current={currentPage === pageNum ? 'page' : undefined}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                    currentPage === pageNum 
                      ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' 
                      : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''
              }`}
            >
              <span className="sr-only">Next</span>
              <FiChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );

  const renderProductCard = (product) => (
    <div key={product.productId} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {product.productImage ? (
          <img
            src={product.productImage}
            alt={product.productName}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span>No Image</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{product.productName}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.productDescription}</p>
          </div>
          
          <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
            {product.productCategory}
          </span>
        </div>
        
        <span className={`text-xs px-2 py-1 rounded-full ${
          product.productStatus === 'Available' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {product.productStatus}
        </span>

        <span className="text-xl font-bold text-gray-900">&#8377;{product.productPrice.toFixed(2)}</span>
        
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => handleViewProduct(product)}
            className="flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <FiEye className="h-5 w-5" />
            <span>View Details</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => updateState({ selectedCategory: category })}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === category 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
        <div className="flex flex-wrap gap-2">
          {RATINGS.map(rating => (
            <button
              key={rating}
              onClick={() => updateState({ selectedRating: rating })}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedRating === rating 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {rating}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price Range: &#8377;{priceRange[0]} - &#8377;{priceRange[1]}
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="1000"
            step="10"
            value={priceRange[0]}
            onChange={(e) => updateState({ priceRange: [parseInt(e.target.value), priceRange[1]] })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <input
            type="range"
            min="0"
            max="1000"
            step="10"
            value={priceRange[1]}
            onChange={(e) => updateState({ priceRange: [priceRange[0], parseInt(e.target.value)] })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );

  const renderViewModal = () => (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl leading-6 font-medium text-gray-900">
                    {selectedProduct.productName}
                  </h3>
                  <button
                    onClick={() => updateState({ isViewModalOpen: false })}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center h-64 md:h-96">
                    {selectedProduct.productImage ? (
                      <img
                        src={selectedProduct.productImage}
                        alt={selectedProduct.productName}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-gray-400">No Image Available</span>
                    )}
                  </div>
                  <div>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900">
                        &#8377;{selectedProduct.productPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="mb-4">
                      <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                        {selectedProduct.productCategory}
                      </span>
                    </div>
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                      <p className="text-gray-600">{selectedProduct.productDescription}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Product ID</h4>
                        <p className="text-gray-600">{selectedProduct.productId}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Seller</h4>
                        <p className="text-gray-600">{state.sellerNames[selectedProduct.sellerId] || 'Loading...'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Status</h4>
                        <p className="text-gray-600">{selectedProduct.productStatus}</p>
                      </div>
                      {/* <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Average Rating</h4>
                        <div className="flex items-center">
                          {renderStars(selectedProduct.averageRating)}
                          <span className="ml-2 text-gray-600">({selectedProduct.averageRating.toFixed(1)})</span>
                        </div>
                      </div> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={() => updateState({ isViewModalOpen: false })}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Product Catalog</h1>
          <p className="mt-2 text-lg text-gray-600">Browse all products in the marketplace</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => updateState({ searchTerm: e.target.value })}
              />
            </div>

            <button
              onClick={() => updateState({ showFilters: !showFilters })}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              <FiFilter className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>

          {showFilters && renderFilters()}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : currentItems.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentItems.map(renderProductCard)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && renderPagination()}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900">No products found</h3>
            <p className="mt-2 text-gray-600">Try adjusting your search or filter criteria</p>
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {isViewModalOpen && selectedProduct && renderViewModal()}
      
      <ToastContainer />
    </div>
  );
}