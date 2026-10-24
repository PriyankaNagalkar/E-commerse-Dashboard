import { useEffect, useState } from "react"
import Header from "./Header"
import { useNavigate, useParams } from "react-router-dom"
import { useproducts } from "./ProductContext"


function UpdateProduct() {
    const params = useParams()
    const { setProducts } = useproducts()
    const navigate = useNavigate()

    const [data, setData] = useState([])
    const [name, setName] = useState("")
    const [file, setFile] = useState("")
    const [price, setPrice] = useState("")
    const [description, setDescription] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const updateProduct = async () => {
            try {
                let result = await fetch(`https://dummyjson.com/products/${params.id}`)
                const response = await result.json()
                setData(response)
                setName(response.title)
                setPrice(response.price)
                setDescription(response.description)
                // setFile(response.images?.[0])
            } catch (error) {
                alert("Failed to load product");
            }
        }
        updateProduct()
    }, [params.id])


    async function editProduct(id) {
        if (!name || !file || !price) {
            alert("Please fill name, file and price")
            return
        }

        // console.log({name,file,price,description})
        const formData = new FormData()
        formData.append("file", file.name)
        formData.append("name", name)
        formData.append("price", price)
        formData.append("description", description)
        formData.append("id", id)

        setLoading(true)

        try {
            let result = await fetch(`https://dummyjson.com/products/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),                 // no Content-Type header
            })
            const data = await result.json()

            const updatedProduct = {
                id: id,
                title: name,
                price: Number(price),
                description: description,
                images: file ? [URL.createObjectURL(file)]: data.images,
            }

            setProducts((prev) =>
                prev.map((product) =>
                    String(product.id) === String(id)
                        ? updatedProduct
                        : product
                )
            );
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
            <h1>UpdateProduct Page</h1>

            <div className="col-sm-6 offset-sm-3">
                <br />
                <input type="text" defaultValue={data.title} className="form-control" placeholder="Name" onChange={(e) => setName(e.target.value)} /><br />
                <input type="text" defaultValue={data.price} className="form-control" placeholder="Price" onChange={(e) => setPrice(e.target.value)} /><br />
                <input type="text" defaultValue={data.description} className="form-control" placeholder="Description" onChange={(e) => setDescription(e.target.value)} /><br />
                <input type="file" className="form-control" accept="image/*" placeholder="File" onChange={(e) => setFile(e.target.files[0])} />
                <br />
                {/* <img style={{width:100}} src={"http://localhost:5173/"+data?.images?.[0]} /> */}
                <button onClick={() => editProduct(data.id)} disabled={loading}>
                    {loading ? "Adding..." : "Update Product"}
                </button>
            </div>
        </div>
    )
}
export default UpdateProduct