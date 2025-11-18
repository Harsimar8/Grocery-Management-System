import React from "react";
import { useCart } from "../CartContext";
import contactStyles, { cartStyles } from "../assets/dummyStyles";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiMinus, FiTrash2, FiPlus } from "react-icons/fi";
import { products } from "../assets/dummyData"; // Load your static products


const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();

  // Find matching product from dummy data
const findProduct = (productId) =>
  products.find((p) => p.id === productId);

// Return name
const getItemName = (item) =>
  findProduct(item.productId || item.product)?.name || "Unnamed";

// Return price
const getItemPrice = (item) =>
  findProduct(item.productId || item.product)?.price || 0;

// Return local static image
const getItemImage = (item) =>
  findProduct(item.productId || item.product)?.image || "";


  // ✅ Subtotal calculation
  const subtotal = cart.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0);


  // ✅ Quantity change handler
  const handleQuantityChange = async (id, delta) => {
    const item = cart.find((i) => i.id === id);
    if (!item) return;

    const newQty = item.quantity + delta;
    if (newQty > 0) {
      await updateQuantity(id, newQty);
    } else {
      await removeFromCart(id);
    }
  };

  // ✅ Empty cart view
  if (cart.length === 0) {
    return (
      <div className={contactStyles.pageContainer}>
        <div className={cartStyles.maxContainer}>
          <Link to="/items" className={cartStyles.continueShopping}>
            <FiArrowLeft className="mr-2" />
            Continue Shopping
          </Link>

          <div className={cartStyles.emptyCartContainer}>
            <div className={cartStyles.emptyCartIcon}>🛒</div>
            <h1 className={cartStyles.emptyCartHeading}>Your Cart is Empty</h1>
            <p className={cartStyles.emptyCartText}>
              Looks like you haven’t added any organic goodies to your cart yet.
            </p>
            <Link to="/items" className={cartStyles.emptyCartButton}>
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Main cart layout
  return (
    <div className={contactStyles.pageContainer}>
      <div className={cartStyles.maxContainer}>
        <div className={cartStyles.headerContainer}>
          <h1 className={cartStyles.headerTitle}>Your Shopping Cart</h1>
          <button onClick={clearCart} className={cartStyles.clearCartButton}>
            <FiTrash2 className="mr-1" />
            Clear Cart
          </button>
        </div>

        <div className={cartStyles.cartGrid}>
          {/* ✅ CART ITEMS SECTION */}
          <div className={cartStyles.cartItemsSection}>
            <div className={cartStyles.cartItemsGrid}>
              {cart.map((item) => {
                const id = item.id;
                const name = getItemName(item);
                const price = getItemPrice(item);
                const img = getItemImage(item);

                return (
                  <div key={id} className={cartStyles.cartItemCard}>
                    <div className={cartStyles.cartItemImageContainer}>
                      {img ? (
                        <img
                          src={img}
                          alt={name}
                          className={cartStyles.cartItemImage}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/no-image.png";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-600 rounded">
                          No Image
                        </div>
                      )}
                    </div>

                    <h3 className={cartStyles.cartItemName}>{name}</h3>
                    <p className={cartStyles.cartItemPrice}>Rs {price.toFixed(2)}</p>

                    <div className={cartStyles.cartItemQuantityContainer}>
                      <button
                        className={cartStyles.cartItemQuantityButton}
                        onClick={() => handleQuantityChange(id, -1)}
                      >
                        <FiMinus />
                      </button>

                      <span className={cartStyles.cartItemQuantity}>{item.quantity}</span>

                      <button
                        onClick={() => handleQuantityChange(id, 1)}
                        className={cartStyles.cartItemQuantityButton}
                      >
                        <FiPlus />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(id)}
                      className={cartStyles.cartItemRemoveButton}
                    >
                      <FiTrash2 className="mr-1" /> Remove
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ✅ ORDER SUMMARY SECTION */}
          <div className={cartStyles.orderSummaryCard}>
            <h2 className={cartStyles.orderSummaryTitle}>Order Summary</h2>

            <div className="space-y-4 text-sm sm:text-base">
              <div className={cartStyles.orderSummaryRow}>
                <span className={cartStyles.orderSummaryLabel}>Subtotal</span>
                <span className={cartStyles.orderSummaryValue}>Rs {subtotal.toFixed(2)}</span>
              </div>

              <div className={cartStyles.orderSummaryRow}>
                <span className={cartStyles.orderSummaryLabel}>Shipping</span>
                <span className={cartStyles.orderSummaryValue}>Free</span>
              </div>

              <div className={cartStyles.orderSummaryRow}>
                <span className={cartStyles.orderSummaryLabel}>Taxes (5%)</span>
                <span className={cartStyles.orderSummaryValue}>
                  Rs {(subtotal * 0.05).toFixed(2)}
                </span>
              </div>

              <div className={cartStyles.orderSummaryDivider}></div>

              <div className={cartStyles.orderSummaryTotalRow}>
                <span className={cartStyles.orderSummaryTotalLabel}>Total</span>
                <span className={cartStyles.orderSummaryTotalValue}>
                  Rs {(subtotal * 1.05).toFixed(2)}
                </span>
              </div>
            </div>

            <button className={cartStyles.checkoutButton}>
              <Link to="/checkout">Proceed to Checkout</Link>
            </button>

            <div className={cartStyles.continueShoppingBottom}>
              <Link to="/items" className={cartStyles.continueShopping}>
                <FiArrowLeft className="mr-2" />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
