import { Route, Routes } from "react-router-dom";
import Navbar from "./components/navbar.jsx"
import RegisterPage from "./pages/register.jsx"
import { BrowserRouter } from 'react-router-dom';
import LoginPage from "./pages/login.jsx";

const App = () => {
  return (
    <BrowserRouter>
    <Navbar/>
    <br></br>
    <Routes>
      <Route path="/register" element={<RegisterPage/>}/>
      <Route path="/login" element={<LoginPage/>}/>

    </Routes>
    </BrowserRouter>
    
    
  )
}

export default App