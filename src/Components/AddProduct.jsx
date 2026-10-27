import { useEffect, useRef, useState } from "react"
import Header from "./Header"
import { useNavigate } from "react-router-dom"
import { useproducts } from "../Context/ProductContext"
import { XCircleFill, CloudArrowUp, PlusCircle } from 'react-bootstrap-icons'
import { Spinner } from 'react-bootstrap'

const MAX_SIZE = 1024 * 1024      // 1 MB
const MAX_DESC = 200

function AddProduct() {
    const navigate = useNavigate()
    const { setProducts } = useproducts()
    const fileInput = useRef(null)

    const [name, setName] = useState("")
    const [file, setFile] = useState("")
    const [price, setPrice] = useState("")
    const [description, setDescription] = useState("")
    const [loading, setLoading] = useState(false)
    const [preview, setPreview] = useState("")
    const [dragging, setDragging] = useState(false)
    const [errors, setErrors] = useState({})

    // preview URL for the chosen image, cleaned up when it changes
    useEffect(() => {
        if (!(file instanceof Blob)) {
            setPreview("")
            return
        }
        const url = URL.createObjectURL(file)
        setPreview(url)
        return () => URL.revokeObjectURL(url)
    }, [file])


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
    async function handleSubmit(e) {
        e.preventDefault()
        if (!validateForm()) return

        const formData = new FormData()
        formData.append("file", file)
        formData.append("name", name)
        formData.append("price", price)
        formData.append("description", description)
        // formData.append("id", Math.random().toString(36).substring(2, 15))
        formData.append("id", Date.now())
        // formData.append("id", Math.floor(Math.random() * 1000000) + 1)


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
                images: [data.files.file],
                isLocal: true,
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

            <div className="col-sm-8 col-lg-5 offset-sm-2 offset-lg-3 login-card">
                <h1 className="login-title">Add New Product</h1>
                <p className="login-subtitle">Fill in the details to list your product</p>

                <form onSubmit={handleSubmit} noValidate className="text-start">
                    <div className="field">
                        <input type="text" className="form-control" placeholder="Product name" value={name} onChange={(e) => setName(e.target.value)} />
                        {errors.name && <div className="text-danger mt-1 error-msg">{errors.name}</div>}
                    </div>

                    <div className="field">
                        <input type="number" min="0" className="form-control" placeholder="Price ($)" value={price} onChange={(e) => setPrice(e.target.value)} />
                        {errors.price && <div className="text-danger mt-1 error-msg">{errors.price}</div>}
                    </div>

                    <div className="field">
                        <textarea className="form-control" rows={2} maxLength={MAX_DESC} value={description} placeholder="Description" onChange={(e) => setDescription(e.target.value)} />
                        <small className="text-muted d-block text-end">
                            {description.length}/{MAX_DESC}
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
                            Adding product...
                        </>) :
                            (<>
                                <PlusCircle size={20} className="me-2" />
                                Add Product
                            </>
                            )}
                    </button>
                </form>
            </div>
        </div>

    )
}
export default AddProduct