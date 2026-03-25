import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { formatCurrency, formatDateTime, activityIcons } from '../utils';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboard().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (!data) return <div className="loading">Failed to load dashboard</div>;

  const { summary, byStage, upcomingActivities, recentActivities } = data;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <div className="subtitle">Sales overview and key metrics</div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="label">Active Prospects</div>
          <div className="value">{summary.activeProspects}</div>
          <div className="sub">{summary.totalProspects} total</div>
        </div>
        <div className="stat-card green">
          <div className="label">Pipeline Value</div>
          <div className="value">{formatCurrency(summary.pipelineValue)}</div>
          <div className="sub">Across active deals</div>
        </div>
        <div className="stat-card purple">
          <div className="label">Closed Won</div>
          <div className="value">{summary.closedWon}</div>
          <div className="sub">{formatCurrency(summary.wonValue)} total</div>
        </div>
        <div className="stat-card yellow">
          <div className="label">Win Rate</div>
          <div className="value">{summary.winRate}%</div>
          <div className="sub">{summary.closedWon}W / {summary.closedLost}L</div>
        </div>
        <div className="stat-card green">
          <div className="label">Available Aircraft</div>
          <div className="value">{summary.availableAircraft}</div>
          <div className="sub">{summary.totalAircraft} total fleet</div>
        </div>
        <div className="stat-card blue">
          <div className="label">Inventory Value</div>
          <div className="value">{formatCurrency(summary.inventoryValue)}</div>
          <div className="sub">Available aircraft</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <h3>Pipeline by Stage</h3>
            <Link to="/pipeline" className="btn btn-secondary btn-sm">View Pipeline</Link>
          </div>
          <table>
            <thead>
              <tr>
                <th>Stage</th>
                <th>Count</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {byStage.map(s => (
                <tr key={s.stage}>
                  <td><span className={`badge ${s.stage}`}>{s.display_name}</span></td>
                  <td>{s.count}</td>
                  <td>{formatCurrency(s.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Upcoming Activities</h3>
            <Link to="/activities" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          {upcomingActivities.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📅</div>
              <p>No upcoming activities</p>
            </div>
          ) : (
            upcomingActivities.map(a => (
              <div className="activity-item" key={a.id}>
                <div className={`activity-icon ${a.type}`}>{activityIcons[a.type]}</div>
                <div className="activity-content">
                  <div className="subject">{a.subject}</div>
                  <div className="desc">{a.contact_name} — {a.contact_company}</div>
                  <div className="meta">{formatDateTime(a.scheduled_at)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Recent Activity</h3>
        </div>
        {recentActivities.length === 0 ? (
          <div className="empty-state"><p>No recent activities</p></div>
        ) : (
          recentActivities.map(a => (
            <div className="activity-item" key={a.id}>
              <div className={`activity-icon ${a.type}`}>{activityIcons[a.type]}</div>
              <div className="activity-content">
                <div className="subject">{a.subject}</div>
                <div className="desc">{a.contact_name} — {a.contact_company}</div>
                <div className="meta">Completed {formatDateTime(a.completed_at)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
