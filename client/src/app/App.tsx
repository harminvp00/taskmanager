
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from "../pages/public/Auth/Login"
import Dashboard from '../pages/private/User/Dashboard';

function App() {

  
  return (
    <>
      <BrowserRouter>
        <Routes>
            <Route path='/' element={<Login/>}/>
            <Route path='/dashboard' element={<Dashboard/>}/>  
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
