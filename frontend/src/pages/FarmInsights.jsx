import React, { useState } from 'react';
import {
  BarChart3,
  Filter,
  TrendingUp,
  Award,
  Layers,
  Calendar,
  MapPin,
  Sprout,
  Activity,
  Droplets,
  AlertOctagon
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';

export default function FarmInsights({ insightsData }) {
  const [selectedCrop, setSelectedCrop] = useState('All Crops');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedSeason, setSelectedSeason] = useState('All Seasons');

  const data = insightsData || {
    yield_trend: [],
    crop_distribution: [],
    disease_distribution: [],
    soil_moisture_trend: []
  };

  // Radar chart data for Soil Condition multi-axis health
  const soilRadarData = [
    { subject: 'Soil pH Balance', score: 86, fullMark: 100 },
    { subject: 'Organic Carbon', score: 78, fullMark: 100 },
    { subject: 'Nitrogen (N)', score: 90, fullMark: 100 },
    { subject: 'Phosphorus (P)', score: 72, fullMark: 100 },
    { subject: 'Potassium (K)', score: 84, fullMark: 100 },
    { subject: 'Microbial Activity', score: 81, fullMark: 100 },
  ];

  // Irrigation usage efficiency by sector
  const irrigationUsageData = [
    { sector: 'Sector A (Corn)', applied: 250, baseline: 270, efficiency: 93 },
    { sector: 'Sector B (Rice)', applied: 520, baseline: 500, efficiency: 89 },
    { sector: 'Sector C (Tomato)', applied: 480, baseline: 510, efficiency: 94 },
    { sector: 'Sector D (Wheat)', applied: 290, baseline: 310, efficiency: 95 },
    { sector: 'Sector E (Potato)', applied: 560, baseline: 540, efficiency: 88 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Filter Bar */}
      <div className="card" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Filter size={18} color="#059669" />
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>
            Filter Analytical Scope:
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '6px 14px', fontSize: '0.825rem' }}
          >
            <option value="All Crops">All Crops (Portfolio)</option>
            <option value="Corn">Corn</option>
            <option value="Rice">Rice</option>
            <option value="Wheat">Wheat</option>
            <option value="Tomato">Tomato</option>
            <option value="Potato">Potato</option>
          </select>

          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '6px 14px', fontSize: '0.825rem' }}
          >
            <option value="All Locations">All Farm Blocks</option>
            <option value="Central Valley">Central Valley</option>
            <option value="Highland Terraces">Highland Terraces</option>
            <option value="River Basin Delta">River Basin Delta</option>
          </select>

          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '6px 14px', fontSize: '0.825rem' }}
          >
            <option value="All Seasons">All Historical Seasons</option>
            <option value="2026 Monsoon">2026 Monsoon (Current)</option>
            <option value="2025 Winter">2025 Winter</option>
            <option value="2025 Monsoon">2025 Monsoon</option>
          </select>
        </div>
      </div>

      {/* Grid: Historical Yield vs Prediction & Soil Radar */}
      <div className="grid-2">
        {/* Historical vs Predicted Yield */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <TrendingUp size={18} color="#059669" />
                Historical vs. Predicted Harvest Yield
              </h3>
              <p className="card-subtitle">Tracking multi-season yield variance (tons/acre)</p>
            </div>
            <span className="badge badge-success">+12.2% Overall Gain</span>
          </div>

          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.yield_trend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="season" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 6]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                  formatter={(val) => [`${val} tons/acre`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="historical" name="Historical Harvest" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="predicted" name="ML Predicted Target" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" name="Validated Actual" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Soil Condition Multi-Factor Radar */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Activity size={18} color="#059669" />
                Soil Health & Bio-Chemical Index
              </h3>
              <p className="card-subtitle">Comprehensive soil profile benchmarking across sectors</p>
            </div>
            <span className="badge badge-info">Index: 82/100</span>
          </div>

          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={soilRadarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <Radar name="Soil Health Score" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid: Crop Performance Comparison & Irrigation Efficiency */}
      <div className="grid-2">
        {/* Crop Performance Matrix */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Sprout size={18} color="#059669" />
                Individual Crop Performance Matrix
              </h3>
              <p className="card-subtitle">Comparing average productivity against health index</p>
            </div>
            <span className="badge badge-success">5 Active Crops</span>
          </div>

          <div style={{ height: '280px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.crop_distribution} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="crop" tick={{ fontSize: 12, fill: '#334155', fontWeight: 600 }} />
                <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar yAxisId="left" dataKey="avg_yield" name="Avg Yield (tons/ac)" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="health_index" name="Crop Health Score (0-100)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Irrigation Efficiency by Sector */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Droplets size={18} color="#0284c7" />
                Sector Irrigation Usage & Efficiency
              </h3>
              <p className="card-subtitle">Water volume applied (mm) vs. crop requirement baseline</p>
            </div>
            <span className="badge badge-info">Avg Efficiency: 91.8%</span>
          </div>

          <div style={{ height: '280px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={irrigationUsageData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="sector" tick={{ fontSize: 11, fill: '#334155' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="applied" name="Applied Irrigation (mm)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="baseline" name="Optimal Requirement (mm)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
