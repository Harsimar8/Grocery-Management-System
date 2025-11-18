import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../CartContext";
import { FiCheckCircle, FiXCircle, FiLoader } from "react-icons/fi";

const VerifyPaymentPage = () => {
  const [statusMsg, setStatusMsg] = useState("Verifying your payment...");
  const [status, setStatus] = useState("loading"); // 'loading' | 'success' | 'error'
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const { search } = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(search);
    const paymentId = query.get("payment_id");
    const paymentStatus = query.get("status");

    // Handle missing or invalid payment link
    if (!paymentId) {
      setStatus("error");
      setStatusMsg("Invalid or missing payment information.");
      return;
    }

    // Handle cancelled payments
    if (paymentStatus === "cancel") {
      navigate("/checkout", { replace: true });
      return;
    }

    // Verify payment with backend
    axios
      .post("http://localhost:4000/api/verify-payment", { paymentId })
      .then((res) => {
        if (res.data.success) {
          setStatus("success");
          setStatusMsg("Payment verified successfully!");
          clearCart();

          // Redirect to orders page after short delay
          setTimeout(() => navigate("/myorders"), 2000);
        } else {
          setStatus("error");
          setStatusMsg("Payment verification failed.");
        }
      })
      .catch((err) => {
        console.error("Payment verification error:", err);
        setStatus("error");
        setStatusMsg("There was an error confirming your payment.");
      });
  }, [search, clearCart, navigate]); // ✅ Correct syntax

  // Choose icon + color based on status
  const renderIcon = () => {
    if (status === "loading")
      return <FiLoader className="animate-spin text-yellow-400 text-5xl mb-4" />;
    if (status === "success")
      return <FiCheckCircle className="text-green-400 text-5xl mb-4" />;
    return <FiXCircle className="text-red-400 text-5xl mb-4" />;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-950 text-white p-6">
      {renderIcon()}
      <p className="text-lg text-center">{statusMsg}</p>
      {status !== "loading" && (
        <button
          onClick={() => navigate("/")}
          className="mt-6 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-medium"
        >
          Go to Home
        </button>
      )}
    </div>
  );
};

export default VerifyPaymentPage;
