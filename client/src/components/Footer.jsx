import React from 'react';
import { Utensils, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="brand-icon-box" style={{ width: '2rem', height: '2rem' }}>
              <Utensils size={15} />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--slate-900)' }}>
              Smart Plate
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.875rem', color: 'var(--slate-500)' }}>
            <Link to="/recipes" style={{ textDecoration: 'none' }}>
              Explore Recipes
            </Link>
            <Link to="/planner" style={{ textDecoration: 'none' }}>
              Weekly Planner
            </Link>
            <Link to="/shopping-list" style={{ textDecoration: 'none' }}>
              Grocery List
            </Link>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--slate-100)',
            paddingTop: '1rem',
            fontSize: '0.8rem',
            color: 'var(--slate-400)',
          }}
        >
          <p>© {new Date().getFullYear()} Smart Plate. All rights reserved.</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Crafted for healthy homes & effortless meal planning
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
