import React, { useEffect, useState } from 'react';
import { getBrands, createBrand, deleteBrand } from '../api';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowRight } from 'lucide-react';

export default function Brands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // Form State
  const [name, setName] = useState('');
  const [keywords, setKeywords] = useState('');

  const load = () => {
    setLoading(true);
    getBrands().then(data => {
      setBrands(data);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const kws = keywords.split(',').map(k => k.trim()).filter(k => k);
    await createBrand({ name, keywords: kws });
    setShowModal(false);
    setName('');
    setKeywords('');
    load();
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if(confirm('Delete brand and all mentions?')) {
      await deleteBrand(id);
      load();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1>Brands</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your tracked brands</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Brand
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {brands.map(b => (
            <div 
              key={b._id} 
              className="glass-panel" 
              style={{ cursor: 'pointer', position: 'relative' }}
              onClick={() => navigate(`/brands/${b._id}/dashboard`)}
            >
              <button 
                onClick={(e) => handleDelete(e, b._id)}
                className="btn btn-danger"
                style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.4rem' }}
              >
                <Trash2 size={16} />
              </button>
              
              <h2 style={{ fontSize: '1.25rem' }}>{b.name}</h2>
              <div style={{ margin: '1rem 0' }}>
                <span className="tag">{b.mentionsCount} Mentions</span>
              </div>
              
              {b.keywords.length > 0 && (
                <div className="flex" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                  {b.keywords.map((k, i) => <span key={i} className="tag" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>{k}</span>)}
                </div>
              )}

              <div className="mt-4 flex items-center gap-2" style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 500 }}>
                View Dashboard <ArrowRight size={16} />
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Create New Brand</h2>
            <form onSubmit={handleCreate} className="mt-4">
              <div className="form-group">
                <label>Brand Name</label>
                <input 
                  type="text" 
                  className="input-control" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Keywords (comma separated)</label>
                <input 
                  type="text" 
                  className="input-control" 
                  value={keywords} 
                  onChange={e => setKeywords(e.target.value)} 
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button type="submit" className="btn btn-primary">Create</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
