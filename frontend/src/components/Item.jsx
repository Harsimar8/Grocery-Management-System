import React, { useEffect, useState } from "react";
import { useCart } from "../CartContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { itemsHomeStyles, itemsPageStyles } from "../assets/dummyStyles";
import {
  FiMinus,
  FiPlus,
  FiArrowLeft,
  FiSearch,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";

import { products } from "../assets/dummyData";

// --------------------------------------------------
// PRODUCT CARD
// --------------------------------------------------
const ProductCard = ({ item }) => {
  const { cart, addToCart, removeFromCart, updateQuantity } = useCart();

  // FIX 1 — correct cart item finder
  const cartItem = cart.find((ci) => ci.productId === item.id);

  const lineId = cartItem?.id;
  const quantity = cartItem ? cartItem.quantity : 0;

  // FIX 2 — correct image logic
  const imgSrc = item.image || "/no-image.png";

  return (
    <div className={itemsPageStyles.productCard}>
      <div className={itemsPageStyles.imageContainer}>
        <img src={imgSrc} alt={item.name} className={itemsPageStyles.productImage} />
      </div>

      <div className={itemsPageStyles.cardContent}>
        <div className={itemsPageStyles.titleContainer}>
          <h3 className={itemsPageStyles.productTitle}>{item.name}</h3>
          <span className={itemsPageStyles.organicTag}>Organic</span>
        </div>

        <p className={itemsPageStyles.productDescription}>
          {item.description ||
            `Fresh organic ${item.name.toLowerCase()} sourced locally`}
        </p>

        <div className={itemsPageStyles.priceContainer}>
          <span className={itemsPageStyles.currentPrice}>Rs {item.price.toFixed(2)}</span>
          <span className={itemsPageStyles.oldPrice}>
            Rs {(item.price * 1.5).toFixed(2)}
          </span>
        </div>

        <div className="mt-3">
          {quantity > 0 ? (
            <div className={itemsPageStyles.quantityControls}>
              <button
                onClick={() =>
                  quantity === 1 ? removeFromCart(lineId) : updateQuantity(lineId, quantity - 1)
                }
                className={`${itemsPageStyles.quantityButton} ${itemsPageStyles.quantityButtonLeft}`}
              >
                <FiMinus />
              </button>

              <span className={itemsPageStyles.quantityValue}>{quantity}</span>

              <button
                onClick={() => updateQuantity(lineId, quantity + 1)}
                className={`${itemsPageStyles.quantityButton} ${itemsPageStyles.quantityButtonRight}`}
              >
                <FiPlus />
              </button>
            </div>
          ) : (
            <button onClick={() => addToCart(item.id, 1)} className={itemsPageStyles.addButton}>
              <span>Add to Cart</span>
              <span className={itemsPageStyles.addButtonArrow}>→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------
// MAIN ITEMS PAGE
// --------------------------------------------------
const Item = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [allExpanded, setAllExpanded] = useState(false);

  const [data, setData] = useState([]);

  // insert products into one category
  useEffect(() => {
    setData([
  {
    id: "all-products",
    name: "All Products",
    items: products,
  },
]);

  }, []);

  // read ?search=
  useEffect(() => {
    const q = new URLSearchParams(location.search).get("search");
    if (q) setSearchTerm(q);
  }, [location.search]);

  const itemMatchSearch = (item, term) =>
    !term || item.name.toLowerCase().includes(term.toLowerCase());

  const filteredData = searchTerm
    ? data
        .map((cat) => ({
          ...cat,
          items: cat.items.filter((item) => itemMatchSearch(item, searchTerm)),
        }))
        .filter((cat) => cat.items.length > 0)
    : data;

  return (
    <div className={itemsPageStyles.container}>
      <header className={itemsPageStyles.header}>
        <Link to="/" className={itemsPageStyles.backLink}>
          <FiArrowLeft className="mr-2" />
          <span>Back</span>
        </Link>

        <h1 className={itemsPageStyles.mainTitle}>
          <span className={itemsPageStyles.titleSpan}>ORGANIC</span>
        </h1>
      </header>

      {/* SEARCH */}
      <div className={itemsPageStyles.searchContainer}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate(`/items?search=${encodeURIComponent(searchTerm)}`);
          }}
          className={itemsPageStyles.searchForm}
        >
          <input
            type="text"
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

      {/* CATEGORIES */}
      {filteredData.map((category) => {
        const visible = category.items; // show ALL products


        return (
          <section key={category.id} className={itemsPageStyles.categorySection}>
            <h2 className={itemsPageStyles.categoryTitle}>{category.name}</h2>

            <div className={itemsPageStyles.productsGrid}>
              {visible.map((item) => (
                <ProductCard key={item.id} item={item} />

              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default Item;
