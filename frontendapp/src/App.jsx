import { BrowserRouter } from 'react-router-dom'
import { useEffect, useState } from 'react';
import AdminNavBar from './Admin/AdminNavBar';
import SellerNavBar from './Seller/SellerNavBar';
import UserNavBar from './User/UserNavBar';
import MainNavBar from './Components/MainNavBar';

function App() {

  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isSellerLoggedIn, setIsSellerLoggedIn] = useState(false);

  const onUserLogin = () =>{
    localStorage.setItem("userLoggedIn", true);
    setIsUserLoggedIn(true);
  }

  const onAdminLogin = ()=>{
    localStorage.setItem("adminLoggedIn", true);
    setIsAdminLoggedIn(true);
  }

  const onSellerLogin = ()=>{
    localStorage.setItem("sellerLoggedIn", true);
    setIsSellerLoggedIn(true);
  }
  
  useEffect(()=>{
    const userLoggedIn = localStorage.getItem("userLoggedIn")==="true";
    const adminLoggedIn = localStorage.getItem("adminLoggedIn")==="true";
    const sellerLoggedIn = localStorage.getItem("sellerLoggedIn")==="true";

    setIsUserLoggedIn(userLoggedIn);
    setIsAdminLoggedIn(adminLoggedIn);
    setIsSellerLoggedIn(sellerLoggedIn);
  }, [])

  return (
    <div>
          <BrowserRouter>
            {isAdminLoggedIn?(
              <AdminNavBar/>
            ):isSellerLoggedIn?(
              <SellerNavBar/>
            ):isUserLoggedIn?(
              <UserNavBar/>
            ):(
              <MainNavBar onAdminLogin={onAdminLogin} onUserLogin={onUserLogin} onSellerLogin={onSellerLogin}/>
            )}
          </BrowserRouter>
          
    </div>
  )
}

export default App
