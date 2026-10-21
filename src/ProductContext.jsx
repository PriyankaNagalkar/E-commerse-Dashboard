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
    const [loaded, setLoaded] = useState(() => {
        return localStorage.getItem("products") !== null
    })

    useEffect(() => {
        if (loaded) {
            localStorage.setItem("products", JSON.stringify(products))
        }
    }, [products, loaded])

    
    return (
        <ProductsContext.Provider value={{ products, setProducts, loaded, setLoaded }}>
            {children}
        </ProductsContext.Provider>
    )
}

export function useproducts() {
    return useContext(ProductsContext)
}