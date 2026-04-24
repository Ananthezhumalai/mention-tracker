const API_URL = 'http://localhost:5000/api';

export const getBrands = async () => {
  const res = await fetch(`${API_URL}/brands`);
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
};

export const createBrand = async (data) => {
  const res = await fetch(`${API_URL}/brands`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const deleteBrand = async (id) => {
  const res = await fetch(`${API_URL}/brands/${id}`, { method: 'DELETE' });
  return res.json();
};

export const getDashboard = async (brandId) => {
  const res = await fetch(`${API_URL}/mentions/dashboard?brandId=${brandId}`);
  return res.json();
};

export const getMentions = async (brandId, filterParams = {}) => {
  const q = new URLSearchParams({ brandId, ...filterParams });
  const res = await fetch(`${API_URL}/mentions?${q.toString()}`);
  return res.json();
};

export const uploadMentionsCsv = async (brandId, file) => {
  const formData = new FormData();
  formData.append('brandId', brandId);
  formData.append('file', file);
  
  const res = await fetch(`${API_URL}/mentions/bulk`, {
    method: 'POST',
    body: formData
  });
  return res.json();
};

export const createMention = async (data) => {
  const res = await fetch(`${API_URL}/mentions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const deleteMention = async (id) => {
  const res = await fetch(`${API_URL}/mentions/${id}`, { method: 'DELETE' });
  return res.json();
};

export const getViews = async (brandId) => {
  const res = await fetch(`${API_URL}/views?brandId=${brandId}`);
  return res.json();
};

export const createView = async (data) => {
  const res = await fetch(`${API_URL}/views`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};
