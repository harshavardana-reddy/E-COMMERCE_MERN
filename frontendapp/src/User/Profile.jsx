import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiEdit2, FiSave, FiLock, FiMail, FiPhone, FiMapPin, FiUser, FiEyeOff, FiEye, FiX } from "react-icons/fi";
import { Tooltip } from "react-tooltip";
import BackendURL from "../BackendURL";
import { toast, ToastContainer } from "react-toastify";
import { userApi } from '../Api';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    userEmail: "",
    userPhone: "",
    userAddress: "",
    userCity: "",
    userState: "",
    userCountry: "",
    userGender: ""
  });
  const [imagePreview, setImagePreview] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setUser(userData);
      setFormData({
        userName: userData.userName || "",
        userEmail: userData.userEmail || "",
        userPhone: userData.userPhone || "",
        userAddress: userData.userAddress || "",
        userCity: userData.userCity || "",
        userState: userData.userState || "",
        userCountry: userData.userCountry || "",
        userGender: userData.userGender || ""
      });
      setImagePreview(userData.userImage);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async() => {
    // Here you would typically send the updated data to your backend
    setIsSaving(true);
    const userData = JSON.parse(localStorage.getItem("user"));
    const form = { ...user, ...formData, userImage: imagePreview };
    console.log(form)
    try {
      const response = await userApi.put(`${BackendURL.User}/updateprofile/${userData.userId}`,form)
      console.log(response)
      const updatedUser = { ...userData, ...response.data.user };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success("Profile Updated Succesfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
    finally{
      setIsEditing(false);
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsUpdatingPassword(true);
    const userData = JSON.parse(localStorage.getItem("user"));
    
    try {
      const response = await userApi.put(
        `${BackendURL.User}/updatepassword/${userData.userId}`,
        {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        }
      );

      if (response.data.success) {
        toast.success("Password updated successfully!");
        setShowPasswordModal(false);
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleShowPassword = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-6"
    >
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Profile Header */}
        <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 h-40">
          <div className="absolute -bottom-16 left-6">
            <div className="relative group">
              <div className="h-32 w-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                    <FiUser className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
              {isEditing && (
                <label 
                  htmlFor="profileImage"
                  className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  data-tooltip-id="image-tooltip"
                  data-tooltip-content="Change photo"
                >
                  <FiEdit2 className="text-white h-6 w-6" />
                  <input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}
              <Tooltip id="image-tooltip" />
            </div>
          </div>
          <div className="absolute right-6 top-6">
          {isEditing ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg shadow-md font-medium ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="mr-2" />
                  Save Changes
                </>
              )}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg shadow-md font-medium"
            >
              <FiEdit2 className="mr-2" />
              Edit Profile
            </motion.button>
          )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="pt-20 px-6 pb-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              {isEditing ? (
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleInputChange}
                  className="border-b-2 border-blue-500 outline-none w-full max-w-xs bg-transparent"
                />
              ) : (
                user.userName
              )}
            </h1>
            <p className="text-gray-600 flex items-center mt-1">
              <FiMail className="mr-2" />
              {isEditing ? (
                <input
                  type="email"
                  name="userEmail"
                  value={formData.userEmail}
                  onChange={handleInputChange}
                  className="border-b-2 border-blue-500 outline-none w-full max-w-xs bg-transparent"
                />
              ) : (
                user.userEmail
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-50 p-6 rounded-lg"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FiUser className="mr-2 text-blue-500" />
                Personal Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Gender</label>
                  {isEditing ? (
                    <select
                      name="userGender"
                      value={formData.userGender}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p className="mt-1 text-gray-800">{user.userGender || "Not specified"}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="userPhone"
                      value={formData.userPhone}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-800 flex items-center">
                      <FiPhone className="mr-2" />
                      {user.userPhone || "Not provided"}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Address Information */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-50 p-6 rounded-lg"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FiMapPin className="mr-2 text-blue-500" />
                Address Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Address</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="userAddress"
                      value={formData.userAddress}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-800">{user.userAddress || "Not provided"}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">City</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="userCity"
                        value={formData.userCity}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="mt-1 text-gray-800">{user.userCity || "Not provided"}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">State</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="userState"
                        value={formData.userState}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="mt-1 text-gray-800">{user.userState || "Not provided"}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Country</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="userCountry"
                      value={formData.userCountry}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-800">{user.userCountry || "Not provided"}</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Security Section */}
          <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-gray-50 p-6 rounded-lg"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FiLock className="mr-2 text-blue-500" />
            Security
          </h2>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-gray-800">Password</h3>
              <p className="text-sm text-gray-500">Last changed 3 months ago</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors"
            >
              Change Password
            </motion.button>
          </div>
        </motion.div>
        </div>
      </div>
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowPasswordModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <FiX className="h-6 w-6" />
              </button>

              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                    <FiLock className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Change Password</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.old ? "text" : "password"}
                        name="oldPassword"
                        value={passwordData.oldPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter current password"
                      />
                      <button
                        onClick={() => toggleShowPassword("old")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.old ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter new password (min 6 chars)"
                      />
                      <button
                        onClick={() => toggleShowPassword("new")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.new ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Confirm new password"
                      />
                      <button
                        onClick={() => toggleShowPassword("confirm")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={isUpdatingPassword}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePasswordUpdate}
                    disabled={isUpdatingPassword}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center ${
                      isUpdatingPassword ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {isUpdatingPassword ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ToastContainer/>
    </motion.div>
  );
}