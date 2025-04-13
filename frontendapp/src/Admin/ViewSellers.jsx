import { useState, useEffect } from 'react';
import { FiSearch, FiEdit2, FiTrash2, FiEye, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import { toast, ToastContainer } from "react-toastify";
import BackendURL from '../BackendURL';
import { adminApi } from "../Api";

export default function ViewSellers() {
  const [sellers, setSellers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    sellerId: '',
    sellerName: '',
    sellerEmail: '',
    sellerPhone: '',
    sellerAddress: '',
    sellerCity: '',
    sellerState: '',
    sellerCountry: 'United States',
    status: 'Active'
  });

  useEffect(() => {
    const fetchSellers = async () => {
      setIsLoading(true);
      try {
        const response = await adminApi.get(`${BackendURL.Admin}/getsellers`);
        setSellers(response.data.data);
      } catch (error) {
        toast.error('Failed to fetch sellers');
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSellers();
  }, []);

  // Filter sellers based on search term
  const filteredSellers = sellers.filter(seller =>
    seller.sellerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.sellerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.sellerCity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSellers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSellers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDelete = async (sellerId) => {
    if (window.confirm('Are you sure you want to delete this seller?')) {
      try {
        await adminApi.delete(`${BackendURL.Admin}/deleteseller/${sellerId}`);
        setSellers(sellers.filter(seller => seller.sellerId !== sellerId));
        toast.success('Seller deleted successfully');
      } catch (error) {
        toast.error('Failed to delete seller');
        console.error('Error:', error);
      }
    }
  };

  const handleView = (seller) => {
    setSelectedSeller(seller);
    setIsViewModalOpen(true);
  };

  const handleEdit = (seller) => {
    setEditFormData({
      sellerId: seller.sellerId,
      sellerName: seller.sellerName,
      sellerEmail: seller.sellerEmail,
      sellerPhone: seller.sellerPhone,
      sellerAddress: seller.sellerAddress || '',
      sellerCity: seller.sellerCity,
      sellerState: seller.sellerState || '',
      sellerCountry: seller.sellerCountry || 'United States',
      status: seller.status || 'Active'
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await adminApi.put(
        `${BackendURL.Admin}/updateseller/${editFormData.sellerId}`,
        editFormData
      );
      setSellers(sellers.map(seller => 
        seller.sellerId === editFormData.sellerId ? response.data.data : seller
      ));
      toast.success('Seller updated successfully');
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error('Failed to update seller');
      console.error('Error:', error);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Seller Management</h1>
          <p className="mt-2 text-sm text-gray-600">View and manage all registered sellers in your platform</p>
        </div>

        {/* Search and Controls */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search sellers..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="flex space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Export CSV
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Add New Seller
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Seller ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.length > 0 ? (
                      currentItems.map((seller) => (
                        <tr key={seller.sellerId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {seller.sellerId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {seller.sellerName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {seller.sellerEmail}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {seller.sellerCity}, {seller.sellerState} {seller.sellerState && seller.sellerCountry !== 'United States' ? '' : seller.sellerCountry}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(seller.status)}`}>
                              {seller.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleView(seller)}
                                className="text-indigo-600 hover:text-indigo-900"
                                title="View Details"
                              >
                                <FiEye className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleEdit(seller)}
                                className="text-yellow-600 hover:text-yellow-900"
                                title="Edit"
                              >
                                <FiEdit2 className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(seller.sellerId)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <FiTrash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                          No sellers found matching your search criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredSellers.length > itemsPerPage && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                        <span className="font-medium">
                          {indexOfLastItem > filteredSellers.length ? filteredSellers.length : indexOfLastItem}
                        </span>{' '}
                        of <span className="font-medium">{filteredSellers.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                          <span className="sr-only">Previous</span>
                          <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                          <button
                            key={number}
                            onClick={() => paginate(number)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === number ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                          >
                            {number}
                          </button>
                        ))}
                        <button
                          onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                          <span className="sr-only">Next</span>
                          <FiChevronRight className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedSeller && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Seller Details: {selectedSeller.sellerName}
                    </h3>
                    <div className="mt-4">
                      <div className="grid grid-cols-1 gap-y-4 gap-x-8 sm:grid-cols-2">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Seller ID</p>
                          <p className="mt-1 text-sm text-gray-900">{selectedSeller.sellerId}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Status</p>
                          <p className="mt-1 text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedSeller.status)}`}>
                              {selectedSeller.status}
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Email</p>
                          <p className="mt-1 text-sm text-gray-900">{selectedSeller.sellerEmail}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Phone</p>
                          <p className="mt-1 text-sm text-gray-900">{selectedSeller.sellerPhone}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-sm font-medium text-gray-500">Location</p>
                          <p className="mt-1 text-sm text-gray-900">
                            {selectedSeller.sellerCity}{selectedSeller.sellerState ? `, ${selectedSeller.sellerState}` : ''}, {selectedSeller.sellerCountry}
                          </p>
                        </div>
                        {selectedSeller.sellerAddress && (
                          <div className="sm:col-span-2">
                            <p className="text-sm font-medium text-gray-500">Address</p>
                            <p className="mt-1 text-sm text-gray-900">{selectedSeller.sellerAddress}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed z-20 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Edit Seller: {editFormData.sellerName}
                      </h3>
                      <button
                        onClick={() => setIsEditModalOpen(false)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <FiX className="h-6 w-6" />
                      </button>
                    </div>
                    <div className="mt-4">
                      <form onSubmit={handleEditSubmit}>
                        <div className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2">
                          {/* Seller ID (readonly) */}
                          <div className="sm:col-span-1">
                            <label htmlFor="sellerId" className="block text-sm font-medium text-gray-700">
                              Seller ID
                            </label>
                            <input
                              type="text"
                              id="sellerId"
                              name="sellerId"
                              value={editFormData.sellerId}
                              readOnly
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                            />
                          </div>

                          {/* Seller Name */}
                          <div className="sm:col-span-1">
                            <label htmlFor="sellerName" className="block text-sm font-medium text-gray-700">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              id="sellerName"
                              name="sellerName"
                              value={editFormData.sellerName}
                              onChange={handleEditChange}
                              required
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                            />
                          </div>

                          {/* Email */}
                          <div className="sm:col-span-1">
                            <label htmlFor="sellerEmail" className="block text-sm font-medium text-gray-700">
                              Email *
                            </label>
                            <input
                              type="email"
                              id="sellerEmail"
                              name="sellerEmail"
                              value={editFormData.sellerEmail}
                              onChange={handleEditChange}
                              required
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                            />
                          </div>

                          {/* Phone */}
                          <div className="sm:col-span-1">
                            <label htmlFor="sellerPhone" className="block text-sm font-medium text-gray-700">
                              Phone *
                            </label>
                            <input
                              type="tel"
                              id="sellerPhone"
                              name="sellerPhone"
                              value={editFormData.sellerPhone}
                              onChange={handleEditChange}
                              required
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                            />
                          </div>

                          {/* Address */}
                          <div className="sm:col-span-2">
                            <label htmlFor="sellerAddress" className="block text-sm font-medium text-gray-700">
                              Street Address
                            </label>
                            <input
                              type="text"
                              id="sellerAddress"
                              name="sellerAddress"
                              value={editFormData.sellerAddress}
                              onChange={handleEditChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                            />
                          </div>

                          {/* City */}
                          <div className="sm:col-span-1">
                            <label htmlFor="sellerCity" className="block text-sm font-medium text-gray-700">
                              City *
                            </label>
                            <input
                              type="text"
                              id="sellerCity"
                              name="sellerCity"
                              value={editFormData.sellerCity}
                              onChange={handleEditChange}
                              required
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                            />
                          </div>

                          {/* State */}
                          <div className="sm:col-span-1">
                            <label htmlFor="sellerState" className="block text-sm font-medium text-gray-700">
                              State/Province
                            </label>
                            <input
                              type="text"
                              id="sellerState"
                              name="sellerState"
                              value={editFormData.sellerState}
                              onChange={handleEditChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                            />
                          </div>

                          {/* Country */}
                          <div className="sm:col-span-1">
                            <label htmlFor="sellerCountry" className="block text-sm font-medium text-gray-700">
                              Country *
                            </label>
                            <select
                              id="sellerCountry"
                              name="sellerCountry"
                              value={editFormData.sellerCountry}
                              onChange={handleEditChange}
                              required
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                            >
                              {countries.map(country => (
                                <option key={country} value={country}>{country}</option>
                              ))}
                            </select>
                          </div>

                          {/* Status */}
                          <div className="sm:col-span-1">
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                              Status *
                            </label>
                            <select
                              id="status"
                              name="status"
                              value={editFormData.status}
                              onChange={handleEditChange}
                              required
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                            >
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                            </select>
                          </div>
                        </div>

                        {/* Form Actions */}
                        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-200">
                          <button
                            type="button"
                            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={() => setIsEditModalOpen(false)}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Save Changes
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}