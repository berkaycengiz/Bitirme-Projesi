import { Route, Routes, BrowserRouter } from 'react-router-dom'
import Menu from './pages/Menu'
import Login from './pages/Login'
import Chef from './pages/Chef'
import Waiter from './pages/Waiter'
import Admin from './pages/Admin'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chef" element={<Chef />} />
        <Route path="/waiter" element={<Waiter />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
