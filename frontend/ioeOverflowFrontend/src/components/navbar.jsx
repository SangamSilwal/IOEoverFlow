import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Assuming you're using React Router
import "./componentsStyles/navbar.css"

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Check if user is logged in (you would replace this with your actual auth check)
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
  }, []);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    // You might want to redirect here
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo/Brand */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🚀</span>
          <span className="logo-text">YourBrand</span>
        </Link>

        {/* Mobile menu button */}
        <div 
          className={`hamburger ${isMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Navigation Links */}
        <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/about" className="nav-link" onClick={() => setIsMenuOpen(false)}>About</Link>
            </li>
            <li className="nav-item">
              <Link to="/features" className="nav-link" onClick={() => setIsMenuOpen(false)}>Features</Link>
            </li>
            <li className="nav-item">
              <Link to="/contact" className="nav-link" onClick={() => setIsMenuOpen(false)}>Contact</Link>
            </li>
            
            {/* Conditional rendering based on auth status */}
            {isLoggedIn ? (
              <>
                <li className="nav-item">
                  <Link to="/dashboard" className="nav-link" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                </li>
                <li className="nav-item">
                  <button className="nav-button logout" onClick={handleLogout}>Logout</button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link to="/login" className="nav-button login" onClick={() => setIsMenuOpen(false)}>Login</Link>
                </li>
                <li className="nav-item">
                  <Link to="/register" className="nav-button register" onClick={() => setIsMenuOpen(false)}>Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;