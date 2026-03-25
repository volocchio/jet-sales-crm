import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { formatCurrency, formatDate, formatDateTime, activityIcons, stageLabels } from '../utils';

export default function ProspectDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [prospect, setProspect] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activityForm, setActivityForm] = useState({ type: 'call', subject: '', description: '', scheduled_at: '' });

  function load() {
    api.getProspect(id).then(p => { setProspect(p); setEditData(p); }).catch(console.error).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [id]);

  async function saveEdit(e) {
    e.preventDefault();
    await api.updateProspect(id, editData);
    setEditing(false);
    load();
  }

  async function handleStageChange(newStage) {
    await api.updateProspect(id, { stage: newStage });
    load();
  }

  async function addActivity(e) {
    e.preventDefault();
    await api.createActivity({ ...activityForm, prospect_id: id, contact_id: prospect.contact_id });
    setShowActivityForm(false);
    setActivityForm({ type: 'call', subject: '', description: '', scheduled_at: '' });
    load();
  }

  async function completeActivity(actId) {
    await api.updateActivity(actId, { completed_at: new Date().toISOString() });
    load();
  }

  if (loading) return <div className="loading">Loading...</div>;
  if (!prospect) return <div className="loading">Prospect not found</div>;

  const stages = ['inquiry', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];

  return (
    <div>
      <div className="detail-header">
        <div>
          <div className="back" onClick={() => nav('/prospects')}>← Back to Prospects</div>
          <h2>{prospect.contact_name}</h2>
          <div className="subtitle">{prospect.contact_company} — {prospect.aircraft_name || 'No aircraft selected'}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => setEditing(!editing)}>
            {editing ? 'Cancel' : '✏️ Edit'}
          </button>
          <button className="btn btn-primary" onClick={() => setShowActivityForm(true)}>+ Log Activity</button>
        </div>
      </div>

      {/* Stage progression */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {stages.map(s => (
            <button
              key={s}
              className={`btn btn-sm ${prospect.stage === s ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleStageChange(s)}
              style={{ flex: 1 }}
            >
              {stageLabels[s]}
            </button>
          ))}
        </div>
      </div>

      {editing ? (
        <div className="card" style={{ marginBottom: 24 }}>
          <form onSubmit={saveEdit}>
            <div className="form-row">
              <div className="form-group">
                <label>Priority</label>
                <select className="form-control" value={editData.priority} onChange={e => setEditData({ ...editData, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="form-group">
                <label>Assigned To</label>
                <input className="form-control" value={editData.assigned_to || ''} onChange={e => setEditData({ ...editData, assigned_to: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Budget Min</label>
                <input className="form-control" type="number" value={editData.budget_min || ''} onChange={e => setEditData({ ...editData, budget_min: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Budget Max</label>
                <input className="form-control" type="number" value={editData.budget_max || ''} onChange={e => setEditData({ ...editData, budget_max: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Expected Close Date</label>
              <input className="form-control" type="date" value={editData.expected_close_date || ''} onChange={e => setEditData({ ...editData, expected_close_date: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea className="form-control" value={editData.notes || ''} onChange={e => setEditData({ ...editData, notes: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="detail-info-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card blue">
            <div className="label">Stage</div>
            <div><span className={`badge ${prospect.stage}`}>{stageLabels[prospect.stage]}</span></div>
          </div>
          <div className="stat-card yellow">
            <div className="label">Priority</div>
            <div><span className={`badge ${prospect.priority}`}>{prospect.priority}</span></div>
          </div>
          <div className="stat-card green">
            <div className="label">Aircraft Price</div>
            <div className="value" style={{ fontSize: 20 }}>{formatCurrency(prospect.aircraft_price)}</div>
          </div>
          <div className="stat-card purple">
            <div className="label">Budget Range</div>
            <div className="value" style={{ fontSize: 16 }}>{formatCurrency(prospect.budget_min)} – {formatCurrency(prospect.budget_max)}</div>
          </div>
          <div className="stat-card blue">
            <div className="label">Expected Close</div>
            <div className="value" style={{ fontSize: 16 }}>{formatDate(prospect.expected_close_date)}</div>
          </div>
          <div className="stat-card green">
            <div className="label">Assigned To</div>
            <div className="value" style={{ fontSize: 16 }}>{prospect.assigned_to || '—'}</div>
          </div>
        </div>
      )}

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3>Contact Info</h3>
          </div>
          <div className="detail-info-grid">
            <div className="detail-info-item">
              <div className="label">Email</div>
              <div className="value">{prospect.contact_email || '—'}</div>
            </div>
            <div className="detail-info-item">
              <div className="label">Phone</div>
              <div className="value">{prospect.contact_phone || '—'}</div>
            </div>
            <div className="detail-info-item">
              <div className="label">Aircraft</div>
              <div className="value">{prospect.aircraft_name} ({prospect.aircraft_year})</div>
            </div>
            <div className="detail-info-item">
              <div className="label">Registration</div>
              <div className="value">{prospect.aircraft_registration || '—'}</div>
            </div>
          </div>
          {prospect.notes && (
            <div style={{ marginTop: 12, padding: 12, background: 'var(--bg-primary)', borderRadius: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
              <strong>Notes:</strong> {prospect.notes}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Activity Timeline</h3>
          </div>
          {prospect.activities && prospect.activities.length > 0 ? (
            prospect.activities.map(a => (
              <div className="activity-item" key={a.id}>
                <div className={`activity-icon ${a.type}`}>{activityIcons[a.type]}</div>
                <div className="activity-content">
                  <div className="subject">{a.subject}</div>
                  {a.description && <div className="desc">{a.description}</div>}
                  <div className="meta">
                    {a.completed_at ? `Completed ${formatDateTime(a.completed_at)}` :
                      a.scheduled_at ? `Scheduled ${formatDateTime(a.scheduled_at)}` : formatDateTime(a.created_at)}
                    {!a.completed_at && a.scheduled_at && (
                      <button className="btn btn-sm btn-secondary" style={{ marginLeft: 8 }} onClick={() => completeActivity(a.id)}>✓ Done</button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state"><p>No activities yet</p></div>
          )}
        </div>
      </div>

      {showActivityForm && (
        <div className="modal-overlay" onClick={() => setShowActivityForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Log Activity</h3>
              <button className="modal-close" onClick={() => setShowActivityForm(false)}>×</button>
            </div>
            <form onSubmit={addActivity}>
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select className="form-control" value={activityForm.type} onChange={e => setActivityForm({ ...activityForm, type: e.target.value })}>
                    <option value="call">📞 Call</option>
                    <option value="email">✉️ Email</option>
                    <option value="meeting">🤝 Meeting</option>
                    <option value="demo">🛩️ Demo Flight</option>
                    <option value="tour">🏭 Hangar Tour</option>
                    <option value="note">📝 Note</option>
                    <option value="follow_up">🔔 Follow Up</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Scheduled For</label>
                  <input className="form-control" type="datetime-local" value={activityForm.scheduled_at} onChange={e => setActivityForm({ ...activityForm, scheduled_at: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Subject *</label>
                <input className="form-control" required value={activityForm.subject} onChange={e => setActivityForm({ ...activityForm, subject: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" value={activityForm.description} onChange={e => setActivityForm({ ...activityForm, description: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowActivityForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Log Activity</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
