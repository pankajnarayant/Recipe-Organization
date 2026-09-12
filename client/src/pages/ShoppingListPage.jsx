import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  CheckCircle2,
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  Sparkles,
  Calendar,
  Share2,
  Copy,
  Check,
} from 'lucide-react';
import { shoppingListService } from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ItemModal from '../components/ItemModal';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';

const ShoppingListPage = () => {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, purchased: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  // Filter tab: 'all' | 'pending' | 'purchased'
  const [filterTab, setFilterTab] = useState('all');

  // Modals state
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [clearPurchasedOpen, setClearPurchasedOpen] = useState(false);
  const [clearAllOpen, setClearAllOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchShoppingList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await shoppingListService.getList();
      if (res.data.success) {
        setItems(res.data.data);
        setStats(res.data.stats || { total: 0, purchased: 0, pending: 0 });
      }
    } catch (err) {
      console.error('Failed to load shopping list:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShoppingList();
  }, [fetchShoppingList]);

  // Toggle purchased
  const handleTogglePurchased = async (item) => {
    try {
      const res = await shoppingListService.togglePurchased(item._id);
      if (res.data.success) {
        setItems((prev) =>
          prev.map((i) => (i._id === item._id ? { ...i, purchased: !i.purchased } : i))
        );
        setStats((prev) => {
          const wasPurchased = item.purchased;
          return {
            ...prev,
            purchased: wasPurchased ? prev.purchased - 1 : prev.purchased + 1,
            pending: wasPurchased ? prev.pending + 1 : prev.pending - 1,
          };
        });
      }
    } catch (err) {
      showToast(err.message || 'Failed to update item', 'error');
    }
  };

  // Delete item
  const handleDeleteItem = async (id, e) => {
    e.stopPropagation();
    try {
      await shoppingListService.deleteItem(id);
      setItems((prev) => prev.filter((i) => i._id !== id));
      showToast('Item removed', 'info');
      fetchShoppingList();
    } catch (err) {
      showToast(err.message || 'Failed to remove item', 'error');
    }
  };

  // Save item (Create or Update)
  const handleSaveItem = async (data) => {
    try {
      if (itemToEdit) {
        const res = await shoppingListService.updateItem(itemToEdit._id, data);
        showToast('Item updated', 'success');
      } else {
        const res = await shoppingListService.addManualItem(data);
        showToast('Item added to grocery list', 'success');
      }
      fetchShoppingList();
    } catch (err) {
      showToast(err.message || 'Failed to save item', 'error');
    }
  };

  // Clear purchased
  const handleClearPurchased = async () => {
    try {
      const res = await shoppingListService.clearPurchased();
      showToast(res.data.message || 'Purchased items cleared', 'info');
      setClearPurchasedOpen(false);
      fetchShoppingList();
    } catch (err) {
      showToast(err.message || 'Failed to clear purchased items', 'error');
    }
  };

  // Clear all
  const handleClearAll = async () => {
    try {
      const res = await shoppingListService.clearAll();
      showToast(res.data.message || 'Shopping list cleared', 'info');
      setClearAllOpen(false);
      fetchShoppingList();
    } catch (err) {
      showToast(err.message || 'Failed to clear list', 'error');
    }
  };

  // Copy list to clipboard
  const handleCopyList = () => {
    const textLines = items.map(
      (item) => `${item.purchased ? '[x]' : '[ ]'} ${item.name} — ${item.quantity} ${item.unit}`
    );
    const content = `Smart Plate Grocery List:\n\n` + textLines.join('\n');
    navigator.clipboard.writeText(content);
    setCopied(true);
    showToast('Grocery list copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const filteredItems = items.filter((item) => {
    if (filterTab === 'pending') return !item.purchased;
    if (filterTab === 'purchased') return item.purchased;
    return true;
  });

  const progressPercent = stats.total > 0 ? Math.round((stats.purchased / stats.total) * 100) : 0;

  return (
    <div className="container" style={{ maxWidth: '820px', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header and Quick Buttons */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <ShoppingCart size={24} style={{ color: 'var(--primary-600)' }} />
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800 }}>Smart Grocery List</h1>
          </div>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
            Consolidated ingredients automatically aggregated from your weekly meal plan
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setItemToEdit(null);
              setItemModalOpen(true);
            }}
          >
            <Plus size={16} />
            <span>Add Item</span>
          </button>

          {items.length > 0 && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleCopyList}
              title="Copy List to Clipboard"
            >
              {copied ? <Check size={16} style={{ color: 'var(--primary-600)' }} /> : <Copy size={16} />}
              <span>{copied ? 'Copied' : 'Copy List'}</span>
            </button>
          )}

          <Link to="/planner" className="btn btn-primary btn-sm">
            <Calendar size={16} />
            <span>From Planner</span>
          </Link>
        </div>
      </div>

      {/* Progress & Stats Card */}
      {stats.total > 0 && (
        <div className="card" style={{ padding: '1.25rem 1.5rem', background: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--slate-800)' }}>
                {stats.purchased} of {stats.total} items purchased
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginLeft: '0.5rem' }}>
                ({stats.pending} remaining)
              </span>
            </div>
            <span style={{ fontWeight: 800, color: 'var(--primary-700)', fontSize: '1rem' }}>
              {progressPercent}%
            </span>
          </div>

          {/* Progress Bar */}
          <div
            style={{
              width: '100%',
              height: '8px',
              background: 'var(--slate-100)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--primary-500), var(--primary-600))',
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      )}

      {/* Main Shopping List Card */}
      <div className="card" style={{ padding: '1.5rem' }}>
        {/* Filter Tabs & Bulk Actions */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              type="button"
              className={`filter-pill ${filterTab === 'all' ? 'active' : ''}`}
              onClick={() => setFilterTab('all')}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              All ({stats.total})
            </button>
            <button
              type="button"
              className={`filter-pill ${filterTab === 'pending' ? 'active' : ''}`}
              onClick={() => setFilterTab('pending')}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              To Buy ({stats.pending})
            </button>
            <button
              type="button"
              className={`filter-pill ${filterTab === 'purchased' ? 'active' : ''}`}
              onClick={() => setFilterTab('purchased')}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              Purchased ({stats.purchased})
            </button>
          </div>

          {items.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {stats.purchased > 0 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setClearPurchasedOpen(true)}
                  style={{ fontSize: '0.8rem', color: 'var(--danger)' }}
                >
                  Clear Purchased
                </button>
              )}
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setClearAllOpen(true)}
                style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* List of Items */}
        {loading ? (
          <LoadingSpinner fullPage={false} text="Loading grocery list..." />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon="shopping"
            title={items.length === 0 ? 'Your shopping list is empty' : 'No items match this filter'}
            description={
              items.length === 0
                ? 'Generate a list from your Weekly Meal Plan, or manually add items to buy.'
                : 'Switch tabs above to view all items.'
            }
            actionText={items.length === 0 ? 'Go to Meal Planner' : undefined}
            actionLink={items.length === 0 ? '/planner' : undefined}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className="shopping-item-row"
                style={{ cursor: 'pointer' }}
                onClick={() => handleTogglePurchased(item)}
              >
                <div className="shopping-item-left">
                  <input
                    type="checkbox"
                    className="shopping-checkbox"
                    checked={item.purchased}
                    onChange={() => {}} // handled by row click
                    onClick={(e) => e.stopPropagation()}
                  />

                  <div>
                    <span
                      className={`shopping-item-name ${item.purchased ? 'purchased' : ''}`}
                    >
                      {item.name}
                    </span>
                    {item.source === 'manual' && (
                      <span
                        className="badge badge-slate"
                        style={{ fontSize: '0.65rem', marginLeft: '0.5rem', verticalAlign: 'middle' }}
                      >
                        manual
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="shopping-item-qty">
                    {item.quantity} {item.unit}
                  </span>

                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '0.25rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setItemToEdit(item);
                      setItemModalOpen(true);
                    }}
                    title="Edit item"
                  >
                    <Edit2 size={14} />
                  </button>

                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '0.25rem', color: 'var(--danger)' }}
                    onClick={(e) => handleDeleteItem(item._id, e)}
                    title="Delete item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Item Modal */}
      <ItemModal
        isOpen={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        onSave={handleSaveItem}
        itemToEdit={itemToEdit}
      />

      {/* Clear Purchased Confirm */}
      <ConfirmModal
        isOpen={clearPurchasedOpen}
        title="Clear Purchased Items"
        message="Are you sure you want to remove all items marked as purchased?"
        confirmText="Remove Purchased"
        onConfirm={handleClearPurchased}
        onCancel={() => setClearPurchasedOpen(false)}
      />

      {/* Clear All Confirm */}
      <ConfirmModal
        isOpen={clearAllOpen}
        title="Clear Entire Shopping List"
        message="Are you sure you want to remove all grocery items from your list?"
        confirmText="Clear All"
        onConfirm={handleClearAll}
        onCancel={() => setClearAllOpen(false)}
      />
    </div>
  );
};

export default ShoppingListPage;
