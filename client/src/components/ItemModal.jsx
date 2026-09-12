import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2 } from 'lucide-react';

const COMMON_UNITS = ['pieces', 'cups', 'tbsp', 'tsp', 'g', 'kg', 'ml', 'l', 'cans', 'slices', 'bunches', 'cloves', 'oz', 'lb'];

const ItemModal = ({ isOpen, onClose, onSave, itemToEdit = null }) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pieces');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        setName(itemToEdit.name || '');
        setQuantity(itemToEdit.quantity?.toString() || '1');
        setUnit(itemToEdit.unit || 'pieces');
      } else {
        setName('');
        setQuantity('1');
        setUnit('pieces');
      }
      setError('');
    }
  }, [isOpen, itemToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Item name is required');
      return;
    }
    const numQty = parseFloat(quantity);
    if (isNaN(numQty) || numQty <= 0) {
      setError('Quantity must be a positive number');
      return;
    }
    if (!unit.trim()) {
      setError('Unit is required');
      return;
    }

    onSave({
      name: name.trim(),
      quantity: numQty,
      unit: unit.trim(),
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--primary-100)',
                color: 'var(--primary-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {itemToEdit ? <Edit2 size={16} /> : <Plus size={16} />}
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
              {itemToEdit ? 'Edit Grocery Item' : 'Add Grocery Item'}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '0.5rem 0.75rem',
              background: 'var(--danger-light)',
              color: 'var(--danger)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.825rem',
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Item Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Greek Yogurt, Olive Oil"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input
                type="number"
                step="any"
                min="0.01"
                className="form-input"
                placeholder="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Unit *</label>
              <input
                type="text"
                list="common-units"
                className="form-input"
                placeholder="pieces, cups, etc."
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
              <datalist id="common-units">
                {COMMON_UNITS.map((u) => (
                  <option key={u} value={u} />
                ))}
              </datalist>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              {itemToEdit ? 'Update Item' : 'Add to List'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemModal;
