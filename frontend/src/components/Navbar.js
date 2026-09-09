import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiLogOut, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <span className="navbar-brand-icon">
            <img src={`${process.env.PUBLIC_URL}/hero.png`} alt="Ai-IPP" />
          </span>
          <span className="navbar-brand-text">
            Ai-IPP
            <span className="navbar-brand-sub">Insurance Purchase Prediction</span>
          </span>
        </Link>

        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        <div className={`navbar-menu ${menuOpen ? 'navbar-menu-open' : ''}`}>
          <div className="navbar-links">
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? 'navbar-link active' : 'navbar-link')}
              onClick={closeMenu}
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) => (isActive ? 'navbar-link active' : 'navbar-link')}
              onClick={closeMenu}
            >
              About
            </NavLink>
            {isAuthenticated && (
              <NavLink
                to="/predict"
                className={({ isActive }) => (isActive ? 'navbar-link active' : 'navbar-link')}
                onClick={closeMenu}
              >
                Predict
              </NavLink>
            )}
          </div>

          <div className="navbar-auth">
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/history"
                  className={({ isActive }) =>
                    isActive ? 'navbar-link navbar-history active' : 'navbar-link navbar-history'
                  }
                  onClick={closeMenu}
                >
                  History
                </NavLink>
                <Link to="/profile" className="navbar-user" onClick={closeMenu}>
                  <FiUser />
                  <span className="navbar-user-name">
                    {user ? user.username || user.first_name || 'Account' : 'Account'}
                  </span>
                </Link>
                <button
                  className="btn btn-sm btn-danger navbar-logout"
                  onClick={handleLogout}
                >
                  <FiLogOut />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-sm btn-outline navbar-login" onClick={closeMenu}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-sm btn-primary navbar-register" onClick={closeMenu}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;