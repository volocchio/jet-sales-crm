import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { formatCurrency } from '../utils';

export default function Pipeline() {
  const [pipeline, setPipeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    api.getPipeline().then(setPipeline).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading pipeline...</div>;

  const totalValue = pipeline.reduce((sum, s) => sum + s.total_value, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Sales Pipeline</h2>
          <div className="subtitle">Total pipeline value: {formatCurrency(totalValue)}</div>
        </div>
      </div>

      <div className="pipeline-board">
        {pipeline.map(stage => (
          <div className="pipeline-column" key={stage.stage}>
            <div className="pipeline-column-header">
              <h4>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: stage.color, display: 'inline-block' }}></span>
                {stage.display_name}
                <span className="count">{stage.prospects.length}</span>
              </h4>
              <span className="value">{formatCurrency(stage.total_value)}</span>
            </div>
            <div className="pipeline-column-body">
              {stage.prospects.map(p => (
                <div className="pipeline-card" key={p.id} onClick={() => nav(`/prospects/${p.id}`)}>
                  <div className="name">{p.contact_name}</div>
                  <div className="company">{p.contact_company}</div>
                  <div className="aircraft">🛩️ {p.aircraft_name || 'No aircraft'}</div>
                  <div className="price">{formatCurrency(p.aircraft_price)}</div>
                </div>
              ))}
              {stage.prospects.length === 0 && (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  No deals
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
