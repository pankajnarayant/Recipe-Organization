import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Save, Sparkles, Image } from 'lucide-react';
import { recipeService } from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Dessert', 'Custom'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const SUGGESTED_TAGS = ['Vegetarian', 'Vegan', 'High Protein', 'Quick Meals', 'Healthy', 'Low Carb', 'Budget Friendly'];
const COMMON_UNITS = ['pieces', 'cups', 'tbsp', 'tsp', 'g', 'kg', 'ml', 'l', 'cans', 'slices', 'bunches', 'cloves', 'oz', 'lb'];

const RecipeFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('Dinner');
  const [tags, setTags] = useState([]);
  const [customTag, setCustomTag] = useState('');
  const [prepTime, setPrepTime] = useState('15');
  const [cookTime, setCookTime] = useState('20');
  const [servings, setServings] = useState('2');
  const [difficulty, setDifficulty] = useState('Easy');

  const [ingredients, setIngredients] = useState([
    { name: '', quantity: '1', unit: 'pieces' },
  ]);

  const [instructions, setInstructions] = useState(['']);

  const [nutrition, setNutrition] = useState({
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });

  useEffect(() => {
    if (isEdit) {
      const fetchExisting = async () => {
        try {
          setLoading(true);
          const res = await recipeService.getRecipeById(id);
          if (res.data.success) {
            const r = res.data.data;
            setTitle(r.title);
            setDescription(r.description);
            setImage(r.image || '');
            setCategory(r.category || 'Dinner');
            setTags(r.tags || []);
            setPrepTime(r.prepTime?.toString() || '15');
            setCookTime(r.cookTime?.toString() || '20');
            setServings(r.servings?.toString() || '2');
            setDifficulty(r.difficulty || 'Easy');
            setIngredients(
              r.ingredients?.map((i) => ({
                name: i.name,
                quantity: i.quantity?.toString() || '1',
                unit: i.unit || 'pieces',
              })) || [{ name: '', quantity: '1', unit: 'pieces' }]
            );
            setInstructions(r.instructions && r.instructions.length ? r.instructions : ['']);
            setNutrition({
              calories: r.nutrition?.calories?.toString() || '',
              protein: r.nutrition?.protein?.toString() || '',
              carbs: r.nutrition?.carbs?.toString() || '',
              fat: r.nutrition?.fat?.toString() || '',
            });
          }
        } catch (err) {
          showToast('Failed to load recipe for editing', 'error');
          navigate('/recipes');
        } finally {
          setLoading(false);
        }
      };
      fetchExisting();
    }
  }, [id, isEdit, navigate, showToast]);

  // Ingredients handlers
  const handleIngredientChange = (index, field, value) => {
    setIngredients((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const addIngredientRow = () => {
    setIngredients((prev) => [...prev, { name: '', quantity: '1', unit: 'pieces' }]);
  };

  const removeIngredientRow = (index) => {
    if (ingredients.length <= 1) return;
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  // Instructions handlers
  const handleInstructionChange = (index, value) => {
    setInstructions((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const addInstructionStep = () => {
    setInstructions((prev) => [...prev, '']);
  };

  const removeInstructionStep = (index) => {
    if (instructions.length <= 1) return;
    setInstructions((prev) => prev.filter((_, i) => i !== index));
  };

  // Tag toggling
  const toggleTag = (t) => {
    setTags((prev) =>
      prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t]
    );
  };

  const handleAddCustomTag = (e) => {
    e.preventDefault();
    if (customTag.trim() && !tags.includes(customTag.trim())) {
      setTags((prev) => [...prev, customTag.trim()]);
      setCustomTag('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!title.trim()) {
      setError('Recipe title is required');
      return;
    }
    if (!description.trim()) {
      setError('Recipe description is required');
      return;
    }

    const validIngredients = ingredients.map((ing) => ({
      name: ing.name.trim(),
      quantity: parseFloat(ing.quantity) || 0,
      unit: ing.unit.trim(),
    }));

    if (validIngredients.length === 0 || validIngredients.some((ing) => !ing.name || ing.quantity <= 0)) {
      setError('Please provide valid name and positive quantity for all ingredients');
      return;
    }

    const validInstructions = instructions.map((s) => s.trim()).filter(Boolean);
    if (validInstructions.length === 0) {
      setError('Please provide at least one instruction step');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      image: image.trim() || undefined,
      category,
      tags,
      prepTime: parseInt(prepTime, 10) || 15,
      cookTime: parseInt(cookTime, 10) || 20,
      servings: parseInt(servings, 10) || 2,
      difficulty,
      ingredients: validIngredients,
      instructions: validInstructions,
      nutrition: {
        calories: parseFloat(nutrition.calories) || 0,
        protein: parseFloat(nutrition.protein) || 0,
        carbs: parseFloat(nutrition.carbs) || 0,
        fat: parseFloat(nutrition.fat) || 0,
      },
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        const res = await recipeService.updateRecipe(id, payload);
        showToast('Recipe updated successfully!', 'success');
        navigate(`/recipes/${id}`);
      } else {
        const res = await recipeService.createRecipe(payload);
        showToast('Recipe created successfully!', 'success');
        navigate(`/recipes/${res.data.data._id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to save recipe');
      showToast(err.message || 'Failed to save recipe', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage text="Loading recipe details..." />;
  }

  return (
    <div className="container" style={{ maxWidth: '840px', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <button
        onClick={() => navigate(-1)}
        className="btn btn-ghost btn-sm"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', alignSelf: 'flex-start' }}
      >
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      <div className="card" style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          {isEdit ? 'Edit Recipe' : 'Create New Recipe'}
        </h1>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Fill in details, ingredients, and steps so your weekly meal planner can calculate accurate grocery lists.
        </p>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              background: 'var(--danger-light)',
              color: 'var(--danger)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="form-group">
            <label className="form-label">Recipe Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Creamy Sun-Dried Tomato Garlic Pasta"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Brief description of the flavors, textures, and serving suggestions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cover Image URL</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://images.unsplash.com/..."
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
            {image && (
              <div style={{ marginTop: '0.5rem', width: '120px', height: '80px', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <img src={image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>

          {/* Category and Difficulty */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Difficulty *</label>
              <select
                className="form-select"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Base Servings *</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Times */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Prep Time (minutes)</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Cook Time (minutes)</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">Dietary & Category Tags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {SUGGESTED_TAGS.map((tag) => {
                const active = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`badge ${active ? 'badge-emerald' : 'badge-slate'}`}
                    style={{ cursor: 'pointer', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                  >
                    {active ? `✓ ${tag}` : `+ ${tag}`}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '360px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Add custom tag..."
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              />
              <button type="button" onClick={handleAddCustomTag} className="btn btn-secondary btn-sm">
                Add
              </button>
            </div>
          </div>

          {/* Ingredients Section */}
          <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Ingredients *</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                  Enter structured quantities so the shopping list consolidator can calculate totals
                </p>
              </div>
              <button
                type="button"
                onClick={addIngredientRow}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <Plus size={15} />
                <span>Add Ingredient</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {ingredients.map((ing, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1.2fr auto',
                    gap: '0.5rem',
                    alignItems: 'center',
                  }}
                >
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ingredient (e.g. Basmati Rice)"
                    value={ing.name}
                    onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    className="form-input"
                    placeholder="Qty"
                    value={ing.quantity}
                    onChange={(e) => handleIngredientChange(idx, 'quantity', e.target.value)}
                    required
                  />
                  <div>
                    <input
                      type="text"
                      list="units-list"
                      className="form-input"
                      placeholder="Unit"
                      value={ing.unit}
                      onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)}
                      required
                    />
                    <datalist id="units-list">
                      {COMMON_UNITS.map((u) => (
                        <option key={u} value={u} />
                      ))}
                    </datalist>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeIngredientRow(idx)}
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '0.4rem', color: 'var(--danger)' }}
                    disabled={ingredients.length <= 1}
                    title="Remove ingredient"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions Section */}
          <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Instructions *</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                  Numbered step-by-step cooking directions
                </p>
              </div>
              <button
                type="button"
                onClick={addInstructionStep}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <Plus size={15} />
                <span>Add Step</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {instructions.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                  <span
                    style={{
                      width: '1.75rem',
                      height: '1.75rem',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--primary-100)',
                      color: 'var(--primary-700)',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '0.4rem',
                    }}
                  >
                    {idx + 1}
                  </span>
                  <textarea
                    rows={2}
                    className="form-textarea"
                    placeholder={`Describe step ${idx + 1}...`}
                    value={step}
                    onChange={(e) => handleInstructionChange(idx, e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeInstructionStep(idx)}
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '0.4rem', color: 'var(--danger)', marginTop: '0.4rem' }}
                    disabled={instructions.length <= 1}
                    title="Remove step"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Optional Nutrition */}
          <div style={{ padding: '1.25rem', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)', marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Optional Nutrition Information (Per Serving)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>Calories</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="kcal"
                  value={nutrition.calories}
                  onChange={(e) => setNutrition({ ...nutrition, calories: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>Protein (g)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="g"
                  value={nutrition.protein}
                  onChange={(e) => setNutrition({ ...nutrition, protein: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>Carbs (g)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="g"
                  value={nutrition.carbs}
                  onChange={(e) => setNutrition({ ...nutrition, carbs: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>Fat (g)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="g"
                  value={nutrition.fat}
                  onChange={(e) => setNutrition({ ...nutrition, fat: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              <Save size={18} />
              <span>{submitting ? 'Saving Recipe...' : isEdit ? 'Update Recipe' : 'Publish Recipe'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecipeFormPage;
