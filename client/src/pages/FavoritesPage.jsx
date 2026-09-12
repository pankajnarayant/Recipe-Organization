import React, { useState, useEffect } from 'react';
import { Heart, Search } from 'lucide-react';
import { recipeService, mealPlanService } from '../services/api';
import RecipeGrid from '../components/RecipeGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import MealSlotModal from '../components/MealSlotModal';
import { useToast } from '../context/ToastContext';

// Helper for current Monday
const getCurrentMonday = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
};

const FavoritesPage = () => {
  const { showToast } = useToast();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Plan modal
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [selectedRecipeForPlan, setSelectedRecipeForPlan] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const res = await recipeService.getFavorites();
        if (res.data.success) {
          setFavorites(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load favorites:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  const handlePlanClick = (recipe) => {
    setSelectedRecipeForPlan(recipe);
    setPlanModalOpen(true);
  };

  const handleSaveMealToPlan = async ({ date, dayOfWeek, mealType, recipeId, servings }) => {
    try {
      await mealPlanService.addOrUpdateMeal({
        weekStartDate: getCurrentMonday(),
        date: date || getCurrentMonday(),
        dayOfWeek: dayOfWeek || 'Monday',
        mealType: mealType || 'Dinner',
        recipeId,
        servings,
      });
      showToast(`Added ${selectedRecipeForPlan?.title} to your weekly plan!`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to save meal', 'error');
    }
  };

  const filteredFavorites = favorites.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Heart size={24} style={{ color: 'var(--danger)' }} fill="#ef4444" />
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800 }}>Favorite Recipes</h1>
          </div>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
            Your curated collection of favorite culinary inspirations ({favorites.length} saved)
          </p>
        </div>

        {favorites.length > 0 && (
          <div style={{ position: 'relative', width: '280px' }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Search your favorites..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
            />
          </div>
        )}
      </div>

      {loading ? (
        <LoadingSpinner fullPage={false} text="Loading your favorites..." />
      ) : (
        <RecipeGrid
          recipes={filteredFavorites}
          onPlanClick={handlePlanClick}
          emptyMessage={favorites.length === 0 ? "You haven't added any favorite recipes yet" : "No favorites matched your search"}
        />
      )}

      {planModalOpen && (
        <MealSlotModal
          isOpen={planModalOpen}
          onClose={() => setPlanModalOpen(false)}
          dayOfWeek="Monday"
          mealType="Dinner"
          date={getCurrentMonday()}
          currentMeal={{ recipe: selectedRecipeForPlan, servings: selectedRecipeForPlan?.servings || 2 }}
          onSaveMeal={handleSaveMealToPlan}
        />
      )}
    </div>
  );
};

export default FavoritesPage;
