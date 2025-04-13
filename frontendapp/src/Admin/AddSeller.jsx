import { useState } from 'react';
import { toast, ToastContainer } from "react-toastify";
import BackendURL from '../BackendURL';
import { adminApi } from "../Api";

export default function AddSeller() {
  const [formData, setFormData] = useState({
    sellerId: '',
    sellerName: '',
    sellerEmail: '',
    sellerPhone: '',
    sellerAddress: '',
    sellerCity: '',
    sellerState: '',
    sellerCountry: 'United States',
    password: 'amz8787'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Here you would typically make an API call to your backend
      // await adminApi.post('/api/sellers', formData);
      const response = await adminApi.post(`${BackendURL.Admin}/addseller`,formData)
      // Simulate API call
      if(response.status === 201){
        toast.success('Seller added successfully!');
        setFormData({
          sellerId: '',
          sellerName: '',
          sellerEmail: '',
          sellerPhone: '',
          sellerAddress: '',
          sellerCity: '',
          sellerState: '',
          sellerCountry: 'United States',
          password: 'amz8787'
        });
      }
      else{
        toast.error('Failed to add seller. Please try again.');
        console.error('Error:', response.data);
      }
      
      
    } catch (error) {
      toast.error('Failed to add seller. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const countries = [
    'United States',
    'Canada',
    'United Kingdom',
    'Australia',
    'Germany',
    'France',
    'Japan',
    'India',
    'Brazil',
    'Mexico'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Add New Seller</h1>
            <p className="mt-1 text-indigo-100">Fill in the details below to register a new seller</p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Seller ID */}
              <div>
                <label htmlFor="sellerId" className="block text-sm font-medium text-gray-700">
                  Seller ID *
                </label>
                <input
                  type="text"
                  id="sellerId"
                  name="sellerId"
                  value={formData.sellerId}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                  placeholder="e.g. AMZ-12345"
                />
              </div>
              
              {/* Seller Name */}
              <div>
                <label htmlFor="sellerName" className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="sellerName"
                  name="sellerName"
                  value={formData.sellerName}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                  placeholder="John Doe"
                />
              </div>
              
              {/* Email */}
              <div>
                <label htmlFor="sellerEmail" className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  type="email"
                  id="sellerEmail"
                  name="sellerEmail"
                  value={formData.sellerEmail}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                  placeholder="john@example.com"
                />
              </div>
              
              {/* Phone */}
              <div>
                <label htmlFor="sellerPhone" className="block text-sm font-medium text-gray-700">
                  Phone *
                </label>
                <input
                  type="tel"
                  id="sellerPhone"
                  name="sellerPhone"
                  value={formData.sellerPhone}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              
              {/* Address */}
              <div className="sm:col-span-2">
                <label htmlFor="sellerAddress" className="block text-sm font-medium text-gray-700">
                  Street Address *
                </label>
                <input
                  type="text"
                  id="sellerAddress"
                  name="sellerAddress"
                  value={formData.sellerAddress}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                  placeholder="123 Main St"
                />
              </div>
              
              {/* City */}
              <div>
                <label htmlFor="sellerCity" className="block text-sm font-medium text-gray-700">
                  City *
                </label>
                <input
                  type="text"
                  id="sellerCity"
                  name="sellerCity"
                  value={formData.sellerCity}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                  placeholder="New York"
                />
              </div>
              
              {/* State */}
              <div>
                <label htmlFor="sellerState" className="block text-sm font-medium text-gray-700">
                  State/Province *
                </label>
                <input
                  type="text"
                  id="sellerState"
                  name="sellerState"
                  value={formData.sellerState}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                  placeholder="NY"
                />
              </div>
              
              {/* Country */}
              <div>
                <label htmlFor="sellerCountry" className="block text-sm font-medium text-gray-700">
                  Country *
                </label>
                <select
                  id="sellerCountry"
                  name="sellerCountry"
                  value={formData.sellerCountry}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                >
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="text"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    readOnly
                    className="block w-full rounded-md border-gray-300 bg-gray-100 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">Default</span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">Default password will be used</p>
              </div>
            </div>
            
            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setFormData({
                  sellerId: '',
                  sellerName: '',
                  sellerEmail: '',
                  sellerPhone: '',
                  sellerAddress: '',
                  sellerCity: '',
                  sellerState: '',
                  sellerCountry: 'United States',
                  password: 'amz8787'
                })}
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
                    Processing...
                  </>
                ) : 'Add Seller'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Additional Info */}
        <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Seller Information</h2>
          </div>
          <div className="px-6 py-4">
            <p className="text-sm text-gray-600">
              All fields marked with * are required. The seller will receive their login credentials via email.
              The default password can be changed by the seller after their first login.
            </p>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}