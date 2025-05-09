import { Route, Routes } from "react-router-dom";
import Navbar from "./components/navbar.jsx"
import RegisterPage from "./pages/register.jsx"
import { BrowserRouter } from 'react-router-dom';

const App = () => {
  return (
    <BrowserRouter>
    <Navbar/>
    <Routes>
      <Route path="/register" element={<RegisterPage/>}/>
    </Routes>
    </BrowserRouter>
    
    
  )
}

export default App