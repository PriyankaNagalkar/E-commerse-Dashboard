import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import Header from "./Header"


function Register() {
    const [firstName, setName] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");

    const navigate = useNavigate();


    useEffect(() => {
     if (localStorage.getItem('user-info')){
        navigate('/add')
     }
    }, [])
    
    async function signUp() {
        let items = { firstName, password, email }

        let result = await fetch('https://dummyjson.com/users/add', {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify(items)
        }).then((res) => res.json())
            .then((response) => {
                localStorage.setItem('user-info', JSON.stringify(response))
                navigate("/add")
            })

    }

    return (
        <>
            <Header />
            <div className="col-sm-6 offset-sm-3">
                <h1>User Sign Up</h1>
                <input type="text" className="form-control" value={firstName} onChange={(e) => setName(e.target.value)} placeholder="Enter Your Name" />
                <br />
                <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter Your Password" />
                <br />
                <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter Your Email" />
                <br />
                <button className="btn btn-primary" onClick={signUp}>Sign Up</button>
            </div>
        </>

    )
}
export default Register