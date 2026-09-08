import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  Filter,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [completedSteps, setCompletedSteps] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const data = await api.getRecommendations();
      setRecommendations(data);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStep = (recId, stepIdx) => {
    const key = `${recId}-${stepIdx}`;
    setCompletedSteps((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const filteredRecs = recommendations.filter((rec) => {
    const matchCat = categoryFilter === 'All' || rec.category === categoryFilter;
    const matchPri = priorityFilter === 'All' || rec.priority === priorityFilter;
    return matchCat && matchPri;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header with Filter Controls */}
      <div className="card" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Lightbulb size={20} color="#059669" />
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Autonomous Agronomic Advisory Feed
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
              Dynamically derived from real-time ML pathology models, regression yields, and microclimate sensors
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '6px 14px', fontSize: '0.825rem' }}
          >
            <option value="All">All Categories</option>
            <option value="Disease Management">Disease Management</option>
            <option value="Irrigation">Irrigation & Water</option>
            <option value="Soil Health">Soil Health</option>
            <option value="Yield Optimization">Yield Optimization</option>
            <option value="Nutrient Management">Nutrient Management</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '6px 14px', fontSize: '0.825rem' }}
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical Priority</option>
            <option value="Warning">Warning Priority</option>
            <option value="Advisory">Advisory Priority</option>
          </select>

          <button
            onClick={fetchRecommendations}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredRecs.map((rec) => {
          const isCritical = rec.priority === 'Critical';
          const isWarning = rec.priority === 'Warning';

          return (
            <div
              key={rec.id}
              className="card"
              style={{
                borderLeft: `5px solid ${isCritical ? '#e11d48' : isWarning ? '#d97706' : '#10b981'}`,
                padding: '20px 24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {isCritical ? (
                    <AlertOctagon size={20} color="#e11d48" />
                  ) : isWarning ? (
                    <AlertTriangle size={20} color="#d97706" />
                  ) : (
                    <Info size={20} color="#059669" />
                  )}
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {rec.title}
                  </h4>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-info" style={{ fontSize: '0.725rem' }}>
                    {rec.category}
                  </span>
                  <span
                    className={`badge ${
                      isCritical ? 'badge-danger' : isWarning ? 'badge-warning' : 'badge-success'
                    }`}
                    style={{ fontSize: '0.725rem' }}
                  >
                    {rec.priority}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '0.875rem', color: '#334155', margin: '0 0 14px 0', lineHeight: 1.5 }}>
                {rec.description}
              </p>

              {/* Action Steps Checklist */}
              {rec.action_steps && rec.action_steps.length > 0 && (
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '14px 18px',
                    marginTop: '10px',
                  }}
                >
                  <div style={{ fontSize: '0.775rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
                    Standard Operating Action Protocol
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {rec.action_steps.map((step, idx) => {
                      const done = completedSteps[`${rec.id}-${idx}`];
                      return (
                        <label
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            cursor: 'pointer',
                            fontSize: '0.825rem',
                            color: done ? '#94a3b8' : '#1e293b',
                            textDecoration: done ? 'line-through' : 'none',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={!!done}
                            onChange={() => toggleStep(rec.id, idx)}
                            style={{
                              marginTop: '3px',
                              accentColor: '#10b981',
                              cursor: 'pointer',
                            }}
                          />
                          <span>{step}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {rec.trigger && (
                <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#64748b' }}>
                  <strong>Triggered by:</strong> {rec.trigger}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
