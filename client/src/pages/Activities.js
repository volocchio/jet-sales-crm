import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { formatDateTime, activityIcons } from '../utils';

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [typeFilter, setTypeFilter] = useState('');

  function load() {
    const params = {};
    if (tab === 'upcoming') params.upcoming = 'true';
    if (typeFilter) params.type = typeFilter;
    api.getActivities(params).then(setActivities).catch(console.error).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [tab, typeFilter]);

  async function completeActivity(id) {
    await api.updateActivity(id, { completed_at: new Date().toISOString() });
    load();
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Activities</h2>
          <div className="subtitle">Calls, meetings, demos, and follow-ups</div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>All Activities</button>
        <button className={`tab ${tab === 'upcoming' ? 'active' : ''}`} onClick={() => setTab('upcoming')}>Upcoming</button>
      </div>

      <div className="filters" style={{ marginBottom: 16 }}>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="call">📞 Calls</option>
          <option value="email">✉️ Emails</option>
          <option value="meeting">🤝 Meetings</option>
          <option value="demo">🛩️ Demo Flights</option>
          <option value="tour">🏭 Tours</option>
          <option value="note">📝 Notes</option>
          <option value="follow_up">🔔 Follow Ups</option>
        </select>
      </div>

      {loading ? <div className="loading">Loading...</div> : (
        <div className="card">
          {activities.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📋</div>
              <p>No activities found</p>
            </div>
          ) : (
            activities.map(a => (
              <div className="activity-item" key={a.id}>
                <div className={`activity-icon ${a.type}`}>{activityIcons[a.type]}</div>
                <div className="activity-content">
                  <div className="subject">{a.subject}</div>
                  {a.description && <div className="desc">{a.description}</div>}
                  <div className="desc">{a.contact_name} — {a.contact_company}</div>
                  <div className="meta">
                    {a.completed_at
                      ? `✓ Completed ${formatDateTime(a.completed_at)}`
                      : a.scheduled_at
                        ? `📅 Scheduled ${formatDateTime(a.scheduled_at)}`
                        : `Created ${formatDateTime(a.created_at)}`
                    }
                    {!a.completed_at && a.scheduled_at && (
                      <button className="btn btn-sm btn-primary" style={{ marginLeft: 8 }} onClick={() => completeActivity(a.id)}>Mark Complete</button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
