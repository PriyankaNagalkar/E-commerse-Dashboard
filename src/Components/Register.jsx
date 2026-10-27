import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom";
import Header from "./Header"
import { Spinner } from "react-bootstrap";
import { Eye, EyeSlash, PersonPlus } from "react-bootstrap-icons"

function getStrength(p) {
    let score = 0
    if (p.length >= 8) score++
    if (/[A-Z]/.test(p)) score++
    if (/\d/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    return score                                    // 0 to 4
}

const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"]
const strengthColors = ["", "#dc3545", "#c15d0c", "#b2890c", "#08502e"]

function Register() {
    const [firstName, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setconfirmPassword] = useState("");
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState({})
    const [apiError, setApiError] = useState("")
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const navigate = useNavigate();


    useEffect(() => {
        if (localStorage.getItem('user-info')) {
            navigate('/add')
        }
    }, [])

    function validateForm() {
        let newErrors = {}, validation = true;
        if (!firstName.trim()) {
            newErrors.firstName = "FirstName is required"
            validation = false;
        }
        if (firstName.trim().length < 3) {
            newErrors.firstName = "Name must be at least 3 characters"
            validation = false;
        }
        if (!password.trim()) {
            newErrors.password = "Password is required"
            validation = false;
        }
        if (!email.trim()) {
            newErrors.email = "Email is required"
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
        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = "You need to confirm your password"
            validation = false;
        }
        if (password.length !== confirmPassword.length && password !== confirmPassword) {
            newErrors.confirmPassword = "Your Password should match"
            validation = false;
        }
        setErrors(newErrors)
        return validation;
    }

    async function handleSubmit(e) {
        let items = { firstName, password, email }
        e.preventDefault()
        if (!validateForm()) return

        setLoading(true)
        try {
            let result = await fetch('https://dummyjson.com/users/add', {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify(items)
            })
            result = await result.json()
            let userInfo = {
                id: result.id,
                firstName: result.firstName,
                email: result.email,
            }
            localStorage.setItem('user-info', JSON.stringify(userInfo))
            // navigate("/add")
            navigate("/login")

        } catch (err) {
            setApiError("Network error. Please try again.")

        } finally {
            setLoading(false)
        }


    }
    const strength = getStrength(password)
    function getPassword(e) {
        setPassword(e.target.value)
        if (strength === 3) {
            document.querySelector(".confirm-group").style.display = "flex"
        }
    }
    return (
        <>
            <Header />
            <div className="col-sm-6 offset-sm-3 login-card">
                <h1 className="login-title">Create Account</h1>
                <p className="login-subtitle">Join My Store and start shopping</p>

                <form onSubmit={handleSubmit}>
                    <input type="text" className="form-control" value={firstName} onChange={(e) => setName(e.target.value)} placeholder="Enter Your Name" />
                    {errors.firstName && <div className="text-danger text-start mt-1 error-msg">{errors.firstName}</div>}
                    <br />
                    <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter Your Email" />
                    {errors.email && <div className="text-danger text-start mt-1 error-msg">{errors.email}</div>}
                    <br />
                    <div className="input-group">
                        <input type={showPassword ? "text" : "password"} className="form-control" value={password} onChange={(e) => getPassword(e)} placeholder="Enter Your Password" />
                        <button type="button" className="btn btn-outline-secondary eyeBtn" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? "Hide password" : "Show password"}>
                            {showPassword ? <EyeSlash /> : <Eye />}
                        </button>
                    </div>
                    {errors.password && <div className="text-danger text-start mt-1 error-msg">{errors.password}</div>}
                    <br />
                    <div className="confirm-group">
                        <input type={showPassword ? "text" : "password"} className="form-control" value={confirmPassword} onChange={(e) => setconfirmPassword(e.target.value)} placeholder="Confirm Your Password" />
                        <button type="button" className="btn btn-outline-secondary eyeBtn" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? "Hide password" : "Show password"}>
                            {showPassword ? <EyeSlash /> : <Eye />}
                        </button>
                        <br />
                    </div>
                    {errors.confirmPassword && <div className="text-danger text-start mt-1 error-msg">{errors.confirmPassword}</div>}

                    {password && (
                        <>
                            <div className="strength">
                                <div
                                    className="strength-bar"
                                    style={{ width: `${strength * 25}%`, background: strengthColors[strength] }}
                                />
                            </div>
                            <small className="d-block text-start mt-1 error-msg" style={{ color: strengthColors[strength] }}>
                                {strengthLabels[strength]}
                            </small>
                        </>
                    )}
                    <br />

                    <button className="btn login-btn" disabled={loading}>
                        <PersonPlus size={20} className="me-2" />
                        {loading ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" className="me-2" />
                                Creating account...
                            </>
                        ) : (


                            "Sign Up"


                        )}</button>
                </form>

                <p className="mt-3 mb-0">
                    Already have an account? <Link to="/login">Login</Link>
                </p>

            </div>
        </>

    )
}
export default Register