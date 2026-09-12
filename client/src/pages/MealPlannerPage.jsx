import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Plus,
  Trash2,
  Users,
  Clock,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { mealPlanService, shoppingListService } from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import MealSlotModal from '../components/MealSlotModal';
import ConfirmModal from '../components/ConfirmModal';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

// Helper to format Date to YYYY-MM-DD
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

// Helper to get Monday for any given date
const getMonday = (d) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

const MealPlannerPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [currentMondayDate, setCurrentMondayDate] = useState(() => getMonday(new Date()));
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Active day filter for mobile view
  const [activeMobileDay, setActiveMobileDay] = useState('Monday');

  // Modal states
  const [slotModalState, setSlotModalState] = useState({
    isOpen: false,
    dayOfWeek: 'Monday',
    mealType: 'Dinner',
    date: '',
    currentMeal: null,
  });

  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  const weekStartDateStr = formatDate(currentMondayDate);

  // Compute date strings for all 7 days of this week
  const weekDays = DAYS_OF_WEEK.map((dayName, index) => {
    const d = new Date(currentMondayDate);
    d.setDate(currentMondayDate.getDate() + index);
    return {
      dayName,
      dateStr: formatDate(d),
      displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  });

  const fetchMealPlan = useCallback(async () => {
    setLoading(true);
    try {
      const res = await mealPlanService.getPlanByWeek(weekStartDateStr);
      if (res.data.success) {
        setMealPlan(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load meal plan:', err);
    } finally {
      setLoading(false);
    }
  }, [weekStartDateStr]);

  useEffect(() => {
    fetchMealPlan();
  }, [fetchMealPlan]);

  // Navigate weeks
  const handlePrevWeek = () => {
    const prev = new Date(currentMondayDate);
    prev.setDate(prev.getDate() - 7);
    setCurrentMondayDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentMondayDate);
    next.setDate(next.getDate() + 7);
    setCurrentMondayDate(next);
  };

  const handleCurrentWeek = () => {
    setCurrentMondayDate(getMonday(new Date()));
  };

  // Open slot modal
  const handleOpenSlot = (dayObj, mealType, existingMeal = null) => {
    setSlotModalState({
      isOpen: true,
      dayOfWeek: dayObj.dayName,
      mealType,
      date: dayObj.dateStr,
      currentMeal: existingMeal,
    });
  };

  // Save meal slot
  const handleSaveMealSlot = async (slotData) => {
    try {
      const res = await mealPlanService.addOrUpdateMeal({
        weekStartDate: weekStartDateStr,
        ...slotData,
      });
      if (res.data.success) {
        setMealPlan(res.data.data);
        showToast('Meal slot updated successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to save meal slot', 'error');
    }
  };

  // Remove meal slot
  const handleRemoveSlot = async (slotId, e) => {
    e.stopPropagation();
    try {
      const res = await mealPlanService.removeMealSlot(slotId);
      if (res.data.success) {
        setMealPlan(res.data.data);
        showToast('Meal removed from plan', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Failed to remove meal', 'error');
    }
  };

  // Clear entire week
  const handleClearWeek = async () => {
    try {
      const res = await mealPlanService.clearWeekPlan(weekStartDateStr);
      if (res.data.success) {
        setMealPlan(res.data.data);
        showToast('Weekly meal plan cleared', 'info');
        setClearConfirmOpen(false);
      }
    } catch (err) {
      showToast(err.message || 'Failed to clear plan', 'error');
    }
  };

  // Auto-generate shopping list
  const handleGenerateShoppingList = async () => {
    if (!mealPlan || !mealPlan.meals || mealPlan.meals.length === 0) {
      showToast('Your meal plan for this week is empty. Add some meals first!', 'error');
      return;
    }

    setGenerating(true);
    try {
      const res = await shoppingListService.generateFromPlan({
        weekStartDate: weekStartDateStr,
        keepManual: true,
      });
      if (res.data.success) {
        showToast('Shopping list generated with scaled ingredients!', 'success');
        navigate('/shopping-list');
      }
    } catch (err) {
      showToast(err.message || 'Failed to generate shopping list', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const totalMealsCount = mealPlan?.meals?.length || 0;

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header and Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800 }}>Weekly Meal Planner</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
            Assign recipes, adjust servings, and auto-generate combined groceries ({totalMealsCount} meals scheduled)
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {totalMealsCount > 0 && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setClearConfirmOpen(true)}
              style={{ color: 'var(--danger)', borderColor: 'var(--slate-200)' }}
            >
              <RotateCcw size={16} />
              <span>Clear Week</span>
            </button>
          )}

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleGenerateShoppingList}
            disabled={generating || totalMealsCount === 0}
            style={{
              padding: '0.75rem 1.35rem',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
            }}
          >
            <ShoppingCart size={18} />
            <span>{generating ? 'Consolidating Ingredients...' : 'Generate Shopping List'}</span>
            <Sparkles size={16} style={{ color: '#fef08a' }} />
          </button>
        </div>
      </div>

      {/* Week Navigator Bar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          background: 'white',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.5rem', background: 'var(--primary-50)', color: 'var(--primary-600)', borderRadius: 'var(--radius-md)' }}>
            <CalendarIcon size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase' }}>
              Selected Week
            </span>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              Week of {weekDays[0].displayDate} – {weekDays[6].displayDate}
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handlePrevWeek}
            title="Previous Week"
          >
            <ChevronLeft size={16} />
            <span>Prev Week</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleCurrentWeek}
          >
            This Week
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleNextWeek}
            title="Next Week"
          >
            <span>Next Week</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Mobile Day Selector Tabs */}
      <div
        style={{
          display: 'none',
          gap: '0.35rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
        }}
        className="mobile-day-tabs"
      >
        {weekDays.map((dayObj) => {
          const isSelected = activeMobileDay === dayObj.dayName;
          const dayMeals = mealPlan?.meals?.filter((m) => m.dayOfWeek === dayObj.dayName) || [];

          return (
            <button
              key={dayObj.dayName}
              type="button"
              className={`filter-pill ${isSelected ? 'active' : ''}`}
              onClick={() => setActiveMobileDay(dayObj.dayName)}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
            >
              {dayObj.dayName.slice(0, 3)} ({dayMeals.length})
            </button>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 860px) {
          .mobile-day-tabs {
            display: flex !important;
          }
          .planner-grid {
            display: flex !important;
            flex-direction: column !important;
          }
          .day-column:not(.mobile-active-day) {
            display: none !important;
          }
          .day-column.mobile-active-day {
            width: 100% !important;
          }
        }
      `}</style>

      {/* Weekly Planner Grid */}
      {loading ? (
        <LoadingSpinner fullPage={false} text="Loading your meal plan..." />
      ) : (
        <div className="planner-grid">
          {weekDays.map((dayObj) => {
            const isMobileActive = activeMobileDay === dayObj.dayName;

            return (
              <div
                key={dayObj.dayName}
                className={`day-column ${isMobileActive ? 'mobile-active-day' : ''}`}
              >
                {/* Day Header */}
                <div className="day-header">
                  <span className="day-name">{dayObj.dayName}</span>
                  <span className="day-date" style={{ display: 'block' }}>
                    {dayObj.displayDate}
                  </span>
                </div>

                {/* 4 Meal Slots: Breakfast, Lunch, Dinner, Snack */}
                {MEAL_TYPES.map((mealType) => {
                  const existingMeal = mealPlan?.meals?.find(
                    (m) => m.date === dayObj.dateStr && m.mealType === mealType
                  );

                  return (
                    <div
                      key={mealType}
                      className={`meal-slot-item ${existingMeal ? 'has-meal' : ''}`}
                      onClick={() => handleOpenSlot(dayObj, mealType, existingMeal)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '0.2rem',
                        }}
                      >
                        <span className="meal-slot-label">{mealType}</span>
                        {existingMeal && (
                          <button
                            type="button"
                            onClick={(e) => handleRemoveSlot(existingMeal._id, e)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--slate-400)',
                              cursor: 'pointer',
                              padding: '0.1rem',
                            }}
                            title="Remove meal"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>

                      {existingMeal ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          <p className="meal-slot-title" title={existingMeal.recipe?.title}>
                            {existingMeal.recipe?.title}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span
                              className="badge badge-emerald"
                              style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}
                            >
                              <Users size={10} style={{ marginRight: '2px' }} />
                              {existingMeal.servings} serv
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.3rem',
                            color: 'var(--slate-400)',
                            fontSize: '0.75rem',
                            padding: '0.5rem 0',
                          }}
                        >
                          <Plus size={14} />
                          <span>Assign</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* Recipe Picker / Servings Modal */}
      {slotModalState.isOpen && (
        <MealSlotModal
          isOpen={slotModalState.isOpen}
          onClose={() => setSlotModalState((prev) => ({ ...prev, isOpen: false }))}
          dayOfWeek={slotModalState.dayOfWeek}
          mealType={slotModalState.mealType}
          date={slotModalState.date}
          currentMeal={slotModalState.currentMeal}
          onSaveMeal={handleSaveMealSlot}
        />
      )}

      {/* Clear Week Confirmation */}
      <ConfirmModal
        isOpen={clearConfirmOpen}
        title="Clear Week Plan"
        message={`Are you sure you want to remove all planned meals for the week of ${weekDays[0].displayDate}?`}
        confirmText="Clear Plan"
        onConfirm={handleClearWeek}
        onCancel={() => setClearConfirmOpen(false)}
      />
    </div>
  );
};

export default MealPlannerPage;
