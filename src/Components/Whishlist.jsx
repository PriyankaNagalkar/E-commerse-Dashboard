import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Modal, Spinner, Toast, ToastContainer } from "react-bootstrap";
import { X, Handbag, HeartFill, Heart, StarFill, Cart3, BagCheck } from "react-bootstrap-icons";
import { useproducts } from "../Context/ProductContext";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import Header from "./Header";

const PAGE_SIZE = 8;

function Wishlist() {
  const { wishlist, setWishlist, toggleWishlist, addToCart, isInCart } = useproducts();

  const [category, setCategory] = useState("all");
  const [removingId, setRemovingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [showClear, setShowClear] = useState(false);

  const totalValue = wishlist.reduce((sum, p) => sum + Number(p.price || 0), 0);

  // category chips are built from what is actually in the wishlist
  const categories = useMemo(
    () => ["all", ...new Set(wishlist.map((p) => p.category).filter(Boolean))],
    [wishlist]
  );
  const activeCategory = categories.includes(category) ? category : "all";

  const filtered = useMemo(
    () => (activeCategory === "all" ? wishlist : wishlist.filter((p) => p.category === activeCategory)),
    [wishlist, activeCategory]
  );

  const { visibleItems, hasMore, loadingMore, sentinelRef } =
    useInfiniteScroll(filtered, PAGE_SIZE, activeCategory, 0);

  // play the exit animation first, then remove
  function removeWithAnimation(item) {
    setRemovingId(item.id);
    setTimeout(() => {
      toggleWishlist(item);
      setRemovingId(null);
    }, 300);
  }

  function moveToBag(item) {
    addToCart(item);
    removeWithAnimation(item);
    setToast({ msg: `"${item.title}" moved to bag`, link: true });
  }

  function moveAllToBag() {
    wishlist.filter((p) => !isInCart(p.id)).forEach(addToCart);
    setWishlist([]);
    setToast({ msg: "All items moved to bag", link: true });
  }

  function clearAll() {
    setWishlist([]);
    setShowClear(false);
  }

  return (
    <>
      <Header />

      <div className="container py-4">
        <div className="text-center mt-3">
          <h1 className="login-title">
            <HeartFill className="wl-title-heart" /> My Wishlist
          </h1>
          <p className="login-subtitle mb-0">
            {wishlist.length > 0
              ? `${wishlist.length} saved item${wishlist.length > 1 ? "s" : ""} · worth $${totalValue.toFixed(2)}`
              : "Save the things you love"}
          </p>
        </div>

        {wishlist.length === 0 ? (
          <div className="wl-empty text-center">
            <div className="wl-empty-icon"><Heart /></div>
            <h4 className="mt-3">Your wishlist is empty</h4>
            <p>Add products by clicking the heart icon.</p>
            <Link to="/" className="wl-btn wl-btn-inline">Continue shopping</Link>
          </div>
        ) : (
          <>
            {/* toolbar: category chips + bulk actions */}
            <div className="wl-toolbar">
              <div className="wl-chips">
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`wl-chip ${activeCategory === c ? "active" : ""}`}
                    onClick={() => setCategory(c)}
                  >
                    {c === "all" ? "All" : c}
                  </button>
                ))}
              </div>

              <div className="wl-actions">
                <button type="button" className="wl-link" onClick={() => setShowClear(true)}>
                  Clear all
                </button>
                <Button className="wl-move-all" onClick={moveAllToBag}>
                  <BagCheck /> Move all to bag
                </Button>
              </div>
            </div>

            {/* cards */}
            <div className="row g-3 g-md-4">
              {visibleItems.map((item, index) => {
                const discount = Math.round(item.discountPercentage || 0);
                const original = discount > 0 ? item.price / (1 - discount / 100) : null;

                return (
                  <div className="col-6 col-md-4 col-lg-3 col-xl-custom" key={item.id}>
                    <div
                      className={`wl-card ${removingId === item.id ? "leaving" : ""}`}
                      style={{ "--i": Math.min(index, 12) }}
                    >
                      <div className="wl-img">
                        <button
                          type="button"
                          className="wl-remove"
                          aria-label={`Remove ${item.title} from wishlist`}
                          onClick={() => removeWithAnimation(item)}
                        >
                          <X />
                        </button>

                        {discount > 0 && <span className="wl-discount">-{discount}%</span>}

                        <img src={item.images?.[0] || item.thumbnail} alt={item.title} loading="lazy" />

                        {item.rating > 0 && (
                          <span className="wl-rating">
                            <StarFill size={11} /> {Number(item.rating).toFixed(1)}
                          </span>
                        )}
                      </div>

                      <div className="wl-body">
                        {item.category && <span className="wl-category">{item.category}</span>}
                        <h3 className="wl-title">{item.title}</h3>

                        <div className="wl-price">
                          <span className="now">${Number(item.price).toFixed(2)}</span>
                          {original && <span className="was">${original.toFixed(2)}</span>}
                        </div>
                      </div>

                      {isInCart(item.id) ? (
                        <Link to="/cart" className="wl-btn outline">
                          <Cart3 /> Go to Cart
                        </Link>
                      ) : (
                        <button type="button" className="wl-btn" onClick={() => moveToBag(item)}>
                          <Handbag /> Move to Bag
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {loadingMore && (
              <div className="row g-3 g-md-4 mt-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div className="col-6 col-md-4 col-lg-3" key={i}>
                    <div className="skeleton-card" />
                  </div>
                ))}
              </div>
            )}

            {hasMore && (
              <div ref={sentinelRef} className="scroll-sentinel">
                <Spinner animation="border" size="sm" /> Loading more...
              </div>
            )}
          </>
        )}
      </div>

      {/* clear all confirmation */}
      <Modal show={showClear} onHide={() => setShowClear(false)} centered>
        <Modal.Header closeButton><Modal.Title>Clear wishlist?</Modal.Title></Modal.Header>
        <Modal.Body>All {wishlist.length} saved items will be removed.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowClear(false)}>Cancel</Button>
          <Button variant="danger" onClick={clearAll}>Clear all</Button>
        </Modal.Footer>
      </Modal>

      {/* toast */}
      <ToastContainer position="bottom-end" className="p-3" style={{ position: "fixed" }}>
        <Toast show={!!toast} onClose={() => setToast(null)} delay={2500} autohide bg="dark">
          <Toast.Body className="text-white d-flex justify-content-between align-items-center gap-3">
            <span>{toast?.msg}</span>
            {toast?.link && <Link to="/cart" className="wl-toast-link">View cart</Link>}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}

export default Wishlist;