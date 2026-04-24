import React, { useEffect, useState } from 'react';
import { getDashboard, getBrands } from '../api';
import { useParams, useNavigate } from 'react-router-dom';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Activity, MessageCircle, BarChart3 } from 'lucide-react';

export default function Dashboard() {
  const { brandId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [brand, setBrand] = useState(null);

  useEffect(() => {
    getDashboard(brandId).then(setData);
    getBrands().then(brands => {
      const b = brands.find(br => br._id === brandId);
      if (b) setBrand(b);
    });
  }, [brandId]);

  if (!data || !brand) return <p>Loading...</p>;

  // Chart configs
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#94a3b8' } } },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
    }
  };

  const lineOptions = { ...chartOptions };

  const sentimentData = {
    labels: data.sentimentCounts.map(s => s._id),
    datasets: [{
      data: data.sentimentCounts.map(s => s.count),
      backgroundColor: ['#10b981', '#3b82f6', '#ef4444'],
      borderWidth: 0
    }]
  };

  const sourceData = {
    labels: data.sourceCounts.map(s => s._id),
    datasets: [{
      label: 'Mentions by Source',
      data: data.sourceCounts.map(s => s.count),
      backgroundColor: '#8b5cf6',
      borderRadius: 4
    }]
  };

  const dailyData = {
    labels: data.recentDailyCounts.map(d => d._id),
    datasets: [{
      label: 'Mentions Last 30 Days',
      data: data.recentDailyCounts.map(d => d.count),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1>{brand.name} Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Overview of brand mentions and sentiment</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="glass-panel flex items-center gap-4">
          <div style={{ padding: '1rem', background: 'rgba(59,130,246,0.1)', borderRadius: '0.5rem', color: 'var(--primary)' }}>
            <Activity size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.875rem' }}>Total Mentions</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{data.total}</p>
          </div>
        </div>

        <div className="glass-panel" style={{ gridColumn: 'span 3' }}>
          <h3>Top Tags</h3>
          <div className="flex gap-2 mt-4" style={{ flexWrap: 'wrap' }}>
            {data.topTags.map(t => (
              <span key={t._id} className="tag" style={{ fontSize: '0.875rem' }}>
                {t._id} ({t.count})
              </span>
            ))}
            {data.topTags.length === 0 && <span style={{color: 'var(--text-muted)'}}>No tags found.</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="glass-panel" style={{ height: '350px' }}>
          <h3>Sentiment Breakdown</h3>
          <div style={{ height: 'calc(100% - 30px)' }}>
            {data.sentimentCounts.length > 0 ? (
              <Doughnut data={sentimentData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }} />
            ) : <p style={{color:'var(--text-muted)'}}>No data</p>}
          </div>
        </div>

        <div className="glass-panel" style={{ height: '350px', gridColumn: 'span 2' }}>
          <h3>Mentions over Time</h3>
          <div style={{ height: 'calc(100% - 30px)' }}>
            {data.recentDailyCounts.length > 0 ? (
              <Line data={dailyData} options={lineOptions} />
            ) : <p style={{color:'var(--text-muted)'}}>No data</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 mb-6">
        <div className="glass-panel" style={{ height: '350px' }}>
          <h3>Sources</h3>
          <div style={{ height: 'calc(100% - 30px)' }}>
            {data.sourceCounts.length > 0 ? (
              <Bar data={sourceData} options={chartOptions} />
            ) : <p style={{color:'var(--text-muted)'}}>No data</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
