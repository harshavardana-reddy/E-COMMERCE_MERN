import { NavLink, Routes, Route, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiTruck,
  FiPackage,
  FiChevronLeft,
  FiChevronRight,
  FiMenu,
  FiX,
  FiLogOut,
  FiUser
} from "react-icons/fi";
import { LuPackagePlus } from "react-icons/lu";
import { motion } from "framer-motion";
import { Tooltip } from "react-tooltip";
import SellerHome from "./SellerHome";
import AddProduct from "./AddProduct";
import ViewOrders from "./ViewOrders";
import Profile from "./Profile";
import { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import ViewProducts from "./ViewProducts";

export default function SellerNavBar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [seller, setSeller] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("seller");
    localStorage.removeItem("sellerLoggedIn");
    navigate("/login");
    window.location.reload();
  };

  const navItems = [
    { path: "/seller/sellerhome", name: "Dashboard", icon: <FiHome size={20} /> },
    { path: "/seller/addproduct", name: "Add Product", icon: <LuPackagePlus size={20} /> },
    { path: "/seller/vieworders", name: "Orders", icon: <FiTruck size={20} /> },
    { path: "/seller/products", name: "Products", icon: <FiPackage size={20} /> },
    { path: "/seller/profile", name: "Profile", icon: <FiUser size={20} /> },
  ];

  useEffect(() => {
    const seller = JSON.parse(localStorage.getItem("seller"));
    setSeller(seller);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-lg text-gray-600 hover:bg-gray-100 transition-colors"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`bg-white shadow-lg transition-all duration-300 ease-in-out fixed md:relative z-40 h-full
          ${isCollapsed ? "w-20" : "w-64"} 
          ${mobileMenuOpen ? "left-0" : "-left-full md:left-0"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`flex items-center p-4 ${isCollapsed ? "justify-center" : "justify-between"}`}>
            {!isCollapsed && (
              <div className="flex items-center">
                <img src={logo} alt="Logo" className="h-9 w-9 mr-2" />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  E-Commerce Seller
                </span>
              </div>
            )}
            {isCollapsed && (
              <img src={logo} alt="Logo" className="h-9 w-9" />
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
              data-tooltip-id="collapse-tooltip"
              data-tooltip-content={isCollapsed ? "Expand" : "Collapse"}
            >
              {isCollapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
            </button>
            <Tooltip id="collapse-tooltip" />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg transition-colors duration-200
                  ${isActive
                    ? "bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600 border-l-4 border-blue-500"
                    : "text-gray-600 hover:bg-gray-100"
                  }
                  ${isCollapsed ? "justify-center" : ""}`
                }
                onClick={() => setMobileMenuOpen(false)}
                data-tooltip-id="nav-tooltip"
                data-tooltip-content={item.name}
              >
                <span className={`${isCollapsed ? "" : "mr-3"}`}>
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="font-medium">{item.name}</span>
                )}
              </NavLink>
            ))}
            <Tooltip id="nav-tooltip" />
          </nav>

          {/* User profile and logout */}
          <div className={`p-4 border-t border-gray-200 ${isCollapsed ? "text-center" : ""}`}>
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {seller.sellerName ? seller.sellerName.charAt(0).toUpperCase() : ""}
              </div>
              {!isCollapsed && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{seller.sellerName}</p>
                  <p className="text-xs text-gray-500">{seller.sellerEmail}</p>
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowLogoutConfirmation(true)}
              className={`w-full flex items-center justify-center p-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium
                ${isCollapsed ? "px-2" : "px-4"}`}
              data-tooltip-id="logout-tooltip"
              data-tooltip-content="Logout"
            >
              <FiLogOut size={18} />
              {!isCollapsed && <span className="ml-2">Logout</span>}
            </motion.button>
            <Tooltip id="logout-tooltip" />
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirmation && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl"
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <FiLogOut className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">Confirm Logout</h3>
              <div className="mt-2 text-sm text-gray-500">
                Are you sure you want to logout from your seller account?
              </div>
              <div className="mt-5 flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirmation(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Main content */}
      <div className={`flex-1 overflow-auto transition-all duration-300 ${isCollapsed ? "md:ml-20" : "md:ml-64"}`}>
        <div className="p-6">
          <Routes>
            <Route path="/seller/sellerhome" element={<SellerHome />} />
            <Route path="/seller/addproduct" element={<AddProduct />} />
            <Route path="/seller/products" element={<ViewProducts />} />
            <Route path="/seller/vieworders" element={<ViewOrders />} />
            <Route path="/seller/profile" element={<Profile />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}