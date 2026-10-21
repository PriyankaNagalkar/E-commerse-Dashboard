// import Header from './Header'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './Login'
import Register from './Register'
import UpdateProduct from './UpdateProduct'
import AddProduct from './AddProduct'
import Protected from './Protected'
import ProductList from './ProductList'

import './App.css'
import { Button } from 'react-bootstrap'

function App() {

  return (
    <div className='app'>
      <BrowserRouter>
        {/* <Header /> */}
        <Routes>
          <Route path='/login' element={<Login />}></Route>
          <Route path='/register' element={<Register />}></Route>
          <Route path='/update' element={<Protected Component={UpdateProduct} />}></Route>
          <Route path='/add' element={<Protected Component={AddProduct} />}></Route>
           <Route path='/' element={<Protected Component={ProductList} />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
