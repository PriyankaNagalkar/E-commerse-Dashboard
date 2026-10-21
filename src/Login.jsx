import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Header from "./Header"

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    async function login() {
        let items = { email, password }

        let result = await fetch("https://dummyjson.com/users/add", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify(items)
        })

        result = await result.json();
        localStorage.setItem('user-info', JSON.stringify(result))
        navigate("/add")
    }

    useEffect(() => {
        if (localStorage.getItem('user-info')) {
            navigate('/add')
        }
    }, [])


    return (
        <>
            <Header />
            <h1>Login Page</h1>
            <div className="col-sm-6 offset-sm-3">
                <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter Your Email" />
                <br />
                <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter Your Password" />
                <br />
                <button className="btn btn-primary" onClick={login}>Login</button>
            </div>
        </>
    )
}
export default Login