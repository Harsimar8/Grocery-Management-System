import React, { useState } from "react";
import { checkoutStyles } from "../assets/dummyStyles";
import { useCart } from "../CartContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiArrowLeft,
  FiUser,
  FiPackage,
  FiCreditCard,
  FiTruck,
  FiCheck,
} from "react-icons/fi";
import { products } from "../assets/dummyData";

const findProduct = (productId) =>
  products.find((p) => p.id === productId);

const getItemName = (item) =>
  findProduct(item.productId || item.product)?.name || "Unnamed";

const getItemPrice = (item) =>
  findProduct(item.productId || item.product)?.price || 0;

const getItemImage = (item) =>
  findProduct(item.productId || item.product)?.image || "/no-image.png";


const Checkout = () => {
  const { cart, getTotal, clearCart } = useCart();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    paymentMethod: "COD",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    else if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Invalid phone number";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    const order = {
      customer: { ...formData },
      items: cart.map((item) => ({
  id: item.productId || item.product || item.id,
  name: getItemName(item),
  price: getItemPrice(item),
  quantity: Number(item.quantity),
  imageUrl: getItemImage(item),
})),




      total: getTotal(),

      status: "Pending",
      paymentMethod: formData.paymentMethod,
      paymentStatus: formData.paymentMethod === "COD" ? "Paid" : "Unpaid",
      deliveryDate: new Date(
        Date.now() + 3 * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split("T")[0],
      notes: formData.notes,
    };

    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.post("http://localhost:4000/api/orders", order, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.data.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
        return;
      }

      if (res.status === 201 || res.status === 200) {
        clearCart();
        alert("Order placed successfully!");
        navigate("/myorders");
      } else {
        alert("Order failed. Try again");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  
  const total = getTotal();
  const tax = total * 0.05;
  const grandTotal = total + tax;

  return (
    <div className={checkoutStyles.page}>
      <div className={checkoutStyles.container}>
        <Link to="/cart" className={checkoutStyles.backLink}>
          <FiArrowLeft className="mr-2" />
          Back to Cart
        </Link>

        <div className={checkoutStyles.header}>
          <h1 className={checkoutStyles.mainTitle}>Checkout</h1>
          <p className={checkoutStyles.subtitle}>
            Complete your purchase with secure checkout
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* CUSTOMER INFO */}
          <div className={checkoutStyles.card}>
            <h2 className={checkoutStyles.sectionTitle}>
              <FiUser className="mr-2 text-emerald-300" />
              Customer Information
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* NAME */}
              <div>
                <label className="block text-sm font-medium text-emerald-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={`${checkoutStyles.input} ${
                    errors.name ? checkoutStyles.inputError : ""
                  }`}
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-400">{errors.name}</p>
                )}
              </div>

              {/* EMAIL + PHONE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-emerald-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@example.com"
                    className={`${checkoutStyles.input} ${
                      errors.email ? checkoutStyles.inputError : ""
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-400">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-emerald-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit phone number"
                    className={`${checkoutStyles.input} ${
                      errors.phone ? checkoutStyles.inputError : ""
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-400">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* ADDRESS */}
              <div>
                <label className="block text-sm font-medium text-emerald-300 mb-2">
                  Delivery Address *
                </label>
                <textarea
                  rows="3"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Full delivery address"
                  className={`${checkoutStyles.input} ${
                    errors.address ? checkoutStyles.inputError : ""
                  }`}
                />
                {errors.address && (
                  <p className="mt-2 text-sm text-red-400">{errors.address}</p>
                )}
              </div>

              {/* NOTES */}
              <div>
                <label className="block text-sm font-medium text-emerald-300 mb-2">
                  Delivery Notes
                </label>
                <textarea
                  rows="2"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Special instructions, gate code, etc."
                  className={checkoutStyles.input}
                />
              </div>

              {/* PAYMENT METHOD */}
              <div>
                <h3 className={checkoutStyles.sectionTitle}>
                  <FiCreditCard className="mr-2 text-emerald-300" />
                  Payment Method
                </h3>

                <label className={checkoutStyles.radioCard}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={formData.paymentMethod === "COD"}
                    onChange={handleChange}
                    className="h-5 w-5 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="ml-3">
                    <span className="font-medium text-emerald-100">
                      Cash on Delivery
                    </span>
                    <span className="block text-sm text-emerald-400">
                      Pay on delivery
                    </span>
                  </div>
                </label>

                <label className={checkoutStyles.radioCard}>
                  <input
  type="radio"
  name="paymentMethod"
  value="Online Payment"
  checked={formData.paymentMethod === "Online Payment"}
  onChange={handleChange}
/>

                  <div className="ml-3">
                    <span className="font-medium text-emerald-100">
                      Online Payment
                    </span>
                    <span className="block text-sm text-emerald-400">
                      Pay now via card/UPI
                    </span>
                  </div>
                </label>
              </div>

              {/* ORDER SUMMARY */}
              <div className={checkoutStyles.card}>
                <h2 className={checkoutStyles.sectionTitle}>
                  <FiPackage className="mr-2" />
                  Order Summary
                </h2>
                <div className="mb-6">
                  <h3 className="font-medium text-emerald-300 mb-4">
                    Your Items ({cart.length})
                  </h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {cart.map((item) => {
  const productId = item.productId || item.id || item.product?._id;
  const product = products.find((p) => p.id === productId);
  const name = product?.name || item.name || "Unnamed";
  const price = product?.price || item.price || 0;
  const img = product?.image || item.imageUrl || "/no-image.png";

  return (
    <div key={productId} className={checkoutStyles.cartItem}>
      <div className={checkoutStyles.cartImage}>
        <img
          src={img}
          alt={name}
          className="w-full h-full object-cover rounded"
          onError={(e) => (e.target.src = "/no-image.png")}
        />
      </div>

      <div className="flex-grow">
        <div className="font-medium text-emerald-100">{name}</div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-emerald-400">
            Rs {price.toFixed(2)} × {item.quantity}
          </span>
          <span className="font-medium text-emerald-100">
            Rs {(price * item.quantity).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
})}

</div>
</div>


                <div className="border-t border-emerald-700/50 pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-emerald-300">Subtotal</span>
                    <span className="font-medium text-emerald-100">
                      Rs{total.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-300">Delivery</span>
                    <span className="text-emerald-400 font-medium">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-300">Tax (5%)</span>
                    <span className="text-emerald-100 font-medium">
                      Rs{tax.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between mt-3 border-t border-emerald-700/50 pt-3">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-lg font-bold text-emerald-300">
                      Rs{grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`${checkoutStyles.button} ${
                    isSubmitting
                      ? checkoutStyles.disabledButton
                      : checkoutStyles.submitButton
                  } mt-6`}
                >
                  <FiCheck className="mr-2" />
                  {isSubmitting ? "Processing Order..." : "Place Order"}
                </button>

                <p className="mt-4 text-center text-sm text-emerald-400">
                  By placing your order, you agree to our{" "}
                  <a href="#" className={checkoutStyles.link}>
                    Terms
                  </a>{" "}
                  and{" "}
                  <a href="#" className={checkoutStyles.link}>
                    Privacy Policy
                  </a>
                </p>
              </div>
            </form>
          </div>

          {/* DELIVERY INFO */}
          <div className={checkoutStyles.deliveryInfo}>
            <h3 className={checkoutStyles.deliveryTitle}>
              <FiTruck className="mr-2" />
              Delivery Information
            </h3>
            <p className={checkoutStyles.deliveryText}>
              We deliver within 30–45 minutes. Orders placed after 9 PM will be
              delivered the next morning.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
