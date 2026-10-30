import { createContext, useContext, useEffect, useState } from "react"

const ProductsContext = createContext();

export function ProductsProvider({ children }) {

    const [products, setProducts] = useState(() => {
        try {
            const savedProducts = localStorage.getItem("products");
            return savedProducts ? JSON.parse(savedProducts) : [];
        } catch {
            return [];
        }
    });

    // NEW: Wishlist state
    const [wishlist, setWishlist] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("wishlist") || "[]");
        } catch {
            return [];
        }
    });

    // Cart state: load saved cart from localStorage
    const [cart, setCart] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("cart") || "[]");
        } catch {
            return [];
        }
    });

    const [orders, setOrders] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("orders") || "[]");
        } catch {
            return [];
        }
    });


    const [loaded, setLoaded] = useState(() => {
        return localStorage.getItem("products") !== null
    })

    // Existing products persistence
    useEffect(() => {
        if (loaded) {
            localStorage.setItem("products", JSON.stringify(products))
        }
    }, [products, loaded])


    // NEW: Save wishlist in localStorage
    useEffect(() => {
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }, [wishlist]);

    // Save cart whenever it changes
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        localStorage.setItem("orders", JSON.stringify(orders));
    }, [orders]);

    const isWished = (id) => wishlist.some((p) => p.id === id)
    const isInCart = (id) => cart.some((p) => p.id === id)

    const addToCart = (product) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);

            if (existing) {
                return prev.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [...prev, { ...product, quantity: 1 }];
        });
    };

    // Increase or decrease quantity
    const updateCartQuantity = (productId, change) => {
        setCart((prev) =>
            prev
                .map((item) =>
                    item.id === productId
                        ? { ...item, quantity: item.quantity + change }
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
    };


    // Remove product completely
    const removeFromCart = (productId) => {
        setCart((prev) => prev.filter((item) => item.id !== productId));
    };

    // Total quantity across all cart products
    const cartCount = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    // NEW: Add or remove a product from wishlist
    const toggleWishlist = (product) => {
        setWishlist((prev) =>
            prev.some((item) => item.id === product.id)
                ? prev.filter((item) => item.id !== product.id)
                : [...prev, product]
        );
    };


    return (
        <ProductsContext.Provider value={{
            products, setProducts, loaded, setLoaded, wishlist,
            setWishlist,
            toggleWishlist,
            cart,
            cartCount,
            addToCart,
            updateCartQuantity,
            removeFromCart,
            isWished, isInCart,
            orders,
            setOrders,
        }}>
            {children}
        </ProductsContext.Provider>
    )
}

export function useproducts() {
    return useContext(ProductsContext)
}