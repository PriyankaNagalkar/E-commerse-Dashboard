import { useEffect, useState } from "react";
import Header from "./Header";
import { Table } from "react-bootstrap";
import { useproducts } from "./ProductContext";

function ProductList() {

    const { products, setProducts, loaded, setLoaded } = useproducts()

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                let result = await fetch("https://dummyjson.com/products")
                const response = await result.json()

                setProducts((prev) => {
                    const filterList = [...prev, ...response.products];

                    return Array.from(new Map(
                        filterList.map((item) => [item.id, item])
                    ).values())
                })
                setLoaded(true)
            } catch (err) {
                alert("Failed to load products", err)
            }
        }
        fetchProduct()
    }, [loaded, setProducts, setLoaded])

    return (
        <div>
            <Header />
            <div className="col-sm-10 offset-sm-1">
                <h1>Product List</h1>

                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Name</th>
                            <th>Image</th>
                            <th>Description</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            products && products.map((item, key) => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.title}</td>
                                    <td><img className="itemImg" src={item.images?.[0]} alt="item.title"></img></td>
                                    <td>{item.description}</td>
                                    <td>{item.price}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </Table>
            </div>

        </div>
    )
}

export default ProductList;