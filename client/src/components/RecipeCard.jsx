import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Flame, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RecipeCard = ({ recipe, onPlanClick }) => {
  const { user, isFavorite, toggleFavorite } = useAuth();
  const favorited = isFavorite(recipe._id);

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(recipe._id);
  };

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return <span className="badge badge-emerald">Easy</span>;
      case 'Medium':
        return <span className="badge badge-amber">Medium</span>;
      case 'Hard':
        return <span className="badge badge-red">Hard</span>;
      default:
        return <span className="badge badge-slate">{difficulty}</span>;
    }
  };

  return (
    <div className="recipe-card">
      <Link to={`/recipes/${recipe._id}`} className="recipe-image-wrap">
        <img
          src={recipe.image || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80'}
          alt={recipe.title}
          className="recipe-image"
          loading="lazy"
        />
        <button
          type="button"
          className="recipe-fav-btn"
          onClick={handleFavorite}
          aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            size={17}
            fill={favorited ? '#ef4444' : 'transparent'}
            color={favorited ? '#ef4444' : '#64748b'}
          />
        </button>
        <span className="badge badge-slate recipe-category-pill" style={{ background: 'rgba(255,255,255,0.95)' }}>
          {recipe.category}
        </span>
      </Link>

      <div className="recipe-body">
        <Link to={`/recipes/${recipe._id}`} style={{ textDecoration: 'none' }}>
          <h3 className="recipe-title" title={recipe.title}>
            {recipe.title}
          </h3>
        </Link>
        <p className="recipe-desc">{recipe.description}</p>

        {/* Tags row */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.75rem' }}>
            {recipe.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                {tag}
              </span>
            ))}
            {recipe.tags.length > 3 && (
              <span className="badge badge-slate" style={{ fontSize: '0.7rem' }}>
                +{recipe.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="recipe-meta-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }} title="Cooking time">
            <Clock size={14} style={{ color: 'var(--slate-400)' }} />
            <span>{(recipe.cookTime || 0) + (recipe.prepTime || 0)}m</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }} title="Servings">
            <Users size={14} style={{ color: 'var(--slate-400)' }} />
            <span>{recipe.servings} serv</span>
          </div>

          {getDifficultyBadge(recipe.difficulty)}
        </div>

        <div style={{ marginTop: '0.85rem', display: 'flex', gap: '0.5rem' }}>
          <Link
            to={`/recipes/${recipe._id}`}
            className="btn btn-secondary btn-sm"
            style={{ flex: 1, fontSize: '0.8rem' }}
          >
            View Recipe
          </Link>
          {onPlanClick && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onPlanClick(recipe)}
              style={{ fontSize: '0.8rem' }}
              title="Add to Meal Plan"
            >
              + Plan
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
