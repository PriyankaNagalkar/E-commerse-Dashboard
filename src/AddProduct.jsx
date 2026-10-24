import { useState } from "react"
import Header from "./Header"
import { useNavigate } from "react-router-dom"
import { useproducts } from "./ProductContext"

function AddProduct() {
    const navigate = useNavigate()
    const { setProducts } = useproducts()

    const [name, setName] = useState("")
    const [file, setFile] = useState("")
    const [price, setPrice] = useState("")
    const [description, setDescription] = useState("")
    const [loading, setLoading] = useState(false)

    async function addProduct() {
        if (!name || !file || !price) {
            alert("Please fill name, file and price")
            return
        }

        // console.log({name,file,price,description})
        const formData = new FormData()
        formData.append("file", file)
        formData.append("name", name)
        formData.append("price", price)
        formData.append("description", description)
        // formData.append("id", Math.random().toString(36).substring(2, 15))
        // formData.append("id", crypto.randomUUID())
        formData.append("id", Math.floor(Math.random() * 1000000) + 1)

        setLoading(true)

        try {
            let result = await fetch("https://httpbin.org/post", {
                method: "POST",
                body: formData,                 // no Content-Type header
            })
            const data = await result.json()

            const newProduct = {
                id: data.form.id,
                title: data.form.name,
                price: Number(data.form.price),
                description: data.form.description,
                images: [data.files.file]
            }

            setProducts((prev) => [newProduct, ...prev])
            navigate("/")
        } catch (err) {
            alert("Failed to add product")
        } finally {
            setLoading(false)
        }


    }
    return (
        <div>
            <Header />

            <div className="col-sm-6 offset-sm-3">
                <br />
                <input type="text" className="form-control" placeholder="Name" onChange={(e) => setName(e.target.value)} /><br />
                <input type="text" className="form-control" placeholder="Price" onChange={(e) => setPrice(e.target.value)} /><br />
                <input type="text" className="form-control" placeholder="Description" onChange={(e) => setDescription(e.target.value)} /><br />
                <input type="file" className="form-control" accept="image/*" placeholder="File" onChange={(e) => setFile(e.target.files[0])} /><br />
                <button onClick={addProduct} disabled={loading}>
                    {loading ? "Adding..." : "Add Product"}
                </button>
            </div>
        </div>

    )
}
export default AddProduct