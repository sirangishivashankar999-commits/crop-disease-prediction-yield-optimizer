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
  ExternalLink,
  ChevronDown,
  Sparkles,
  CloudSun,
  Send,
  Leaf,
  ShieldAlert,
  BarChart3,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import MetricCard from '../components/MetricCard';

const DONUT_COLORS = [
  '#10B981', // Corn (Emerald)
  '#14B8A6', // Rice (Teal)
  '#F59E0B', // Tomato (Amber)
  '#8B5CF6', // Potato (Purple)
  '#38BDF8', // Wheat (Blue)
];

const YIELD_TREND_DATA = [
  { month: 'Jan', yield: 2.2 },
  { month: 'Feb', yield: 2.8 },
  { month: 'Mar', yield: 3.4 },
  { month: 'Apr', yield: 3.2 },
  { month: 'May', yield: 4.4 },
  { month: 'Jun', yield: 3.9, annotation: 'June 2025\nPrediction: 4.6 ton/acre' },
  { month: 'Jul', yield: 4.6 },
];

const CROP_DISTRIBUTION_DATA = [
  { name: 'Corn (Maize)', acres: 40, percentage: 33, color: '#10B981' },
  { name: 'Rice', acres: 35, percentage: 29, color: '#14B8A6' },
  { name: 'Tomato', acres: 20, percentage: 17, color: '#F59E0B' },
  { name: 'Potato', acres: 15, percentage: 12, color: '#8B5CF6' },
  { name: 'Wheat', acres: 10, percentage: 9, color: '#38BDF8' },
];

export default function Dashboard({ insightsData, weatherData, setActiveTab, onOpenAI }) {
  const [activeModal, setActiveModal] = useState(null);
  const [questionInput, setQuestionInput] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('This Season');

  const data = insightsData || {
    total_farms: 4,
    crops_monitored: 5,
    disease_alerts_active: 87,
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

  const handleAskAISubmit = (e) => {
    e.preventDefault();
    if (onOpenAI) {
      onOpenAI();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', minWidth: 0 }}>
      {/* 1. Quick Action Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #064E3B 0%, #065F46 45%, #0D543A 80%, #064E3B 100%)',
          borderRadius: '16px',
          padding: '30px 36px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(6, 78, 59, 0.35)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
        }}
      >
        {/* Subtle Network Constellation / Grid background overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(circle at 75% 50%, rgba(20, 184, 166, 0.18) 0%, transparent 60%),
                              radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)`,
            backgroundSize: '100% 100%, 24px 24px',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '620px', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(167, 243, 208, 0.3)',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#A7F3D0',
              marginBottom: '14px',
              backdropFilter: 'blur(4px)',
            }}
          >
            <Sprout size={14} color="#6EE7B7" />
            Autonomous Crop Intelligence Platform
          </div>

          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              margin: '0 0 10px 0',
              lineHeight: 1.2,
            }}
          >
            Welcome to Predictive Crop<br />Disease & Yield Optimizer
          </h1>

          <p
            style={{
              fontSize: '0.925rem',
              color: '#D1FAE5',
              lineHeight: 1.5,
              margin: '0 0 22px 0',
              maxWidth: '560px',
            }}
          >
            Harness real machine learning models to detect foliar crop diseases from leaf scans and optimize harvest yields with multi-factorial agronomic regression.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('disease')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: '10px',
                background: '#ffffff',
                color: '#064E3B',
                fontWeight: 700,
                fontSize: '0.875rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
            >
              <Scan size={18} color="#059669" />
              Scan Crop Leaf
            </button>

            <button
              onClick={() => setActiveTab('yield')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <TrendingUp size={18} color="#6EE7B7" />
              Optimize Yield
            </button>
          </div>
        </div>

        {/* Right Agricultural Leaf & Constellation Graphic */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            width: '280px',
            height: '200px',
            flexShrink: 0,
            zIndex: 1,
          }}
          className="hero-art-container"
        >
          <svg width="240" height="190" viewBox="0 0 240 190" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Ambient Glow */}
            <circle cx="160" cy="110" r="70" fill="url(#heroPlantGlow)" fillOpacity="0.4" />

            {/* Neural network nodes connecting to plant */}
            <g stroke="rgba(110, 231, 183, 0.35)" strokeWidth="1.5" strokeDasharray="3 3">
              <line x1="20" y1="120" x2="60" y2="90" />
              <line x1="60" y1="90" x2="110" y2="100" />
              <line x1="110" y1="100" x2="150" y2="60" />
              <line x1="60" y1="90" x2="80" y2="140" />
              <line x1="80" y1="140" x2="135" y2="135" />
            </g>
            <circle cx="20" cy="120" r="3.5" fill="#34D399" />
            <circle cx="60" cy="90" r="4.5" fill="#10B981" />
            <circle cx="110" cy="100" r="3.5" fill="#6EE7B7" />
            <circle cx="80" cy="140" r="3" fill="#34D399" />

            {/* Main Sprout Plant */}
            {/* Stem */}
            <path d="M160 175 C160 140, 155 105, 150 55" stroke="#34D399" strokeWidth="4.5" strokeLinecap="round" />
            {/* Top Leaf */}
            <path
              d="M150 55 C140 30, 150 15, 165 25 C175 35, 165 50, 150 55 Z"
              fill="url(#leafGradTop)"
            />
            {/* Left Main Leaf */}
            <path
              d="M154 95 C120 85, 100 100, 110 120 C125 135, 145 115, 154 95 Z"
              fill="url(#leafGradLeft)"
            />
            {/* Right Main Leaf */}
            <path
              d="M156 80 C190 70, 215 85, 205 105 C190 125, 168 100, 156 80 Z"
              fill="url(#leafGradRight)"
            />
            {/* Lower Right Small Leaf */}
            <path
              d="M158 125 C185 120, 200 135, 190 148 C175 160, 162 140, 158 125 Z"
              fill="url(#leafGradTop)"
            />
            {/* Lower Left Small Leaf */}
            <path
              d="M156 135 C132 135, 120 150, 130 162 C145 170, 154 150, 156 135 Z"
              fill="url(#leafGradLeft)"
            />

            <defs>
              <radialGradient id="heroPlantGlow" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="leafGradTop" x1="145" y1="15" x2="175" y2="55" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6EE7B7" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="leafGradLeft" x1="100" y1="85" x2="154" y2="135" gradientUnits="userSpaceOnUse">
                <stop stopColor="#34D399" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>
              <linearGradient id="leafGradRight" x1="215" y1="70" x2="156" y2="125" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6EE7B7" />
                <stop offset="100%" stopColor="#065F46" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* 2. Four Main Dashboard Summary Cards */}
      <div className="grid-4">
        {/* CARD 1: TOTAL FARMS */}
        <MetricCard
          title="TOTAL FARMS"
          value={data.total_farms || 4}
          unit="Active Sites"
          icon={Sprout}
          iconBg="#10B981"
          iconColor="#10B981"
          details={[
            { label: 'Cultivated Land', value: '120.0 Acres' },
            { label: 'Sectors Monitored', value: '4 Blocks (A, B, C, D)' },
            { label: 'Top Facility', value: 'Central Valley (35 ac)' }
          ]}
          onInspect={() => setActiveModal('farms')}
          inspectLabel="View All Farms →"
        />

        {/* CARD 2: CROPS MONITORED */}
        <MetricCard
          title="CROPS MONITORED"
          value={data.crops_monitored || 5}
          unit="Major Species"
          icon={Leaf}
          iconBg="#14B8A6"
          iconColor="#14B8A6"
          details={[
            { label: 'Corn (Maize)', value: '40 ac • Vegetative' },
            { label: 'Rice & Wheat', value: '45 ac • Tillering/Booting' },
            { label: 'Tomato & Potato', value: '35 ac • Flowering' }
          ]}
          onInspect={() => setActiveModal('crops')}
          inspectLabel="View Crop Breakdown →"
        />

        {/* CARD 3: DISEASE ALERTS */}
        <MetricCard
          title="DISEASE ALERTS"
          value={data.disease_alerts_active || 87}
          unit="Incidents"
          icon={ShieldAlert}
          iconBg="#EF4444"
          iconColor="#EF4444"
          details={[
            { label: 'Tomato Early Blight', value: 'Sector A • 12' },
            { label: 'Potato Blight Risk', value: 'Sector C • 09' },
            { label: 'Corn & Rice Health', value: 'Clean Foliage' }
          ]}
          onInspect={() => setActiveModal('disease')}
          inspectLabel="View All Alerts →"
        />

        {/* CARD 4: AVG PREDICTED YIELD */}
        <MetricCard
          title="AVG PREDICTED YIELD"
          value={data.average_predicted_yield ? `${data.average_predicted_yield}` : '4.6'}
          unit="tons/acre"
          icon={BarChart3}
          iconBg="#8B5CF6"
          iconColor="#8B5CF6"
          details={[
            { label: 'Gross Farm Harvest', value: '552 Total Metric Tons' },
            { label: 'High Yield Leader', value: 'Corn @ 5.4 tons/acre' },
            { label: 'ML Algorithm', value: 'Gradient Boosting (R² 0.992)' }
          ]}
          onInspect={() => setActiveModal('yield')}
          inspectLabel="View Analytics →"
        />
      </div>

      {/* 3. Three-Column Analytics Section */}
      <div className="grid-3">
        {/* FIRST: Yield Prediction Trend Line Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div>
                <h3 style={{ fontSize: '0.975rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  Yield Prediction Trend
                </h3>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>tons/acre</span>
              </div>

              {/* Filter Dropdown */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--surface-bg)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <span>{seasonFilter}</span>
                <ChevronDown size={13} color="var(--text-muted)" />
              </div>
            </div>

            {/* Chart Canvas */}
            <div style={{ height: '200px', width: '100%', marginTop: '12px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={YIELD_TREND_DATA} margin={{ top: 15, right: 15, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    axisLine={{ stroke: 'var(--border-subtle)' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 6.0]}
                    ticks={[0, 1.5, 3.0, 4.5, 6.0]}
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    axisLine={{ stroke: 'var(--border-subtle)' }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--surface-card)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      boxShadow: 'var(--shadow-md)',
                      color: 'var(--text-main)',
                      fontSize: '0.775rem'
                    }}
                    formatter={(val) => [`${val} ton/acre`, 'Predicted']}
                  />
                  <Line
                    type="monotone"
                    dataKey="yield"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#10B981', stroke: 'var(--surface-card)', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#34D399', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              paddingTop: '10px',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
            <span>Predicted Yield (ton/acre)</span>
          </div>
        </div>

        {/* SECOND: Top Performing Crops Donut Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '0.975rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 12px 0' }}>
              Top Performing Crops
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', height: '185px' }}>
              {/* Donut Chart with Center Text */}
              <div style={{ width: '50%', height: '100%', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={CROP_DISTRIBUTION_DATA}
                      dataKey="acres"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={72}
                      paddingAngle={3}
                      stroke="transparent"
                    >
                      {CROP_DISTRIBUTION_DATA.map((entry, index) => (
                        <Cell key={`donut-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--surface-card)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)',
                        boxShadow: 'var(--shadow-md)',
                        color: 'var(--text-main)',
                        fontSize: '0.75rem'
                      }}
                      formatter={(val, name) => [`${val} Acres`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center Badge in Donut */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 800 }}>120</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Acres</div>
                </div>
              </div>

              {/* Legend Listing */}
              <div style={{ width: '50%', display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '8px' }}>
                {CROP_DISTRIBUTION_DATA.map((crop) => (
                  <div key={crop.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: crop.color, flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-main)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {crop.name}
                      </span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', flexShrink: 0 }}>
                      {crop.acres} ac ({crop.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: '10px',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <button
              onClick={() => setActiveModal('crops')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#10B981',
                fontSize: '0.785rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              View Crop Performance →
            </button>
          </div>
        </div>

        {/* THIRD: Weather Overview Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '0.975rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 14px 0' }}>
              Weather Overview
            </h3>

            {/* Sun/Cloud & Temp */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(56, 189, 248, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <CloudSun size={32} color="#F59E0B" />
              </div>

              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
                  {weatherData?.temperature || 26.8}°C
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {weatherData?.condition || 'Partly Cloudy'}
                </div>
              </div>
            </div>

            {/* 4-Metric Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px',
                background: 'var(--surface-bg)',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Humidity</span>
                <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {weatherData?.humidity ? `${weatherData.humidity}%` : '65%'}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Wind</span>
                <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {weatherData?.wind_speed ? `${weatherData.wind_speed} km/h` : '12 km/h'}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Rain Chance</span>
                <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)' }}>15%</span>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Feels Like</span>
                <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {weatherData?.feels_like ? `${weatherData.feels_like}°C` : '27.3°C'}
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: '10px',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <button
              onClick={() => setActiveTab('weather')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#38BDF8',
                fontSize: '0.785rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              View Full Forecast →
            </button>
          </div>
        </div>
      </div>

      {/* 4. Bottom Operational Row (Recent Activity, AI Insights, Ask CropWise AI) */}
      <div className="grid-3">
        {/* RECENT ACTIVITY */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '0.975rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 14px 0' }}>
              Recent Activity
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Activity 1 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#10B981',
                      marginTop: '2px',
                      flexShrink: 0,
                    }}
                  >
                    <Scan size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      Leaf scan completed - Tomato (Block A)
                    </div>
                    <div style={{ fontSize: '0.725rem', color: '#EF4444', marginTop: '1px' }}>
                      Early Blight detected
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#EF4444', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  10 min ago
                </span>
              </div>

              {/* Activity 2 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#10B981',
                      marginTop: '2px',
                      flexShrink: 0,
                    }}
                  >
                    <TrendingUp size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      Yield prediction updated - Corn (Block B)
                    </div>
                    <div style={{ fontSize: '0.725rem', color: '#10B981', marginTop: '1px' }}>
                      Prediction improved by 4.8%
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  1 hour ago
                </span>
              </div>

              {/* Activity 3 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(56, 189, 248, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#38BDF8',
                      marginTop: '2px',
                      flexShrink: 0,
                    }}
                  >
                    <Droplets size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      Irrigation recommendation generated
                    </div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                      Block C • Next irrigation in 2 days
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#38BDF8', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  3 hours ago
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI INSIGHTS */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#F59E0B',
                }}
              >
                <Sparkles size={15} />
              </div>
              <h3 style={{ fontSize: '0.975rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                AI Insights
              </h3>
            </div>

            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              Corn crops in Block A showing excellent growth potential. Maintain current irrigation schedule and monitor for common leaf diseases.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: '10px',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <button
              onClick={() => setActiveTab('insights')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#10B981',
                fontSize: '0.785rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              View All Insights →
            </button>
          </div>
        </div>

        {/* ASK CROPWISE AI ASSISTANT CARD */}
        <div
          className="card"
          style={{
            background: 'var(--surface-card)',
            border: '1px solid rgba(139, 92, 246, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="#A78BFA" />
                <h3 style={{ fontSize: '0.975rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Ask CropWise AI
                </h3>
              </div>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  backgroundColor: '#8B5CF6',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '6px',
                }}
              >
                AI Assistant
              </span>
            </div>

            <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', lineHeight: 1.4, margin: '0 0 14px 0', maxWidth: '75%' }}>
              Get intelligent insights, recommendations and solutions for your farm in real-time.
            </p>

            {/* Input Row */}
            <form onSubmit={handleAskAISubmit} style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                placeholder="Type your question here..."
                style={{
                  flex: 1,
                  background: 'var(--surface-bg)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: 'var(--text-main)',
                  fontSize: '0.775rem',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  background: '#8B5CF6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'opacity 0.2s ease',
                }}
                title="Send to CropWise AI"
              >
                <Send size={14} />
              </button>
            </form>
          </div>

          {/* Cute 3D Robot Mascot Avatar Artwork in bottom-right */}
          <div
            style={{
              position: 'absolute',
              right: '12px',
              bottom: '8px',
              width: '84px',
              height: '84px',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          >
            <svg width="84" height="84" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Soft purple glow under robot */}
              <ellipse cx="50" cy="90" rx="35" ry="8" fill="#8B5CF6" fillOpacity="0.25" />

              {/* Robot Body */}
              <rect x="25" y="46" width="50" height="42" rx="16" fill="url(#botBodyGrad)" />
              {/* Sprout on Chest */}
              <circle cx="50" cy="65" r="9" fill="rgba(16, 185, 129, 0.2)" />
              <path d="M50 69 C50 63, 49 61, 48 58" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M48 58 C45 55, 43 56, 44 59 C45 61, 47 60, 48 58 Z" fill="#10B981" />
              <path d="M49 60 C53 58, 55 60, 54 62 C53 64, 50 62, 49 60 Z" fill="#34D399" />

              {/* Robot Arms */}
              <rect x="15" y="52" width="8" height="20" rx="4" fill="#D8B4FE" />
              <rect x="77" y="52" width="8" height="20" rx="4" fill="#D8B4FE" />

              {/* Robot Neck */}
              <rect x="42" y="38" width="16" height="8" rx="2" fill="#C084FC" />

              {/* Robot Head */}
              <rect x="20" y="10" width="60" height="34" rx="14" fill="url(#botHeadGrad)" />

              {/* Visor Screen */}
              <rect x="26" y="16" width="48" height="22" rx="9" fill="#0B1324" />

              {/* Glowing Cyan Eyes */}
              <ellipse cx="38" cy="27" rx="5" ry="4" fill="#38BDF8" />
              <ellipse cx="62" cy="27" rx="5" ry="4" fill="#38BDF8" />
              <circle cx="39" cy="26" r="1.5" fill="#ffffff" />
              <circle cx="63" cy="26" r="1.5" fill="#ffffff" />

              {/* Robot Ears / Antennae */}
              <rect x="14" y="20" width="6" height="12" rx="3" fill="#A855F7" />
              <rect x="80" y="20" width="6" height="12" rx="3" fill="#A855F7" />

              <defs>
                <linearGradient id="botHeadGrad" x1="20" y1="10" x2="80" y2="44" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#F8FAFC" />
                  <stop offset="100%" stopColor="#E2E8F0" />
                </linearGradient>
                <linearGradient id="botBodyGrad" x1="25" y1="46" x2="75" y2="88" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#CBD5E1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* 5. Interactive Detail Inspection Modals */}
      {activeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(6px)',
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
              color: 'var(--text-main)',
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
                      activeModal === 'disease' ? 'rgba(239, 68, 68, 0.15)' : activeModal === 'crops' ? 'rgba(20, 184, 166, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {activeModal === 'farms' && <Sprout size={20} color="#10B981" />}
                  {activeModal === 'crops' && <Leaf size={20} color="#14B8A6" />}
                  {activeModal === 'disease' && <ShieldAlert size={20} color="#EF4444" />}
                  {activeModal === 'yield' && <BarChart3 size={20} color="#8B5CF6" />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 800 }}>
                    {activeModal === 'farms' && 'Total Farms & Operational Sectors'}
                    {activeModal === 'crops' && 'Monitored Crops Portfolio (5 Major Species)'}
                    {activeModal === 'disease' && 'Active Disease Incidents & Pathology Alerts'}
                    {activeModal === 'yield' && 'Yield Optimizer & Production Projections'}
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
                    <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>Central Valley Farm</strong>
                  </div>
                </div>

                <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--surface-bg)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '10px 14px' }}>Sector / Name</th>
                        <th style={{ padding: '10px 14px' }}>Acreage</th>
                        <th style={{ padding: '10px 14px' }}>Soil Type</th>
                        <th style={{ padding: '10px 14px' }}>Crops Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-main)' }}>Sector A (Central Valley)</td>
                        <td style={{ padding: '10px 14px' }}>35 Acres</td>
                        <td style={{ padding: '10px 14px' }}>Sandy Loam</td>
                        <td style={{ padding: '10px 14px' }}>Corn, Tomato</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-main)' }}>Sector B (North Ridge)</td>
                        <td style={{ padding: '10px 14px' }}>45 Acres</td>
                        <td style={{ padding: '10px 14px' }}>Silt Loam</td>
                        <td style={{ padding: '10px 14px' }}>Rice, Corn</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-main)' }}>Sector C (South Meadow)</td>
                        <td style={{ padding: '10px 14px' }}>25 Acres</td>
                        <td style={{ padding: '10px 14px' }}>Clay Loam</td>
                        <td style={{ padding: '10px 14px' }}>Potato</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-main)' }}>Sector D (Highland Basin)</td>
                        <td style={{ padding: '10px 14px' }}>15 Acres</td>
                        <td style={{ padding: '10px 14px' }}>Loam</td>
                        <td style={{ padding: '10px 14px' }}>Wheat</td>
                      </tr>
                    </tbody>
                  </table>
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
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-main)' }}>🌽 Corn (Maize)</td>
                        <td style={{ padding: '10px 14px' }}>40 Acres (33%)</td>
                        <td style={{ padding: '10px 14px' }}>Vegetative</td>
                        <td style={{ padding: '10px 14px', color: '#10B981', fontWeight: 700 }}>5.4 tons/acre</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-main)' }}>🌾 Rice</td>
                        <td style={{ padding: '10px 14px' }}>30 Acres (25%)</td>
                        <td style={{ padding: '10px 14px' }}>Active Tillering</td>
                        <td style={{ padding: '10px 14px', color: '#10B981', fontWeight: 700 }}>4.8 tons/acre</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-main)' }}>🍅 Tomato</td>
                        <td style={{ padding: '10px 14px' }}>20 Acres (17%)</td>
                        <td style={{ padding: '10px 14px' }}>Early Flowering</td>
                        <td style={{ padding: '10px 14px', color: '#10B981', fontWeight: 700 }}>4.2 tons/acre</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-main)' }}>🥔 Potato</td>
                        <td style={{ padding: '10px 14px' }}>15 Acres (12%)</td>
                        <td style={{ padding: '10px 14px' }}>Tuberization</td>
                        <td style={{ padding: '10px 14px', color: '#10B981', fontWeight: 700 }}>5.0 tons/acre</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-main)' }}>🌾 Wheat</td>
                        <td style={{ padding: '10px 14px' }}>15 Acres (12%)</td>
                        <td style={{ padding: '10px 14px' }}>Booting Stage</td>
                        <td style={{ padding: '10px 14px', color: '#10B981', fontWeight: 700 }}>3.6 tons/acre</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeModal === 'disease' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Foliar pathology incidents detected by computer vision models and sensor humidity alerts:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ padding: '14px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.1)' }}>
                    <strong style={{ color: '#F87171', fontSize: '0.9rem' }}>🍅 Tomato Early Blight (Sector A - 20 Acres)</strong>
                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#FECDD3' }}>
                      Target-board concentric brown spots detected on lower leaves. Treat with copper-based protectant.
                    </p>
                  </div>

                  <div style={{ padding: '14px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.1)' }}>
                    <strong style={{ color: '#FBBF24', fontSize: '0.9rem' }}>🥔 Potato Late Blight Risk (Sector C - 15 Acres)</strong>
                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#FDE68A' }}>
                      Relative humidity forecast exceeding 85% creates favorable zoospore conditions.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button
                    onClick={() => {
                      setActiveModal(null);
                      setActiveTab('disease');
                    }}
                    style={{
                      background: '#10B981',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontWeight: 700,
                      fontSize: '0.825rem',
                      cursor: 'pointer',
                    }}
                  >
                    Open Disease Scanner →
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'yield' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div style={{ padding: '12px', background: 'var(--surface-bg)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>Predicted Average</span>
                    <strong style={{ fontSize: '1.1rem', color: '#10B981' }}>4.6 tons/acre</strong>
                  </div>
                  <div style={{ padding: '12px', background: 'var(--surface-bg)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>Expected Production</span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>552.0 Metric Tons</strong>
                  </div>
                  <div style={{ padding: '12px', background: 'var(--surface-bg)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>Champion Model</span>
                    <strong style={{ fontSize: '1.1rem', color: '#8B5CF6' }}>Gradient Boosting</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button
                    onClick={() => {
                      setActiveModal(null);
                      setActiveTab('yield');
                    }}
                    style={{
                      background: '#8B5CF6',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontWeight: 700,
                      fontSize: '0.825rem',
                      cursor: 'pointer',
                    }}
                  >
                    Open Yield Optimizer →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Responsive Breakpoints Styling */}
      <style>{`
        @media (max-width: 900px) {
          .hero-art-container {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
