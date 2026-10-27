import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Header from "./Header"
import {Spinner } from "react-bootstrap"
import { BoxArrowInRight } from "react-bootstrap-icons"
import { Eye, EyeSlash } from "react-bootstrap-icons"

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [errors, setErrors] = useState({})
    const [apiError, setApiError] = useState("")
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    function validateForm() {
        let newErrors = {}, validation = true;
        if (!email.trim()) {
            newErrors.email = "Email is required"
            validation = false;
        }
        if (!password.trim()) {
            newErrors.password = "Password is required"
            validation = false;
        }
        if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
            newErrors.email = "Enter a valid email address"
            validation = false;
        }
        if (password.length < 8) {
            newErrors.password = "Password must be at least 8 characters"
            validation = false;
        }
        if (!/[A-Z]/.test(password)) {
            newErrors.password = "Add at least one uppercase letter"
            validation = false;
        }
        if (!/\d/.test(password)) {
            newErrors.password = "Add at least one number"
            validation = false;
        }
        if (!/[^A-Za-z0-9]/.test(password)) {
            newErrors.password = "Add at least one special character (!@#$%)"
            validation = false;
        }
        setErrors(newErrors)
        return validation;
    }
    async function handleSubmit(e) {

        let items = { email, password }
        e.preventDefault()
        setApiError("")
        if (!validateForm()) return
        setLoading(true)
        try {
            let result = await fetch("https://dummyjson.com/users/add", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify(items)
            })

            result = await result.json();
            localStorage.setItem('user-info', JSON.stringify(result))
            navigate("/add")
        } catch (err) {
            setApiError("Network error. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (localStorage.getItem('user-info')) {
            navigate('/add')
        }
    }, [])


    return (
        <>
            <Header /><br />
            <div className="col-sm-6 offset-sm-3 login-card">
                <h1 className="login-title">Welcome Back</h1>
                <p className="login-subtitle">Login to continue shopping</p><br />
                <form onSubmit={handleSubmit}>
                    <input type="email" className="form-control" value={email} onChange={(e) => {
                        setEmail(e.target.value)
                        setErrors((prev) => ({ ...prev, email: "" }))
                        setApiError("")
                    }} placeholder="Enter Your Email" />
                    {errors.email && (
                        <div className="text-danger text-start mt-1 error-msg">{errors.email}</div>
                    )}
                    <br />


                    <div className="input-group">
                        <input type={showPassword ? "text" : "password"} className="form-control" value={password} onChange={(e) => {
                            setPassword(e.target.value)
                            setErrors((prev) => ({ ...prev, password: "" }))
                            setApiError("")
                        }} placeholder="Enter Your Password" />
                        <button
                            type="button"
                            className="btn btn-outline-secondary eyeBtn"
                            onClick={() => setShowPassword((i) => !i)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeSlash /> : <Eye />}
                        </button>
                    </div>
                    {errors.password && (
                        <div className="text-danger text-start mt-1 error-msg">{errors.password}</div>
                    )}
                    <br />


                    {/* <button className="btn login-btn" onClick={login}>Login</button> */}
                    <button className="btn login-btn" disabled={loading}>
                        <BoxArrowInRight size={20} className="me-2" />
                        {loading ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" className="me-2" />
                                Logging in...
                            </>
                        ) : (
                            "Login"
                        )}
                    </button>
                </form>
                <p className="mt-3 mb-0">
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
            </div>
        </>
    )
}
export default Login