import React, { useState } from 'react';
import {
  Droplets,
  FlaskConical,
  Activity,
  HeartPulse,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

export default function SoilIrrigation() {
  const [ph, setPh] = useState(6.5);
  const [moisture, setMoisture] = useState(32);
  const [nitrogen, setNitrogen] = useState(95);
  const [phosphorus, setPhosphorus] = useState(45);
  const [potassium, setPotassium] = useState(60);
  const [organicMatter, setOrganicMatter] = useState(3.4);

  // Dynamic calculations based on live sliders
  const calculateSoilHealthScore = () => {
    let score = 100;
    // pH penalty
    score -= Math.abs(ph - 6.6) * 16;
    // Moisture penalty
    if (moisture < 28) score -= (28 - moisture) * 2.2;
    if (moisture > 40) score -= (moisture - 40) * 1.8;
    // Nutrient balance
    if (nitrogen < 70) score -= 8;
    if (phosphorus < 30) score -= 6;
    if (potassium < 40) score -= 6;
    return Math.max(25, Math.min(99, Math.round(score)));
  };

  const calculateIrrigationRecommendation = () => {
    if (moisture < 24) {
      return {
        status: 'Critical Deficit',
        urgency: 'high',
        runtimeMinutes: 90,
        volumeMm: 22,
        advice: 'Soil moisture is approaching the permanent wilting point. Immediate pulse fertigation required.',
      };
    } else if (moisture < 28) {
      return {
        status: 'Moderate Deficit',
        urgency: 'medium',
        runtimeMinutes: 45,
        volumeMm: 12,
        advice: 'Moisture below optimal threshold. Schedule morning drip cycle to prevent vegetative stress.',
      };
    } else if (moisture <= 38) {
      return {
        status: 'Optimal Moisture',
        urgency: 'low',
        runtimeMinutes: 0,
        volumeMm: 0,
        advice: 'Soil moisture satisfies crop evapotranspiration demand. No supplemental irrigation needed.',
      };
    } else {
      return {
        status: 'Moisture Excess',
        urgency: 'warning',
        runtimeMinutes: 0,
        volumeMm: 0,
        advice: 'Soil pores saturated. Ensure field drainage culverts are open to prevent root hypoxia.',
      };
    }
  };

  const healthScore = calculateSoilHealthScore();
  const irrigRec = calculateIrrigationRecommendation();

  // NPK comparison chart against agronomic optimal standards
  const npkChartData = [
    { nutrient: 'Nitrogen (N)', current: nitrogen, optimal: 100, unit: 'kg/ha' },
    { nutrient: 'Phosphorus (P)', current: phosphorus, optimal: 50, unit: 'kg/ha' },
    { nutrient: 'Potassium (K)', current: potassium, optimal: 70, unit: 'kg/ha' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner with Health Score & Irrigation Status */}
      <div className="grid-2">
        {/* Soil Health Score Card */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px 28px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a7f3d0', fontSize: '0.825rem', fontWeight: 600 }}>
              <HeartPulse size={16} />
              Overall Soil Fertility Index
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, margin: '6px 0 2px 0', letterSpacing: '-0.03em' }}>
              {healthScore}
              <span style={{ fontSize: '1.25rem', color: '#a7f3d0', fontWeight: 500 }}>/100</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#d1fae5', margin: 0 }}>
              {healthScore >= 80 ? 'Excellent fertility & microclimate balance' : healthScore >= 60 ? 'Moderate fertility - minor nutrient top-dressing suggested' : 'Degraded soil conditions - action required'}
            </p>
          </div>

          <div
            style={{
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              border: '6px solid rgba(255,255,255,0.2)',
              borderTopColor: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              fontWeight: 800,
            }}
          >
            {healthScore}%
          </div>
        </div>

        {/* Automated Irrigation Calculator Status */}
        <div
          className="card"
          style={{
            backgroundColor: irrigRec.urgency === 'high' ? '#fff1f2' : irrigRec.urgency === 'medium' ? '#fffbeb' : '#f0fdf4',
            border: `1px solid ${irrigRec.urgency === 'high' ? '#fecdd3' : irrigRec.urgency === 'medium' ? '#fde68a' : '#bbf7d0'}`,
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.825rem', fontWeight: 700, color: '#475569' }}>
                <Droplets size={16} color={irrigRec.urgency === 'high' ? '#e11d48' : '#059669'} />
                Irrigation Recommendation Engine
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '6px 0 0 0' }}>
                {irrigRec.status}
              </h3>
            </div>

            <span
              className={`badge ${
                irrigRec.urgency === 'high' ? 'badge-danger' : irrigRec.urgency === 'medium' ? 'badge-warning' : 'badge-success'
              }`}
            >
              {irrigRec.runtimeMinutes > 0 ? `Run ${irrigRec.runtimeMinutes} min` : 'No Action'}
            </span>
          </div>

          <p style={{ fontSize: '0.825rem', color: '#334155', margin: '10px 0 0 0', lineHeight: 1.45 }}>
            {irrigRec.advice} {irrigRec.volumeMm > 0 && `(Recommended application: +${irrigRec.volumeMm} mm).`}
          </p>
        </div>
      </div>

      {/* Interactive Soil & Water Simulator Sliders */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Sliders size={18} color="#059669" />
                Interactive Field Sensor Simulator
              </h3>
              <p className="card-subtitle">Adjust real-time sensor parameters to observe model response</p>
            </div>
            <button
              onClick={() => {
                setPh(6.5);
                setMoisture(32);
                setNitrogen(95);
                setPhosphorus(45);
                setPotassium(60);
              }}
              className="btn btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            >
              <RotateCcw size={13} /> Reset Defaults
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Soil pH Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                <span>Soil pH:</span>
                <span style={{ color: ph < 6.0 || ph > 7.5 ? '#e11d48' : '#059669', fontWeight: 700 }}>
                  {ph.toFixed(1)} ({ph < 6.0 ? 'Acidic' : ph > 7.5 ? 'Alkaline' : 'Optimal'})
                </span>
              </div>
              <input
                type="range"
                min="4.5"
                max="9.0"
                step="0.1"
                value={ph}
                onChange={(e) => setPh(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#10b981' }}
              />
            </div>

            {/* Soil Moisture Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                <span>Volumetric Soil Moisture:</span>
                <span style={{ color: moisture < 28 ? '#e11d48' : '#059669', fontWeight: 700 }}>
                  {moisture}% ({moisture < 28 ? 'Deficit' : moisture > 40 ? 'Saturation' : 'Optimal'})
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="50"
                step="1"
                value={moisture}
                onChange={(e) => setMoisture(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#0284c7' }}
              />
            </div>

            {/* Nitrogen Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                <span>Available Nitrogen (N):</span>
                <span style={{ fontWeight: 700 }}>{nitrogen} kg/ha</span>
              </div>
              <input
                type="range"
                min="30"
                max="180"
                step="5"
                value={nitrogen}
                onChange={(e) => setNitrogen(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#10b981' }}
              />
            </div>

            {/* Phosphorus Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                <span>Available Phosphorus (P):</span>
                <span style={{ fontWeight: 700 }}>{phosphorus} kg/ha</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                step="2"
                value={phosphorus}
                onChange={(e) => setPhosphorus(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#10b981' }}
              />
            </div>

            {/* Potassium Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                <span>Available Potassium (K):</span>
                <span style={{ fontWeight: 700 }}>{potassium} kg/ha</span>
              </div>
              <input
                type="range"
                min="20"
                max="120"
                step="2"
                value={potassium}
                onChange={(e) => setPotassium(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#10b981' }}
              />
            </div>
          </div>
        </div>

        {/* N-P-K Nutrient Balance Benchmark Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <FlaskConical size={18} color="#059669" />
                Primary Nutrient (N-P-K) Profiling
              </h3>
              <p className="card-subtitle">Current lab telemetry compared with target crop agronomic thresholds</p>
            </div>
            <span className="badge badge-success">Soil Lab Verified</span>
          </div>

          <div style={{ height: '280px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={npkChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="nutrient" tick={{ fontSize: 12, fill: '#334155', fontWeight: 600 }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                  formatter={(val) => [`${val} kg/ha`, '']}
                />
                <Bar dataKey="current" name="Current Available" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="optimal" name="Agronomic Target" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-around', fontSize: '0.8rem', color: '#64748b' }}>
            <span>N Target: 100 kg/ha</span>
            <span>•</span>
            <span>P Target: 50 kg/ha</span>
            <span>•</span>
            <span>K Target: 70 kg/ha</span>
          </div>
        </div>
      </div>
    </div>
  );
}
