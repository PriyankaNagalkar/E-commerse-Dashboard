import { useEffect, useState, useRef } from "react"
import Header from "./Header"
import { useNavigate, useParams } from "react-router-dom"
import { useproducts } from "../Context/ProductContext"
import { XCircleFill, CloudArrowUp, PlusCircle } from 'react-bootstrap-icons'
import { Spinner } from 'react-bootstrap'

const MAX_SIZE = 1024 * 1024      // 1 MB
const MAX_DESC = 200

function UpdateProduct() {
    const params = useParams()
    const { setProducts } = useproducts()
    const navigate = useNavigate()
    const fileInput = useRef(null)

    const [data, setData] = useState([])
    const [name, setName] = useState("")
    const [file, setFile] = useState("")
    const [price, setPrice] = useState("")
    const [description, setDescription] = useState("")
    const [loading, setLoading] = useState(false)
    const [preview, setPreview] = useState("")
    const [dragging, setDragging] = useState(false)
    const [errors, setErrors] = useState({})

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

    function chooseFile(selected) {
        if (!selected) return
        if (!selected.type.startsWith("image/")) {
            setErrors((prev) => ({ ...prev, file: "Please choose an image file" }))
            return
        }
        if (selected.size > MAX_SIZE) {
            setErrors((prev) => ({ ...prev, file: "Image must be under 1 MB" }))
            return
        }
        setFile(selected)
        // clearError("file")
    }

    function removeFile() {
        setFile(null)
        if (fileInput.current) fileInput.current.value = ""
    }

    function validateForm() {
        const newErrors = {}
        if (!name.trim()) newErrors.name = "Product name is required"
        else if (name.trim().length < 3) newErrors.name = "Name must be at least 3 characters"

        if (!price) newErrors.price = "Price is required"
        else if (isNaN(Number(price)) || Number(price) <= 0) newErrors.price = "Enter a valid price greater than 0"

        if (!file) newErrors.file = "Please upload a product image"

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0

    }
    async function editProduct(id, e) {
        e.preventDefault()
        if (!validateForm()) return

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
                images: file ? [URL.createObjectURL(file)] : data.images,
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
            <div className="col-sm-8 col-lg-5 offset-sm-2 offset-lg-3 login-card">
                <h1 className="login-title">UpdateProduct Page</h1>
                <p className="login-subtitle">Update the details to list your product</p>
                <form onSubmit={editProduct} noValidate className="text-start">
                    <div className="field">
                        <input type="text" defaultValue={data.title} className="form-control" placeholder="Product name" value={name} onChange={(e) => setName(e.target.value)} />
                        {errors.name && <div className="text-danger mt-1 error-msg">{errors.name}</div>}
                    </div>

                    <div className="field">
                        <input type="number" defaultValue={data.price} min="0" className="form-control" placeholder="Price ($)" value={price} onChange={(e) => setPrice(e.target.value)} />
                        {errors.price && <div className="text-danger mt-1 error-msg">{errors.price}</div>}
                    </div>

                    <div className="field">
                        <textarea className="form-control" defaultValue={data.description} rows={2} maxLength={MAX_DESC} value={description} placeholder="Description" onChange={(e) => setDescription(e.target.value)} />
                        <small className="text-muted d-block text-end">
                            {description && description.length}/{MAX_DESC}
                        </small>
                    </div>
                    <div className="field" style={{ "--i": 4 }}>
                        <div
                            className={`drop-zone ${dragging ? "dragging" : ""} ${errors.file ? "has-error" : ""}`}
                            role="button"
                            tabIndex={0}
                            onClick={() => fileInput.current.click()}
                            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileInput.current.click()}
                            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={(e) => {
                                e.preventDefault()
                                setDragging(false)
                                chooseFile(e.dataTransfer.files[0])
                            }}
                        >
                            {preview ? (
                                <div className="preview-wrap">
                                    <img src={preview} alt="Preview" className="preview-img" />
                                    <button
                                        type="button"
                                        className="remove-img"
                                        aria-label="Remove image"
                                        onClick={(e) => { e.stopPropagation(); removeFile() }}
                                    >
                                        <XCircleFill size={22} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <CloudArrowUp size={36} />
                                    <p className="mb-0">Drag and drop an image or <span>browse</span></p>
                                    <small>PNG or JPG, up to 1 MB</small>
                                </>
                            )}
                        </div>
                        <input ref={fileInput} type="file" hidden className="form-control" accept="image/*" placeholder="File" onChange={(e) => {
                            const selected = e.target.files[0]
                            e.target.value = ""            // lets the same file be chosen again
                            chooseFile(selected)           // same validation as drag and drop
                        }} />
                        {errors.file && <div className="text-danger mt-1 error-msg">{errors.file}</div>}
                    </div>

                    <button type="submit" className="btn login-btn mt-2" disabled={loading}>
                        {loading ? (<>
                            <Spinner as="span" animation="border" size="sm" className="me-2" />
                            Updating product...
                        </>) :
                            (<>
                                <PlusCircle size={20} className="me-2" />
                                Update Product
                            </>
                            )}
                    </button>
                </form>
            </div>
        </div>
    )
}
export default UpdateProduct