/* eslint-disable react/prop-types */
import { Link, Route, Routes } from "react-router-dom";
import logo from '../assets/logo.png';
import Home from "./Home";
import Login from "./Login";
import Register from "./Register";
import About from "./About";

const Logo = () => {
    return (
        <div className="flex items-center">
            <img src={logo} alt="Logo" className="h-9 w-9 mr-2" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                E-Commerce
            </span>
        </div>
    )
}

export default function MainNavBar({ onAdminLogin, onUserLogin, onSellerLogin }) {
    return (
        <>
            <nav className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link to="/" className="flex-shrink-0">
                                <Logo />
                            </Link>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <Link 
                                    to="/" 
                                    className="border-blue-500 text-gray-900 dark:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                >
                                    Home
                                </Link>
                                
                                <Link 
                                    to="/about" 
                                    className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                >
                                    About
                                </Link>
                            </div>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
                            <Link 
                                to="/login" 
                                className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Sign in
                            </Link>
                            <Link 
                                to="/register" 
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                Get started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Routes>
                <Route path="/" element={<Home/>} />
                <Route path="/about" element={<About/>} />
                <Route path="/login" element={<Login onAdminLogin={onAdminLogin} onUserLogin={onUserLogin} onSellerLogin={onSellerLogin} />} />
                <Route path="/register" element={<Register/>} />
            </Routes>
            </main>
        </>
    );
}