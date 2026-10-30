import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import {
    Search, BoxSeam, ChevronDown, ArrowRepeat, CheckCircleFill,
} from "react-bootstrap-icons";
import { useproducts } from "../Context/ProductContext";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import Header from "./Header";

const PAGE_SIZE = 5;
const STEPS = ["Placed", "Packed", "Shipped", "Delivered"];

// orders? are not tracked by a server, so the status is simulated from the order date.
// DAY = how long one "day" lasts. For a quick demo set it to 15000 (15 seconds).
const DAY = 86400000;
const STEP_AFTER_DAYS = [0, 1, 3, 5];

function getStep(date) {
    const days = (Date.now() - new Date(date).getTime()) / DAY;
    let step = 0;
    STEP_AFTER_DAYS.forEach((d, i) => { if (days >= d) step = i; });
    return step;
}

const fmtDate = (d, opts) =>
    new Date(d).toLocaleDateString("en-US", opts || { day: "numeric", month: "short", year: "numeric" });

function Orders() {
    const { orders, addToCart, updateCartQuantity } = useproducts();
    const navigate = useNavigate();

    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState("all");          // all | progress | delivered
    const [openId, setOpenId] = useState(null);

    const stats = useMemo(() => ({
        count: orders?.length,
        spent: orders?.reduce((s, o) => s + Number(o.total || 0), 0),
        saved: orders?.reduce((s, o) => s + Number(o.saved || 0), 0),
    }), [orders]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();

        return (orders || []).filter((o) => {
            const delivered = getStep(o.date) === 3;

            if (filter === "progress" && delivered) return false;
            if (filter === "delivered" && !delivered) return false;

            if (!q) return true;

            const orderId = String(o.id ?? "").toLowerCase();

            const productNames = (o.items || [])
                .map((i) => i.title || "")
                .join(" ")
                .toLowerCase();

            return orderId.includes(q) || productNames.includes(q);
        });
    }, [orders, query, filter]);

    const { visibleItems, hasMore, sentinelRef } =
        useInfiniteScroll(filtered, PAGE_SIZE, `${query}|${filter}`, 0);

    function buyAgain(order) {
        order.items.forEach((item) => {
            addToCart(item);
            if (item.quantity > 1) updateCartQuantity(item.id, item.quantity - 1);
        });
        navigate("/cart");
    }

    return (
        <>
            <Header />

            <div className="container py-4">
                <div className="text-center mt-3 mb-4">
                    <h1 className="login-title">My orders</h1>
                    <p className="login-subtitle mb-0">
                        {orders?.length > 0 ? "Track, review and reorder your purchases" : "Nothing ordered yet"}
                    </p>
                </div>

                {orders?.length === 0 ? (
                    <div className="wl-empty text-center">
                        <div className="wl-empty-icon"><BoxSeam /></div>
                        <h4 className="mt-3">No orders yet</h4>
                        <p>When you place an order, it will show up here.</p>
                        <Link to="/" className="wl-btn wl-btn-inline">Start shopping</Link>
                    </div>
                ) : (
                    <>
                        {/* stats */}
                        <div className="or-stats">
                            <div className="or-stat"><span>{stats.count}</span><small>orders</small></div>
                            <div className="or-stat"><span>${stats.spent?.toFixed(2)}</span><small>Total spent</small></div>
                            <div className="or-stat green"><span>${stats.saved?.toFixed(2)}</span><small>Total saved</small></div>
                        </div>

                        {/* toolbar */}
                        <div className="wl-toolbar">
                            <div className="search-box or-search">
                                <input
                                    type="search"
                                    className="form-control"
                                    placeholder="Search by order ID or product..."
                                    aria-label="Search orders"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                <Search className="search-icon" />
                            </div>

                            <div className="wl-chips">
                                {[["all", "All"], ["progress", "In progress"], ["delivered", "Delivered"]].map(([key, label]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        className={`wl-chip ${filter === key ? "active" : ""}`}
                                        onClick={() => setFilter(key)}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* order cards */}
                        {visibleItems?.map((order, index) => {
                            const step = getStep(order.date);
                            const delivered = step === 3;
                            const open = openId === order.id;
                            const units = order.items.reduce((s, i) => s + i.quantity, 0);
                            const eta = new Date(new Date(order.date).getTime() + 5 * DAY);

                            return (
                                <div key={order.id} className="or-card" style={{ "--i": Math.min(index, 8) }}>
                                    {/* header */}
                                    <div className="or-head">
                                        <div>
                                            <div className="or-id">Order #{order.id}</div>
                                            <small>Placed on {fmtDate(order.date)}</small>
                                        </div>
                                        <div className="or-head-right">
                                            <span className={`or-badge ${delivered ? "done" : ""}`}>
                                                {delivered ? <><CheckCircleFill /> Delivered</> : STEPS[step]}
                                            </span>
                                            <strong className="or-total">${Number(order.total).toFixed(2)}</strong>
                                        </div>
                                    </div>

                                    {/* timeline */}
                                    <ol className="or-steps" style={{ "--step": step }}>
                                        {STEPS.map((label, i) => (
                                            <li key={label} className={i < step ? "done" : i === step ? "current" : ""}>
                                                <span className="dot">{i <= step ? "✓" : ""}</span>
                                                <span className="label">{label}</span>
                                            </li>
                                        ))}
                                    </ol>
                                    <p className="or-eta">
                                        {delivered
                                            ? `Delivered on ${fmtDate(eta, { weekday: "short", day: "numeric", month: "short" })}`
                                            : `Arriving by ${fmtDate(eta, { weekday: "short", day: "numeric", month: "short" })}`}
                                    </p>

                                    {/* thumbnails */}
                                    <div className="or-thumbs">
                                        {order.items.slice(0, 4).map((i) => (
                                            <img key={i.id} src={i.images?.[0] || i.thumbnail} alt={i.title} title={i.title} />
                                        ))}
                                        {order.items.length > 4 && <span className="more">+{order.items.length - 4}</span>}
                                        <small className="or-units">
                                            {order.items.length} product{order.items.length > 1 ? "s" : ""} · {units} unit{units > 1 ? "s" : ""}
                                        </small>
                                    </div>

                                    {/* actions */}
                                    <div className="or-actions">
                                        <button type="button" className="or-toggle" onClick={() => setOpenId(open ? null : order.id)} aria-expanded={open}>
                                            {open ? "Hide details" : "View details"} <ChevronDown className={open ? "flip" : ""} />
                                        </button>
                                        <button type="button" className="or-again" onClick={() => buyAgain(order)}>
                                            <ArrowRepeat /> Buy again
                                        </button>
                                    </div>

                                    {/* expandable details */}
                                    <div className={`or-details ${open ? "open" : ""}`}>
                                        <div className="inner">
                                            {order.items.map((i) => (
                                                <div className="or-line" key={i.id}>
                                                    <img src={i.images?.[0] || i.thumbnail} alt="" />
                                                    <div className="info">
                                                        <span className="t">{i.title}</span>
                                                        <small>Qty {i.quantity} × ${Number(i.price).toFixed(2)}</small>
                                                    </div>
                                                    <strong>${(i.price * i.quantity).toFixed(2)}</strong>
                                                </div>
                                            ))}

                                            <div className="or-sum">
                                                {order.couponCode && <div><span>Coupon ({order.couponCode})</span><span className="green">applied</span></div>}
                                                <div>
                                                    <span>Delivery</span>
                                                    {order.delivery === 0 ? <span className="green">FREE</span> : <span>${Number(order.delivery).toFixed(2)}</span>}
                                                </div>
                                                {order.saved > 0.005 && (
                                                    <div><span>You saved</span><span className="green">${Number(order.saved).toFixed(2)}</span></div>
                                                )}
                                                <div className="grand"><span>Order total</span><span>${Number(order.total).toFixed(2)}</span></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {filtered?.length === 0 && (
                            <div className="empty-state text-center">
                                <BoxSeam size={44} />
                                <h5 className="mt-3">No matching orders</h5>
                                <p>Try a different search or filter.</p>
                            </div>
                        )}

                        {hasMore && (
                            <div ref={sentinelRef} className="scroll-sentinel">
                                <Spinner animation="border" size="sm" /> Loading more orders...
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

export default Orders