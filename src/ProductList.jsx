import { useEffect, useState } from "react";
import Header from "./Header";
import { Table } from "react-bootstrap";
import { useproducts } from "./ProductContext";
import { Pencil, Trash } from 'react-bootstrap-icons'
import { Link } from "react-router-dom";

function ProductList() {

    const { products, setProducts, loaded, setLoaded } = useproducts()

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                let result = await fetch("https://dummyjson.com/products")
                const response = await result.json()

                setProducts((prev) => {
                    const filterList = [...prev];

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

    async function deleteItem(id) {
        setProducts((prev) =>
            prev.filter((product) => product.id !== id)
        );
    }

    async function updateData(id) {
        console.log(id)
    }

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
                            <th>Operation</th>
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
                                    <td><Trash className="deleteBtn" onClick={() => { deleteItem(item.id) }} /></td>
                                    <td><Link to={"update/"+item.id}><Pencil className="editData" onClick={() => {updateData(item.id)}}/></Link></td>
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