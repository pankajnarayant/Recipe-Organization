import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Utensils,
  Calendar,
  ShoppingCart,
  Heart,
  User,
  LogOut,
  Menu,
  X,
  PlusCircle,
  LayoutDashboard,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsMobileOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to={user ? '/dashboard' : '/'} className="nav-brand" onClick={() => setIsMobileOpen(false)}>
          <div className="brand-icon-box">
            <Utensils size={20} />
          </div>
          <span>Smart Plate</span>
        </Link>

        {/* Navigation Links */}
        <div className={`nav-links ${isMobileOpen ? 'open' : ''}`}>
          {user ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileOpen(false)}
              >
                <LayoutDashboard size={17} />
                <span>Dashboard</span>
              </NavLink>

              <NavLink
                to="/recipes"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileOpen(false)}
              >
                <Utensils size={17} />
                <span>Recipes</span>
              </NavLink>

              <NavLink
                to="/planner"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileOpen(false)}
              >
                <Calendar size={17} />
                <span>Meal Planner</span>
              </NavLink>

              <NavLink
                to="/shopping-list"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileOpen(false)}
              >
                <ShoppingCart size={17} />
                <span>Shopping List</span>
              </NavLink>

              <NavLink
                to="/favorites"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileOpen(false)}
              >
                <Heart size={17} />
                <span>Favorites</span>
              </NavLink>

              <NavLink
                to="/recipes/new"
                className="btn btn-primary btn-sm"
                style={{ marginLeft: '0.25rem' }}
                onClick={() => setIsMobileOpen(false)}
              >
                <PlusCircle size={16} />
                <span>Add Recipe</span>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileOpen(false)}
              >
                Home
              </NavLink>
              <NavLink
                to="/recipes"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileOpen(false)}
              >
                Browse Recipes
              </NavLink>
            </>
          )}
        </div>

        {/* Right Actions */}
        <div className="nav-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Link
                to="/profile"
                className="btn btn-secondary btn-sm"
                title="Account Profile"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <User size={15} />
                <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-ghost btn-sm"
                title="Log Out"
                style={{ padding: '0.4rem' }}
              >
                <LogOut size={17} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}

          <button
            className="mobile-toggle"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
