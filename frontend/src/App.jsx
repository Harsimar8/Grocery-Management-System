// import React, { useEffect, useState } from "react";
// import Home from "./pages/Home";
// import { Route, Routes, useLocation, Navigate } from "react-router-dom";
// import { CartProvider } from "./CartContext";   // ⬅ THIS WAS MISSING
// import Navbar from "./components/Navbar";
// import Login from "./components/Login";
// import Signup from "./components/Signup";
// import Logout from "./components/Logout";
// import Checkout from "./components/Checkout";
// import VerifyPaymentPage from "./pages/VerifyPaymentPage";
// import MyOrders from "./components/MyOrders";
// import Contact from "./pages/Contact";
// import Items from "./pages/Items";
// import Cart from "./pages/Cart";

// import { Elements } from "@stripe/react-stripe-js";
// import { loadStripe } from "@stripe/stripe-js";
// import axios from "axios";


// const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// const App = () => {
//   const [isAuthenticated, setIsAuthenticated] = useState(
//     Boolean(localStorage.getItem("authToken"))
//   );
//   const [clientSecret, setClientSecret] = useState(null);

//   useEffect(() => {
//     const handler = () => {
//       setIsAuthenticated(Boolean(localStorage.getItem("authToken")));
//     };
//     window.addEventListener("authStateChanged", handler);
//     return () => window.removeEventListener("authStateChanged", handler);
//   }, []);

//   // 🔥 Create initial PaymentIntent when app loads
//   useEffect(() => {
//     axios
//       .post("http://localhost:4000/api/payments/create-payment-intent", {
//         amount: 5000, // dummy initial amount
//       })
//       .then((res) => setClientSecret(res.data.clientSecret))
//       .catch((err) => console.log("Stripe Init Error:", err));
//   }, []);

//   return (
//     <CartProvider>
//       {clientSecret ? (
//         <Elements stripe={stripePromise} options={{ clientSecret }}>
//           <ScrollToTop />
//           <Navbar isAuthenticated={isAuthenticated} />

//           <Routes>
//             <Route path="/" element={<Home />} />
//             <Route path="/contact" element={<Contact />} />
//             <Route path="/items" element={<Items />} />

//             <Route
//               path="/cart"
//               element={
//                 isAuthenticated ? <Cart /> : <Navigate replace to="/login" />
//               }
//             />

//             <Route path="/checkout" element={<Checkout />} />
//             <Route path="/myorders/verify" element={<VerifyPaymentPage />} />
//             <Route path="/myorders" element={<MyOrders />} />

//             {/* AUTH ROUTES */}
//             <Route path="/login" element={<Login />} />
//             <Route path="/signup" element={<Signup />} />
//             <Route path="/logout" element={<Logout />} />
//           </Routes>
//         </Elements>
//       ) : (
//         <p className="text-center text-white p-5">Loading secure payment...</p>
//       )}
//     </CartProvider>
//   );
// };

// export default App;

import React, { useEffect, useState } from "react";
import Home from "./pages/Home";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import { CartProvider } from "./CartContext"; 
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Logout from "./components/Logout";
import Checkout from "./components/Checkout";
import VerifyPaymentPage from "./pages/VerifyPaymentPage";
import MyOrders from "./components/MyOrders";
import Contact from "./pages/Contact";
import Items from "./pages/Items";
import Cart from "./pages/Cart";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// ⬇️ ScrollToTop FIXED
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("authToken"))
  );
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    const handler = () => {
      setIsAuthenticated(Boolean(localStorage.getItem("authToken")));
    };
    window.addEventListener("authStateChanged", handler);
    return () => window.removeEventListener("authStateChanged", handler);
  }, []);

  // 🔥 Create initial PaymentIntent when app loads
  useEffect(() => {
    axios
      .post("http://localhost:4000/api/payments/create-payment-intent", {
        amount: 5000, // minimum ₹50
      })
      .then((res) => setClientSecret(res.data.clientSecret))
      .catch((err) => console.log("Stripe Init Error:", err));
  }, []);

  return (
    <CartProvider>
      {clientSecret ? (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <ScrollToTop />
          <Navbar isAuthenticated={isAuthenticated} />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/items" element={<Items />} />

            <Route
              path="/cart"
              element={
                isAuthenticated ? <Cart /> : <Navigate replace to="/login" />
              }
            />

            <Route path="/checkout" element={<Checkout />} />
            <Route path="/myorders/verify" element={<VerifyPaymentPage />} />
            <Route path="/myorders" element={<MyOrders />} />

            {/* AUTH ROUTES */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/logout" element={<Logout />} />
          </Routes>
        </Elements>
      ) : (
        <p className="text-center text-white p-5">Loading secure payment...</p>
      )}
    </CartProvider>
  );
};

export default App;

