import { useState } from "react"
import Header from "./Header"

function AddProduct() {
    const [name, setName] = useState("")
    const [file, setFile] = useState("")
    const [price, setPrice] = useState("")
    const [description, setDescription] = useState("")

    async function addProduct() {
        // console.log({name,file,price,description})
        const formData = new FormData()
        formData.append("file", file)
        formData.append("name", name)
        formData.append("price", price)
        formData.append("description", description)
        formData.append("id", Math.random().toString(36).substring(2, 15))
        let result = await fetch("https://httpbin.org/post", {
            method: "POST",
            body: formData,                 // no Content-Type header
        })
        result = await result.json()
        console.log(result)
    }
    return (
        <div>
            <Header />

            <div className="col-sm-6 offset-sm-3">
                <br />
                <input type="text" className="form-control" placeholder="Name" onChange={(e) => setName(e.target.value)} /><br />
                <input type="file" className="form-control" placeholder="File" onChange={(e) => setFile(e.target.files[0])} /><br />
                <input type="text" className="form-control" placeholder="Price" onChange={(e) => setPrice(e.target.value)} /><br />
                <input type="text" className="form-control" placeholder="Description" onChange={(e) => setDescription(e.target.value)} /><br />
                <button onClick={addProduct}>Add Product</button>
            </div>
        </div>

    )
}
export default AddProduct