import React, { useEffect, useState } from "react";
import { itemsHomeStyles } from "../assets/dummyStyles";
import BannerHome from "./BannerHome";
import { useNavigate } from "react-router-dom";
import { useCart } from "../CartContext";
import { normalizeProduct } from "../CartContext";
import axios from "axios";

import {
  FaShoppingCart,
  FaThList,
  FaChevronRight,
  FaPlus,
  FaMinus,
} from "react-icons/fa";

import { categories, products as dummyProducts } from "../assets/dummyData";

const ItemsHome = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState(
    localStorage.getItem("activeCategory") || "All"
  );

  const navigate = useNavigate();
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();

  useEffect(() => {
    localStorage.setItem("activeCategory", activeCategory);
  }, [activeCategory]);

  // ⭐ LOAD both dummy + backend products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        // 1️⃣ Start with dummy
        let merged = [...dummyProducts];

        // 2️⃣ Fetch from backend (same endpoint as Items.jsx)
        const res = await axios.get("http://localhost:4000/api/items");

        const backend = res.data;

        // 3️⃣ Convert backend format → dummy format
        // inside loadProducts() — replace formatted = backend.map(...)
const formatted = backend.map((item) => ({
  id: item._id ? item._id.toString() : String(item.id || item._id), // ensure string id
  name: item.name,
  price: Number(item.price || 0),
  category: item.category,
  image: item.imageUrl ? `http://localhost:4000${item.imageUrl}` : "/no-image.png",
}));


        // 4️⃣ Merge both
        merged = [...merged, ...formatted];

        setAllProducts(merged);
      } catch (err) {
        console.log("Backend failed → using dummy only");
        setAllProducts(dummyProducts);
      }
    };

    loadProducts();
  }, []);

  // 🔍 SEARCH
  const productMatchesSearch = (product, term) => {
    if (!term) return true;
    const words = term.trim().toLowerCase().split(/\s+/);
    return words.every((w) => product.name.toLowerCase().includes(w));
  };

  // FILTERED LIST
  const filteredProducts = searchTerm
    ? allProducts.filter((p) => productMatchesSearch(p, searchTerm))
    : activeCategory === "All"
    ? allProducts
    : allProducts.filter(
        (p) =>
          p.category &&
          p.category.toLowerCase() === activeCategory.toLowerCase()
      );

  // CART HELPERS
    const getQuantity = (productId) => {
  const item = cart.find((ci) => String(ci.productId) === String(productId));
  return item ? item.quantity : 0;
};

const getLineItemId = (productId) => {
  const item = cart.find((ci) => String(ci.productId) === String(productId));
  return item ? item.id : null;
};


 const handleIncrease = (product) => {
  const lineId = getLineItemId(product.id);

  if (lineId) {
    updateQuantity(lineId, getQuantity(product.id) + 1);
  } else {
    addToCart(String(product.id), 1);
  }
};


  const handleDecrease = (product) => {
    const qty = getQuantity(product.id);
    const lineId = getLineItemId(product.id);
    if (qty > 1) updateQuantity(lineId, qty - 1);
    else removeFromCart(lineId);
  };

  const redirectToItemsPage = () => {
    navigate("/items", { state: { category: activeCategory } });
  };

  const sidebarCategories = [
    { name: "All", icon: <FaThList className="text-lg" /> },
    ...categories,
  ];

  return (
    <div className={itemsHomeStyles.page}>
      <BannerHome onSearch={setSearchTerm} />

      <div className="flex flex-col lg:flex-row flex-1">
        {/* Sidebar */}
        <aside className={itemsHomeStyles.sidebar}>
          <div className={itemsHomeStyles.sidebarHeader}>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
              }}
              className={itemsHomeStyles.sidebarTitle}
            >
              FreshCart
            </h1>
            <div className={itemsHomeStyles.sidebarDivider} />
          </div>

          <div className={itemsHomeStyles.categoryList}>
            <ul className="space-y-3">
              {sidebarCategories.map((category) => (
                <li key={category.name}>
                  <button
                    onClick={() => {
                      setActiveCategory(category.name);
                      setSearchTerm("");
                    }}
                    className={`${itemsHomeStyles.categoryItem} ${
                      activeCategory === category.name && !searchTerm
                        ? itemsHomeStyles.activeCategory
                        : itemsHomeStyles.inactiveCategory
                    }`}
                  >
                    <div className={itemsHomeStyles.categoryIcon}>
                      {category.icon}
                    </div>
                    <span className={itemsHomeStyles.categoryName}>
                      {category.name}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className={itemsHomeStyles.mainContent}>
          {/* Search Results Header */}
          {searchTerm && (
            <div className={itemsHomeStyles.searchResults}>
              <div className="flex items-center justify-center">
                <span className="text-emerald-700 font-medium">
                  Search results for:{" "}
                  <span className="font-bold">"{searchTerm}"</span>
                </span>
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-4 text-emerald-500 hover:text-emerald-700 p-1 rounded-full"
                >
                  <span className="text-sm bg-emerald-100 px-2 py-1 rounded-full">
                    Clear
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Section Title */}
          <div className="text-center mb-6">
            <h2
              className={itemsHomeStyles.sectionTitle}
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {searchTerm
                ? "Search Results"
                : activeCategory === "All"
                ? "Featured Products"
                : `Best ${activeCategory}`}
            </h2>
            <div className={itemsHomeStyles.sectionDivider} />
          </div>

          {/* Products Grid */}
          <div className={itemsHomeStyles.productsGrid}>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const qty = getQuantity(product.id);

                return (
                  <div key={product.id} className={itemsHomeStyles.productCard}>
                    <div className={itemsHomeStyles.imageContainer}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className={itemsHomeStyles.productImage}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/no-image.png";
                        }}
                      />
                    </div>

                    <div className={itemsHomeStyles.productContent}>
                      <h3 className={itemsHomeStyles.productTitle}>
                        {product.name}
                      </h3>

                      <div className={itemsHomeStyles.priceContainer}>
                        <div>
                          <p className={itemsHomeStyles.currentPrice}>
                            Rs {product.price.toFixed(2)}
                          </p>
                          <span className={itemsHomeStyles.oldPrice}>
                            Rs {(product.price * 1.2).toFixed(2)}
                          </span>
                        </div>

                        {/* Add / Qty Controls */}
                        {qty === 0 ? (
                          <button
                            onClick={() => handleIncrease(product)}
                            className={itemsHomeStyles.addButton}
                          >
                            <FaShoppingCart className="mr-2" /> Add
                          </button>
                        ) : (
                          <div className={itemsHomeStyles.quantityControls}>
                            <button
                              onClick={() => handleDecrease(product)}
                              className={itemsHomeStyles.quantityButton}
                            >
                              <FaMinus />
                            </button>

                            <span className="font-bold">{qty}</span>

                            <button
                              onClick={() => handleIncrease(product)}
                              className={itemsHomeStyles.quantityButton}
                            >
                              <FaPlus />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={itemsHomeStyles.noProducts}>
                <div className={itemsHomeStyles.noProductsText}>
                  No Products Found
                </div>
                <button
                  onClick={() => setSearchTerm("")}
                  className={itemsHomeStyles.clearSearchButton}
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>

          {/* View All */}
          {!searchTerm && (
            <div className="text-center">
              <button
                onClick={redirectToItemsPage}
                className={itemsHomeStyles.viewAllButton}
              >
                View All{" "}
                {activeCategory === "All"
                  ? "Products"
                  : activeCategory}{" "}
                <FaChevronRight className="ml-3" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ItemsHome;
