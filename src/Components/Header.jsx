import { Navbar, Nav, NavDropdown, Badge, Container } from "react-bootstrap"
import { Link, NavLink, useNavigate } from "react-router-dom"
import {
    Heart, Cart3, PersonCircle, BoxArrowRight,
    Stars, PlusCircle, Pencil, BoxSeam
} from "react-bootstrap-icons"
import { useproducts } from "../Context/ProductContext"

function IconLink({ to, label, count, children }) {
    return (
        <Link to={to} className="icon-link" aria-label={label} title={label}>
            {children}
            {count > 0 && (
                <Badge pill bg="danger" className="wishlist-count">
                    {count > 99 ? "99+" : count}
                </Badge>
            )}
        </Link>
    )
}

function Header() {
    const navigate = useNavigate()
    const { wishlist, cartCount } = useproducts()

    const user = JSON.parse(localStorage.getItem("user-info"))
    const displayName = user ? user.firstName || user.fullName || user.email : ""
    const initial = displayName.charAt(0).toUpperCase()

    function logout() {
        localStorage.removeItem("user-info")   // not clear(): that would also wipe cart/wishlist data
        navigate("/home")
    }

    return (
        <Navbar expand="lg" sticky="top" className="store-nav">
            <Container fluid className="px-3 px-lg-4">
                <Navbar.Brand as={Link} to={user ? "/" : "/home"} className="brand">
                    <span className="brand-mark"><Stars /></span>
                    <span>GlowStore</span>
                </Navbar.Brand>

                {/* right side: always visible, even on mobile */}
                <div className="nav-actions order-lg-3">
                    {user ? (
                        <>
                            <IconLink to="/wishlist" label="Wishlist" count={wishlist.length}>
                                <Heart />
                            </IconLink>
                            <IconLink to="/cart" label="Cart" count={cartCount}>
                                <Cart3 />
                            </IconLink>

                            <NavDropdown
                                align="end"
                                className="user-menu"
                                title={
                                    <span className="user-chip">
                                        <span className="avatar">{initial}</span>
                                        <span className="user-name d-none d-md-inline">{displayName}</span>
                                    </span>
                                }
                            >
                                <NavDropdown.Header>Signed in as<br /><strong>{displayName}</strong></NavDropdown.Header>
                                <NavDropdown.Divider />
                                <NavDropdown.Item as={Link} to="/profile">
                                    <PersonCircle className="me-2" />Profile
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/orders">
                                    <BoxSeam className="me-2" />My Orders
                                </NavDropdown.Item>
                                <NavDropdown.Item onClick={logout}>
                                    <BoxArrowRight className="me-2" />Logout
                                </NavDropdown.Item>
                            </NavDropdown>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn-ghost">Login</Link>
                            <Link to="/register" className="btn-solid">Register</Link>
                        </>
                    )}
                    <Navbar.Toggle aria-controls="main-nav" className="ms-1" />
                </div>

                <Navbar.Collapse id="main-nav">
                    <Nav className="mx-auto">
                        {user ? (
                            <>
                                <Nav.Link as={NavLink} to="/" end>Shop</Nav.Link>
                                <Nav.Link as={NavLink} to="/search">Search</Nav.Link>
                                <NavDropdown title="Manage" id="manage-dropdown">
                                    <NavDropdown.Item as={Link} to="/add">
                                        <PlusCircle className="me-2" />Add Product
                                    </NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/update">
                                        <Pencil className="me-2" />Update Product
                                    </NavDropdown.Item>
                                </NavDropdown>
                            </>
                        ) : (
                            <Nav.Link as={NavLink} to="/home">Home</Nav.Link>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}

export default Header