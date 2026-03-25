const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  // Dashboard
  getDashboard: () => request('/dashboard'),

  // Contacts
  getContacts: (search) => request(`/contacts${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getContact: (id) => request(`/contacts/${id}`),
  createContact: (data) => request('/contacts', { method: 'POST', body: JSON.stringify(data) }),
  updateContact: (id, data) => request(`/contacts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteContact: (id) => request(`/contacts/${id}`, { method: 'DELETE' }),

  // Aircraft
  getAircraft: (params) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/aircraft${qs ? `?${qs}` : ''}`);
  },
  getAircraftById: (id) => request(`/aircraft/${id}`),
  createAircraft: (data) => request('/aircraft', { method: 'POST', body: JSON.stringify(data) }),
  updateAircraft: (id, data) => request(`/aircraft/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAircraft: (id) => request(`/aircraft/${id}`, { method: 'DELETE' }),

  // Prospects
  getProspects: (params) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/prospects${qs ? `?${qs}` : ''}`);
  },
  getPipeline: () => request('/prospects/pipeline'),
  getProspect: (id) => request(`/prospects/${id}`),
  createProspect: (data) => request('/prospects', { method: 'POST', body: JSON.stringify(data) }),
  updateProspect: (id, data) => request(`/prospects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProspect: (id) => request(`/prospects/${id}`, { method: 'DELETE' }),

  // Activities
  getActivities: (params) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/activities${qs ? `?${qs}` : ''}`);
  },
  createActivity: (data) => request('/activities', { method: 'POST', body: JSON.stringify(data) }),
  updateActivity: (id, data) => request(`/activities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteActivity: (id) => request(`/activities/${id}`, { method: 'DELETE' }),
};
