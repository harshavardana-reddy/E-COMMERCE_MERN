import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiX } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import BackendURL from '../BackendURL';
import { sellerApi } from "../Api";

const categories = ['Electronics', 'Fashion', 'Home Appliances', 'Books'];

export default function AddProduct() {

    const [sellerId,setSellerId] = useState("");

    useEffect(() => {
        const seller = JSON.parse(localStorage.getItem("seller"));
        if (seller) {
            setSellerId(seller.sellerId);
        }
    }, []);

    function generateProductId() {
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        return `PROD-HMZ-${randomNum}`;
    }
  const [formData, setFormData] = useState({
    productId: generateProductId(),
    productName: '',
    productPrice: '',
    productDescription: '',
    productCategory: 'Electronics',
    sellerId: sellerId,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageError, setImageError] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate image type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setImageError('Only PNG, JPG, and JPEG images are allowed');
      return;
    }

    // Validate image size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setImageError('Image size must be less than 2MB');
      return;
    }

    setImageError('');
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage({
        src: reader.result,
        type: file.type,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpeg', '.jpg']
    },
    maxFiles: 1
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!previewImage) {
      setImageError('Product image is required');
      return;
    }

    if (!formData.productName || !formData.productPrice || !formData.productDescription || !formData.productCategory) {
      toast.error('All fields are required');
      return;
    }

    setIsSubmitting(true);

    try {
      const productData = {
        ...formData,
        productImage: previewImage.src,
        productImageType: previewImage.type,
        sellerId:sellerId // Replace with actual seller ID from auth/session
      };

      const response = await sellerApi.post(`${BackendURL.Seller}/addproduct`, productData);
      
      if (response.data.success) {
        toast.success('Product added successfully');
        // Reset form
        setFormData({
            productId: generateProductId(),
            productName: '',
            productPrice: '',
            productDescription: '',
            productCategory: 'Electronics',
            sellerId: sellerId,
        });
        setPreviewImage(null);
      } else {
        toast.error(response.data.message || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error(error.response?.data?.message || 'Failed to add product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeImage = () => {
    setPreviewImage(null);
    setImageError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Add New Product</h1>
            <p className="mt-1 text-indigo-100">Fill in the details below to add a new product</p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Product Name */}
              <div>
                <label htmlFor="productName" className="block text-sm font-medium text-gray-700">
                  Product Name *
                </label>
                <input
                  type="text"
                  id="productName"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                  placeholder="e.g. Wireless Headphones"
                />
              </div>
              
              {/* Product Price */}
              <div>
                <label htmlFor="productPrice" className="block text-sm font-medium text-gray-700">
                  Price *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">&#8377;</span>
                  </div>
                  <input
                    type="number"
                    id="productPrice"
                    name="productPrice"
                    value={formData.productPrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                    className="block w-full pl-7 pr-12 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              {/* Product Description */}
              <div>
                <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <textarea
                  id="productDescription"
                  name="productDescription"
                  rows={4}
                  value={formData.productDescription}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                  placeholder="Describe the product features and specifications..."
                />
              </div>
              
              {/* Product Category */}
              <div>
                <label htmlFor="productCategory" className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  id="productCategory"
                  name="productCategory"
                  value={formData.productCategory}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              {/* Product Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Product Image *
                </label>
                {previewImage ? (
                  <div className="mt-2 relative">
                    <img
                      src={previewImage.src}
                      alt="Product preview"
                      className="h-48 w-full object-contain rounded-md border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm text-red-600 hover:text-red-800 focus:outline-none"
                    >
                      <FiX className="h-5 w-5" />
                    </button>
                    <p className="mt-1 text-xs text-gray-500">{previewImage.name}</p>
                  </div>
                ) : (
                  <div
                    {...getRootProps()}
                    className={`mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'} ${imageError ? 'border-red-300' : ''}`}
                  >
                    <div className="space-y-1 text-center">
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                          <span>Upload an image</span>
                          <input {...getInputProps()} className="sr-only" />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG up to 2MB
                      </p>
                      <div className="flex justify-center">
                        <FiUpload className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                  </div>
                )}
                {imageError && (
                  <p className="mt-2 text-sm text-red-600">{imageError}</p>
                )}
              </div>
            </div>
            
            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => {
                  setFormData({
                    productId: generateProductId(),
                    productName: '',
                    productPrice: '',
                    productDescription: '',
                    productCategory: 'Electronics',
                    sellerId: sellerId,
                  });
                  setPreviewImage(null);
                  setImageError('');
                }}
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </>
                ) : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Additional Info */}
        <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Product Information</h2>
          </div>
          <div className="px-6 py-4">
            <p className="text-sm text-gray-600">
              All fields marked with * are required. Product images should be clear and high quality.
              Make sure to select the appropriate category for better discoverability.
            </p>
          </div>
        </div>
      </div>
      <ToastContainer/>
    </div>
  );
}