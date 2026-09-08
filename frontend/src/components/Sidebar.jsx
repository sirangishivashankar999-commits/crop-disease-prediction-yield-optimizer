import React from 'react';
import {
  LayoutDashboard,
  Scan,
  TrendingUp,
  BarChart3,
  CloudSun,
  Droplets,
  Lightbulb,
  Settings,
  Sprout,
  CheckCircle2,
  AlertCircle,
  Menu,
  X
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, modelStatus, isOpen, setIsOpen }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'disease', label: 'Disease Detection', icon: Scan, badge: 'Vision' },
    { id: 'yield', label: 'Yield Optimizer', icon: TrendingUp, badge: 'ML Regressor' },
    { id: 'insights', label: 'Farm Insights', icon: BarChart3 },
    { id: 'weather', label: 'Weather', icon: CloudSun },
    { id: 'soil', label: 'Soil & Irrigation', icon: Droplets },
    { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const diseaseReady = modelStatus?.disease_model_loaded;
  const yieldReady = modelStatus?.yield_model_loaded;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 40,
          }}
        />
      )}

      <aside
        style={{
          width: '280px',
          backgroundColor: '#064e3b',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 50,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
        }}
        className="sidebar-desktop"
      >
        {/* Branding Header */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                }}
              >
                <Sprout size={24} color="#ffffff" strokeWidth={2.4} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h1 style={{ fontSize: '0.98rem', fontWeight: 800, letterSpacing: '-0.01em', color: '#ffffff', margin: 0, lineHeight: 1.25 }}>
                  Predictive Crop Disease <span style={{ color: '#6ee7b7' }}>&</span> Yield Optimizer
                </h1>
                <p style={{ fontSize: '0.675rem', color: '#a7f3d0', margin: '4px 0 0 0', fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                  AI Agronomic Intelligence
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="mobile-close-btn"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#cbd5e1',
                cursor: 'pointer',
                display: 'none',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#6ee7b7', padding: '8px 12px', letterSpacing: '0.08em' }}>
            Operational Modules
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    background: isActive ? 'rgba(16, 185, 129, 0.22)' : 'transparent',
                    color: isActive ? '#6ee7b7' : '#e2e8f0',
                    border: 'none',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    textAlign: 'left',
                    width: '100%',
                    boxShadow: isActive ? 'inset 0 0 0 1px rgba(110, 231, 183, 0.3)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon size={19} color={isActive ? '#6ee7b7' : '#94a3b8'} strokeWidth={isActive ? 2.3 : 1.9} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      style={{
                        fontSize: '0.675rem',
                        padding: '2px 7px',
                        borderRadius: '6px',
                        background: isActive ? '#10b981' : 'rgba(255,255,255,0.12)',
                        color: '#ffffff',
                        fontWeight: 600,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer: ML Pipeline Status Monitor */}
        <div
          style={{
            padding: '16px',
            margin: '12px',
            borderRadius: '12px',
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ML Engines
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                color: diseaseReady && yieldReady ? '#34d399' : '#fbbf24',
                fontWeight: 600,
              }}
            >
              {diseaseReady && yieldReady ? 'Active' : 'Checking'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <span style={{ color: '#cbd5e1' }}>Vision (MobileNet):</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: diseaseReady ? '#34d399' : '#fbbf24', fontWeight: 600 }}>
                {diseaseReady ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                {diseaseReady ? 'Loaded' : 'No Weights'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <span style={{ color: '#cbd5e1' }}>Yield (Regressor):</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: yieldReady ? '#34d399' : '#fbbf24', fontWeight: 600 }}>
                {yieldReady ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                {yieldReady ? 'Loaded' : 'No Model'}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Desktop fixed sidebar placeholder so main content offsets cleanly */}
      <div className="sidebar-spacer" style={{ width: '280px', flexShrink: 0 }} />

      <style>{`
        @media (min-width: 1024px) {
          .sidebar-desktop {
            transform: translateX(0) !important;
          }
          .sidebar-spacer {
            display: block !important;
          }
          .mobile-close-btn {
            display: none !important;
          }
        }
        @media (max-width: 1023px) {
          .sidebar-spacer {
            display: none !important;
          }
          .mobile-close-btn {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}
