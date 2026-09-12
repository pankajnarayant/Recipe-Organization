import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Utensils,
  Calendar,
  ShoppingCart,
  Heart,
  PlusCircle,
  Clock,
  ArrowRight,
  Sparkles,
  ChevronRight,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { recipeService, mealPlanService, shoppingListService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

// Helper to get current week's Monday YYYY-MM-DD
const getCurrentMonday = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
};

const getTodayDayOfWeek = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRecipes: 0,
    favoritesCount: 0,
    shoppingCount: 0,
    plannedMealsCount: 0,
  });
  const [currentPlan, setCurrentPlan] = useState(null);
  const currentMonday = getCurrentMonday();
  const todayName = getTodayDayOfWeek();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [recipesRes, favsRes, planRes, shopRes] = await Promise.all([
          recipeService.getRecipes({ limit: 1 }),
          recipeService.getFavorites(),
          mealPlanService.getPlanByWeek(currentMonday),
          shoppingListService.getList(),
        ]);

        const planData = planRes.data.data;
        setCurrentPlan(planData);

        setStats({
          totalRecipes: recipesRes.data.total || 0,
          favoritesCount: favsRes.data.count || user?.favorites?.length || 0,
          shoppingCount: shopRes.data.stats?.pending ?? 0,
          plannedMealsCount: planData?.meals?.length || 0,
        });
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentMonday, user]);

  if (loading) {
    return <LoadingSpinner fullPage text="Loading your kitchen dashboard..." />;
  }

  // Filter today's planned meals
  const todayMeals = currentPlan?.meals?.filter((m) => m.dayOfWeek === todayName) || [];

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Greeting Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--slate-900), #064e3b)',
          color: 'white',
          borderRadius: 'var(--radius-xl)',
          padding: '2.25rem 2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span
              style={{
                background: 'rgba(16, 185, 129, 0.25)',
                color: 'var(--primary-200)',
                padding: '0.2rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              Chef Dashboard
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate-300)' }}>
              Week of {currentMonday}
            </span>
          </div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: 'white' }}>
            Welcome back, {user?.name || 'Chef'}!
          </h1>
          <p style={{ color: 'var(--slate-200)', fontSize: '0.95rem', marginTop: '0.35rem', maxWidth: '560px' }}>
            {stats.plannedMealsCount > 0
              ? `You have ${stats.plannedMealsCount} meals scheduled this week and ${stats.shoppingCount} groceries to pick up.`
              : 'Your weekly meal plan is currently open. Add recipes to jumpstart your week!'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/planner" className="btn btn-primary btn-sm">
            <Calendar size={16} />
            <span>Open Meal Planner</span>
          </Link>
          <Link to="/recipes/new" className="btn btn-secondary btn-sm" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', borderColor: 'rgba(255,255,255,0.25)' }}>
            <PlusCircle size={16} />
            <span>New Recipe</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <Link to="/recipes" className="card" style={{ padding: '1.25rem', textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-500)' }}>
              Total Recipes
            </span>
            <div style={{ padding: '0.5rem', background: 'var(--primary-50)', color: 'var(--primary-600)', borderRadius: 'var(--radius-md)' }}>
              <Utensils size={18} />
            </div>
          </div>
          <p style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            {stats.totalRecipes}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--primary-600)', fontWeight: 600 }}>
            Browse collection →
          </span>
        </Link>

        <Link to="/planner" className="card" style={{ padding: '1.25rem', textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-500)' }}>
              Meals Planned
            </span>
            <div style={{ padding: '0.5rem', background: 'var(--accent-50)', color: 'var(--accent-600)', borderRadius: 'var(--radius-md)' }}>
              <Calendar size={18} />
            </div>
          </div>
          <p style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            {stats.plannedMealsCount}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-600)', fontWeight: 600 }}>
            For week of {currentMonday} →
          </span>
        </Link>

        <Link to="/shopping-list" className="card" style={{ padding: '1.25rem', textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-500)' }}>
              Grocery Items
            </span>
            <div style={{ padding: '0.5rem', background: 'var(--primary-50)', color: 'var(--primary-600)', borderRadius: 'var(--radius-md)' }}>
              <ShoppingCart size={18} />
            </div>
          </div>
          <p style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            {stats.shoppingCount}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--primary-600)', fontWeight: 600 }}>
            View shopping checklist →
          </span>
        </Link>

        <Link to="/favorites" className="card" style={{ padding: '1.25rem', textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-500)' }}>
              Favorites
            </span>
            <div style={{ padding: '0.5rem', background: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-md)' }}>
              <Heart size={18} />
            </div>
          </div>
          <p style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            {stats.favoritesCount}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600 }}>
            Saved favorites →
          </span>
        </Link>
      </div>

      {/* Today's Planned Meals Section */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} style={{ color: 'var(--primary-600)' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Today's Planned Meals ({todayName})</h2>
          </div>
          <Link to="/planner" style={{ fontSize: '0.85rem', color: 'var(--primary-600)', fontWeight: 600 }}>
            Edit Week Plan
          </Link>
        </div>

        {todayMeals.length === 0 ? (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              background: 'var(--slate-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--slate-300)',
            }}
          >
            <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
              No meals scheduled for today yet.
            </p>
            <Link to="/planner" className="btn btn-primary btn-sm">
              Schedule Today's Meals
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
            }}
          >
            {todayMeals.map((meal) => (
              <div
                key={meal._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.85rem',
                  background: 'var(--slate-50)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <img
                  src={meal.recipe?.image || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80'}
                  alt={meal.recipe?.title || 'Meal'}
                  style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                    {meal.mealType}
                  </span>
                  <p
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: 'var(--slate-900)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {meal.recipe?.title || 'Recipe'}
                  </p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                    {meal.servings} Servings
                  </span>
                </div>
                <Link
                  to={`/recipes/${meal.recipe?._id}`}
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '0.4rem' }}
                  title="View Recipe Details"
                >
                  <ChevronRight size={18} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Week at a Glance Summary */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Weekly Menu Overview</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
              Monday through Sunday schedule
            </p>
          </div>
          <Link to="/planner" className="btn btn-secondary btn-sm">
            View Full Planner Grid
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '0.75rem',
          }}
        >
          {DAYS_OF_WEEK.map((day) => {
            const dayMeals = currentPlan?.meals?.filter((m) => m.dayOfWeek === day) || [];
            const isToday = day === todayName;

            return (
              <div
                key={day}
                style={{
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: isToday ? 'var(--primary-50)' : 'white',
                  border: isToday ? '1.5px solid var(--primary-500)' : '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: isToday ? 'var(--primary-800)' : 'var(--slate-800)' }}>
                    {day.slice(0, 3)}
                  </span>
                  {isToday && (
                    <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                      Today
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minHeight: '60px' }}>
                  {dayMeals.length === 0 ? (
                    <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontStyle: 'italic' }}>
                      No meals
                    </span>
                  ) : (
                    dayMeals.map((m) => (
                      <div
                        key={m._id}
                        style={{
                          fontSize: '0.75rem',
                          background: 'rgba(255,255,255,0.75)',
                          padding: '0.2rem 0.4rem',
                          borderRadius: '4px',
                          border: '1px solid var(--slate-200)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={`${m.mealType}: ${m.recipe?.title} (${m.servings} serv)`}
                      >
                        <strong style={{ color: 'var(--primary-700)' }}>{m.mealType[0]}:</strong>{' '}
                        {m.recipe?.title}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        <Link
          to="/recipes/new"
          className="card"
          style={{
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            textDecoration: 'none',
          }}
        >
          <div style={{ padding: '0.75rem', background: 'var(--primary-100)', color: 'var(--primary-700)', borderRadius: 'var(--radius-md)' }}>
            <PlusCircle size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Add New Recipe</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>Save your own creations</p>
          </div>
        </Link>

        <Link
          to="/recipes"
          className="card"
          style={{
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            textDecoration: 'none',
          }}
        >
          <div style={{ padding: '0.75rem', background: 'var(--accent-100)', color: 'var(--accent-700)', borderRadius: 'var(--radius-md)' }}>
            <Utensils size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Browse Recipes</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>Search by tags & dietary</p>
          </div>
        </Link>

        <Link
          to="/planner"
          className="card"
          style={{
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            textDecoration: 'none',
          }}
        >
          <div style={{ padding: '0.75rem', background: 'var(--slate-100)', color: 'var(--slate-700)', borderRadius: 'var(--radius-md)' }}>
            <Calendar size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Plan Meals</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>Set up weekly menu</p>
          </div>
        </Link>

        <Link
          to="/shopping-list"
          className="card"
          style={{
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            textDecoration: 'none',
          }}
        >
          <div style={{ padding: '0.75rem', background: 'var(--primary-100)', color: 'var(--primary-700)', borderRadius: 'var(--radius-md)' }}>
            <ShoppingCart size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Shopping List</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>Check off grocery items</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;
