
import React, { useState, useEffect } from "react";
import { checkoutStyles } from "../assets/dummyStyles";
import { useCart } from "../CartContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { FiArrowLeft, FiUser, FiPackage, FiCreditCard, FiTruck, FiCheck } from "react-icons/fi";
import { products as dummyProducts } from "../assets/dummyData";

// 🟢 Find product safely
const findProduct = (allProducts, productId) => {
  return allProducts.find((p) => String(p.id) === String(productId)) || null;
};

// 🟢 Get product fields
const getItemName = (allProducts, item) =>
  findProduct(allProducts, item.productId)?.name || item.name || "Unnamed";

const getItemPrice = (allProducts, item) =>
  Number(findProduct(allProducts, item.productId)?.price) ||
  Number(item.price) ||
  0;

const getItemImage = (allProducts, item) => {
  const product = findProduct(allProducts, item.productId || item.id || item.product);
  let img = product?.image || item.imageUrl;

  // No image fallback
  if (!img) return "https://via.placeholder.com/150x150?text=No+Image";

  // 🟢 CASE 1: backend URL (http)
  if (img.startsWith("http")) return img;

  // 🟢 CASE 2: dummy images located in src/assets
  if (img.startsWith("assets/") || img.startsWith("/assets/")) {
    return img; // React will resolve these correctly
  }

  // 🟢 CASE 3: images stored in public/images
  if (img.startsWith("/images/")) {
    return img; // public folder path, no need to prepend frontend URL
  }

  // 🟢 CASE 4: src/assets images
  if (img.startsWith("src/assets/")) {
    return img.replace("src/assets/", "/assets/");
  }

  // 🟢 CASE 5: /src/assets images
  if (img.startsWith("/src/assets/")) {
    return img.replace("/src/assets/", "/assets/");
  }

  // 🟢 CASE 6: missing leading slash
  return "/" + img;
};


const Checkout = () => {
  const { cart, clearCart } = useCart();
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [allProducts, setAllProducts] = useState([]);

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

  useEffect(() => {
    const loadProducts = async () => {
      try {
        let merged = [...dummyProducts];
        const res = await axios.get("http://localhost:4000/api/items");
        const backend = res.data;
        const formatted = backend.map((item) => ({
          id: item._id ? item._id.toString() : String(item.id || item._id),
          name: item.name,
          price: Number(item.price || 0),
          category: item.category,
          image: item.imageUrl ? `http://localhost:4000${item.imageUrl}` : "/no-image.png",
        }));
        merged = [...merged, ...formatted];
        setAllProducts(merged);
      } catch (err) {
        console.log("Backend failed → using dummy only");
        setAllProducts(dummyProducts);
      }
    };
    loadProducts();
  }, []);

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

  // 🟢 Calculate total from all products
  const subtotal = cart.reduce(
    (sum, item) => sum + getItemPrice(allProducts, item) * item.quantity,
    0
  );
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  // 🟢 Place Order
  const placeOrder = async (paymentStatus) => {
    const order = {
      customer: { ...formData },
      items: cart.map((item) => {
  const productId =
    item.productId ||
    item.id ||
    item.product?._id ||
    item.product ||
    null;

  if (!productId) {
    console.error("❌ CART ITEM MISSING PRODUCT ID:", item);
    throw new Error("Product ID missing in cart item");
  }

  // Build completely safe image URL
  let img = getItemImage(allProducts, item);

  // Make sure image is absolute URL
  if (!img.startsWith("http://") && !img.startsWith("https://")) {
    if (!img.startsWith("/")) img = "/" + img;
    img = `http://localhost:5173${img}`;
  }

  return {
    id: productId,
    name: getItemName(allProducts, item),
    price: getItemPrice(allProducts, item),
    quantity: item.quantity,
    imageUrl: img, // <-- always valid URL
  };
}),

      total,
      status: "Pending",
      paymentMethod: formData.paymentMethod,
      paymentStatus,
      deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      notes: formData.notes,
    };

    const token = localStorage.getItem("authToken");

    await axios.post("http://localhost:4000/api/orders", order, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    clearCart();
  };

  // 🟢 Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    // COD logic
    if (formData.paymentMethod === "COD") {
      await placeOrder("Paid");
      alert("Order placed successfully!");
      return navigate("/myorders");
    }

    // Stripe logic
    try {
      if (!stripe || !elements) return alert("Stripe loading...");

      const { error: submitError } = await elements.submit();
      if (submitError) {
        alert(submitError.message);
        setIsSubmitting(false);
        return;
      }

      const amount = Math.round(total * 100);
      if (amount < 5000) {
        alert("Minimum online payment is ₹50");
        setIsSubmitting(false);
        return;
      }

      const { data } = await axios.post(
        "http://localhost:4000/api/payments/create-payment-intent",
        { amount },
        { headers: { "Content-Type": "application/json" } }
      );

      const result = await stripe.confirmPayment({
        clientSecret: data.clientSecret,
        elements,
        redirect: "if_required",
      });

      if (result.error) {
        alert(result.error.message);
      } else if (result.paymentIntent?.status === "succeeded") {
        await placeOrder("Paid");
        alert("Payment Successful!");
        navigate("/myorders");
      }
    } catch (err) {
      console.error("🔥 Payment Error:", err.response?.data || err.message);
      alert("Payment failed, try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={checkoutStyles.page}>
      <div className={checkoutStyles.container}>
        <Link to="/cart" className={checkoutStyles.backLink}>
          <FiArrowLeft className="mr-2" /> Back to Cart
        </Link>

        <div className={checkoutStyles.header}>
          <h1 className={checkoutStyles.mainTitle}>Checkout</h1>
          <p className={checkoutStyles.subtitle}>
            Complete your purchase with secure checkout
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT FORM */}
          <div className={checkoutStyles.card}>
            <h2 className={checkoutStyles.sectionTitle}>
              <FiUser className="mr-2 text-emerald-300" /> Customer Information
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
                  className={`${checkoutStyles.input} ${
                    errors.name ? checkoutStyles.inputError : ""
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
              </div>

              {/* EMAIL / PHONE */}
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
                    className={`${checkoutStyles.input} ${
                      errors.email ? checkoutStyles.inputError : ""
                    }`}
                    placeholder="your@example.com"
                  />
                  {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
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
                    className={`${checkoutStyles.input} ${
                      errors.phone ? checkoutStyles.inputError : ""
                    }`}
                    placeholder="10-digit phone number"
                  />
                  {errors.phone && <p className="text-red-400 text-sm">{errors.phone}</p>}
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
                  className={`${checkoutStyles.input} ${
                    errors.address ? checkoutStyles.inputError : ""
                  }`}
                  placeholder="House No, Street, City..."
                />
                {errors.address && <p className="text-red-400 text-sm">{errors.address}</p>}
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
                  className={checkoutStyles.input}
                  placeholder="Optional instructions..."
                />
              </div>

              {/* PAYMENT METHOD */}
              <div>
                <h3 className={checkoutStyles.sectionTitle}>
                  <FiCreditCard className="mr-2 text-emerald-300" /> Payment Method
                </h3>

                <label className={checkoutStyles.radioCard}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={formData.paymentMethod === "COD"}
                    onChange={handleChange}
                  />
                  <span className="ml-3 font-medium">Cash on Delivery</span>
                </label>

                <label className={checkoutStyles.radioCard}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Online Payment"
                    checked={formData.paymentMethod === "Online Payment"}
                    onChange={handleChange}
                  />
                  <span className="ml-3 font-medium">Online Payment (Card/UPI)</span>
                </label>

                {formData.paymentMethod === "Online Payment" && (
                  <div className="mt-4 p-4 bg-emerald-900/40 rounded-lg">
                    <PaymentElement />
                  </div>
                )}
              </div>

              {/* ORDER SUMMARY */}
              <div className={checkoutStyles.card}>
                <h2 className={checkoutStyles.sectionTitle}>
                  <FiPackage className="mr-2" /> Order Summary
                </h2>

                <div className="mb-6">
                  <h3 className="font-medium text-emerald-300 mb-4">
                    Your Items ({cart.length})
                  </h3>

                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {cart.map((item) => {
                      const name = getItemName(allProducts, item);
                      const price = getItemPrice(allProducts, item);
                      const img = getItemImage(allProducts, item);

                      return (
                        <div key={item.productId} className={checkoutStyles.cartItem}>
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
                                Rs {price} × {item.quantity}
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
                      Rs{subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-emerald-300">Tax (5%)</span>
                    <span className="font-medium text-emerald-100">
                      Rs{tax.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between mt-3 border-t border-emerald-700/50 pt-3">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-lg font-bold text-emerald-300">
                      Rs{total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button
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
              </div>
            </form>
          </div>

          {/* DELIVERY INFO */}
          <div className={checkoutStyles.deliveryInfo}>
            <h3 className={checkoutStyles.deliveryTitle}>
              <FiTruck className="mr-2" /> Delivery Information
            </h3>
            <p className={checkoutStyles.deliveryText}>
              We deliver within 30–45 minutes. Orders placed after 9 PM arrive next morning.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
