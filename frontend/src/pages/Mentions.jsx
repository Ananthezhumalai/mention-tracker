import React, { useEffect, useState, useRef } from 'react';
import { getMentions, createMention, deleteMention, uploadMentionsCsv, getViews, createView, getBrands, deleteSavedView } from '../api';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Search, Filter, Download, Upload, Plus, Save, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Mentions() {
  const { brandId } = useParams();
  const [brand, setBrand] = useState(null);
  const [mentions, setMentions] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [source, setSource] = useState('');
  const [sentiment, setSentiment] = useState('');
  const [tag, setTag] = useState('');
  const [search, setSearch] = useState('');
  
  const [views, setViews] = useState([]);
  
  // Modals
  const [showImport, setShowImport] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showSaveView, setShowSaveView] = useState(false);
  
  // File upload state
  const [file, setFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  
  // New mention form
  const [newMention, setNewMention] = useState({
    source: 'twitter', author: '', body: '', url: '', sentiment: 'neutral', tags: ''
  });

  const fileInputRef = useRef();

  const loadMentions = async () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (source) params.source = source;
    if (sentiment) params.sentiment = sentiment;
    if (tag) params.tag = tag;
    if (search) params.search = search;
    
    try {
      const data = await getMentions(brandId, params);
      setMentions(data.mentions);
      setTotal(data.total);
      setPages(data.pages);
    } catch(err) { console.error(err); }
    setLoading(false);
  };

  const loadViews = async () => {
    try {
      const data = await getViews(brandId);
      setViews(data);
    } catch(err) {}
  };

  useEffect(() => {
    getBrands().then(brands => {
      const b = brands.find(br => br._id === brandId);
      if (b) setBrand(b);
    });
    loadViews();
  }, [brandId]);

  useEffect(() => {
    loadMentions();
  }, [brandId, page, source, sentiment, tag]);

  // Handle Search input with debounce or just on Enter
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadMentions();
  };

  const applyView = (v) => {
    setSource(v.filters?.source?.join(',') || '');
    setSentiment(v.filters?.sentiment?.join(',') || '');
    setTag(v.filters?.tags?.join(',') || '');
    setSearch(v.filters?.search || '');
    setPage(1);
    setTimeout(loadMentions, 0); // Need to wait for states to flush, or just let useEffect handle it if we trigger it
  };

  const deleteView = async (id) => {
    await deleteSavedView(id);
    loadViews();
  }

  const handleSaveViewSubmit = async (e) => {
    e.preventDefault();
    const name = e.target.viewName.value;
    const viewData = {
      brandId, name,
      filters: { 
        source: source ? source.split(',') : [],
        sentiment: sentiment ? sentiment.split(',') : [],
        tags: tag ? tag.split(',') : [],
        search
      }
    };
    await createView(viewData);
    setShowSaveView(false);
    loadViews();
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) return;
    const res = await uploadMentionsCsv(brandId, file);
    setUploadResult(res);
    loadMentions();
  };

  const handleCreateMention = async (e) => {
    e.preventDefault();
    await createMention({
      ...newMention,
      brandId,
      postedAt: new Date(),
      tags: newMention.tags.split(',').map(t=>t.trim()).filter(t=>t)
    });
    setShowNew(false);
    loadMentions();
  };

  const handleDelete = async (id) => {
    if(confirm('Delete this mention?')) {
      await deleteMention(id);
      loadMentions();
    }
  };

  const exportCSV = () => {
    if (mentions.length === 0) return;
    const headers = ['Source', 'Author', 'Body', 'URL', 'Sentiment', 'Tags', 'Posted At'];
    const rows = mentions.map(m => [
      m.source, m.author, `"${m.body.replace(/"/g, '""')}"`, m.url, m.sentiment, m.tags.join(';'), m.postedAt
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mentions_export.csv`;
    a.click();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1>Mentions</h1>
          {brand && <p style={{ color: 'var(--text-muted)' }}>{brand.name}</p>}
        </div>
        <div className="flex gap-4">
          <button className="btn btn-secondary" onClick={exportCSV}><Download size={16}/> Export CSV</button>
          <button className="btn btn-secondary" onClick={() => setShowImport(true)}><Upload size={16}/> Bulk Import</button>
          <button className="btn btn-primary" onClick={() => setShowNew(true)}><Plus size={16}/> New Mention</button>
        </div>
      </div>

      <div className="glass-panel mb-6 flex flex-col gap-4">
        <form onSubmit={handleSearch} className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search size={18} style={{position:'absolute', top:'0.9rem', left:'1rem', color:'var(--text-muted)'}} />
            <input 
              type="text" className="input-control" 
              style={{paddingLeft: '2.5rem'}}
              placeholder="Search mention text..." 
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="input-control w-auto" value={source} onChange={e => setSource(e.target.value)}>
            <option value="">All Sources</option>
            <option value="twitter">Twitter</option>
            <option value="instagram">Instagram</option>
            <option value="reddit">Reddit</option>
            <option value="news">News</option>
          </select>
          <select className="input-control w-auto" value={sentiment} onChange={e => setSentiment(e.target.value)}>
            <option value="">All Sentiments</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>
          <input 
            type="text" className="input-control w-auto" 
            placeholder="Tag (e.g. bug)" 
            value={tag} onChange={e => setTag(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary">Search</button>
          <button type="button" className="btn btn-secondary" onClick={() => setShowSaveView(true)}>
            <Save size={16} /> Save View
          </button>
        </form>

        {views.length > 0 && (
          <div className="flex gap-2 items-center flex-wrap pt-4" style={{borderTop: '1px solid var(--border)'}}>
            <span style={{color:'var(--text-muted)', fontSize:'0.875rem'}}><Filter size={14} className="inline mr-1"/> Saved Views:</span>
            {views.map(v => (
              <div key={v._id} className="tag flex items-center gap-1 cursor-pointer" style={{background: 'rgba(255,255,255,0.1)'}} onClick={() => applyView(v)}>
                {v.name}
                <button onClick={(e) => { e.stopPropagation(); deleteView(v._id); }} style={{background:'transparent', border:'none', color:'var(--text-muted)', cursor:'pointer'}}>
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-panel" style={{padding: 0, overflow: 'hidden'}}>
        <div className="table-container">
          {loading ? (
            <div style={{padding:'2rem', textAlign:'center'}}>Loading...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Platform & Date</th>
                  <th>Mention Content</th>
                  <th>Sentiment</th>
                  <th>Tags</th>
                  <th style={{textAlign: 'right'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mentions.map(m => (
                  <tr key={m._id}>
                    <td style={{width: '150px'}}>
                      <div style={{fontWeight: 600, textTransform: 'capitalize'}}>{m.source}</div>
                      <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>{format(new Date(m.postedAt), 'MMM d, yyyy')}</div>
                    </td>
                    <td>
                      <div style={{fontWeight: 500, marginBottom: '0.25rem'}}>{m.author}</div>
                      <div style={{fontSize: '0.875rem', color: 'var(--text-muted)'}}>{m.body}</div>
                      {m.url && <a href={m.url} target="_blank" rel="noreferrer" style={{fontSize: '0.75rem', color: 'var(--primary)'}}>Link</a>}
                    </td>
                    <td style={{width:'100px'}}>
                      <span className={`tag sentiment-${m.sentiment}`}>{m.sentiment}</span>
                    </td>
                    <td style={{width:'200px'}}>
                      <div className="flex" style={{flexWrap:'wrap', gap:'0.25rem'}}>
                        {m.tags.map((t, i) => <span key={i} className="tag">{t}</span>)}
                      </div>
                    </td>
                    <td style={{textAlign: 'right', width: '100px'}}>
                      <button className="btn btn-danger" style={{padding:'0.4rem'}} onClick={() => handleDelete(m._id)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {mentions.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{textAlign:'center', padding:'2rem', color:'var(--text-muted)'}}>No mentions found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination */}
        <div className="flex justify-between items-center" style={{padding: '1rem', borderTop: '1px solid var(--border)'}}>
          <div style={{fontSize: '0.875rem', color: 'var(--text-muted)'}}>
            Showing page {page} of {pages} ({total} total)
          </div>
          <div className="flex gap-2">
            <button className="btn btn-secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft size={16} /> Prev
            </button>
            <button className="btn btn-secondary" disabled={page === pages || pages === 0} onClick={() => setPage(page + 1)}>
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modals here */}
      {showImport && (
        <div className="modal-overlay" onClick={() => setShowImport(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Bulk Import</h2>
            <p style={{color:'var(--text-muted)', marginBottom:'1rem'}}>Upload a CSV or JSON file.</p>
            <form onSubmit={handleImport}>
              <div className="form-group">
                <input type="file" ref={fileInputRef} className="input-control" accept=".csv,.json" onChange={e => setFile(e.target.files[0])} />
              </div>
              <div className="flex gap-4 mt-6">
                <button type="submit" className="btn btn-primary" disabled={!file}>Upload</button>
                <button type="button" className="btn btn-secondary" onClick={() => {setShowImport(false); setUploadResult(null);}}>Close</button>
              </div>
            </form>
            {uploadResult && (
              <div className="mt-4 p-4" style={{background:'rgba(255,255,255,0.05)', borderRadius:'0.5rem', fontSize:'0.875rem'}}>
                <p>Added: {uploadResult.added}</p>
                <p>Skipped (Duplicates): {uploadResult.skipped}</p>
                <p>Failed: {uploadResult.failed}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showSaveView && (
        <div className="modal-overlay" onClick={() => setShowSaveView(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Save View</h2>
            <form onSubmit={handleSaveViewSubmit} className="mt-4">
              <div className="form-group">
                <label>View Name</label>
                <input type="text" name="viewName" className="input-control" required placeholder="e.g. Negative Twitter Mentions" />
              </div>
              <div className="flex gap-4 mt-6">
                <button type="submit" className="btn btn-primary">Save View</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowSaveView(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showNew && (
        <div className="modal-overlay" onClick={() => setShowNew(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>New Mention</h2>
            <form onSubmit={handleCreateMention} className="mt-4">
              <div className="form-group">
                <label>Source</label>
                <select className="input-control" value={newMention.source} onChange={e => setNewMention({...newMention, source: e.target.value})}>
                  <option value="twitter">Twitter</option><option value="instagram">Instagram</option>
                  <option value="reddit">Reddit</option><option value="news">News</option>
                </select>
              </div>
              <div className="form-group">
                <label>Author</label>
                <input type="text" className="input-control" required value={newMention.author} onChange={e => setNewMention({...newMention, author: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Body</label>
                <textarea className="input-control" required rows={3} value={newMention.body} onChange={e => setNewMention({...newMention, body: e.target.value})}></textarea>
              </div>
              <div className="form-group">
                <label>URL (used for deduplication)</label>
                <input type="url" className="input-control" required value={newMention.url} onChange={e => setNewMention({...newMention, url: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label>Sentiment</label>
                  <select className="input-control" value={newMention.sentiment} onChange={e => setNewMention({...newMention, sentiment: e.target.value})}>
                    <option value="positive">Positive</option><option value="neutral">Neutral</option><option value="negative">Negative</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Tags</label>
                  <input type="text" className="input-control" placeholder="bug, issue" value={newMention.tags} onChange={e => setNewMention({...newMention, tags: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button type="submit" className="btn btn-primary">Create</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
