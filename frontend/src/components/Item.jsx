import React, { useEffect, useState } from "react";
import { useCart } from "../CartContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { itemsPageStyles } from "../assets/dummyStyles";
import { FiMinus, FiPlus, FiArrowLeft, FiSearch } from "react-icons/fi";
import { products as dummyProducts } from "../assets/dummyData";
import axios from "axios";

const ProductCard = ({ item }) => {
  const { cart, addToCart, removeFromCart, updateQuantity } = useCart();

  const cartItem = cart.find((ci) => ci.productId === item.id);
  const lineId = cartItem?.id;
  const quantity = cartItem ? cartItem.quantity : 0;

  // FIXED IMAGE LOGIC
  const imgSrc = item.image?.startsWith("/uploads")
    ? `http://localhost:4000${item.image}`
    : item.image || "/no-image.png";

  return (
    <div className={itemsPageStyles.productCard}>
      <div className={itemsPageStyles.imageContainer}>
        <img
          src={imgSrc}
          alt={item.name}
          className={itemsPageStyles.productImage}
          onError={(e) => (e.target.src = "/no-image.png")}
        />
      </div>

      <div className={itemsPageStyles.cardContent}>
        <h3 className={itemsPageStyles.productTitle}>{item.name}</h3>

        <div className={itemsPageStyles.priceContainer}>
          <span className={itemsPageStyles.currentPrice}>
            Rs {item.price.toFixed(2)}
          </span>
        </div>

        {/* CART BUTTONS */}
        {quantity > 0 ? (
          <div className={itemsPageStyles.quantityControls}>
            <button
              onClick={() =>
                quantity === 1
                  ? removeFromCart(lineId)
                  : updateQuantity(lineId, quantity - 1)
              }
              className={itemsPageStyles.quantityButton}
            >
              <FiMinus />
            </button>

            <span className={itemsPageStyles.quantityValue}>{quantity}</span>

            <button
              onClick={() => updateQuantity(lineId, quantity + 1)}
              className={itemsPageStyles.quantityButton}
            >
              <FiPlus />
            </button>
          </div>
        ) : (
          <button
            onClick={() => addToCart(item.id, 1)}
            className={itemsPageStyles.addButton}
          >
            Add →
          </button>
        )}
      </div>
    </div>
  );
};

const Item = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);

  // ⭐ LOAD both dummy + backend products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/items");

        const backend = res.data;

        const formattedBackend = backend.map((p) => ({
          id: p._id,
          name: p.name,
          price: p.price,
          image: p.imageUrl, // must be `/uploads/...`
          category: p.category,
        }));

        // MERGE BOTH SOURCES
        setProducts([...dummyProducts, ...formattedBackend]);
      } catch (err) {
        console.log("Backend error → dummy only");
        setProducts(dummyProducts);
      }
    };

    loadProducts();
  }, []);

  // SEARCH
  useEffect(() => {
    const q = new URLSearchParams(location.search).get("search");
    if (q) setSearchTerm(q);
  }, [location.search]);

  const filtered = searchTerm
    ? products.filter((i) =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;

  return (
    <div className={itemsPageStyles.container}>
      <header className={itemsPageStyles.header}>
        <Link to="/" className={itemsPageStyles.backLink}>
          <FiArrowLeft /> Back
        </Link>
        <h1 className={itemsPageStyles.mainTitle}>ORGANIC</h1>
      </header>

      {/* SEARCH */}
      <div className={itemsPageStyles.searchContainer}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate(`/items?search=${searchTerm}`);
          }}
          className={itemsPageStyles.searchForm}
        >
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={itemsPageStyles.searchInput}
            placeholder="Search..."
          />
          <button className={itemsPageStyles.searchButton}>
            <FiSearch />
          </button>
        </form>
      </div>

      {/* PRODUCTS */}
      <div className={itemsPageStyles.productsGrid}>
        {filtered.map((item) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default Item;
