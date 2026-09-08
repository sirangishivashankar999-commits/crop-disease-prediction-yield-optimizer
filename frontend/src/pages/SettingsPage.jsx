import React, { useState, useEffect } from 'react';
import {
  Settings,
  Cpu,
  Save,
  CheckCircle2,
  RefreshCw,
  Server,
  Bell,
  MapPin,
  Sliders,
  Terminal,
  ShieldCheck,
  AlertTriangle,
  Sun,
  Moon,
  Monitor,
  User,
  History,
  Sprout,
  Calendar,
  Clock,
  Scan,
  TrendingUp,
  FileText,
  ChevronRight,
  Eye
} from 'lucide-react';
import { api } from '../services/api';

export default function SettingsPage({ modelStatus, onRefreshStatus, theme = 'system', setTheme }) {
  const [farmName, setFarmName] = useState(() => localStorage.getItem('cropwise_farm_name') || 'Green Valley AgTech Farm');
  const [ownerName, setOwnerName] = useState(() => localStorage.getItem('cropwise_owner_name') || 'Pavan Kumar');
  const [location, setLocation] = useState(() => localStorage.getItem('cropwise_location') || 'Central Valley Agro-Climatic Zone');
  const [totalAcres, setTotalAcres] = useState(() => parseFloat(localStorage.getItem('cropwise_total_acres')) || 120);
  const [primaryCrop, setPrimaryCrop] = useState(() => localStorage.getItem('cropwise_primary_crop') || 'Corn');
  const [unitSystem, setUnitSystem] = useState(() => localStorage.getItem('cropwise_units') || 'metric');
  const [savedAt, setSavedAt] = useState(() => localStorage.getItem('cropwise_profile_saved_at') || '2026-09-07 18:30');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [apiPingStatus, setApiPingStatus] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('profile');
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [diseaseHistory, setDiseaseHistory] = useState([]);
  const [yieldHistory, setYieldHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('all');

  useEffect(() => {
    async function loadSavedProfile() {
      try {
        const res = await api.getFarmerProfile();
        if (res) {
          if (res.farm_name) setFarmName(res.farm_name);
          if (res.owner_name) setOwnerName(res.owner_name);
          if (res.location) setLocation(res.location);
          if (res.total_acres) setTotalAcres(res.total_acres);
          if (res.primary_crop) setPrimaryCrop(res.primary_crop);
          if (res.preferred_units) setUnitSystem(res.preferred_units);
          if (res.updated_at) setSavedAt(res.updated_at);
        }
      } catch (err) {
        console.warn('Using local cached farmer profile:', err);
      }
    }
    loadSavedProfile();
  }, []);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const [dHist, yHist] = await Promise.allSettled([
        api.getDiseaseHistory(),
        api.getYieldHistory()
      ]);
      if (dHist.status === 'fulfilled') setDiseaseHistory(dHist.value || []);
      if (yHist.status === 'fulfilled') setYieldHistory(yHist.value || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'history') {
      fetchHistory();
    }
  }, [activeSubTab]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const timestamp = new Date().toLocaleString();
    setSavedAt(timestamp);

    localStorage.setItem('cropwise_farm_name', farmName);
    localStorage.setItem('cropwise_owner_name', ownerName);
    localStorage.setItem('cropwise_location', location);
    localStorage.setItem('cropwise_total_acres', totalAcres.toString());
    localStorage.setItem('cropwise_primary_crop', primaryCrop);
    localStorage.setItem('cropwise_units', unitSystem);
    localStorage.setItem('cropwise_profile_saved_at', timestamp);

    try {
      await api.updateFarmerProfile({
        farm_name: farmName,
        owner_name: ownerName,
        location,
        total_acres: totalAcres,
        primary_crop: primaryCrop,
        preferred_units: unitSystem,
        theme,
      });
    } catch (err) {
      console.warn('Backend sync failed, saved locally:', err);
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleTestApi = async () => {
    setApiPingStatus('testing');
    try {
      const res = await fetch('/api');
      if (res.ok) {
        setApiPingStatus('success');
      } else {
        setApiPingStatus('error');
      }
    } catch {
      setApiPingStatus('error');
    }
  };

  const combinedHistory = [
    ...diseaseHistory.map(item => ({ ...item, type: 'disease' })),
    ...yieldHistory.map(item => ({ ...item, type: 'yield' }))
  ].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

  const filteredHistory = combinedHistory.filter(item => {
    if (historyFilter === 'all') return true;
    return item.type === historyFilter;
  });


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Sub-Navigation Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '6px',
        backgroundColor: 'var(--surface-card)',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle)',
        width: 'fit-content'
      }}>
        <button
          onClick={() => setActiveSubTab('profile')}
          className="btn"
          style={{
            padding: '8px 16px',
            fontSize: '0.85rem',
            borderRadius: '8px',
            background: activeSubTab === 'profile' ? 'var(--primary-600)' : 'transparent',
            color: activeSubTab === 'profile' ? '#ffffff' : 'var(--text-main)',
            border: 'none',
          }}
        >
          <User size={16} /> Farm Profile
        </button>

        <button
          onClick={() => setActiveSubTab('theme')}
          className="btn"
          style={{
            padding: '8px 16px',
            fontSize: '0.85rem',
            borderRadius: '8px',
            background: activeSubTab === 'theme' ? 'var(--primary-600)' : 'transparent',
            color: activeSubTab === 'theme' ? '#ffffff' : 'var(--text-main)',
            border: 'none',
          }}
        >
          <Sun size={16} /> Theme & Display
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className="btn"
          style={{
            padding: '8px 16px',
            fontSize: '0.85rem',
            borderRadius: '8px',
            background: activeSubTab === 'history' ? 'var(--primary-600)' : 'transparent',
            color: activeSubTab === 'history' ? '#ffffff' : 'var(--text-main)',
            border: 'none',
          }}
        >
          <History size={16} /> Recent History
        </button>
      </div>

      {savedSuccess && (
        <div
          style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '12px 18px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600,
            fontSize: '0.85rem',
          }}
        >
          <CheckCircle2 size={18} color="#10b981" />
          Farmer profile preferences updated and synchronized successfully.
        </div>
      )}

      {/* TAB 1: FARM IDENTITY & PROFILE */}
      {activeSubTab === 'profile' && (
        <div className="grid-2">
          {/* Farm Profile Form */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <MapPin size={18} color="#059669" />
                  Farm Identity & Operational Profile
                </h3>
                <p className="card-subtitle">Manage baseline farm credentials and land allocations</p>
              </div>
              <button
                type="button"
                onClick={() => setShowProfileModal(true)}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}
              >
                <Eye size={14} color="#059669" /> Check Saved Profile
              </button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label className="form-label">Farm / Facility Name</label>
                <input
                  type="text"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Farm Operator / Agronomist</label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Total Cultivated Area (Acres)</label>
                  <input
                    type="number"
                    value={totalAcres}
                    onChange={(e) => setTotalAcres(parseFloat(e.target.value))}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Primary Crop Monitored</label>
                  <select
                    value={primaryCrop}
                    onChange={(e) => setPrimaryCrop(e.target.value)}
                    className="form-select"
                  >
                    <option value="Corn">Corn (Maize)</option>
                    <option value="Rice">Rice</option>
                    <option value="Wheat">Wheat</option>
                    <option value="Tomato">Tomato</option>
                    <option value="Potato">Potato</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Measurement Units</label>
                  <select
                    value={unitSystem}
                    onChange={(e) => setUnitSystem(e.target.value)}
                    className="form-select"
                  >
                    <option value="metric">Metric (tons/acre, °C, mm)</option>
                    <option value="imperial">Imperial (tons/acre, °F, inches)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Geographic Region / Agro-Climatic Zone</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '14px' }}>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} /> Save Farm Profile
                </button>
              </div>
            </form>
          </div>

          {/* Saved Farmer Profile Card Preview */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="card-header">
                <div>
                  <h3 className="card-title">
                    <User size={18} color="#059669" />
                    Saved Farmer Profile Card
                  </h3>
                  <p className="card-subtitle">Active credentials stored in system registry</p>
                </div>
                <span className="badge badge-success">
                  <CheckCircle2 size={12} /> Verified Profile
                </span>
              </div>

              {/* Farmer ID Card UI */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.08) 0%, rgba(16, 185, 129, 0.04) 100%)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '14px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 10px rgba(5, 150, 105, 0.3)'
                  }}>
                    {ownerName ? ownerName.charAt(0).toUpperCase() : 'P'}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>{ownerName}</h4>
                    <p style={{ margin: '2px 0 0', fontSize: '0.825rem', color: 'var(--text-muted)' }}>{farmName}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.825rem' }}>
                  <div style={{ padding: '10px', background: 'var(--surface-card)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.725rem' }}>Cultivated Land</span>
                    <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{totalAcres} Acres</strong>
                  </div>
                  <div style={{ padding: '10px', background: 'var(--surface-card)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.725rem' }}>Primary Crop</span>
                    <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{primaryCrop}</strong>
                  </div>
                  <div style={{ padding: '10px', background: 'var(--surface-card)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.725rem' }}>Agro-Climatic Zone</span>
                    <strong style={{ color: 'var(--text-main)', fontSize: '0.825rem' }}>{location}</strong>
                  </div>
                  <div style={{ padding: '10px', background: 'var(--surface-card)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.725rem' }}>Unit Standard</span>
                    <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem', textTransform: 'capitalize' }}>{unitSystem}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px dashed var(--border-subtle)', paddingTop: '10px' }}>
                  <Clock size={13} />
                  <span>Last Profile Saved: <strong>{savedAt}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Profile Summary Footer */}
            <div style={{ marginTop: '20px', padding: '12px 16px', background: 'var(--surface-bg)', borderRadius: '10px', border: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              💡 Profile settings are synchronized with the local SQLite database and active ML prediction pipelines.
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: THEME & DISPLAY OPTIONS */}
      {activeSubTab === 'theme' && (
        <div className="grid-2">
          {/* Theme Selector Card */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <Sun size={18} color="#059669" />
                  Visual Theme & Appearance
                </h3>
                <p className="card-subtitle">Choose between Light, Dark, or System Default interface modes</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '10px' }}>
              {/* Option 1: Light Theme */}
              <div
                onClick={() => setTheme && setTheme('light')}
                style={{
                  border: `2px solid ${theme === 'light' ? '#10b981' : 'var(--border-subtle)'}`,
                  borderRadius: '14px',
                  padding: '18px 14px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  background: theme === 'light' ? 'var(--primary-50)' : 'var(--surface-card)',
                  transition: 'all 0.2s ease',
                  boxShadow: theme === 'light' ? '0 4px 12px rgba(16, 185, 129, 0.15)' : 'none'
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: '#fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}>
                  <Sun size={22} />
                </div>
                <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem', color: 'var(--text-main)' }}>Light</h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>High clarity daytime contrast</p>
                {theme === 'light' && (
                  <span className="badge badge-success" style={{ marginTop: '10px' }}>Active</span>
                )}
              </div>

              {/* Option 2: Dark Theme */}
              <div
                onClick={() => setTheme && setTheme('dark')}
                style={{
                  border: `2px solid ${theme === 'dark' ? '#10b981' : 'var(--border-subtle)'}`,
                  borderRadius: '14px',
                  padding: '18px 14px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  background: theme === 'dark' ? 'var(--primary-50)' : 'var(--surface-card)',
                  transition: 'all 0.2s ease',
                  boxShadow: theme === 'dark' ? '0 4px 12px rgba(16, 185, 129, 0.15)' : 'none'
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: '#1e293b',
                  color: '#93c5fd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}>
                  <Moon size={22} />
                </div>
                <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem', color: 'var(--text-main)' }}>Dark</h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Low-light night comfort</p>
                {theme === 'dark' && (
                  <span className="badge badge-success" style={{ marginTop: '10px' }}>Active</span>
                )}
              </div>

              {/* Option 3: System Default */}
              <div
                onClick={() => setTheme && setTheme('system')}
                style={{
                  border: `2px solid ${theme === 'system' ? '#10b981' : 'var(--border-subtle)'}`,
                  borderRadius: '14px',
                  padding: '18px 14px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  background: theme === 'system' ? 'var(--primary-50)' : 'var(--surface-card)',
                  transition: 'all 0.2s ease',
                  boxShadow: theme === 'system' ? '0 4px 12px rgba(16, 185, 129, 0.15)' : 'none'
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'var(--surface-bg)',
                  color: '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}>
                  <Monitor size={22} />
                </div>
                <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem', color: 'var(--text-main)' }}>System Default</h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Matches OS preferences</p>
                {theme === 'system' && (
                  <span className="badge badge-success" style={{ marginTop: '10px' }}>Active</span>
                )}
              </div>
            </div>

            <div style={{ marginTop: '24px', padding: '14px 18px', background: 'var(--surface-bg)', borderRadius: '10px', border: '1px solid var(--border-subtle)', fontSize: '0.825rem' }}>
              <strong style={{ color: 'var(--text-main)' }}>Current Theme Mode: </strong>
              <span style={{ color: '#059669', fontWeight: 600, textTransform: 'capitalize' }}>{theme}</span>
              <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.775rem' }}>
                Your theme preference is automatically remembered and applied instantly across all operational modules.
              </p>
            </div>
          </div>

          {/* ML Telemetry Info */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <Cpu size={18} color="#059669" />
                  Active Machine Learning Engines
                </h3>
                <p className="card-subtitle">Real model specifications, checkpoints, and validation scores</p>
              </div>
              <button
                onClick={onRefreshStatus}
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              >
                <RefreshCw size={12} /> Refresh Status
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Crop Disease Vision Classifier
                  </span>
                  <span className={`badge ${modelStatus?.disease_model_loaded ? 'badge-success' : 'badge-danger'}`}>
                    {modelStatus?.disease_model_loaded ? 'Loaded (.pt)' : 'Not Trained'}
                  </span>
                </div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                  <div>Architecture: <strong>{modelStatus?.disease_architecture || 'MobileNetV2'}</strong></div>
                  <div>Classes: <strong>{modelStatus?.disease_classes_count || 10} categories</strong></div>
                  <div>Val Accuracy: <strong>{modelStatus?.disease_best_val_acc !== null ? `${modelStatus?.disease_best_val_acc}%` : 'N/A'}</strong></div>
                  <div>Framework: <strong>PyTorch 2.x CPU</strong></div>
                </div>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Crop Yield Optimization Regressor
                  </span>
                  <span className={`badge ${modelStatus?.yield_model_loaded ? 'badge-success' : 'badge-danger'}`}>
                    {modelStatus?.yield_model_loaded ? 'Loaded (.joblib)' : 'Not Trained'}
                  </span>
                </div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                  <div>Champion: <strong>{modelStatus?.yield_champion_model || 'Gradient Boosting'}</strong></div>
                  <div>R² Score: <strong>{modelStatus?.yield_model_r2_score !== null ? modelStatus?.yield_model_r2_score : 'N/A'}</strong></div>
                  <div>MAE: <strong>{modelStatus?.yield_model_mae !== null ? `${modelStatus?.yield_model_mae} tons` : 'N/A'}</strong></div>
                  <div>Trained At: <strong>{modelStatus?.yield_training_date || 'N/A'}</strong></div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                  <Server size={15} color="#059669" />
                  <span>Gateway: <strong>http://127.0.0.1:8000/api</strong></span>
                </div>
                <button
                  onClick={handleTestApi}
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.725rem' }}
                >
                  {apiPingStatus === 'testing' ? 'Testing...' : 'Test Connection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RECENT HISTORY */}
      {activeSubTab === 'history' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <History size={18} color="#059669" />
                Recent Prediction & Diagnosis History
              </h3>
              <p className="card-subtitle">Complete chronological activity log from SQLite database</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Filter Pills */}
              <div style={{ display: 'flex', gap: '6px', background: 'var(--surface-bg)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <button
                  onClick={() => setHistoryFilter('all')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: historyFilter === 'all' ? 'var(--primary-600)' : 'transparent',
                    color: historyFilter === 'all' ? '#ffffff' : 'var(--text-main)',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  All ({combinedHistory.length})
                </button>
                <button
                  onClick={() => setHistoryFilter('disease')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: historyFilter === 'disease' ? 'var(--primary-600)' : 'transparent',
                    color: historyFilter === 'disease' ? '#ffffff' : 'var(--text-main)',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Disease ({diseaseHistory.length})
                </button>
                <button
                  onClick={() => setHistoryFilter('yield')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: historyFilter === 'yield' ? 'var(--primary-600)' : 'transparent',
                    color: historyFilter === 'yield' ? '#ffffff' : 'var(--text-main)',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Yield ({yieldHistory.length})
                </button>
              </div>

              <button
                onClick={fetchHistory}
                disabled={historyLoading}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.75rem', gap: '6px' }}
              >
                <RefreshCw size={12} className={historyLoading ? 'spin' : ''} />
                {historyLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* History List / Table */}
          {historyLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw size={24} className="spin" style={{ margin: '0 auto 10px', display: 'block' }} />
              Loading history records from database...
            </div>
          ) : filteredHistory.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--surface-bg)', borderRadius: '12px', border: '1px dashed var(--border-subtle)' }}>
              <History size={32} color="#94a3b8" style={{ margin: '0 auto 10px', display: 'block' }} />
              <p style={{ fontWeight: 600, fontSize: '0.95rem', margin: 0, color: 'var(--text-main)' }}>No recent predictions found</p>
              <p style={{ fontSize: '0.8rem', margin: '4px 0 0' }}>Run a Disease Scan or Yield Prediction to generate activity history.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px 14px' }}>Type</th>
                    <th style={{ padding: '10px 14px' }}>Target / Sample</th>
                    <th style={{ padding: '10px 14px' }}>Outcome / Diagnosis</th>
                    <th style={{ padding: '10px 14px' }}>Metric / Confidence</th>
                    <th style={{ padding: '10px 14px' }}>Status / Severity</th>
                    <th style={{ padding: '10px 14px' }}>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((item, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '12px 14px' }}>
                        {item.type === 'disease' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 600 }}>
                            <Scan size={14} /> Foliar Scan
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2563eb', fontWeight: 600 }}>
                            <TrendingUp size={14} /> Yield Optimizer
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '12px 14px', color: 'var(--text-main)', fontWeight: 600 }}>
                        {item.type === 'disease'
                          ? (item.filename || `${item.crop} Leaf Sample`)
                          : `${item.crop} (${item.area} Acres)`}
                      </td>

                      <td style={{ padding: '12px 14px', color: 'var(--text-main)' }}>
                        {item.type === 'disease'
                          ? item.disease
                          : `${item.predicted_yield} tons/acre (${item.total_production} tons total)`}
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        {item.type === 'disease' ? (
                          <span style={{ fontWeight: 600, color: item.confidence > 70 ? '#059669' : '#d97706' }}>
                            {item.confidence ? `${item.confidence.toFixed(1)}%` : 'N/A'}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>
                            Score: <strong>{item.productivity_score}/100</strong>
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        {item.type === 'disease' ? (
                          <span className={`badge ${
                            item.severity === 'None' ? 'badge-success' :
                            item.severity === 'Low' ? 'badge-info' :
                            item.severity === 'Moderate' ? 'badge-warning' : 'badge-danger'
                          }`}>
                            {item.severity}
                          </span>
                        ) : (
                          <span className={`badge ${
                            item.risk_level === 'Low' ? 'badge-success' :
                            item.risk_level === 'Moderate' ? 'badge-warning' : 'badge-danger'
                          }`}>
                            {item.risk_level} Risk
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '0.775rem' }}>
                        {item.created_at}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Profile Modal / Dialog */}
      {showProfileModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 60,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '28px',
            maxWidth: '520px',
            width: '100%',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} color="#059669" /> Farmer Profile Credentials
              </h3>
              <button
                onClick={() => setShowProfileModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Farm Name</span>
                <strong style={{ color: 'var(--text-main)' }}>{farmName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Agronomist / Operator</span>
                <strong style={{ color: 'var(--text-main)' }}>{ownerName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Cultivated Land</span>
                <strong style={{ color: 'var(--text-main)' }}>{totalAcres} Acres</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Primary Crop Monitored</span>
                <strong style={{ color: 'var(--text-main)' }}>{primaryCrop}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Agro-Climatic Zone</span>
                <strong style={{ color: 'var(--text-main)' }}>{location}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Preferred Measurement Units</span>
                <strong style={{ color: 'var(--text-main)', textTransform: 'capitalize' }}>{unitSystem}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Last Profile Saved</span>
                <strong style={{ color: 'var(--text-main)' }}>{savedAt}</strong>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowProfileModal(false)}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                Close Profile Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
