import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const CartContext = createContext();

const getAuthHeader = () => {
  const token =
    localStorage.getItem("authToken") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

    if (!token) {
    console.warn("⚠️ No auth token found in storage.");
    return { withCredentials: true };
  }

  return {
    headers: {
        Authorization: `Bearer ${token}` ,
      "Content-Type": "application/json",
    },
    withCredentials: true, // ✅ allow cookies to go along
  };
};



// Normalize cart items from backend
const normalizeItems = (rawItems = []) => {
  return rawItems.map((item) => ({
    id: item._id || item.id,
    productId: item.product?._id || item.productId || item.product,
    name: item.product?.name || item.name,
    price: Number(item.product?.price || item.price || 0),
    imageUrl: item.product?.imageUrl || item.imageUrl || "/no-image.png",
    quantity: Number(item.quantity) || 1,
  }));
};

// Convert backend product format into dummy frontend format
export const normalizeProduct = (p) => {
  if (!p) return null;

  return {
    id: String(p.id || p._id),
     // convert string to number OR fallback
    name: p.name || "Unnamed",
    price: Number(p.price || 0),
    imageUrl: p.imageUrl || p.image || "/no-image.png",
  };
};




export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch Cart on mount
  useEffect(() => {
    
      fetchCart();
    
    
  }, []);

  const getCartTotal = () => {
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};


  // ✅ Fetch cart from backend
  const fetchCart = async () => {
  try {
    const { data } = await axios.get("http://localhost:4000/api/cart", getAuthHeader());

    const rawItems =
      data?.cart?.items ||
      data?.items ||
      (Array.isArray(data) ? data : []);

    setCart(normalizeItems(rawItems));
  } catch (err) {
    console.error("❌ Error fetching cart:", err.response?.status, err.message);
    setCart([]);
  } finally {
    setLoading(false);
  }
};


  // ✅ Refresh cart
  const refreshCart = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:4000/api/cart",
        getAuthHeader()
      );

      const rawItems = Array.isArray(data)
        ? data
        : Array.isArray(data.items)
        ? data.items
        : data.cart?.items || [];

      setCart(normalizeItems(rawItems));
    } catch (err) {
      console.error("❌ Error refreshing cart:", err.message);
    }
  };

  // ✅ Add to cart
  const addToCart = async (productId, quantity = 1) => {
    try {
      await axios.post(
        "http://localhost:4000/api/cart",
        { productId, quantity },
        getAuthHeader()
      );
      await refreshCart();
    } catch (err) {
      console.error("❌ Error adding to cart:", err.message);
    }
  };

  // ✅ Update item quantity
  const updateQuantity = async (lineId, quantity) => {
    if (!lineId) return console.warn("⚠ No lineId provided to updateQuantity");
    try {
      await axios.put(
        `http://localhost:4000/api/cart/${lineId}`,
        { quantity },
        getAuthHeader()
      );
      await refreshCart();
    } catch (err) {
      console.error(`❌ Error updating cart item ${lineId}:`, err.message);
    }
  };

  // ✅ Remove item from cart
  const removeFromCart = async (lineId) => {
    if (!lineId) return console.warn("⚠ No lineId provided to removeFromCart");
    try {
      await axios.delete(
        `http://localhost:4000/api/cart/${lineId}`,
        getAuthHeader()
      );
      await refreshCart();
    } catch (err) {
      console.error(`❌ Error removing item ${lineId} from cart:`, err.message);
    }
  };

  // ✅ Clear all items
  const clearCart = async () => {
    try {
      await axios.post(
        "http://localhost:4000/api/cart/clear",
        {},
        getAuthHeader()
      );
      setCart([]);
    } catch (err) {
      console.error("❌ Error clearing cart:", err.message);
    }
  };

  // ✅ Totals and counts
  
  const getTotal = () =>
  cart.reduce((sum, item) => {
    const product = products.find(p => p.id === Number(item.productId));
    const price = product?.price || 0;
    return sum + price * item.quantity;
  }, 0);



  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // ✅ Provide context values
  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        cartCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotal,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// ✅ Custom hook for consuming the context
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
