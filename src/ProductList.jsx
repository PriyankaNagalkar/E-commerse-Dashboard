import { useEffect, useState } from "react";
import Header from "./Header";
import { Table } from "react-bootstrap";

function ProductList() {

    const [data, setData] = useState([])

    useEffect(() => {
        const fetchProduct = async () => {
            let result = await fetch("https://dummyjson.com/products")
            result = await result.json()
            setData(result.products)
        }
        fetchProduct()
    }, [])

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
                            data.map((item) => (
                                <tr>
                                    <td>{item.id}</td>
                                    <td>{item.title}</td>
                                    <td><img className="itemImg" src={item.images[0]}></img></td>
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