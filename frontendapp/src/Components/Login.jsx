/* eslint-disable react/prop-types */
import { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import BackendURL from "../BackendURL";
import { Link, useNavigate } from "react-router-dom";

export default function Login({ onAdminLogin, onUserLogin, onSellerLogin }) {
  const navigate = useNavigate();
  // State management
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);

  // Constants
  const ROLES = {
    ADMIN: "admin",
    SELLER: "seller",
    USER: "user"
  };

  // Handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleLoginSuccess = (role, data, token) => {
    const roleCallbacks = {
      [ROLES.ADMIN]: onAdminLogin,
      [ROLES.SELLER]: onSellerLogin,
      [ROLES.USER]: onUserLogin
    };
    
    roleCallbacks[role]();
    localStorage.setItem(role, JSON.stringify(data));
    localStorage.setItem(`${role}Token`,token);
    toast.success(`${role.charAt(0).toUpperCase() + role.slice(1)} logged in successfully`);
    
    // Navigate based on role
    switch (role) {
      case ROLES.ADMIN:
        navigate('/admin/adminhome');
        break;
      case ROLES.SELLER:
        navigate('/seller/sellerhome');
        break;
      case ROLES.USER:
        navigate('/user/userhome');
        break;
      default:
        navigate('/');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { username, password } = formData;
      const response = await axios.post(`${BackendURL.Main}/login`, { username, password });
      if (response.status === 200) {
        handleLoginSuccess(response.data.role, response.data.data,response.data.token);
      } else {
        toast.error("Invalid Credentials");
      }
    } catch (error) {
      console.error("Login failed", error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Render helpers
  const renderInputField = ({ id, name, type, placeholder, value, icon }) => (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={type}
        required
        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
      />
      {icon && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          {icon}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4 rounded-4xl">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center">
            <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
            <p className="text-blue-100 mt-2">Sign in to your account</p>
          </div>
          
          {/* Login Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Email or Username
                </label>
                {renderInputField({
                  id: "username",
                  name: "username",
                  type: "text",
                  placeholder: "Enter your email or username",
                  value: formData.username,
                  icon: (
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  )
                })}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                    Forgot password?
                  </a>
                </div>
                {renderInputField({
                  id: "password",
                  name: "password",
                  type: "password",
                  placeholder: "Enter your password",
                  value: formData.password,
                  icon: (
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  )
                })}
              </div>

              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-70"
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Don&apos;t have an account?</span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/register"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}