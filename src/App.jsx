// import Header from './Header'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './Components/Home'
import Login from './Components/Login'
import Register from './Components/Register'
import UpdateProduct from './Components/UpdateProduct'
import AddProduct from './Components/AddProduct'
import Protected from './Router/Protected'
import ProductList from './Components/ProductList'
import { ProductsProvider } from './Context/ProductContext'
import SearchProduct from './Components/SearchProduct'
import Profile from './Components/Profile'
import Whishlist from './Components/Whishlist'
import Cart from './Components/Cart'
import Orders from './Components/Orders'


import './App.css'
import { Button } from 'react-bootstrap'

function App() {

  return (
    <div className='app'>
      <ProductsProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/home' element={<Home />}></Route>
            <Route path='/login' element={<Login />}></Route>
            <Route path='/register' element={<Register />}></Route>
            <Route path='/update' element={<Protected Component={UpdateProduct} />}></Route>
            <Route path='/add' element={<Protected Component={AddProduct} />}></Route>
            <Route path='/search' element={<Protected Component={SearchProduct} />}></Route>
            <Route path='/profile' element={<Protected Component={Profile} />} />
            <Route path='/wishlist' element={<Protected Component={Whishlist} />} />
            <Route path='/cart' element={<Protected Component={Cart} />} />
            <Route path="/orders" element={<Protected Component={Orders}></Protected>} />
            <Route path='/' element={<Protected Component={ProductList} />}></Route>
          </Routes>
        </BrowserRouter>
      </ProductsProvider>

    </div>
  )
}

export default App
