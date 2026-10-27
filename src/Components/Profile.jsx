import { useState } from "react"
import { Alert } from "react-bootstrap"
import Header from "./Header"
import { Eye, EyeSlash } from "react-bootstrap-icons"

function Profile() {
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user-info")))
    const [name, setName] = useState(user?.firstName || "")
    const [email, setEmail] = useState(user?.email || "")
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [saved, setSaved] = useState(false)
    const [showOldPassword, setShowOldPassword] = useState(false)
     const [showNewPassword, setShowNewPassword] = useState(false)
      const [showConfirmPassword, setShowConfirmPassword] = useState(false)


    function validateForm() {
        let newErrors = {}, validation = true;
        if (!name.trim()) {
            newErrors.name = "Name is required"
            validation = false;
        }
        if (name.trim().length < 3) {
            newErrors.name = "Name must be at least 3 characters"
            validation = false;
        }
        if (!oldPassword.trim()) {
            newErrors.oldPassword = "Password is required"
            validation = false;
        }
        if (!newPassword.trim()) {
            newErrors.newPassword = "Password is required"
            validation = false;
        }
        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = "Password is required"
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
        if (newPassword.length < 8) {
            newErrors.newPassword = "Password must be at least 8 characters"
            validation = false;
        }
        if (!/[A-Z]/.test(newPassword)) {
            newErrors.newPassword = "Add at least one uppercase letter"
            validation = false;
        }
        if (!/\d/.test(newPassword)) {
            newErrors.newPassword = "Add at least one number"
            validation = false;
        }
        if (!/[^A-Za-z0-9]/.test(newPassword)) {
            newErrors.newPassword = "Add at least one special character (!@#$%)"
            validation = false;
        }
        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = "You need to confirm your password"
            validation = false;
        }
        if (newPassword.length !== confirmPassword.length && newPassword !== confirmPassword) {
            newErrors.confirmPassword = "Your Password should match"
            validation = false;
        }
        setError(newErrors)
        const updated = { ...user, firstName: name.trim(), email: email.trim() }
        localStorage.setItem("user-info", JSON.stringify(updated))
        setUser(updated)
        return validation;

    }
    function handleSave(e) {
        e.preventDefault()
        setSaved(false)
        if (!validateForm()) return
        setSaved(true)
    }

    return (
        <>
            <Header />
            <div className="col-sm-6 col-lg-4 offset-sm-3 offset-lg-4 login-card">
                {/* <div className="avatar">
                    {(user?.firstName || "?").charAt(0).toUpperCase()}
                </div> */}
                <h2 className="login-title">{user?.firstName || "My Account"}</h2>
                <p className="login-subtitle">Manage your profile</p>

                {saved && (
                    <Alert variant="success" dismissible onClose={() => setSaved(false)}>
                        Profile updated successfully
                    </Alert>
                )}

                <form onSubmit={handleSave} noValidate>
                    <label className="d-block text-start mb-1" htmlFor="profileName">Name</label>
                    <input id="profileName"
                        type="text"
                        className={`form-control ${error ? "border-danger" : ""}`}
                        value={name}
                        placeholder="Change Your Name"
                        onChange={(e) => { setName(e.target.value); setError(""); setSaved(false) }} />
                    {error.name && <div className="text-danger text-start mt-1 error-msg">{error.name}</div>}
                    <label className="d-block text-start mb-1" htmlFor="profileEmail">Email</label>
                    <input id="profileEmail"
                        type="text"
                        className={`form-control ${error ? "border-danger" : ""}`}
                        value={email}
                        placeholder="Change Your Email"
                        onChange={(e) => { setEmail(e.target.value); setError(""); setSaved(false) }} />
                    {error.email && <div className="text-danger text-start mt-1 error-msg">{error.email}</div>}


                    <label className="d-block text-start mb-1" htmlFor="profileOldPass">Old Password</label>
                    <div className="input-group">
                        <input id="profileOldPassword"
                            type={showOldPassword ? "text" : "password"}
                            className={`form-control ${error ? "border-danger" : ""}`}
                            value={oldPassword}
                            placeholder="Enter Your Old Password"
                            onChange={(e) => { setOldPassword(e.target.value); setError(""); setSaved(false) }} />
                        <button type="button" className="btn btn-outline-secondary eyeBtn" onClick={() => setShowOldPassword((s) => !s)} aria-label={showOldPassword ? "Hide password" : "Show password"}>
                            {showOldPassword ? <EyeSlash /> : <Eye />}
                        </button>
                    </div>
                    {error.oldPassword && <div className="text-danger text-start mt-1 error-msg">{error.oldPassword}</div>}

                    <label className="d-block text-start mb-1" htmlFor="profileNewPass">New Password</label>
                   <div className="input-group">
                     <input id="profileNewPassword"
                        type={showNewPassword ? "text" : "password"}
                        className={`form-control ${error ? "border-danger" : ""}`}
                        value={newPassword}
                        placeholder="Enter Your New Password"
                        onChange={(e) => { setNewPassword(e.target.value); setError(""); setSaved(false) }} />
                         <button type="button" className="btn btn-outline-secondary eyeBtn" onClick={() => setShowNewPassword((s) => !s)} aria-label={showNewPassword ? "Hide password" : "Show password"}>
                            {showNewPassword ? <EyeSlash /> : <Eye />}
                        </button>
                   </div>
                    {error.newPassword && <div className="text-danger text-start mt-1 error-msg">{error.newPassword}</div>}


                    <label className="d-block text-start mb-1" htmlFor="profileConfirmPass">Confirm Password</label>
                   <div className="input-group">
                     <input id="profileConfirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        className={`form-control ${error ? "border-danger" : ""}`}
                        value={confirmPassword}
                        placeholder="Confirm Your New Password"
                        onChange={(e) => { setConfirmPassword(e.target.value); setError(""); setSaved(false) }} />
                         <button type="button" className="btn btn-outline-secondary eyeBtn" onClick={() => setShowConfirmPassword((s) => !s)} aria-label={showConfirmPassword ? "Hide password" : "Show password"}>
                            {showConfirmPassword ? <EyeSlash /> : <Eye />}
                        </button>
                   </div>
                    {error.confirmPassword && <div className="text-danger text-start mt-1 error-msg">{error.confirmPassword}</div>}




                    <button type="submit" className="btn login-btn mt-4">Save Changes</button>
                </form>
            </div>
        </>
    )
}

export default Profile