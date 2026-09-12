import React from 'react';
import RecipeCard from './RecipeCard';
import EmptyState from './EmptyState';

const RecipeGrid = ({ recipes = [], onPlanClick, emptyMessage = 'No recipes found' }) => {
  if (!recipes || recipes.length === 0) {
    return (
      <EmptyState
        icon="search"
        title={emptyMessage}
        description="Try adjusting your search terms or filters to find what you crave."
      />
    );
  }

  return (
    <div className="recipe-grid">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe._id}
          recipe={recipe}
          onPlanClick={onPlanClick}
        />
      ))}
    </div>
  );
};

export default RecipeGrid;
