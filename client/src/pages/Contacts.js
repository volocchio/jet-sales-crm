import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', phone: '', company: '', title: '', notes: '',
  });

  function load() {
    api.getContacts(search).then(setContacts).catch(console.error).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [search]);

  async function handleSubmit(e) {
    e.preventDefault();
    await api.createContact(formData);
    setShowForm(false);
    setFormData({ first_name: '', last_name: '', email: '', phone: '', company: '', title: '', notes: '' });
    load();
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Contacts</h2>
          <div className="subtitle">{contacts.length} contacts</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ New Contact</button>
      </div>

      <div className="filters" style={{ marginBottom: 16 }}>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? <div className="loading">Loading...</div> : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Title</th>
                  <th>Email</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.first_name} {c.last_name}</td>
                    <td>{c.company || '—'}</td>
                    <td>{c.title || '—'}</td>
                    <td>{c.email ? <a href={`mailto:${c.email}`}>{c.email}</a> : '—'}</td>
                    <td>{c.phone || '—'}</td>
                  </tr>
                ))}
                {contacts.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No contacts found</td></tr>
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
              <h3>New Contact</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input className="form-control" required value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input className="form-control" required value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input className="form-control" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input className="form-control" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Company</label>
                  <input className="form-control" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Title</label>
                  <input className="form-control" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea className="form-control" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Contact</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
