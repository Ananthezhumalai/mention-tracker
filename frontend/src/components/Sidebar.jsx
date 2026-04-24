import React, { useEffect, useState } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { getBrands } from '../api';
import { LayoutDashboard, MessageSquareText, Home, Target } from 'lucide-react';

export default function Sidebar() {
  const { brandId } = useParams();
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [currentBrand, setCurrentBrand] = useState(null);

  useEffect(() => {
    getBrands().then(data => {
      setBrands(data);
      if (brandId) {
        const found = data.find(b => b._id === brandId);
        if (found) setCurrentBrand(found);
      }
    });
  }, [brandId]);

  return (
    <div className="sidebar">
      <div className="flex items-center gap-2 mb-8" style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.25rem' }}>
        <Target size={24} /> MentionTracker
      </div>

      <div className="mb-6">
        <NavLink to="/" className="flex items-center gap-2 mb-4" style={({isActive}) => ({ color: isActive && !brandId ? 'white' : 'var(--text-muted)' })}>
          <Home size={20} /> All Brands
        </NavLink>

        {currentBrand && (
          <div className="glass-panel" style={{ padding: '1rem', marginTop: '1rem' }}>
            <h3 style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>{currentBrand.name}</h3>
            
            <NavLink 
              to={`/brands/${brandId}/dashboard`}
              className="flex items-center gap-2 mb-3"
              style={({isActive}) => ({ color: isActive ? 'var(--primary)' : 'var(--text-muted)' })}
            >
              <LayoutDashboard size={18} /> Dashboard
            </NavLink>

            <NavLink 
              to={`/brands/${brandId}/mentions`}
              className="flex items-center gap-2"
              style={({isActive}) => ({ color: isActive ? 'var(--primary)' : 'var(--text-muted)' })}
            >
              <MessageSquareText size={18} /> Mentions
            </NavLink>
          </div>
        )}
      </div>

      {brands.length > 0 && !currentBrand && (
        <div>
          <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Recent Brands</h3>
          <ul className="mt-4 gap-2 flex flex-col">
            {brands.slice(0, 5).map(b => (
              <li key={b._id}>
                <NavLink 
                  to={`/brands/${b._id}/dashboard`}
                  style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}
                >
                  {b.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
