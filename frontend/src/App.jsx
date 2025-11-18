import React, { useEffect, useState } from 'react'
import Home from './pages/Home'; 
import {Route, Routes, useLocation ,Navigate} from 'react-router-dom'
import { CartProvider } from './CartContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Signup from './components/Signup';
import Logout from './components/Logout';
import Checkout from './components/Checkout';
import VerifyPaymentPage from './pages/VerifyPaymentPage';
import MyOrders from './components/MyOrders';


import Contact from './pages/Contact';
import Items from './pages/Items';
import Cart from './pages/Cart';

const ScrollToTop = () =>{
  const {pathName} = useLocation();

  useEffect(() =>{
    window.scrollTo(0,0)
  },[pathName]);
  return null;
}

const App = () => {

  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem('authToken'))
  )

  useEffect(() =>{
    const handler = () =>{
      setIsAuthenticated(Boolean(localStorage.getItem('authToken')))
    }
    window.addEventListener('authStateChanged',handler)
    return() => window.removeEventListener('authStateChanged',handler)
  },[])
  
  return (
    <CartProvider>
      <ScrollToTop/>
      <Navbar isAuthenticated={isAuthenticated}/>
    <Routes>
      <Route path ="/" element={<Home />} />
      <Route path='/contact' element={<Contact/>}/>
      <Route path='/items' element={<Items/>}/>

      <Route path='/cart' element={isAuthenticated ? <Cart /> : <Navigate replace to='/login' />} />
      <Route path='/checkout' element={<Checkout/>} />
      <Route path='/myorders/verify' element={<VerifyPaymentPage/>} />
      <Route path='/myorders' element={<MyOrders/>} />



      {/* AUTH ROUTES*/}
      <Route path='/login' element={<Login />} />
      <Route path='/signup' element={<Signup />} />
      <Route path='/logout' element={<Logout />} />


    </Routes>
    </CartProvider>
  )
}

export default App
