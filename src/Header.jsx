import { Navbar, Nav } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { NavDropdown } from 'react-bootstrap'
import { useNavigate, useLocation } from 'react-router-dom'

function Header(props) {
    const userName = JSON.parse(localStorage.getItem('user-info'))
    const navigate = useNavigate()
    const location = useLocation()

    function logout() {
        localStorage.clear()
         navigate('/register')
    }

    function getUserName() {
        if (userName) {
            return userName.fullName || userName.email
        }
    }
    return (
        <div>
            <Navbar bg="dark" data-bs-theme="dark">
                <Navbar.Brand href="#home">Navbar</Navbar.Brand>
                <Nav className="me-auto nav_bar_wrapper">
                    {
                        localStorage.getItem('user-info') ?
                            <>
                             <Link to="/">Product List</Link>
                                <Link to="/add">Add Product</Link>
                                <Link to="/update">Update Product</Link>
                            </> :
                            <>
                                <Link to="/login">Login</Link>
                                <Link to="/register">Register</Link></>
                    }


                </Nav>
                {
                    localStorage.getItem('user-info') ?
                        <nav style={{ color: "white" }}>
                            <NavDropdown title={(getUserName())}>
                                <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>
                                <NavDropdown.Item>Profile</NavDropdown.Item>
                            </NavDropdown>
                        </nav> : null
                }

            </Navbar>
        </div>
    )
} ``
export default Header
































