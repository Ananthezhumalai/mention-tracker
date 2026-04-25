import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBrands, createBrand, deleteBrand } from '../api';
import { Plus, Trash2, ArrowRight } from 'lucide-react';

export default function Brands() {
  const navigate = useNavigate();

  // State variables
  const [brands, setBrands] = useState([]);      // List of all brands
  const [loading, setLoading] = useState(true);   // Show loading text while fetching
  const [showModal, setShowModal] = useState(false); // Show/hide the create brand form

  // Form input values
  const [brandName, setBrandName] = useState('');
  const [brandKeywords, setBrandKeywords] = useState('');

  // Load all brands when the page first opens
  useEffect(() => {
    loadBrands();
  }, []);

  // Fetch brands from the API and update the state
  async function loadBrands() {
    setLoading(true);
    const result = await getBrands();
    setBrands(result);
    setLoading(false);
  }

  // Called when the user submits the "Create Brand" form
  async function handleCreate(event) {
    event.preventDefault(); // Stop page from refreshing on submit

    // Convert the comma-separated keywords string into an array
    // Example: "apple, iphone, ios" → ["apple", "iphone", "ios"]
    const keywordsArray = brandKeywords
      .split(',')
      .map(word => word.trim())
      .filter(word => word !== ''); // Remove empty strings

    await createBrand(brandName, keywordsArray);

    // Reset the form and close the modal
    setBrandName('');
    setBrandKeywords('');
    setShowModal(false);

    // Reload the brands list to show the new brand
    loadBrands();
  }

  // Called when the user clicks the Delete button on a brand card
  async function handleDelete(event, brandId) {
    event.stopPropagation(); // Prevent the click from also opening the brand dashboard

    const confirmed = window.confirm('Delete this brand and all its mentions?');
    if (!confirmed) return;

    await deleteBrand(brandId);
    loadBrands(); // Reload the list to remove deleted brand
  }

  return (
    <div>

      {/* Page header with title and "New Brand" button */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1>Brands</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your tracked brands</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Brand
        </button>
      </div>

      {/* Show loading text while data is being fetched */}
      {loading && <p>Loading brands...</p>}

      {/* Show brand cards once loaded */}
      {!loading && (
        <div className="grid grid-cols-3 gap-6">
          {brands.map(brand => (
            <div
              key={brand._id}
              className="glass-panel"
              style={{ cursor: 'pointer', position: 'relative' }}
              onClick={() => navigate(`/brands/${brand._id}/dashboard`)}
            >
              {/* Delete button - top right corner of each card */}
              <button
                className="btn btn-danger"
                style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.4rem' }}
                onClick={(e) => handleDelete(e, brand._id)}
              >
                <Trash2 size={16} />
              </button>

              {/* Brand name */}
              <h2 style={{ fontSize: '1.25rem' }}>{brand.name}</h2>

              {/* Mention count badge */}
              <div style={{ margin: '1rem 0' }}>
                <span className="tag">{brand.mentionsCount} Mentions</span>
              </div>

              {/* Keywords list */}
              {brand.keywords.length > 0 && (
                <div className="flex" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                  {brand.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="tag"
                      style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}

              {/* "View Dashboard" link */}
              <div className="mt-4 flex items-center gap-2" style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 500 }}>
                View Dashboard <ArrowRight size={16} />
              </div>
            </div>
          ))}

          {/* Show message if no brands exist yet */}
          {brands.length === 0 && (
            <p style={{ color: 'var(--text-muted)', gridColumn: 'span 3' }}>
              No brands yet. Click "New Brand" to get started.
            </p>
          )}
        </div>
      )}

      {/* ── Create Brand Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          {/* Stop clicks inside the modal from closing it */}
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Create New Brand</h2>

            <form onSubmit={handleCreate} className="mt-4">
              <div className="form-group">
                <label>Brand Name</label>
                <input
                  type="text"
                  className="input-control"
                  value={brandName}
                  onChange={e => setBrandName(e.target.value)}
                  placeholder="e.g. Nike"
                  required
                />
              </div>

              <div className="form-group">
                <label>Keywords (comma separated)</label>
                <input
                  type="text"
                  className="input-control"
                  value={brandKeywords}
                  onChange={e => setBrandKeywords(e.target.value)}
                  placeholder="e.g. nike, just do it, swoosh"
                />
              </div>

              <div className="flex gap-4 mt-6">
                <button type="submit" className="btn btn-primary">Create Brand</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
