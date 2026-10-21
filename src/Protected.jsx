import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Header from "./Header"

function Login(props) {
    let Cmp = props.Component;

    const navigate = useNavigate();
    useEffect(() => {
        if (!localStorage.getItem('user-info')) {
            navigate('/register')
        }

    }, [])
    return (
        <div>
          <Cmp />
        </div>
    )
}
export default Login