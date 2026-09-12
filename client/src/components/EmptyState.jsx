import React from 'react';
import { ChefHat, ShoppingBag, Calendar, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon = 'recipe',
  title = 'Nothing here yet',
  description = 'Get started by creating or adding items.',
  actionText,
  actionLink,
  onAction,
}) => {
  const getIcon = () => {
    switch (icon) {
      case 'shopping':
        return <ShoppingBag size={42} style={{ color: 'var(--primary-600)' }} />;
      case 'calendar':
        return <Calendar size={42} style={{ color: 'var(--primary-600)' }} />;
      case 'search':
        return <Search size={42} style={{ color: 'var(--slate-400)' }} />;
      default:
        return <ChefHat size={42} style={{ color: 'var(--primary-600)' }} />;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3.5rem 1.5rem',
        background: 'white',
        border: '1px dashed var(--slate-300)',
        borderRadius: 'var(--radius-xl)',
        maxWidth: '480px',
        margin: '2rem auto',
      }}
    >
      <div
        style={{
          width: '4.5rem',
          height: '4.5rem',
          borderRadius: 'var(--radius-full)',
          background: 'var(--primary-50)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
        }}
      >
        {getIcon()}
      </div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.4rem' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.9rem', color: 'var(--slate-500)', maxWidth: '340px', marginBottom: '1.5rem' }}>
        {description}
      </p>

      {actionText && actionLink && (
        <Link to={actionLink} className="btn btn-primary btn-sm">
          {actionText}
        </Link>
      )}

      {actionText && onAction && (
        <button onClick={onAction} className="btn btn-primary btn-sm">
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
