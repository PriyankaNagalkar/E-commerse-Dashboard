import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Modal, Spinner } from "react-bootstrap";
import {
  Dash, Plus, Trash, Heart, Truck, TagFill, X,
  CheckCircleFill, ShieldCheck, Cart3,
} from "react-bootstrap-icons";
import { useproducts } from "../Context/ProductContext";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useCountUp } from "../hooks/useCountUp";
import Header from "./Header";

const FREE_DELIVERY_AT = 50;
const DELIVERY_FEE = 4.99;
const COUPONS = { GLOW10: 10 };      // code -> percent off
const PAGE_SIZE = 10;

function Cart() {
  const {
    cart, cartCount, updateCartQuantity, removeFromCart,
    toggleWishlist, isWished, orders,
    setOrders,
  } = useproducts();

  const [removingId, setRemovingId] = useState(null);
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState(null);          // { code, percent }
  const [couponError, setCouponError] = useState("");
  const [showClear, setShowClear] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [unselected, setUnselected] = useState(() => new Set());
  const [placing, setPlacing] = useState(false);

  const { visibleItems, hasMore, loadingMore, sentinelRef } =
    useInfiniteScroll(cart, PAGE_SIZE, "", 0);


  // every total is calculated from the FULL cart, not from visibleItems
  const selectedItems = useMemo(
    () => cart.filter((i) => !unselected.has(i.id)),
    [cart, unselected]
  );
  const selectedQty = selectedItems.reduce((sum, i) => sum + i.quantity, 0);
  const allSelected = cart.length > 0 && selectedItems.length === cart.length;
  const noneSelected = selectedItems.length === 0;

  // every total is calculated from the SELECTED items only
  const t = useMemo(() => {
    let mrp = 0;
    let subtotal = 0;
    selectedItems.forEach((i) => {
      const price = Number(i.price || 0);
      const d = Number(i.discountPercentage || 0);
      const original = d > 0 && d < 100 ? price / (1 - d / 100) : price;
      mrp += original * i.quantity;
      subtotal += price * i.quantity;
    });
    const couponOff = coupon ? (subtotal * coupon.percent) / 100 : 0;
    const afterCoupon = subtotal - couponOff;
    const delivery = noneSelected || afterCoupon >= FREE_DELIVERY_AT ? 0 : DELIVERY_FEE;
    return {
      mrp, subtotal, couponOff, delivery,
      productDiscount: mrp - subtotal,
      total: afterCoupon + delivery,
      saved: mrp - subtotal + couponOff,
      remaining: Math.max(0, FREE_DELIVERY_AT - afterCoupon),
      progress: Math.min(100, (afterCoupon / FREE_DELIVERY_AT) * 100),
    };
  }, [selectedItems, coupon, noneSelected]);

  const animatedTotal = useCountUp(t.total);

  function toggleItem(id) {
    setUnselected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // select all / unselect all (uses the FULL cart, not just the scrolled-in items)
  function toggleAll() {
    setUnselected(allSelected ? new Set(cart.map((i) => i.id)) : new Set());
  }

  function removeSelected() {
    selectedItems.forEach((i) => removeFromCart(i.id));
    setShowClear(false);
  }

  function removeWithAnimation(id) {
    setRemovingId(id);
    setTimeout(() => {
      removeFromCart(id);
      setRemovingId(null);
    }, 300);
  }

  function saveForLater(item) {
    if (!isWished(item.id)) toggleWishlist(item);
    removeWithAnimation(item.id);
  }

  function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (COUPONS[code]) {
      setCoupon({ code, percent: COUPONS[code] });
      setCouponError("");
      setCouponInput("");
    } else {
      setCouponError("Invalid coupon code");
    }
  }

  function closeOrder() {
    setOrdered(false);
    selectedItems.forEach((i) => removeFromCart(i.id));   // unticked items stay in the cart
    setCoupon(null);
  }

  function placeOrder() {
    setPlacing(true);

    setTimeout(() => {
      const newOrder = {
        id: String(Date.now()),
        date: new Date().toISOString(),
        items: selectedItems.map((item) => ({ ...item })),
        total: t.total,
        saved: t.saved,
        delivery: t.delivery,
        couponCode: coupon?.code || null,
        status: "Placed",
      };

      setOrders((prev) => [...prev, newOrder]);

      setPlacing(false);
      setOrdered(true);
    }, 1200);
  }

  return (
    <>
      <Header />

      <div className="container py-4">
        <div className="text-center mt-3 mb-4">
          <h1 className="login-title">My Cart</h1>
          <p className="login-subtitle mb-0">
            {cart.length > 0
              ? `${cartCount} item${cartCount > 1 ? "s" : ""} in your cart`
              : "Your bag is waiting to be filled"}
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="wl-empty text-center">
            <div className="wl-empty-icon"><Cart3 /></div>
            <h4 className="mt-3">Your cart is empty</h4>
            <p>Looks like you haven't added anything yet.</p>
            <Link to="/" className="wl-btn wl-btn-inline">Start shopping</Link>
          </div>
        ) : (
          <div className="row g-4">
            {/* LEFT: items */}
            <div className="col-lg-8">
              <div className={`ct-banner ${t.remaining === 0 && !noneSelected ? "unlocked" : ""}`}>
                <div className="ct-banner-text">
                  <Truck />
                  {t.remaining > 0 ? (
                    <span>Add <strong>${t.remaining.toFixed(2)}</strong> more for <strong>free delivery</strong></span>
                  ) : (
                    <span>🎉 You've unlocked <strong>free delivery</strong></span>
                  )}
                </div>
                <div className="ct-track"><div className="ct-fill" style={{ width: `${t.progress}%` }} /></div>
              </div>

              <div className="ct-head">
                <label className="ct-check-all">
                  <input
                    type="checkbox"
                    className="ct-check"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = !allSelected && !noneSelected; }}
                    onChange={toggleAll}
                  />
                  <span>Select all ({selectedItems.length}/{cart.length})</span>
                </label>

                {!noneSelected && (
                  <button type="button" className="wl-link" onClick={() => setShowClear(true)}>
                    Remove selected
                  </button>
                )}
              </div>

              {visibleItems.map((item, index) => {
                const price = Number(item.price || 0);
                const discount = Math.round(item.discountPercentage || 0);
                const original = discount > 0 && discount < 100 ? price / (1 - discount / 100) : null;
                const maxed = item.stock && item.quantity >= item.stock;
                const checked = !unselected.has(item.id);
                return (
                  <div
                    key={item.id}
                    className={`ct-item ${checked ? "" : "unchecked"} ${removingId === item.id ? "leaving" : ""}`}
                    style={{ "--i": Math.min(index, 10) }}
                  >
                    <input
                      type="checkbox"
                      className="ct-check"
                      checked={checked}
                      onChange={() => toggleItem(item.id)}
                      aria-label={`Select ${item.title}`}
                    />
                    <div className="ct-img">
                      <img src={item.images?.[0] || item.thumbnail} alt={item.title} loading="lazy" />
                    </div>

                    <div className="ct-info">
                      {item.category && <span className="wl-category">{item.category}</span>}
                      <h3 className="ct-title">{item.title}</h3>

                      <div className="ct-price">
                        <span className="now">${price.toFixed(2)}</span>
                        {original && <span className="was">${original.toFixed(2)}</span>}
                        {discount > 0 && <span className="off">{discount}% off</span>}
                      </div>

                      <div className="ct-stepper">
                        <button
                          type="button"
                          aria-label={item.quantity === 1 ? "Remove item" : "Decrease quantity"}
                          onClick={() =>
                            item.quantity === 1 ? removeWithAnimation(item.id) : updateCartQuantity(item.id, -1)
                          }
                        >
                          {item.quantity === 1 ? <Trash /> : <Dash />}
                        </button>
                        <span key={item.quantity} className="qty">{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          disabled={!!maxed}
                          onClick={() => updateCartQuantity(item.id, 1)}
                        >
                          <Plus />
                        </button>
                      </div>
                      {maxed && <small className="ct-warn">Only {item.stock} in stock</small>}
                    </div>

                    <div className="ct-side">
                      <div className="ct-line">${(price * item.quantity).toFixed(2)}</div>
                      <div className="ct-links">
                        <button type="button" onClick={() => saveForLater(item)}>
                          <Heart /> Save for later
                        </button>
                        <button type="button" className="danger" onClick={() => removeWithAnimation(item.id)}>
                          <X /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {loadingMore && <div className="skeleton-card" style={{ height: 140 }} />}
              {hasMore && (
                <div ref={sentinelRef} className="scroll-sentinel">
                  <Spinner animation="border" size="sm" /> Loading more...
                </div>
              )}
            </div>

            {/* RIGHT: price details */}
            <div className="col-lg-4">
              <aside className="ct-summary">
                <h5 className="ct-summary-title">Price Details</h5>

                <div className="ct-coupon">
                  {coupon ? (
                    <div className="ct-coupon-applied">
                      <span><TagFill /> <strong>{coupon.code}</strong> applied</span>
                      <button type="button" onClick={() => setCoupon(null)}>Remove</button>
                    </div>
                  ) : (
                    <>
                      <div className="ct-coupon-input">
                        <input
                          value={couponInput}
                          placeholder="Coupon code"
                          aria-label="Coupon code"
                          onChange={(e) => { setCouponInput(e.target.value); setCouponError(""); }}
                          onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                        />
                        <button type="button" onClick={applyCoupon} disabled={!couponInput.trim()}>Apply</button>
                      </div>
                      {couponError && <small className="ct-warn">{couponError}</small>}
                    </>
                  )}
                </div>
                <div className="ct-row"><span>Price ({selectedQty} item{selectedQty !== 1 ? "s" : ""})</span><span>${t.mrp.toFixed(2)}</span></div>
                {t.productDiscount > 0.005 && (
                  <div className="ct-row green"><span>Discount</span><span>- ${t.productDiscount.toFixed(2)}</span></div>
                )}
                {t.couponOff > 0 && (
                  <div className="ct-row green"><span>Coupon ({coupon.code})</span><span>- ${t.couponOff.toFixed(2)}</span></div>
                )}
                <div className="ct-row">
                  <span>Delivery</span>
                  {t.delivery === 0 ? <span className="free">FREE</span> : <span>${t.delivery.toFixed(2)}</span>}
                </div>

                <div className="ct-row ct-total"><span>Total</span><span>${animatedTotal.toFixed(2)}</span></div>

                {t.saved > 0.005 && (
                  <div className="ct-save">You'll save ${t.saved.toFixed(2)} on this order 🎉</div>
                )}

                <button
                  type="button"
                  className="ct-order-btn"
                  disabled={noneSelected || placing}
                  onClick={placeOrder}
                >
                  {placing ? (
                    <><Spinner animation="border" size="sm" /> Placing order...</>
                  ) : noneSelected ? (
                    "Select items to order"
                  ) : (
                    `Place Order (${selectedQty})`
                  )}
                </button>
                <p className="ct-secure"><ShieldCheck /> Safe and secure payments</p>
              </aside>
            </div>
          </div>
        )}
      </div>

      {/* clear cart */}
      <Modal show={showClear && !noneSelected} onHide={() => setShowClear(false)} centered>
        <Modal.Header closeButton><Modal.Title>Remove selected items?</Modal.Title></Modal.Header>
        <Modal.Body>
          {selectedItems.length} selected product{selectedItems.length > 1 ? "s" : ""} will be removed from your cart.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowClear(false)}>Cancel</Button>
          <Button variant="danger" onClick={removeSelected}>Remove</Button>
        </Modal.Footer>
      </Modal>

      {/* order success */}
      <Modal show={ordered} onHide={closeOrder} centered>
        <Modal.Body className="ct-success text-center">
          <CheckCircleFill className="ct-success-icon" />
          <h4>Order placed!</h4>
          <p>Thank you for shopping with GlowStore.</p>
          <Link to="/" className="wl-btn wl-btn-inline" onClick={closeOrder}>Continue shopping</Link>
          <Link to="/orders" className="wl-link d-block mt-3" onClick={closeOrder}>View my orders</Link>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Cart;