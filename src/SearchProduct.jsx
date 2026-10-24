import { useState } from "react"
import Header from "./Header"
import { Table } from "react-bootstrap"
import { Trash } from 'react-bootstrap-icons'
import { useproducts } from "./ProductContext";

function SearchProduct() {
    const [data, setData] = useState([])
    const { setProducts } = useproducts()

    async function search(key) {
        if (key.length >= 2) {
            try {
                let result = await fetch(`https://dummyjson.com/products/search?q=${encodeURIComponent(key)}&limit=8`),
                    res = await result.json()
                setData(res)
            } catch {
                alert("Searched Product is not in the list")
            }

        }
    }

    async function deleteItem(id) {
        setProducts((prev) =>
            prev.filter((product) => product.id !== id)
        );
    }
    return (
        <div>
            <Header />
            <div className="col-sm-6 offset-sm-3">
                <h1>Search Product</h1>
                <br />
                <input type="text" onChange={(e) => search(e.target.value)} className="form-control" placeholder="Search Your Product" />
                <br />

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
                            data?.products && data.products.map((item, key) => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.title}</td>
                                    <td><img className="itemImg" src={item.images?.[0]} alt="item.title"></img></td>
                                    <td>{item.description}</td>
                                    <td>{item.price}</td>
                                    <td><Trash className="deleteBtn" onClick={() => { deleteItem(item.id) }} /></td>
                                </tr>
                            ))
                        }
                    </tbody>
                </Table>

            </div>

        </div>
    )
}
export default SearchProduct