import React, { useState } from 'react';
import {
  Sprout,
  AlertOctagon,
  TrendingUp,
  Award,
  CloudLightning,
  HeartPulse,
  Droplets,
  Scan,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Info,
  MapPin,
  CheckCircle2,
  X,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import MetricCard from '../components/MetricCard';

const PIE_COLORS = ['#10b981', '#059669', '#3b82f6', '#f59e0b', '#8b5cf6'];

export default function Dashboard({ insightsData, weatherData, setActiveTab }) {
  const [activeModal, setActiveModal] = useState(null);

  const data = insightsData || {
    total_farms: 4,
    crops_monitored: 5,
    disease_alerts_active: 3,
    average_predicted_yield: 4.6,
    productivity_score: 87,
    weather_risk: 'Moderate',
    soil_health_score: 82,
    irrigation_efficiency: 91,
    yield_trend: [],
    crop_distribution: [],
    disease_distribution: [],
    soil_moisture_trend: [],
    active_alerts: []
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Quick Action Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)',
          borderRadius: '16px',
          padding: '28px 32px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 8px 24px rgba(6, 78, 59, 0.25)',
        }}
      >
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, color: '#a7f3d0', marginBottom: '12px' }}>
            <Sprout size={14} />
            Autonomous Crop Intelligence Platform
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: '0 0 8px 0' }}>
            Welcome to Predictive Crop Disease & Yield Optimizer
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#d1fae5', lineHeight: 1.5, margin: 0 }}>
            Harness real machine learning models to detect foliar crop diseases from leaf scans and optimize harvest yields with multi-factorial agronomic regression.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('disease')}
            className="btn btn-primary"
            style={{
              background: '#ffffff',
              color: '#065f46',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              fontWeight: 700
            }}
          >
            <Scan size={18} color="#059669" />
            Scan Crop Leaf
          </button>
          <button
            onClick={() => setActiveTab('yield')}
            className="btn"
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.3)',
              fontWeight: 600,
              backdropFilter: 'blur(8px)'
            }}
          >
            <TrendingUp size={18} />
            Optimize Yield
          </button>
        </div>
      </div>

      {/* 8 Primary Agronomic KPIs with In-Frame Details */}
      <div className="grid-4">
        <MetricCard
          title="Total Farms"
          value={data.total_farms}
          unit="Active Sites"
          change="+1 site added"
          changeType="positive"
          icon={Sprout}
          iconBg="#ecfdf5"
          iconColor="#059669"
          description="120 Total Cultivated Acres"
          details={[
            { label: 'Cultivated Land', value: '120.0 Acres' },
            { label: 'Sectors Monitored', value: '4 Blocks (A, B, C, D)' },
            { label: 'Top Facility', value: 'Central Valley (35 ac)' }
          ]}
          onInspect={() => setActiveModal('farms')}
          inspectLabel="Inspect"
        />

        <MetricCard
          title="Crops Monitored"
          value={data.crops_monitored}
          unit="Major Species"
          change="Optimal Rotation"
          changeType="neutral"
          icon={HeartPulse}
          iconBg="#eff6ff"
          iconColor="#2563eb"
          description="Corn, Rice, Wheat, Tomato, Potato"
          details={[
            { label: 'Corn (Maize)', value: '40 ac • Vegetative V6' },
            { label: 'Rice & Wheat', value: '45 ac • Tillering/Booting' },
            { label: 'Tomato & Potato', value: '35 ac • Flowering/Tubers' }
          ]}
          onInspect={() => setActiveModal('crops')}
          inspectLabel="Breakdown"
        />

        <MetricCard
          title="Disease Alerts"
          value={data.disease_alerts_active}
          unit="Incidents"
          change={data.disease_alerts_active > 0 ? "Requires Scouting" : "All Clean"}
          changeType={data.disease_alerts_active > 0 ? "negative" : "positive"}
          icon={AlertOctagon}
          iconBg="#fff1f2"
          iconColor="#e11d48"
          description="Foliar Pathology Monitoring"
          details={[
            { label: 'Tomato Early Blight', value: 'Sector A • Scouting Active' },
            { label: 'Potato Blight Risk', value: 'Sector C • Humidity Alert' },
            { label: 'Corn & Rice Health', value: 'Clean Foliage (0 Issues)' }
          ]}
          onInspect={() => setActiveModal('disease')}
          inspectLabel="Alerts"
        />

        <MetricCard
          title="Avg Predicted Yield"
          value={data.average_predicted_yield}
          unit="tons/acre"
          change="+8.4% vs 2025"
          changeType="positive"
          icon={TrendingUp}
          iconBg="#f0fdf4"
          iconColor="#16a34a"
          description="Champion ML Regressor"
          details={[
            { label: 'Gross Farm Harvest', value: '552 Total Metric Tons' },
            { label: 'High Yield Leader', value: 'Corn @ 5.4 tons/acre' },
            { label: 'ML Algorithm', value: 'Gradient Boosting (R² 0.992)' }
          ]}
          onInspect={() => setActiveModal('yield')}
          inspectLabel="Predict"
        />

        <MetricCard
          title="Productivity Score"
          value={`${data.productivity_score}/100`}
          unit="High"
          change="+4 pts increase"
          changeType="positive"
          icon={Award}
          iconBg="#fef3c7"
          iconColor="#d97706"
          description="Agronomic Efficiency Index"
          details={[
            { label: 'Canopy Density', value: '89% Chlorophyll Turgor' },
            { label: 'Water Efficiency', value: '91% Optimal Delivery' },
            { label: 'Nutrient Assimilation', value: '84% Balanced NPK' }
          ]}
          onInspect={() => setActiveModal('productivity')}
          inspectLabel="Metrics"
        />

        <MetricCard
          title="Weather Risk"
          value={data.weather_risk}
          unit="Index"
          change="Rain Front in 48h"
          changeType={data.weather_risk === 'Low' ? 'positive' : 'negative'}
          icon={CloudLightning}
          iconBg="#f5f3ff"
          iconColor="#7c3aed"
          description="Precipitation & Wind Risk"
          details={[
            { label: 'Temperature & RH', value: '26.8°C • 68% Humidity' },
            { label: 'Precipitation', value: '14 mm Front in 48h' },
            { label: 'Spraying Window', value: 'Favorable Today' }
          ]}
          onInspect={() => setActiveModal('weather')}
          inspectLabel="Forecast"
        />

        <MetricCard
          title="Soil Health"
          value={`${data.soil_health_score}%`}
          unit="Good"
          change="pH 6.5 Balanced"
          changeType="positive"
          icon={HeartPulse}
          iconBg="#ecfdf5"
          iconColor="#059669"
          description="NPK Organic Balance"
          details={[
            { label: 'Soil pH Level', value: '6.5 (Neutral Optimal)' },
            { label: 'Organic Matter', value: '3.6% Rich Humus' },
            { label: 'Soil Moisture', value: '28 kPa (Field Capacity)' }
          ]}
          onInspect={() => setActiveModal('soil')}
          inspectLabel="Soil Data"
        />

        <MetricCard
          title="Irrigation Status"
          value={`${data.irrigation_efficiency}%`}
          unit="Efficiency"
          change="Automated Drip On"
          changeType="positive"
          icon={Droplets}
          iconBg="#e0f2fe"
          iconColor="#0284c7"
          description="Root Zone Moisture Balanced"
          details={[
            { label: 'Drip Line Network', value: '8 of 8 Lines Active' },
            { label: 'Daily Delivery', value: '42,000 Liters/day' },
            { label: 'Power & Pumps', value: 'Solar-Assisted Online' }
          ]}
          onInspect={() => setActiveModal('irrigation')}
          inspectLabel="Sensors"
        />
      </div>

      {/* Row 2: Charts (Yield Trend & Crop Distribution) */}
      <div className="grid-2">
        {/* Yield Prediction Trend Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <TrendingUp size={18} color="#059669" />
                Multi-Season Harvest Yield Trajectory
              </h3>
              <p className="card-subtitle">Historical actual harvest vs. Machine Learning predicted yield (tons/acre)</p>
            </div>
            <span className="badge badge-success">ML Regressor R² 0.92</span>
          </div>

          <div style={{ height: '280px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.yield_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="predYieldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="histYieldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="season" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={[2.5, 5.5]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  formatter={(val) => [`${val} tons/acre`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="historical" name="Historical Baseline" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#histYieldGrad)" />
                <Area type="monotone" dataKey="predicted" name="ML Predicted Yield" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#predYieldGrad)" />
                <Line type="monotone" dataKey="actual" name="Actual Harvest" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Crop Portfolio Distribution */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Sprout size={18} color="#059669" />
                Cultivated Acreage & Performance
              </h3>
              <p className="card-subtitle">Distribution across active farm acreage and health rating</p>
            </div>
            <span className="badge badge-info">120 Acres Total</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', height: '280px' }}>
            <div style={{ width: '45%', height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.crop_distribution}
                    dataKey="acres"
                    nameKey="crop"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {data.crop_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`${val} acres`, 'Acreage']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ width: '55%', display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '10px' }}>
              {data.crop_distribution.map((crop, idx) => (
                <div key={crop.crop} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>{crop.crop}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: '#64748b' }}>{crop.acres} ac ({crop.percentage}%)</span>
                    <span style={{ fontWeight: 700, color: '#059669' }}>{crop.avg_yield} t/ac</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Soil Moisture Monitoring & Active Field Alerts */}
      <div className="grid-2">
        {/* Soil Moisture Dynamics */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Droplets size={18} color="#0284c7" />
                7-Day Root-Zone Soil Moisture (%)
              </h3>
              <p className="card-subtitle">Real-time tensiometer readings with automated irrigation triggers</p>
            </div>
            <span className="badge badge-success">Safe Band: 28% - 40%</span>
          </div>

          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.soil_moisture_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={[15, 50]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                  formatter={(val) => [`${val}%`, 'Moisture Level']}
                />
                <Line type="monotone" dataKey="moisture" name="Soil Moisture" stroke="#0284c7" strokeWidth={3} dot={{ r: 5, fill: '#0284c7' }} activeDot={{ r: 7 }} />
                <Line type="step" dataKey="optimal_min" name="Minimum Threshold" stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1.5} dot={false} />
                <Line type="step" dataKey="optimal_max" name="Saturation Limit" stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational Intelligence Alerts */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <AlertOctagon size={18} color="#e11d48" />
                Active Agronomic Field Alerts
              </h3>
              <p className="card-subtitle">Prioritized automated alerts from ML models and environmental sensors</p>
            </div>
            <button
              onClick={() => setActiveTab('recommendations')}
              className="btn btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            >
              View Protocols
              <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto' }}>
            {data.active_alerts.map((alert) => (
              <div
                key={alert.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: `1px solid ${
                    alert.level === 'warning' ? '#fde68a' : alert.level === 'alert' ? '#fecdd3' : '#bfdbfe'
                  }`,
                  backgroundColor:
                    alert.level === 'warning' ? '#fffbeb' : alert.level === 'alert' ? '#fff1f2' : '#eff6ff',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ marginTop: '2px' }}>
                  {alert.level === 'alert' && <AlertTriangle size={16} color="#e11d48" />}
                  {alert.level === 'warning' && <AlertTriangle size={16} color="#d97706" />}
                  {alert.level === 'info' && <Info size={16} color="#2563eb" />}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                      {alert.title}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{alert.timestamp}</span>
                  </div>
                  <p style={{ fontSize: '0.775rem', color: '#475569', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                    {alert.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Detail Inspection Modal */}
      {activeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 60,
            padding: '20px',
          }}
          onClick={() => setActiveModal(null)}
        >
          <div
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              padding: '28px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor:
                      activeModal === 'disease' ? '#fff1f2' : activeModal === 'crops' ? '#eff6ff' : '#ecfdf5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {activeModal === 'farms' && <Sprout size={20} color="#059669" />}
                  {activeModal === 'crops' && <HeartPulse size={20} color="#2563eb" />}
                  {activeModal === 'disease' && <AlertOctagon size={20} color="#e11d48" />}
                  {activeModal === 'yield' && <TrendingUp size={20} color="#16a34a" />}
                  {activeModal === 'productivity' && <Award size={20} color="#d97706" />}
                  {activeModal === 'weather' && <CloudLightning size={20} color="#7c3aed" />}
                  {activeModal === 'soil' && <HeartPulse size={20} color="#059669" />}
                  {activeModal === 'irrigation' && <Droplets size={20} color="#0284c7" />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 800 }}>
                    {activeModal === 'farms' && 'Total Farms & Operational Sectors'}
                    {activeModal === 'crops' && 'Monitored Crops Portfolio (5 Major Species)'}
                    {activeModal === 'disease' && 'Active Disease Incidents & Pathology Alerts'}
                    {activeModal === 'yield' && 'Yield Optimizer & Production Projections'}
                    {activeModal === 'productivity' && 'Agronomic Productivity & Biomass Index'}
                    {activeModal === 'weather' && 'Agro-Meteorological Forecast & Spray Windows'}
                    {activeModal === 'soil' && 'Soil Chemistry & Nutrient Composition'}
                    {activeModal === 'irrigation' && 'Automated Drip & Soil Moisture Telemetry'}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Detailed agronomic telemetry and machine learning diagnostic metrics
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveModal(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.25rem' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            {activeModal === 'farms' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div style={{ padding: '12px', background: 'var(--surface-bg)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>Total Acreage</span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>120.0 Acres</strong>
                  </div>
                  <div style={{ padding: '12px', background: 'var(--surface-bg)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>Active Blocks</span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>4 Cultivated Sectors</strong>
                  </div>
                  <div style={{ padding: '12px', background: 'var(--surface-bg)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>Operator</span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>Pavan Kumar</strong>
                  </div>
                </div>

                <h4 style={{ margin: '8px 0 4px', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Registered Farm Facilities
                </h4>
                <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--surface-bg)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '10px 14px' }}>Sector / Name</th>
                        <th style={{ padding: '10px 14px' }}>Acreage</th>
                        <th style={{ padding: '10px 14px' }}>Soil Type</th>
                        <th style={{ padding: '10px 14px' }}>Crops Active</th>
                        <th style={{ padding: '10px 14px' }}>Irrigation</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-main)' }}>Sector A (Central Valley)</td>
                        <td style={{ padding: '10px 14px' }}>35 Acres</td>
                        <td style={{ padding: '10px 14px' }}>Sandy Loam</td>
                        <td style={{ padding: '10px 14px' }}>Corn, Tomato</td>
                        <td style={{ padding: '10px 14px' }}><span className="badge badge-success">Drip (Active)</span></td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-main)' }}>Sector B (North Ridge)</td>
                        <td style={{ padding: '10px 14px' }}>45 Acres</td>
                        <td style={{ padding: '10px 14px' }}>Silt Loam</td>
                        <td style={{ padding: '10px 14px' }}>Rice, Corn</td>
                        <td style={{ padding: '10px 14px' }}><span className="badge badge-success">Furrow (Optimal)</span></td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-main)' }}>Sector C (South Meadow)</td>
                        <td style={{ padding: '10px 14px' }}>25 Acres</td>
                        <td style={{ padding: '10px 14px' }}>Clay Loam</td>
                        <td style={{ padding: '10px 14px' }}>Potato</td>
                        <td style={{ padding: '10px 14px' }}><span className="badge badge-success">Sprinkler (Active)</span></td>
                      </tr>
                      <tr>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-main)' }}>Sector D (Highland Basin)</td>
                        <td style={{ padding: '10px 14px' }}>15 Acres</td>
                        <td style={{ padding: '10px 14px' }}>Loam</td>
                        <td style={{ padding: '10px 14px' }}>Wheat</td>
                        <td style={{ padding: '10px 14px' }}><span className="badge badge-info">Rainfed (Good)</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button
                    onClick={() => {
                      setActiveModal(null);
                      setActiveTab('settings');
                    }}
                    className="btn btn-primary"
                    style={{ fontSize: '0.825rem' }}
                  >
                    Edit Farmer Profile in Settings
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'crops' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Multi-season crop distribution configured across 120 total acres with active phonological and disease telemetry.
                </p>

                <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--surface-bg)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '10px 14px' }}>Crop Species</th>
                        <th style={{ padding: '10px 14px' }}>Cultivated Area</th>
                        <th style={{ padding: '10px 14px' }}>Growth Stage</th>
                        <th style={{ padding: '10px 14px' }}>Target Yield</th>
                        <th style={{ padding: '10px 14px' }}>Health Index</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-main)' }}>🌽 Corn (Maize)</td>
                        <td style={{ padding: '10px 14px' }}>40 Acres (33%)</td>
                        <td style={{ padding: '10px 14px' }}>Vegetative (V6)</td>
                        <td style={{ padding: '10px 14px' }}>5.4 tons/acre</td>
                        <td style={{ padding: '10px 14px' }}><span className="badge badge-success">94% Robust</span></td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-main)' }}>🌾 Rice</td>
                        <td style={{ padding: '10px 14px' }}>30 Acres (25%)</td>
                        <td style={{ padding: '10px 14px' }}>Active Tillering</td>
                        <td style={{ padding: '10px 14px' }}>4.8 tons/acre</td>
                        <td style={{ padding: '10px 14px' }}><span className="badge badge-success">96% Excellent</span></td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-main)' }}>🍅 Tomato</td>
                        <td style={{ padding: '10px 14px' }}>20 Acres (17%)</td>
                        <td style={{ padding: '10px 14px' }}>Early Flowering</td>
                        <td style={{ padding: '10px 14px' }}>4.2 tons/acre</td>
                        <td style={{ padding: '10px 14px' }}><span className="badge badge-warning">88% (Scouting)</span></td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-main)' }}>🥔 Potato</td>
                        <td style={{ padding: '10px 14px' }}>15 Acres (13%)</td>
                        <td style={{ padding: '10px 14px' }}>Tuberization</td>
                        <td style={{ padding: '10px 14px' }}>5.0 tons/acre</td>
                        <td style={{ padding: '10px 14px' }}><span className="badge badge-warning">90% (Preventive)</span></td>
                      </tr>
                      <tr>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-main)' }}>🌾 Wheat</td>
                        <td style={{ padding: '10px 14px' }}>15 Acres (12%)</td>
                        <td style={{ padding: '10px 14px' }}>Booting Stage</td>
                        <td style={{ padding: '10px 14px' }}>3.6 tons/acre</td>
                        <td style={{ padding: '10px 14px' }}><span className="badge badge-success">92% Vigorous</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    onClick={() => {
                      setActiveModal(null);
                      setActiveTab('disease');
                    }}
                    className="btn btn-primary"
                    style={{ fontSize: '0.825rem' }}
                  >
                    <Scan size={16} /> Scan Leaf for Disease
                  </button>
                  <button
                    onClick={() => {
                      setActiveModal(null);
                      setActiveTab('yield');
                    }}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.825rem' }}
                  >
                    <TrendingUp size={16} /> Optimize Crop Yield
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'disease' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Active foliar pathology incidents detected by computer vision models and sensor humidity alerts:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ padding: '14px', borderRadius: '10px', border: '1px solid #fecdd3', background: '#fff1f2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <strong style={{ color: '#9f1239', fontSize: '0.9rem' }}>🍅 Tomato Early Blight (Sector A - 20 Acres)</strong>
                      <span className="badge badge-danger">Moderate Severity</span>
                    </div>
                    <p style={{ margin: '0 0 8px', fontSize: '0.8rem', color: '#881337', lineHeight: 1.4 }}>
                      Target-board concentric brown spots detected on lower leaves. Chlorotic halos developing around lesions.
                    </p>
                    <div style={{ fontSize: '0.775rem', color: '#4c0519', background: '#ffe4e6', padding: '8px 10px', borderRadius: '6px' }}>
                      <strong>Immediate Protocol:</strong> Apply copper-based protectant fungicide (copper hydroxide) or chlorothalonil. Prune lower canopy foliage to restrict spore ascent.
                    </div>
                  </div>

                  <div style={{ padding: '14px', borderRadius: '10px', border: '1px solid #fde68a', background: '#fffbeb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <strong style={{ color: '#92400e', fontSize: '0.9rem' }}>🥔 Potato Late Blight Risk (Sector C - 15 Acres)</strong>
                      <span className="badge badge-warning">Micro-Climate Alert</span>
                    </div>
                    <p style={{ margin: '0 0 8px', fontSize: '0.8rem', color: '#78350f', lineHeight: 1.4 }}>
                      Relative humidity forecast exceeding 85% with night temperatures around 18°C creates favorable zoospore conditions.
                    </p>
                    <div style={{ fontSize: '0.775rem', color: '#451a03', background: '#fef3c7', padding: '8px 10px', borderRadius: '6px' }}>
                      <strong>Recommended Protocol:</strong> Apply preventative protectant fungicide (mancozeb) before the forecasted rain front arrives.
                    </div>
                  </div>

                  <div style={{ padding: '14px', borderRadius: '10px', border: '1px solid #bbf7d0', background: '#f0fdf4' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <strong style={{ color: '#166534', fontSize: '0.9rem' }}>🌽 Corn & 🌾 Rice Foliage (Sectors B & D - 60 Acres)</strong>
                      <span className="badge badge-success">0 Incidents Detected</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#14532d' }}>
                      No fungal blight or sheath blight symptoms detected during recent field scouting passes. Maintain preventative bio-inoculants.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    onClick={() => {
                      setActiveModal(null);
                      setActiveTab('disease');
                    }}
                    className="btn btn-primary"
                    style={{ fontSize: '0.825rem' }}
                  >
                    <Scan size={16} /> Open Disease Detection & Scan Leaf
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'yield' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div style={{ padding: '12px', background: 'var(--surface-bg)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>Predicted Average</span>
                    <strong style={{ fontSize: '1.1rem', color: '#059669' }}>4.6 tons/acre</strong>
                  </div>
                  <div style={{ padding: '12px', background: 'var(--surface-bg)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>Expected Production</span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>552.0 Metric Tons</strong>
                  </div>
                  <div style={{ padding: '12px', background: 'var(--surface-bg)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>Model R² Score</span>
                    <strong style={{ fontSize: '1.1rem', color: '#2563eb' }}>0.992 (Gradient Boosting)</strong>
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  The yield prediction engine evaluates multi-factorial environmental conditions (soil pH, rainfall, temperature, irrigation, NPK values) to forecast tonnage per acre.
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    onClick={() => {
                      setActiveModal(null);
                      setActiveTab('yield');
                    }}
                    className="btn btn-primary"
                    style={{ fontSize: '0.825rem' }}
                  >
                    <TrendingUp size={16} /> Open Yield Optimizer Simulator
                  </button>
                </div>
              </div>
            )}

            {(activeModal === 'productivity' || activeModal === 'weather' || activeModal === 'soil' || activeModal === 'irrigation') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '16px', background: 'var(--surface-bg)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '0.95rem', color: 'var(--text-main)' }}>Telemetry Breakdown</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    <li>Productivity Biomass Index: <strong>87/100 (Optimal Crop Canopy Density)</strong></li>
                    <li>Micro-Climate Station: <strong>26.8°C, 68% Relative Humidity, 14 km/h Wind</strong></li>
                    <li>Soil Sub-Surface Sensors: <strong>pH 6.5, Nitrogen 140 mg/kg, Organic Carbon 3.6%</strong></li>
                    <li>Irrigation Delivery: <strong>Automated Drip Active across 8 Zones (28 kPa Soil Tension)</strong></li>
                  </ul>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="btn btn-primary"
                    style={{ fontSize: '0.825rem' }}
                  >
                    Close Inspection
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
