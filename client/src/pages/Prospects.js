import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { formatCurrency, formatDate, stageLabels } from '../utils';

export default function Prospects() {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [aircraft, setAircraft] = useState([]);
  const [formData, setFormData] = useState({
    contact_id: '', aircraft_id: '', stage: 'inquiry', source: '', budget_min: '', budget_max: '',
    priority: 'medium', assigned_to: '', expected_close_date: '', notes: '',
  });

  function load() {
    const params = {};
    if (search) params.search = search;
    if (stageFilter) params.stage = stageFilter;
    if (priorityFilter) params.priority = priorityFilter;
    api.getProspects(params).then(setProspects).catch(console.error).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [search, stageFilter, priorityFilter]);

  function openForm() {
    Promise.all([api.getContacts(), api.getAircraft()]).then(([c, a]) => {
      setContacts(c);
      setAircraft(a);
      setShowForm(true);
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...formData };
    if (payload.budget_min) payload.budget_min = Number(payload.budget_min);
    if (payload.budget_max) payload.budget_max = Number(payload.budget_max);
    await api.createProspect(payload);
    setShowForm(false);
    setFormData({ contact_id: '', aircraft_id: '', stage: 'inquiry', source: '', budget_min: '', budget_max: '', priority: 'medium', assigned_to: '', expected_close_date: '', notes: '' });
    load();
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Prospects</h2>
          <div className="subtitle">{prospects.length} prospects tracked</div>
        </div>
        <button className="btn btn-primary" onClick={openForm}>+ New Prospect</button>
      </div>

      <div className="filters" style={{ marginBottom: 16 }}>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input placeholder="Search prospects..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={stageFilter} onChange={e => setStageFilter(e.target.value)}>
          <option value="">All Stages</option>
          {Object.entries(stageLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {loading ? <div className="loading">Loading...</div> : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Contact</th>
                  <th>Company</th>
                  <th>Aircraft</th>
                  <th>Stage</th>
                  <th>Priority</th>
                  <th>Budget Range</th>
                  <th>Assigned To</th>
                  <th>Close Date</th>
                </tr>
              </thead>
              <tbody>
                {prospects.map(p => (
                  <tr key={p.id}>
                    <td><Link to={`/prospects/${p.id}`} style={{ fontWeight: 600 }}>{p.contact_name}</Link></td>
                    <td>{p.contact_company || '—'}</td>
                    <td>{p.aircraft_name || '—'}</td>
                    <td><span className={`badge ${p.stage}`}>{stageLabels[p.stage]}</span></td>
                    <td><span className={`badge ${p.priority}`}>{p.priority}</span></td>
                    <td>{p.budget_min || p.budget_max ? `${formatCurrency(p.budget_min)} – ${formatCurrency(p.budget_max)}` : '—'}</td>
                    <td>{p.assigned_to || '—'}</td>
                    <td>{formatDate(p.expected_close_date)}</td>
                  </tr>
                ))}
                {prospects.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No prospects found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Prospect</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Contact *</label>
                <select className="form-control" required value={formData.contact_id} onChange={e => setFormData({ ...formData, contact_id: e.target.value })}>
                  <option value="">Select contact...</option>
                  {contacts.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name} — {c.company}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Aircraft Interest</label>
                <select className="form-control" value={formData.aircraft_id} onChange={e => setFormData({ ...formData, aircraft_id: e.target.value })}>
                  <option value="">Select aircraft...</option>
                  {aircraft.map(a => <option key={a.id} value={a.id}>{a.make} {a.model} ({a.registration}) — {formatCurrency(a.price)}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Stage</label>
                  <select className="form-control" value={formData.stage} onChange={e => setFormData({ ...formData, stage: e.target.value })}>
                    {Object.entries(stageLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select className="form-control" value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Budget Min ($)</label>
                  <input className="form-control" type="number" value={formData.budget_min} onChange={e => setFormData({ ...formData, budget_min: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Budget Max ($)</label>
                  <input className="form-control" type="number" value={formData.budget_max} onChange={e => setFormData({ ...formData, budget_max: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Source</label>
                  <select className="form-control" value={formData.source} onChange={e => setFormData({ ...formData, source: e.target.value })}>
                    <option value="">Select...</option>
                    <option value="referral">Referral</option>
                    <option value="website">Website</option>
                    <option value="trade_show">Trade Show</option>
                    <option value="cold_call">Cold Call</option>
                    <option value="advertising">Advertising</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Assigned To</label>
                  <input className="form-control" value={formData.assigned_to} onChange={e => setFormData({ ...formData, assigned_to: e.target.value })} placeholder="Sales rep name" />
                </div>
              </div>
              <div className="form-group">
                <label>Expected Close Date</label>
                <input className="form-control" type="date" value={formData.expected_close_date} onChange={e => setFormData({ ...formData, expected_close_date: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea className="form-control" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Prospect</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
