import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Utensils,
  Calendar,
  ShoppingCart,
  Layers,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Heart,
  ChefHat,
} from 'lucide-react';
import { recipeService } from '../services/api';
import RecipeCard from '../components/RecipeCard';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { user } = useAuth();
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await recipeService.getRecipes({ limit: 4 });
        if (res.data.success) {
          setFeaturedRecipes(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load featured recipes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4.5rem', paddingBottom: '3rem' }}>
      {/* Hero Section */}
      <section
        style={{
          background: 'radial-gradient(ellipse at top, #ecfdf5 0%, #f8fafc 70%)',
          padding: '4rem 1rem 3.5rem',
          textAlign: 'center',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="container" style={{ maxWidth: '900px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'white',
              border: '1px solid var(--primary-200)',
              padding: '0.35rem 1rem',
              borderRadius: 'var(--radius-full)',
              color: 'var(--primary-700)',
              fontSize: '0.85rem',
              fontWeight: 700,
              boxShadow: 'var(--shadow-sm)',
              marginBottom: '1.5rem',
            }}
          >
            <Sparkles size={16} />
            <span>Smart Culinary Organization</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              fontWeight: 800,
              color: 'var(--slate-900)',
              marginBottom: '1.25rem',
              letterSpacing: '-0.02em',
            }}
          >
            Plan Your Meals. <br />
            Organize Your Recipes. <br />
            <span style={{ color: 'var(--primary-600)' }}>Shop Smarter.</span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
              color: 'var(--slate-600)',
              lineHeight: 1.6,
              maxWidth: '680px',
              margin: '0 auto 2.25rem',
            }}
          >
            Say goodbye to food waste and stressful dinners. Save delicious recipes, schedule balanced weekly menus with customized servings, and auto-generate combined grocery lists in seconds.
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
            }}
          >
            {user ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                <span>Go to Your Dashboard</span>
                <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  <span>Get Started Free</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to="/recipes" className="btn btn-secondary btn-lg">
                  <span>Explore 15+ Recipes</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Visual Workflow Section */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            How Smart Plate Works
          </h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '1.05rem' }}>
            From kitchen inspiration to the grocery checkout in 4 effortless steps
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {[
            {
              step: '01',
              title: 'Create & Save Recipes',
              desc: 'Store structured ingredients, measurements, and ordered cooking steps with dietary tags.',
              icon: <Utensils size={24} />,
            },
            {
              step: '02',
              title: 'Schedule Your Week',
              desc: 'Assign breakfast, lunch, dinner, and snacks for each day from Monday to Sunday.',
              icon: <Calendar size={24} />,
            },
            {
              step: '03',
              title: 'Adjust Servings',
              desc: 'Cooking for 4 on Tuesday and 2 on Wednesday? Quantities scale automatically.',
              icon: <Layers size={24} />,
            },
            {
              step: '04',
              title: 'Consolidated Shopping',
              desc: 'Duplicate ingredients combine into accurate sums so you buy exactly what you need.',
              icon: <ShoppingCart size={24} />,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="card"
              style={{
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                position: 'relative',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--primary-50)',
                    color: 'var(--primary-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </div>
                <span
                  style={{
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    color: 'var(--slate-200)',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  {item.step}
                </span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{item.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', lineHeight: 1.5 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Recipes Section */}
      <section className="container">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: '2rem',
            gap: '1rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              Fresh Culinary Inspiration
            </h2>
            <p style={{ color: 'var(--slate-500)' }}>
              Handcrafted recipes tested for taste, speed, and balanced nutrition
            </p>
          </div>
          <Link to="/recipes" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>View All Recipes</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="recipe-grid">
          {featuredRecipes.map((recipe) => (
            <RecipeCard key={recipe._id} recipe={recipe} />
          ))}
        </div>
      </section>

      {/* CTA Box */}
      <section className="container">
        <div
          style={{
            background: 'linear-gradient(135deg, var(--slate-900), var(--slate-800))',
            color: 'white',
            borderRadius: 'var(--radius-xl)',
            padding: '3.5rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          <div
            style={{
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(16, 185, 129, 0.2)',
              color: 'var(--primary-400)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChefHat size={32} />
          </div>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'white', maxWidth: '600px' }}>
            Ready to Take Control of Your Weekly Dinners?
          </h2>
          <p style={{ color: 'var(--slate-300)', maxWidth: '540px', lineHeight: 1.6 }}>
            Join Smart Plate today. Organize your kitchen, spend less on groceries, and eat better meals all week long.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg" style={{ marginTop: '0.5rem' }}>
            <span>Create Your Free Account</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
