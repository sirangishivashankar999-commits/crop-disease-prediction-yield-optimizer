import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Bell,
  CloudSun,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  MapPin,
  X,
  CheckCheck,
  AlertOctagon,
  Droplets,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Trash2,
  Camera,
  Layers,
  Info
} from 'lucide-react';

export default function Header({
  activeTab,
  setActiveTab,
  setIsSidebarOpen,
  weatherData,
  modelStatus,
  selectedFarm,
  setSelectedFarm,
  insightsData,
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

  // Notification State
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'crop' | 'website'
  const dropdownRef = useRef(null);

  // Default notification list encompassing Crop & Farm Alerts and Website/Platform Updates
  const [notifications, setNotifications] = useState([
    {
      id: 'WEB-01',
      category: 'website',
      type: 'feature',
      title: 'Website Update: Camera Leaf Scanner Live',
      message: 'Real-time camera access is now integrated into Disease Detection. Capture live foliage directly from your device camera.',
      timestamp: 'New Update',
      read: false,
      tab: 'disease',
      actionLabel: 'Try Scanner',
      icon: 'camera'
    },
    {
      id: 'CROP-01',
      category: 'crop',
      type: 'disease',
      title: 'Crop Disease Alert: Tomato Early Blight',
      message: 'Foliar target-spot lesions identified in Sector A with 92% ML confidence. Urgent scouting & copper fungicide recommended.',
      timestamp: '12 mins ago',
      read: false,
      tab: 'disease',
      actionLabel: 'Inspect Pathology',
      icon: 'disease'
    },
    {
      id: 'CROP-02',
      category: 'crop',
      type: 'soil',
      title: 'Irrigation Warning: Sector C Moisture Dip',
      message: 'Root-zone soil moisture dropped to 26% (critical threshold 28%). Automated drip cycle scheduled.',
      timestamp: '45 mins ago',
      read: false,
      tab: 'soil',
      actionLabel: 'View Soil Sensor',
      icon: 'soil'
    },
    {
      id: 'WEB-02',
      category: 'website',
      type: 'feature',
      title: 'Website Update: Clean Season Filter',
      message: 'Yield Optimizer growing season inputs have been updated to clean seasonal periods: Monsoon, Winter, Summer, Spring, and Autumn.',
      timestamp: '1 hour ago',
      read: false,
      tab: 'yield',
      actionLabel: 'Explore Optimizer',
      icon: 'sparkles'
    },
    {
      id: 'CROP-03',
      category: 'crop',
      type: 'weather',
      title: 'AgroMet Alert: Heavy Precipitation Front',
      message: 'Precipitation model projects 35mm rainfall front arriving in 48 hours. Clear drainage culverts.',
      timestamp: '2 hours ago',
      read: false,
      tab: 'weather',
      actionLabel: 'Weather Radar',
      icon: 'weather'
    },
    {
      id: 'CROP-04',
      category: 'crop',
      type: 'yield',
      title: 'Yield Advisory: Fertigation Opportunity',
      message: 'Applying split potassium top-dressing could boost projected Corn yield by +0.35 tons/acre.',
      timestamp: '5 hours ago',
      read: false,
      tab: 'yield',
      actionLabel: 'Optimize Yield',
      icon: 'yield'
    },
    {
      id: 'WEB-03',
      category: 'website',
      type: 'system',
      title: 'System Update: ML Engines Synchronized',
      message: 'MobileNetV2 Transfer Learning vision and Gradient Boosting Regressor (R² = 0.992) active and responding.',
      timestamp: 'Today',
      read: true,
      tab: 'settings',
      actionLabel: 'Check Health',
      icon: 'system'
    }
  ]);

  // Synchronize dynamic active alerts from backend insights if available
  useEffect(() => {
    if (insightsData?.active_alerts && Array.isArray(insightsData.active_alerts) && insightsData.active_alerts.length > 0) {
      setNotifications(prev => {
        const dynamicCropAlerts = insightsData.active_alerts.map((alert, idx) => ({
          id: alert.id || `BACKEND-ALERT-${idx}`,
          category: 'crop',
          type: alert.type || 'disease',
          title: alert.title || 'Farm Operational Alert',
          message: alert.message || 'Check agronomic sensor readings.',
          timestamp: alert.timestamp || 'Recently',
          read: false,
          tab: alert.type === 'disease' ? 'disease' : alert.type === 'irrigation' ? 'soil' : alert.type === 'yield' ? 'yield' : 'weather',
          actionLabel: 'Inspect',
          icon: alert.type === 'disease' ? 'disease' : alert.type === 'irrigation' ? 'soil' : alert.type === 'yield' ? 'yield' : 'weather'
        }));

        const websiteUpdates = prev.filter(item => item.category === 'website');
        return [...dynamicCropAlerts, ...websiteUpdates];
      });
    }
  }, [insightsData]);

  // Click outside and ESC key listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? ({ ...n, read: true }) : n));
  };

  const removeNotification = (e, id) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (item) => {
    markAsRead(item.id);
    if (setActiveTab && item.tab) {
      setActiveTab(item.tab);
    }
    setIsOpen(false);
  };

  const filteredNotifications = notifications.filter(item => {
    if (filter === 'crop') return item.category === 'crop';
    if (filter === 'website') return item.category === 'website';
    return true;
  });

  const cropCount = notifications.filter(n => n.category === 'crop').length;
  const websiteCount = notifications.filter(n => n.category === 'website').length;

  const renderIcon = (type) => {
    switch (type) {
      case 'disease':
        return (
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11d48', flexShrink: 0 }}>
            <AlertOctagon size={16} />
          </div>
        );
      case 'soil':
      case 'irrigation':
        return (
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', flexShrink: 0 }}>
            <Droplets size={16} />
          </div>
        );
      case 'weather':
        return (
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', flexShrink: 0 }}>
            <CloudSun size={16} />
          </div>
        );
      case 'yield':
        return (
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', flexShrink: 0 }}>
            <TrendingUp size={16} />
          </div>
        );
      case 'camera':
        return (
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', flexShrink: 0 }}>
            <Camera size={16} />
          </div>
        );
      case 'system':
        return (
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d9488', flexShrink: 0 }}>
            <ShieldCheck size={16} />
          </div>
        );
      default:
        return (
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed', flexShrink: 0 }}>
            <Sparkles size={16} />
          </div>
        );
    }
  };

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
        zIndex: 40,
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
          aria-label="Toggle Navigation Menu"
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

      {/* Right: Farm Selector, Weather Pill, System Status & Bell Notification */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '10px',
            backgroundColor: 'var(--surface-card)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--text-main)',
          }}
        >
          <CloudSun size={17} color="#F59E0B" />
          <span>{weatherData?.temperature || 26.8}°C</span>
          <span style={{ color: 'var(--text-muted)' }}>{weatherData?.condition || 'Partly Cloudy'}</span>
        </div>

        {/* Backend / ML Model Health Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '10px',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            fontSize: '0.775rem',
            fontWeight: 700,
            color: '#10b981',
          }}
          title={modelStatus?.instructions || 'ML Service Status'}
        >
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
          <span>ML Online</span>
          <span style={{ color: 'rgba(16, 185, 129, 0.6)' }}>•</span>
          <span style={{ color: '#34d399', fontWeight: 600 }}>All Systems Active</span>
        </div>

        {/* Interactive Notifications Bell & Dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle notifications panel"
            aria-expanded={isOpen}
            style={{
              position: 'relative',
              background: isOpen ? 'var(--primary-50)' : 'var(--surface-bg)',
              border: `1px solid ${isOpen ? 'var(--primary-500)' : 'var(--border-subtle)'}`,
              borderRadius: '10px',
              padding: '8px',
              cursor: 'pointer',
              color: isOpen ? 'var(--primary-700)' : 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            title={unreadCount > 0 ? `${unreadCount} unread crop & website updates` : 'Notifications & Updates'}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  minWidth: '18px',
                  height: '18px',
                  padding: '0 4px',
                  borderRadius: '9999px',
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
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Popover Dropdown */}
          {isOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 12px)',
                right: 0,
                width: '410px',
                maxWidth: 'calc(100vw - 24px)',
                backgroundColor: 'var(--surface-card)',
                borderRadius: '16px',
                border: '1px solid var(--border-subtle)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                zIndex: 100,
                overflow: 'hidden',
                animation: 'notificationSlideIn 0.18s ease-out',
              }}
            >
              {/* Header Bar */}
              <div
                style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--surface-bg)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={17} color="#059669" />
                  <span style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-main)' }}>
                    Notifications & Updates
                  </span>
                  {unreadCount > 0 && (
                    <span
                      style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        fontSize: '0.675rem',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: '9999px',
                      }}
                    >
                      {unreadCount} New
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      title="Mark all as read"
                    >
                      <CheckCheck size={14} />
                      <span>Read All</span>
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px 6px',
                        borderRadius: '6px',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Clear all notifications"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 6px',
                      borderRadius: '6px',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title="Close"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div
                style={{
                  display: 'flex',
                  padding: '8px 14px',
                  gap: '8px',
                  borderBottom: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--surface-card)',
                }}
              >
                <button
                  onClick={() => setFilter('all')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.775rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: filter === 'all' ? 'var(--primary-600)' : 'var(--surface-bg)',
                    color: filter === 'all' ? '#ffffff' : 'var(--text-muted)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('crop')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.775rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: filter === 'crop' ? 'var(--primary-600)' : 'var(--surface-bg)',
                    color: filter === 'crop' ? '#ffffff' : 'var(--text-muted)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  🌾 Crop Alerts ({cropCount})
                </button>
                <button
                  onClick={() => setFilter('website')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.775rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: filter === 'website' ? 'var(--primary-600)' : 'var(--surface-bg)',
                    color: filter === 'website' ? '#ffffff' : 'var(--text-muted)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  ✨ Website Updates ({websiteCount})
                </button>
              </div>

              {/* Notification List Scroll Area */}
              <div
                style={{
                  maxHeight: '380px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {filteredNotifications.length === 0 ? (
                  <div
                    style={{
                      padding: '40px 20px',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <CheckCircle2 size={36} color="#10b981" />
                    <div>
                      <h4 style={{ margin: '0 0 4px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        All Caught Up!
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        No alerts or updates in this category right now.
                      </p>
                    </div>
                  </div>
                ) : (
                  filteredNotifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--border-subtle)',
                        backgroundColor: item.read ? 'transparent' : 'var(--primary-50)',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start',
                        transition: 'background-color 0.15s ease',
                        position: 'relative',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--surface-card-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = item.read ? 'transparent' : 'var(--primary-50)';
                      }}
                    >
                      {/* Left Category Icon */}
                      {renderIcon(item.icon || item.type)}

                      {/* Content Column */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px', gap: '8px' }}>
                          <span
                            style={{
                              fontSize: '0.675rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              color: item.category === 'crop' ? '#e11d48' : '#059669',
                            }}
                          >
                            {item.category === 'crop' ? 'Crop & Field Alert' : 'Platform & Web Update'}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                            {item.timestamp}
                          </span>
                        </div>

                        <h4
                          style={{
                            margin: '0 0 3px',
                            fontSize: '0.835rem',
                            fontWeight: item.read ? 600 : 700,
                            color: 'var(--text-main)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          {!item.read && (
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: '#10b981',
                                display: 'inline-block',
                                flexShrink: 0,
                              }}
                            />
                          )}
                          {item.title}
                        </h4>

                        <p
                          style={{
                            margin: '0 0 8px',
                            fontSize: '0.785rem',
                            color: 'var(--text-muted)',
                            lineHeight: 1.4,
                          }}
                        >
                          {item.message}
                        </p>

                        {/* Action CTA link */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: 'var(--primary-600)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            {item.actionLabel || 'View Details'}
                            <ArrowRight size={12} />
                          </span>

                          <button
                            onClick={(e) => removeNotification(e, item.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-light)',
                              cursor: 'pointer',
                              padding: '2px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            title="Dismiss notification"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Popover Footer */}
              <div
                style={{
                  padding: '10px 16px',
                  backgroundColor: 'var(--surface-bg)',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                }}
              >
                <span>CropWise Intelligence • v2.4 Live</span>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    if (setActiveTab) setActiveTab('settings');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--primary-600)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                  }}
                >
                  Manage Alerts →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes notificationSlideIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (min-width: 1024px) {
          .header-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
