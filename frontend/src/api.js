// This file contains all the functions that talk to our backend API.
// Every function uses fetch() to make HTTP requests and returns the response as JSON.

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// ─────────────────────────────────────────
// BRAND functions
// ─────────────────────────────────────────

// Get all brands from the database
export async function getBrands() {
  const response = await fetch(`${API_URL}/brands`);
  const data = await response.json();
  return data;
}

// Create a new brand by sending name and keywords
export async function createBrand(name, keywords) {
  const response = await fetch(`${API_URL}/brands`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, keywords })
  });
  const data = await response.json();
  return data;
}

// Update an existing brand's name or keywords
export async function updateBrand(id, name, keywords) {
  const response = await fetch(`${API_URL}/brands/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, keywords })
  });
  const data = await response.json();
  return data;
}

// Delete a brand (also deletes all its mentions on the backend)
export async function deleteBrand(id) {
  const response = await fetch(`${API_URL}/brands/${id}`, {
    method: 'DELETE'
  });
  const data = await response.json();
  return data;
}

// ─────────────────────────────────────────
// MENTION functions
// ─────────────────────────────────────────

// Get mentions for a brand, with optional filters and pagination
// filters = { source, sentiment, tag, search, page, limit }
export async function getMentions(brandId, filters) {
  // Build the URL query string from the filters object
  const params = new URLSearchParams();
  params.set('brandId', brandId);

  if (filters.source)    params.set('source', filters.source);
  if (filters.sentiment) params.set('sentiment', filters.sentiment);
  if (filters.tag)       params.set('tag', filters.tag);
  if (filters.search)    params.set('search', filters.search);
  if (filters.page)      params.set('page', filters.page);
  if (filters.limit)     params.set('limit', filters.limit);

  const response = await fetch(`${API_URL}/mentions?${params.toString()}`);
  const data = await response.json();
  return data;
  // Returns: { mentions: [...], total: number, page: number, pages: number }
}

// Get dashboard stats for a brand (totals, charts data)
export async function getDashboard(brandId) {
  const response = await fetch(`${API_URL}/mentions/dashboard?brandId=${brandId}`);
  const data = await response.json();
  return data;
  // Returns: { total, sentimentCounts, sourceCounts, topTags, recentDailyCounts }
}

// Create a single mention manually
export async function createMention(mentionData) {
  const response = await fetch(`${API_URL}/mentions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mentionData)
  });
  const data = await response.json();
  return data;
}

// Delete a mention by its ID
export async function deleteMention(id) {
  const response = await fetch(`${API_URL}/mentions/${id}`, {
    method: 'DELETE'
  });
  const data = await response.json();
  return data;
}

// Update a mention (e.g. change sentiment or tags)
export async function updateMention(id, updatedFields) {
  const response = await fetch(`${API_URL}/mentions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedFields)
  });
  const data = await response.json();
  return data;
}

// Bulk upload mentions from a CSV or JSON file
export async function bulkUploadFile(brandId, file) {
  // FormData is used when sending a file — not regular JSON
  const formData = new FormData();
  formData.append('brandId', brandId);
  formData.append('file', file);

  const response = await fetch(`${API_URL}/mentions/bulk`, {
    method: 'POST',
    body: formData
    // Note: Do NOT set Content-Type header here — the browser sets it automatically for FormData
  });
  const data = await response.json();
  return data;
  // Returns: { added: number, skipped: number, failed: number }
}

// ─────────────────────────────────────────
// SAVED VIEW functions
// ─────────────────────────────────────────

// Get all saved views for a brand
export async function getSavedViews(brandId) {
  const response = await fetch(`${API_URL}/views?brandId=${brandId}`);
  const data = await response.json();
  return data;
}

// Save a new filter combination with a name
export async function createSavedView(brandId, name, filters) {
  const response = await fetch(`${API_URL}/views`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ brandId, name, filters })
  });
  const data = await response.json();
  return data;
}

// Delete a saved view by ID
export async function deleteSavedView(id) {
  const response = await fetch(`${API_URL}/views/${id}`, {
    method: 'DELETE'
  });
  const data = await response.json();
  return data;
}
