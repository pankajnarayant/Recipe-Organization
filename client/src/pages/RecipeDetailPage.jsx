import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  Users,
  Heart,
  Calendar,
  Edit,
  Trash2,
  ArrowLeft,
  Flame,
  Check,
  ChefHat,
  Sparkles,
} from 'lucide-react';
import { recipeService, mealPlanService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmModal from '../components/ConfirmModal';
import MealSlotModal from '../components/MealSlotModal';

const RecipeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isFavorite, toggleFavorite } = useAuth();
  const { showToast } = useToast();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeServings, setActiveServings] = useState(2);
  const [checkedIngredients, setCheckedIngredients] = useState({});

  // Modals state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const res = await recipeService.getRecipeById(id);
        if (res.data.success) {
          setRecipe(res.data.data);
          setActiveServings(res.data.data.servings || 2);
        }
      } catch (err) {
        showToast('Recipe not found', 'error');
        navigate('/recipes');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, navigate, showToast]);

  if (loading || !recipe) {
    return <LoadingSpinner fullPage text="Preparing recipe..." />;
  }

  const isOwner = user && recipe.owner && (recipe.owner._id || recipe.owner).toString() === user.id.toString();
  const favorited = isFavorite(recipe._id);
  const baseServings = recipe.servings || 2;
  const multiplier = activeServings / (baseServings > 0 ? baseServings : 1);

  const toggleIngredientCheck = (idx) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleDeleteRecipe = async () => {
    try {
      await recipeService.deleteRecipe(recipe._id);
      showToast('Recipe deleted successfully', 'success');
      navigate('/recipes');
    } catch (err) {
      showToast(err.message || 'Failed to delete recipe', 'error');
    }
  };

  const handleSaveToMealPlan = async ({ date, dayOfWeek, mealType, recipeId, servings }) => {
    try {
      await mealPlanService.addOrUpdateMeal({
        weekStartDate: date,
        date,
        dayOfWeek,
        mealType,
        recipeId,
        servings,
      });
      showToast(`Added to ${dayOfWeek} ${mealType}!`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to add to meal plan', 'error');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '960px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Back button and quick actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            type="button"
            className={`btn btn-sm ${favorited ? 'btn-danger' : 'btn-secondary'}`}
            onClick={() => toggleFavorite(recipe._id)}
          >
            <Heart size={16} fill={favorited ? 'currentColor' : 'none'} />
            <span>{favorited ? 'Favorited' : 'Add to Favorites'}</span>
          </button>

          {user && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setPlanModalOpen(true)}
            >
              <Calendar size={16} />
              <span>Add to Meal Plan</span>
            </button>
          )}

          {isOwner && (
            <>
              <Link to={`/recipes/${recipe._id}/edit`} className="btn btn-secondary btn-sm" title="Edit Recipe">
                <Edit size={16} />
              </Link>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => setDeleteModalOpen(true)}
                title="Delete Recipe"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hero Card */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ position: 'relative', width: '100%', maxHeight: '420px', overflow: 'hidden' }}>
          <img
            src={recipe.image || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80'}
            alt={recipe.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', maxHeight: '420px' }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '1rem',
              left: '1rem',
              display: 'flex',
              gap: '0.5rem',
            }}
          >
            <span className="badge badge-emerald" style={{ padding: '0.35rem 0.85rem', fontSize: '0.85rem' }}>
              {recipe.category}
            </span>
            <span className="badge badge-slate" style={{ padding: '0.35rem 0.85rem', fontSize: '0.85rem', background: 'white' }}>
              {recipe.difficulty}
            </span>
          </div>
        </div>

        <div style={{ padding: '2rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.75rem' }}>
            {recipe.title}
          </h1>

          <p style={{ fontSize: '1.05rem', color: 'var(--slate-600)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            {recipe.description}
          </p>

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {recipe.tags.map((tag, i) => (
                <span key={i} className="badge badge-emerald">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Meta metrics row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '1rem',
              padding: '1.25rem',
              background: 'var(--slate-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--slate-200)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase' }}>
                Prep Time
              </span>
              <p style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-800)' }}>
                {recipe.prepTime} mins
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase' }}>
                Cook Time
              </span>
              <p style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-800)' }}>
                {recipe.cookTime} mins
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase' }}>
                Total Time
              </span>
              <p style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary-700)' }}>
                {recipe.prepTime + recipe.cookTime} mins
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase' }}>
                Created By
              </span>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--slate-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {recipe.owner?.name || 'Smart Plate Chef'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Servings Scaler Header */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.75rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.5rem', background: 'var(--primary-50)', color: 'var(--primary-600)', borderRadius: 'var(--radius-md)' }}>
            <Users size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Adjust Cooking Servings</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
              Ingredients scale automatically in real-time
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ width: '2.25rem', height: '2.25rem', padding: 0 }}
            onClick={() => setActiveServings((s) => Math.max(1, s - 1))}
          >
            -
          </button>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, minWidth: '2rem', textAlign: 'center' }}>
            {activeServings}
          </span>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ width: '2.25rem', height: '2.25rem', padding: 0 }}
            onClick={() => setActiveServings((s) => s + 1)}
          >
            +
          </button>
          <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
            servings {multiplier !== 1 && `(${multiplier}x)`}
          </span>
        </div>
      </div>

      {/* Main Recipe Content (Ingredients & Instructions Grid) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Ingredients Checklist */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Ingredients</span>
            <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
              {recipe.ingredients?.length || 0} items
            </span>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {recipe.ingredients?.map((ing, idx) => {
              const scaledQty = Math.round(ing.quantity * multiplier * 100) / 100;
              const isChecked = checkedIngredients[idx];

              return (
                <div
                  key={idx}
                  onClick={() => toggleIngredientCheck(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.75rem',
                    background: isChecked ? 'var(--slate-50)' : 'white',
                    border: '1px solid var(--slate-200)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div
                      style={{
                        width: '1.25rem',
                        height: '1.25rem',
                        borderRadius: '4px',
                        border: isChecked ? 'none' : '1.5px solid var(--slate-300)',
                        background: isChecked ? 'var(--primary-600)' : 'white',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isChecked && <Check size={12} />}
                    </div>
                    <span
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        color: isChecked ? 'var(--slate-400)' : 'var(--slate-800)',
                        textDecoration: isChecked ? 'line-through' : 'none',
                      }}
                    >
                      {ing.name}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: isChecked ? 'var(--slate-400)' : 'var(--primary-700)',
                      background: isChecked ? 'transparent' : 'var(--primary-50)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    {scaledQty} {ing.unit}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Instructions Steps */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.25rem' }}>
            Step-by-Step Instructions
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {recipe.instructions?.map((step, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '1rem' }}>
                <div
                  style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--primary-600)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    flexShrink: 0,
                    marginTop: '0.1rem',
                  }}
                >
                  {idx + 1}
                </div>
                <p style={{ fontSize: '0.95rem', color: 'var(--slate-700)', lineHeight: 1.6, flex: 1 }}>
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nutrition Facts Card if present */}
      {recipe.nutrition && (recipe.nutrition.calories > 0 || recipe.nutrition.protein > 0) && (
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Flame size={20} style={{ color: 'var(--accent-500)' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Nutrition Information (Per Serving)</h3>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
              gap: '1rem',
              textAlign: 'center',
            }}
          >
            <div style={{ padding: '0.85rem', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>Calories</span>
              <p style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                {recipe.nutrition.calories || 0}
              </p>
            </div>
            <div style={{ padding: '0.85rem', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>Protein</span>
              <p style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                {recipe.nutrition.protein || 0}g
              </p>
            </div>
            <div style={{ padding: '0.85rem', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>Carbohydrates</span>
              <p style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                {recipe.nutrition.carbs || 0}g
              </p>
            </div>
            <div style={{ padding: '0.85rem', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>Fat</span>
              <p style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                {recipe.nutrition.fat || 0}g
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Recipe"
        message={`Are you sure you want to delete "${recipe.title}"? This action cannot be undone.`}
        confirmText="Delete Recipe"
        onConfirm={handleDeleteRecipe}
        onCancel={() => setDeleteModalOpen(false)}
      />

      {/* Meal Slot Modal */}
      {planModalOpen && (
        <MealSlotModal
          isOpen={planModalOpen}
          onClose={() => setPlanModalOpen(false)}
          dayOfWeek="Monday"
          mealType="Dinner"
          date={new Date().toISOString().split('T')[0]}
          currentMeal={{ recipe, servings: activeServings }}
          onSaveMeal={handleSaveToMealPlan}
        />
      )}
    </div>
  );
};

export default RecipeDetailPage;
