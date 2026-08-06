
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from "../pages/public/Auth/Login"
import Dashboard from '../pages/private/User/Dashboard';
import { Register } from '../pages/public/Auth/Register';

function App() {

  
  return (
    <>
      <BrowserRouter>
        <Routes>
            <Route path='/' element={<Login/>}/>
            <Route path="/register" element={<Register/>} />
            <Route path='/dashboard' element={<Dashboard/>}/>  
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
