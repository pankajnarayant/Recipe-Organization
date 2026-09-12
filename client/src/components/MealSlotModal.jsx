import React, { useState, useEffect } from 'react';
import { X, Search, Users, Check, Utensils } from 'lucide-react';
import { recipeService } from '../services/api';

const MealSlotModal = ({
  isOpen,
  onClose,
  dayOfWeek,
  mealType,
  date,
  currentMeal,
  onSaveMeal,
}) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedRecipeId, setSelectedRecipeId] = useState(currentMeal?.recipe?._id || '');
  const [servings, setServings] = useState(currentMeal?.servings || 2);

  useEffect(() => {
    if (isOpen) {
      setSelectedRecipeId(currentMeal?.recipe?._id || '');
      setServings(currentMeal?.servings || 2);
      fetchRecipes();
    }
  }, [isOpen, currentMeal]);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const res = await recipeService.getRecipes({ limit: 50 });
      if (res.data.success) {
        setRecipes(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load recipes for modal:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredRecipes = recipes.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (recipe) => {
    setSelectedRecipeId(recipe._id);
    if (!currentMeal) {
      setServings(recipe.servings || 2);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedRecipeId) return;
    onSaveMeal({
      date,
      dayOfWeek,
      mealType,
      recipeId: selectedRecipeId,
      servings: Number(servings) || 2,
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <span className="badge badge-emerald" style={{ marginBottom: '0.35rem' }}>
              {dayOfWeek} • {mealType}
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Assign Recipe to Slot</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Servings Adjuster */}
          <div
            style={{
              background: 'var(--slate-50)',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--slate-200)',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} style={{ color: 'var(--primary-600)' }} />
              <div>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--slate-800)' }}>
                  Planned Servings
                </span>
                <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                  Ingredients in shopping list will scale automatically
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ width: '2rem', height: '2rem', padding: 0 }}
                onClick={() => setServings((s) => Math.max(1, s - 1))}
              >
                -
              </button>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', minWidth: '1.5rem', textAlign: 'center' }}>
                {servings}
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ width: '2rem', height: '2rem', padding: 0 }}
                onClick={() => setServings((s) => s + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* Search Recipes */}
          <div style={{ position: 'relative', marginBottom: '0.85rem' }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Search recipes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.25rem', fontSize: '0.875rem' }}
            />
          </div>

          {/* Recipe List to Pick From */}
          <div
            style={{
              maxHeight: '260px',
              overflowY: 'auto',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
            }}
          >
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate-400)' }}>
                Loading recipes...
              </div>
            ) : filteredRecipes.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate-400)', fontSize: '0.875rem' }}>
                No matching recipes found
              </div>
            ) : (
              filteredRecipes.map((recipe) => {
                const isSelected = selectedRecipeId === recipe._id;
                return (
                  <div
                    key={recipe._id}
                    onClick={() => handleSelect(recipe)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.65rem 0.85rem',
                      borderBottom: '1px solid var(--slate-100)',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--primary-50)' : 'transparent',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <img
                      src={recipe.image || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80'}
                      alt={recipe.title}
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: 'var(--radius-sm)',
                        objectFit: 'cover',
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          color: isSelected ? 'var(--primary-800)' : 'var(--slate-800)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {recipe.title}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                        {recipe.category} • {recipe.prepTime + recipe.cookTime} mins • Base {recipe.servings} serv
                      </p>
                    </div>
                    {isSelected && (
                      <div
                        style={{
                          width: '1.5rem',
                          height: '1.5rem',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--primary-600)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Check size={12} />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={!selectedRecipeId}
            >
              Save to Meal Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MealSlotModal;
