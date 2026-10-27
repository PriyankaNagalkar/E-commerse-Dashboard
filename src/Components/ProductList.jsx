import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Alert, Button, Col, Modal, Row } from "react-bootstrap"
import { Pencil, Trash, StarFill, Search, BoxSeam } from "react-bootstrap-icons"
import Header from "./Header"
import { useproducts } from "../Context/ProductContext"

function ProductList() {
    const { products, setProducts, loaded, setLoaded } = useproducts()

    const [query, setQuery] = useState("")
    const [sort, setSort] = useState("default")
    const [toDelete, setToDelete] = useState(null)       // product waiting for confirmation
    const [removingId, setRemovingId] = useState(null)   // product playing its exit animation
    const [error, setError] = useState("")
    const [attempt, setAttempt] = useState(0)            // bumped by the Retry button

    // load once; the guard stops refetching (and deleted items coming back)
    useEffect(() => {
        if (loaded) return
        const controller = new AbortController()

        async function fetchProducts() {
            try {
                const res = await fetch("https://dummyjson.com/products", { signal: controller.signal })
                if (!res.ok) throw new Error("Request failed")
                const data = await res.json()
                setProducts((prev) => [...prev, ...data.products])
                setLoaded(true)
            } catch (err) {
                if (err.name !== "AbortError") {
                    setError("Failed to load products. Please try again.")
                }
            }
        }
        fetchProducts()

        return () => controller.abort()
    }, [loaded, attempt, setProducts, setLoaded])

    // search + sort (recalculated only when something it uses changes)
    const visible = useMemo(() => {
        const q = query.trim().toLowerCase()
        const list = products.filter((p) => p.title?.toLowerCase().includes(q))

        if (sort === "low") list.sort((a, b) => a.price - b.price)
        else if (sort === "high") list.sort((a, b) => b.price - a.price)
        else if (sort === "az") list.sort((a, b) => a.title.localeCompare(b.title))

        return list
    }, [products, query, sort])

    async function confirmDelete() {
        const item = toDelete
        setToDelete(null)

        try {
            if (!item.isLocal) {                          // products you added don't exist on DummyJSON
                const res = await fetch(`https://dummyjson.com/products/${item.id}`, { method: "DELETE" })
                if (!res.ok) throw new Error("Delete failed")
            }

            setRemovingId(item.id)                        // plays the fade-out
            setTimeout(() => {
                setProducts((prev) => prev.filter((p) => p.id !== item.id))
                setRemovingId(null)
            }, 300)
        } catch (err) {
            setError("Failed to delete product. Please try again.")
        }
    }

    return (
        <div>
            <Header />

            <div className="container pb-5">
                <div className="text-center mt-3">
                    <h1 className="login-title">Our Products</h1>
                    <p className="login-subtitle mb-0">Browse, edit or remove items from your store</p>
                </div>

                {error && (
                    <Alert variant="danger" dismissible onClose={() => setError("")}>
                        {error}{" "}
                        {!loaded && (
                            <Button size="sm" variant="outline-danger" onClick={() => { setError(""); setAttempt((a) => a + 1) }}>
                                Retry
                            </Button>
                        )}
                    </Alert>
                )}

                {loaded && (
                    <>
                        <div className="toolbar">
                            <div className="search-box">
                                <input
                                    type="search"
                                    className="form-control"
                                    placeholder="Search products..."
                                    aria-label="Search products"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                <Search className="search-icon" />
                            </div>

                            <select
                                className="form-select sort-select"
                                aria-label="Sort products"
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                            >
                                <option value="default">Sort: Default</option>
                                <option value="low">Price: Low to High</option>
                                <option value="high">Price: High to Low</option>
                                <option value="az">Name: A to Z</option>
                            </select>
                        </div>

                        <p className="result-count text-center">
                            Showing {visible.length} of {products.length} products
                        </p>
                    </>
                )}

                {/* loading skeletons */}
                {!loaded && !error && (
                    <Row xs={1} sm={2} lg={3} xl={4} className="g-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Col key={i}><div className="skeleton-card" /></Col>
                        ))}
                    </Row>
                )}

                {/* product cards */}
                {loaded && visible.length > 0 && (
                    <Row xs={1} sm={2} lg={3} xl={4} className="g-4">
                        {visible.map((item, index) => (
                            <Col key={item.id}>
                                <div
                                    className={`product-card ${removingId === item.id ? "removing" : ""}`}
                                    style={{ "--i": Math.min(index, 12) }}
                                >
                                    <div className="product-img-wrap">
                                        {item.isLocal && <span className="new-badge">New</span>}

                                        <img src={item.images?.[0] || item.thumbnail} alt={item.title} loading="lazy" />

                                        <div className="card-actions">
                                            <Link to={`/update/${item.id}`} className="icon-btn" aria-label={`Edit ${item.title}`}>
                                                <Pencil />
                                            </Link>
                                            <button
                                                type="button"
                                                className="icon-btn danger"
                                                aria-label={`Delete ${item.title}`}
                                                onClick={() => setToDelete(item)}
                                            >
                                                <Trash />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="product-body">
                                        {item.category && <span className="category">{item.category}</span>}
                                        <h3 className="product-title">{item.title}</h3>
                                        <p className="product-desc">{item.description}</p>

                                        <div className="product-footer">
                                            <span className="price">${Number(item.price).toFixed(2)}</span>
                                            {item.rating && (
                                                <span className="rating"><StarFill size={13} /> {item.rating}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                )}

                {/* empty state */}
                {loaded && visible.length === 0 && (
                    <div className="empty-state text-center">
                        <BoxSeam size={48} />
                        <h4 className="mt-3">No products found</h4>
                        <p>Try a different search or add a new product.</p>
                        {query && <Button variant="outline-danger" onClick={() => setQuery("")}>Clear search</Button>}
                    </div>
                )}
            </div>

            {/* delete confirmation */}
            <Modal show={!!toDelete} onHide={() => setToDelete(null)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Delete product?</Modal.Title>
                </Modal.Header>
                <Modal.Body>"{toDelete?.title}" will be removed from your store.</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setToDelete(null)}>Cancel</Button>
                    <Button variant="danger" onClick={confirmDelete}>Delete</Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default ProductList