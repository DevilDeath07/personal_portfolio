import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsOpen(false);
    alert('Logged out successfully');
    navigate('/login');
    window.location.reload(); // Refresh to update navbar
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="nav-logo" onClick={closeMenu}>Balamurugan</Link>

        <div className="menu-icon" onClick={toggleMenu}>
          <i className={isOpen ? 'bx bx-x' : 'bx bx-menu'}></i>
        </div>

        <div className={`nav-links ${isOpen ? 'active' : ''}`}>
          <Link to="/" className={isActive('/')} onClick={closeMenu}>Home</Link>
          <Link to="/about" className={isActive('/about')} onClick={closeMenu}>About Me</Link>
          <Link to="/skills" className={isActive('/skills')} onClick={closeMenu}>Skills</Link>
          <Link to="/certificates" className={isActive('/certificates')} onClick={closeMenu}>Certificates</Link>
          <Link to="/projects" className={isActive('/projects')} onClick={closeMenu}>Projects</Link>
          <Link to="/experience" className={isActive('/experience')} onClick={closeMenu}>Experience</Link>
          <Link to="/contact" className={isActive('/contact')} onClick={closeMenu}>Contact</Link>

          {isLoggedIn ? (
            <>
              <Link to="/profile-settings" className={isActive('/profile-settings')} onClick={closeMenu} style={{ color: 'var(--secondary-color)' }}>Settings</Link>
              <button onClick={handleLogout} className="btn" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem', marginLeft: '10px', backgroundColor: '#dc3545' }}>Logout</button>
            </>
          ) : (
            <Link to="/login" className="btn" onClick={closeMenu} style={{ fontSize: '0.8rem', padding: '0.4rem 1rem', marginLeft: '10px' }}>Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
