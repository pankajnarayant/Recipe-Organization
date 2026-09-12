import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Utensils, ChevronLeft, ChevronRight } from 'lucide-react';
import { recipeService, mealPlanService } from '../services/api';
import RecipeGrid from '../components/RecipeGrid';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import LoadingSpinner from '../components/LoadingSpinner';
import MealSlotModal from '../components/MealSlotModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Helper for current Monday
const getCurrentMonday = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
};

const RecipesPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters and pagination state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [tag, setTag] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Plan modal state
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [selectedRecipeForPlan, setSelectedRecipeForPlan] = useState(null);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        sort: sortBy,
      };
      if (search.trim()) params.search = search.trim();
      if (category !== 'All') params.category = category;
      if (tag !== 'All') params.tag = tag;
      if (difficulty !== 'All') params.difficulty = difficulty;

      const res = await recipeService.getRecipes(params);
      if (res.data.success) {
        setRecipes(res.data.data);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load recipes:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, tag, difficulty, sortBy]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchRecipes();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, category, tag, difficulty, sortBy]);

  // Handle page change
  useEffect(() => {
    fetchRecipes();
  }, [page]);

  const handlePlanClick = (recipe) => {
    if (!user) {
      showToast('Please log in to add recipes to your weekly meal plan', 'info');
      return;
    }
    setSelectedRecipeForPlan(recipe);
    setPlanModalOpen(true);
  };

  const handleSaveMealToPlan = async ({ date, dayOfWeek, mealType, recipeId, servings }) => {
    try {
      const res = await mealPlanService.addOrUpdateMeal({
        weekStartDate: getCurrentMonday(),
        date: date || getCurrentMonday(),
        dayOfWeek: dayOfWeek || 'Monday',
        mealType: mealType || 'Dinner',
        recipeId,
        servings,
      });
      if (res.data.success) {
        showToast(`Added ${selectedRecipeForPlan?.title || 'recipe'} to meal plan!`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to save to meal plan', 'error');
    }
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header Row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800 }}>Explore Recipes</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
            Discover and organize meals ({totalCount} {totalCount === 1 ? 'recipe' : 'recipes'} available)
          </p>
        </div>

        {user && (
          <Link to="/recipes/new" className="btn btn-primary">
            <PlusCircle size={18} />
            <span>Create New Recipe</span>
          </Link>
        )}
      </div>

      {/* Search Bar */}
      <div style={{ maxWidth: '600px' }}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by recipe name, tag, or ingredient..."
        />
      </div>

      {/* Filters (Category Pills, Tags, Difficulty, Sorting) */}
      <CategoryFilter
        selectedCategory={category}
        onSelectCategory={(cat) => {
          setCategory(cat);
          setPage(1);
        }}
        selectedTag={tag}
        onSelectTag={(t) => {
          setTag(t);
          setPage(1);
        }}
        selectedDifficulty={difficulty}
        onSelectDifficulty={(d) => {
          setDifficulty(d);
          setPage(1);
        }}
        sortBy={sortBy}
        onSelectSort={(s) => {
          setSortBy(s);
          setPage(1);
        }}
      />

      {/* Recipes Grid */}
      {loading ? (
        <LoadingSpinner fullPage={false} text="Finding recipes..." />
      ) : (
        <RecipeGrid
          recipes={recipes}
          onPlanClick={handlePlanClick}
          emptyMessage="No recipes found matching your criteria"
        />
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            marginTop: '1.5rem',
          }}
        >
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-600)' }}>
            Page {page} of {totalPages}
          </span>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Quick Add to Meal Plan Modal */}
      {planModalOpen && (
        <MealSlotModal
          isOpen={planModalOpen}
          onClose={() => setPlanModalOpen(false)}
          dayOfWeek="Monday"
          mealType="Dinner"
          date={getCurrentMonday()}
          currentMeal={{
            recipe: selectedRecipeForPlan,
            servings: selectedRecipeForPlan?.servings || 2,
          }}
          onSaveMeal={handleSaveMealToPlan}
        />
      )}
    </div>
  );
};

export default RecipesPage;
