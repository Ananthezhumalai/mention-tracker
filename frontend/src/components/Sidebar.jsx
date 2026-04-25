import React, { useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { getBrands } from '../api';
import { LayoutDashboard, MessageSquareText, Home, Target } from 'lucide-react';

export default function Sidebar() {
  // Get the brandId from the URL (e.g. /brands/abc123/dashboard → brandId = "abc123")
  const { brandId } = useParams();

  const [brands, setBrands] = useState([]);
  const [currentBrand, setCurrentBrand] = useState(null);

  // Load all brands when the page opens or when brandId changes
  useEffect(() => {
    async function loadBrands() {
      const allBrands = await getBrands();
      setBrands(allBrands);

      // If we are on a brand page, find and save the current brand info
      if (brandId) {
        const found = allBrands.find(b => b._id === brandId);
        if (found) {
          setCurrentBrand(found);
        }
      } else {
        setCurrentBrand(null);
      }
    }
    loadBrands();
  }, [brandId]);

  return (
    <div className="sidebar">

      {/* App logo / title */}
      <div className="flex items-center gap-2 mb-8" style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.25rem' }}>
        <Target size={24} /> MentionTracker
      </div>

      {/* Link back to the main brands list */}
      <NavLink
        to="/"
        className="flex items-center gap-2 mb-6"
        style={({ isActive }) => ({ color: isActive && !brandId ? 'white' : 'var(--text-muted)' })}
      >
        <Home size={20} /> All Brands
      </NavLink>

      {/* If we are inside a brand, show Dashboard and Mentions links */}
      {currentBrand && (
        <div className="glass-panel" style={{ padding: '1rem' }}>
          <h3 style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>{currentBrand.name}</h3>

          <NavLink
            to={`/brands/${brandId}/dashboard`}
            className="flex items-center gap-2 mb-3"
            style={({ isActive }) => ({ color: isActive ? 'var(--primary)' : 'var(--text-muted)' })}
          >
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>

          <NavLink
            to={`/brands/${brandId}/mentions`}
            className="flex items-center gap-2"
            style={({ isActive }) => ({ color: isActive ? 'var(--primary)' : 'var(--text-muted)' })}
          >
            <MessageSquareText size={18} /> Mentions
          </NavLink>
        </div>
      )}

      {/* If we are on the home page, show a quick list of brands */}
      {!currentBrand && brands.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Brands</h3>
          <ul style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
