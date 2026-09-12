import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div
      className="container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '65vh',
        textAlign: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div
        className="brand-icon-box"
        style={{ width: '4rem', height: '4rem', marginBottom: '1.5rem' }}
      >
        <Utensils size={28} />
      </div>
      <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--slate-900)' }}>404</h1>
      <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '0.5rem' }}>
        Recipe or Page Not Found
      </h2>
      <p style={{ color: 'var(--slate-500)', maxWidth: '400px', marginBottom: '2rem' }}>
        The page you are looking for doesn't exist or may have been moved.
      </p>
      <Link to="/" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <ArrowLeft size={16} />
        <span>Return to Home</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;
