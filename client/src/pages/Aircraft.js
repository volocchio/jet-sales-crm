import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { formatCurrency } from '../utils';

export default function Aircraft() {
  const [aircraft, setAircraft] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    make: '', model: '', year: '', serial_number: '', registration: '',
    total_hours: '', price: '', status: 'available', description: '',
  });

  function load() {
    const params = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    api.getAircraft(params).then(setAircraft).catch(console.error).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [search, statusFilter]);

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...formData };
    if (payload.year) payload.year = Number(payload.year);
    if (payload.total_hours) payload.total_hours = Number(payload.total_hours);
    if (payload.price) payload.price = Number(payload.price);
    await api.createAircraft(payload);
    setShowForm(false);
    setFormData({ make: '', model: '', year: '', serial_number: '', registration: '', total_hours: '', price: '', status: 'available', description: '' });
    load();
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Aircraft Inventory</h2>
          <div className="subtitle">{aircraft.length} aircraft in fleet</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Aircraft</button>
      </div>

      <div className="filters" style={{ marginBottom: 16 }}>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input placeholder="Search aircraft..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="reserved">Reserved</option>
          <option value="sold">Sold</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      {loading ? <div className="loading">Loading...</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {aircraft.map(a => (
            <div className="card" key={a.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <h3 style={{ fontSize: 18 }}>{a.make} {a.model}</h3>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{a.year} · {a.registration}</div>
                </div>
                <span className={`badge ${a.status}`}>{a.status}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Serial</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{a.serial_number || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Hours</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{a.total_hours ? a.total_hours.toLocaleString() : '—'}</div>
                </div>
              </div>
              <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)' }}>{a.description}</div>
              <div style={{ marginTop: 12, fontSize: 22, fontWeight: 700, color: 'var(--success)' }}>
                {formatCurrency(a.price)}
              </div>
            </div>
          ))}
          {aircraft.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <div className="icon">🛩️</div>
              <p>No aircraft found</p>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Aircraft</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Make *</label>
                  <input className="form-control" required value={formData.make} onChange={e => setFormData({ ...formData, make: e.target.value })} placeholder="e.g. Gulfstream" />
                </div>
                <div className="form-group">
                  <label>Model *</label>
                  <input className="form-control" required value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} placeholder="e.g. G650ER" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Year</label>
                  <input className="form-control" type="number" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Registration</label>
                  <input className="form-control" value={formData.registration} onChange={e => setFormData({ ...formData, registration: e.target.value })} placeholder="e.g. N650GS" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Serial Number</label>
                  <input className="form-control" value={formData.serial_number} onChange={e => setFormData({ ...formData, serial_number: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Total Hours</label>
                  <input className="form-control" type="number" value={formData.total_hours} onChange={e => setFormData({ ...formData, total_hours: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price ($)</label>
                  <input className="form-control" type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select className="form-control" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="sold">Sold</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Aircraft</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
