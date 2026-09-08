import React from 'react';
import { Menu, Bell, CloudSun, CheckCircle2, AlertTriangle, ShieldCheck, MapPin } from 'lucide-react';

export default function Header({
  activeTab,
  setIsSidebarOpen,
  weatherData,
  modelStatus,
  selectedFarm,
  setSelectedFarm,
  unreadAlertsCount = 3
}) {
  const pageTitles = {
    dashboard: 'Executive Farm Dashboard',
    disease: 'Crop Disease Detection & Pathology',
    yield: 'Predictive Crop Yield Optimizer',
    insights: 'Farm Performance & Analytical Insights',
    weather: 'Agro-Meteorological Monitoring',
    soil: 'Soil Health & Irrigation Management',
    recommendations: 'Agronomic Advisory & Recommendations',
    settings: 'System Configuration & Preferences',
  };

  const isHealthy = modelStatus?.disease_model_loaded && modelStatus?.yield_model_loaded;

  return (
    <header
      style={{
        height: '72px',
        backgroundColor: 'var(--surface-card)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Left: Mobile Toggle & Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={() => setIsSidebarOpen(true)}
          style={{
            background: 'var(--surface-bg)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-main)',
          }}
          className="header-menu-btn"
        >
          <Menu size={20} />
        </button>

        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            {pageTitles[activeTab] || 'Predictive Crop Disease & Yield Optimizer'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Operations</span>
            <span>/</span>
            <span style={{ color: '#059669', fontWeight: 600, textTransform: 'capitalize' }}>{activeTab}</span>
          </div>
        </div>
      </div>

      {/* Right: Farm Selector, Weather Pill, System Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Farm Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--surface-bg)', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <MapPin size={15} color="#059669" />
          <select
            value={selectedFarm}
            onChange={(e) => setSelectedFarm(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '0.825rem',
              fontWeight: 600,
              color: 'var(--text-main)',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="Central Valley Farm">Central Valley Farm (Block A)</option>
            <option value="Highland Terraces">Highland Terraces (Block B)</option>
            <option value="River Basin Delta">River Basin Delta (Sector 3)</option>
            <option value="Southern Orchard">Southern Orchard (Plot 7)</option>
          </select>
        </div>

        {/* Live Weather Quick Pill */}
        {weatherData && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '9999px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#065f46',
            }}
          >
            <CloudSun size={16} color="#059669" />
            <span>{weatherData.temperature}°C</span>
            <span style={{ color: '#6ee7b7' }}>•</span>
            <span style={{ color: '#047857' }}>{weatherData.condition}</span>
          </div>
        )}

        {/* Backend / ML Model Health Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '9999px',
            backgroundColor: isHealthy ? '#ecfdf5' : '#fffbeb',
            border: `1px solid ${isHealthy ? '#a7f3d0' : '#fde68a'}`,
            fontSize: '0.775rem',
            fontWeight: 600,
            color: isHealthy ? '#065f46' : '#92400e',
          }}
          title={modelStatus?.instructions || 'ML Service Status'}
        >
          {isHealthy ? <ShieldCheck size={15} color="#059669" /> : <AlertTriangle size={15} color="#d97706" />}
          <span>{isHealthy ? 'ML Online' : 'ML Degraded'}</span>
        </div>

        {/* Notifications Bell */}
        <button
          style={{
            position: 'relative',
            background: 'var(--surface-bg)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '8px',
            cursor: 'pointer',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title={`${unreadAlertsCount} active farm alerts`}
        >
          <Bell size={18} />
          {unreadAlertsCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                fontSize: '0.65rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)',
              }}
            >
              {unreadAlertsCount}
            </span>
          )}
        </button>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .header-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
