import React from 'react';

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Dessert'];
const TAGS = ['All', 'Vegetarian', 'Vegan', 'High Protein', 'Quick Meals', 'Healthy', 'Low Carb'];

const CategoryFilter = ({
  selectedCategory,
  onSelectCategory,
  selectedTag,
  onSelectTag,
  selectedDifficulty,
  onSelectDifficulty,
  sortBy,
  onSelectSort,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
      {/* Category Pills Bar */}
      <div className="filter-scroll-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => onSelectCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Secondary filter controls (Tags, Difficulty, Sort) */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
          {/* Dietary Tag Dropdown */}
          <select
            className="form-select"
            value={selectedTag}
            onChange={(e) => onSelectTag(e.target.value)}
            style={{ width: 'auto', padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
          >
            <option value="All">Dietary Tag: All</option>
            {TAGS.filter((t) => t !== 'All').map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>

          {/* Difficulty Dropdown */}
          <select
            className="form-select"
            value={selectedDifficulty}
            onChange={(e) => onSelectDifficulty(e.target.value)}
            style={{ width: 'auto', padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
          >
            <option value="All">Difficulty: All</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Sort Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--slate-500)' }}>
            Sort by:
          </span>
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => onSelectSort(e.target.value)}
            style={{ width: 'auto', padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
          >
            <option value="newest">Newest First</option>
            <option value="cookTime">Fastest Cooking Time</option>
            <option value="alphabetical">Name (A–Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;
