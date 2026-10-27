import { Navbar, Nav, NavDropdown } from 'react-bootstrap'
import { useNavigate, useLocation, Link, NavLink } from 'react-router-dom'
import { HouseHeartFill, PersonCircle, BoxArrowRight } from 'react-bootstrap-icons'


function Header(props) {
    const userName = JSON.parse(localStorage.getItem('user-info'))
    const navigate = useNavigate()
    const location = useLocation()

    const user = JSON.parse(localStorage.getItem('user-info'))

    const displayName = user ? user.firstName || user.fullName || user.email : ''
    const initial = displayName.charAt(0).toUpperCase()

    function logout() {
        localStorage.clear()
        navigate('/home')
    }

    function getUserName() {
        if (userName) {
            return userName.fullName || userName.email
        }
    }
    return (
        <div>
            <Navbar>
                {/* <Navbar.Brand href="#home">Navbar</Navbar.Brand> */}

                <Nav className="me-auto nav_bar_wrapper">
                    {
                        localStorage.getItem('user-info') ?
                            <>
                                <NavLink to="/">Product List</NavLink>
                                <NavLink to="/add">Add Product</NavLink>
                                <NavLink to="/update">Update Product</NavLink>
                                <NavLink to="/search">Search Product</NavLink>
                            </> :
                            <>
                                <NavLink to="/home"><HouseHeartFill className='homeIcon' /></NavLink>
                                <NavLink to="/login" className='loginIcon'>Login</NavLink>
                                <NavLink to="/register" className='registerIcon'>Register</NavLink></>
                    }


                </Nav>
                {/* {
                    localStorage.getItem('user-info') ?
                        <nav style={{ color: "white" }}>
                            <NavDropdown title={(getUserName())}>
                                <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>
                                <NavDropdown.Item>Profile</NavDropdown.Item>
                            </NavDropdown>
                        </nav> : null
                } */}

                {user && (
                    <Nav className="me-3">
                        <NavDropdown
                            align="end"
                            className="user-menu"
                            title={
                                <span className="user-chip">
                                    <span className="avatar">{initial}</span>
                                    <span className="user-name">Hi, {displayName}</span>
                                </span>
                            }
                        >
                            <NavDropdown.Item as={Link} to="/profile">
                                <PersonCircle className="me-2" />Profile
                            </NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item as={Link} to="/profile">
                                <PersonCircle className="me-2" />Profile
                            </NavDropdown.Item>
                            <NavDropdown.Item onClick={logout}>
                                <BoxArrowRight className="me-2" />Logout
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                )}

            </Navbar>
        </div>
    )
} ``
export default Header
































