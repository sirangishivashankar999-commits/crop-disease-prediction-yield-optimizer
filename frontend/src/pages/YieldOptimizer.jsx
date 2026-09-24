import React, { useState } from 'react';
import {
  TrendingUp,
  Award,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Sliders,
  Sparkles,
  BarChart2,
  RefreshCw,
  Scale,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  Leaf
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
import { api } from '../services/api';

const PRESETS = {
  rice: {
    crop: 'Rice',
    area: 5.0,
    location: 'Central Valley',
    soil_type: 'Loamy',
    growing_season: 'Monsoon',
    ph: 6.5,
    temperature: 27.0,
    rainfall: 1200.0,
    humidity: 75.0,
    irrigation: 500.0,
    fertilizer: 120.0,
    previous_yield: 4.2,
    n_content: 95.0,
    p_content: 40.0,
    k_content: 60.0
  },
  corn: {
    crop: 'Corn',
    area: 25.0,
    location: 'Midwest',
    soil_type: 'Black Soil',
    growing_season: 'Summer',
    ph: 6.6,
    temperature: 26.0,
    rainfall: 850.0,
    humidity: 65.0,
    irrigation: 250.0,
    fertilizer: 160.0,
    previous_yield: 4.8,
    n_content: 120.0,
    p_content: 55.0,
    k_content: 70.0
  },
  tomato: {
    crop: 'Tomato',
    area: 8.0,
    location: 'Southeast',
    soil_type: 'Alluvial',
    growing_season: 'Spring',
    ph: 6.4,
    temperature: 25.5,
    rainfall: 780.0,
    humidity: 70.0,
    irrigation: 500.0,
    fertilizer: 170.0,
    previous_yield: 17.5,
    n_content: 125.0,
    p_content: 60.0,
    k_content: 105.0
  },
  wheat: {
    crop: 'Wheat',
    area: 40.0,
    location: 'Great Plains',
    soil_type: 'Silt Loam',
    growing_season: 'Winter',
    ph: 6.8,
    temperature: 18.0,
    rainfall: 550.0,
    humidity: 55.0,
    irrigation: 300.0,
    fertilizer: 110.0,
    previous_yield: 3.4,
    n_content: 85.0,
    p_content: 48.0,
    k_content: 45.0
  }
};

export default function YieldOptimizer({ modelStatus }) {
  const [formData, setFormData] = useState(PRESETS.rice);
  const [isPredicting, setIsPredicting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const applyPreset = (key) => {
    setFormData(PRESETS[key]);
    setResult(null);
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: isNaN(value) || value === '' ? value : parseFloat(value),
    }));
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setIsPredicting(true);
    setError(null);

    try {
      const data = await api.predictYield(formData);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to generate yield prediction.');
    } finally {
      setIsPredicting(false);
    }
  };

  const isModelUnavailable = modelStatus && !modelStatus.yield_model_loaded;

  // Format chart data from feature importance breakdown
  const importanceChartData = result?.feature_importance_breakdown
    ? Object.entries(result.feature_importance_breakdown)
        .map(([factor, pct]) => ({
          name: factor.replace('_', ' ').toUpperCase(),
          importance: pct,
        }))
        .slice(0, 6)
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Model Unavailable Notice */}
      {isModelUnavailable && (
        <div
          style={{
            backgroundColor: '#fff1f2',
            border: '1px solid #fecdd3',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <ShieldAlert size={22} color="#e11d48" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <h4 style={{ color: '#9f1239', fontSize: '0.925rem', fontWeight: 700, margin: '0 0 4px 0' }}>
              Crop Yield ML Model Bundle Not Loaded
            </h4>
            <p style={{ color: '#be123c', fontSize: '0.825rem', margin: 0, lineHeight: 1.5 }}>
              The multi-model champion bundle (<code>yield_best_model.joblib</code>) is missing.
              Execute <strong><code>python ml/yield/train.py</code></strong> or <strong><code>python bootstrap_models.py</code></strong> in your terminal to train and evaluate Linear Regression, Random Forest, and Gradient Boosting.
            </p>
          </div>
        </div>
      )}

      {/* Preset Quick Loader Bar */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sliders size={18} color="#059669" />
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b' }}>
            Quick Load Agricultural Presets:
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['rice', 'corn', 'tomato', 'wheat'].map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => applyPreset(key)}
              className="btn btn-secondary"
              style={{
                padding: '6px 14px',
                fontSize: '0.8rem',
                textTransform: 'capitalize',
                borderColor: formData.crop.toLowerCase() === key ? '#10b981' : '#e2e8f0',
                backgroundColor: formData.crop.toLowerCase() === key ? '#ecfdf5' : 'white',
                color: formData.crop.toLowerCase() === key ? '#047857' : '#334155',
                fontWeight: formData.crop.toLowerCase() === key ? 700 : 500,
              }}
            >
              {key} Field
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Grid: Parameter Form & Results */}
      <div className="grid-2">
        {/* Left Column: Input Form */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Leaf size={18} color="#059669" />
                Agronomic Field Parameters
              </h3>
              <p className="card-subtitle">Supply soil, weather, water, and historical metrics</p>
            </div>
            <span className="badge badge-success">Multi-Model Regressor</span>
          </div>

          <form onSubmit={handlePredict}>
            {/* Row 1: Crop & Farm Area */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Target Crop</label>
                <select name="crop" value={formData.crop} onChange={handleChange} className="form-select">
                  <option value="Rice">Rice</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Corn">Corn (Maize)</option>
                  <option value="Potato">Potato</option>
                  <option value="Tomato">Tomato</option>
                  <option value="Soybean">Soybean</option>
                  <option value="Cotton">Cotton</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Cultivated Area (Acres)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="1000"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Row 2: Location & Season */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Agro-Climatic Zone</label>
                <select name="location" value={formData.location} onChange={handleChange} className="form-select">
                  <option value="Central Valley">Central Valley</option>
                  <option value="Midwest">Midwest Corn Belt</option>
                  <option value="Southeast">Southeast Subtropical</option>
                  <option value="Great Plains">Great Plains</option>
                  <option value="Delta Region">Delta Region</option>
                  <option value="Pacific Northwest">Pacific Northwest</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Growing Season</label>
                <select name="growing_season" value={formData.growing_season} onChange={handleChange} className="form-select">
                  <option value="Monsoon">Monsoon</option>
                  <option value="Winter">Winter</option>
                  <option value="Summer">Summer</option>
                  <option value="Spring">Spring</option>
                  <option value="Autumn">Autumn</option>
                </select>
              </div>
            </div>

            {/* Row 3: Soil Type & pH */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Soil Texture Type</label>
                <select name="soil_type" value={formData.soil_type} onChange={handleChange} className="form-select">
                  <option value="Loamy">Loamy Soil</option>
                  <option value="Clay">Clay Soil</option>
                  <option value="Sandy Loam">Sandy Loam</option>
                  <option value="Silt Loam">Silt Loam</option>
                  <option value="Black Soil">Black Vertisol</option>
                  <option value="Alluvial">Alluvial Silt</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Soil pH Level</label>
                <input
                  type="number"
                  step="0.1"
                  min="4.0"
                  max="9.0"
                  name="ph"
                  value={formData.ph}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Row 4: Climate (Temp, Rainfall, Humidity) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">Temp (°C)</label>
                <input
                  type="number"
                  step="0.5"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Rainfall (mm)</label>
                <input
                  type="number"
                  step="10"
                  name="rainfall"
                  value={formData.rainfall}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Humidity (%)</label>
                <input
                  type="number"
                  step="1"
                  min="10"
                  max="100"
                  name="humidity"
                  value={formData.humidity}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Row 5: Irrigation, Fertilizer, Previous Yield */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">Irrigation (mm)</label>
                <input
                  type="number"
                  step="10"
                  name="irrigation"
                  value={formData.irrigation}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Fertilizer (kg/ac)</label>
                <input
                  type="number"
                  step="5"
                  name="fertilizer"
                  value={formData.fertilizer}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Prev Yield (t/ac)</label>
                <input
                  type="number"
                  step="0.1"
                  name="previous_yield"
                  value={formData.previous_yield}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Row 6: Soil Nutrients N-P-K */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">Nitrogen (N kg/ha)</label>
                <input
                  type="number"
                  step="5"
                  name="n_content"
                  value={formData.n_content}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phosphorus (P kg/ha)</label>
                <input
                  type="number"
                  step="5"
                  name="p_content"
                  value={formData.p_content}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Potassium (K kg/ha)</label>
                <input
                  type="number"
                  step="5"
                  name="k_content"
                  value={formData.k_content}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            {error && (
              <div
                style={{
                  backgroundColor: '#fff1f2',
                  border: '1px solid #fecdd3',
                  color: '#9f1239',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '0.825rem',
                  marginBottom: '16px',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPredicting || isModelUnavailable}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px 20px', marginTop: '6px' }}
            >
              {isPredicting ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Running Multi-Model Regressors...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Predict Yield & Optimize
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Prediction Results & Explainability */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <TrendingUp size={18} color="#059669" />
                Yield Optimization Insights
              </h3>
              <p className="card-subtitle">Projected tonnage, risk scoring, and explainability</p>
            </div>
            {result && (
              <span
                className={`badge ${
                  result.risk_level === 'Low'
                    ? 'badge-success'
                    : result.risk_level === 'Moderate'
                    ? 'badge-warning'
                    : 'badge-danger'
                }`}
              >
                Risk: {result.risk_level}
              </span>
            )}
          </div>

          {result ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
              {/* Primary Prediction KPI Ribbon */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
                  border: '1px solid #a7f3d0',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  textAlign: 'center',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                    Predicted Yield
                  </span>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#064e3b', margin: '4px 0' }}>
                    {result.predicted_yield_per_acre}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                    tons / acre
                  </span>
                </div>

                <div style={{ borderLeft: '1px solid #a7f3d0', borderRight: '1px solid #a7f3d0' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                    Total Production
                  </span>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#064e3b', margin: '4px 0' }}>
                    {result.total_estimated_production}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                    tons across {result.area_acres} ac
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                    Productivity Score
                  </span>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706', margin: '4px 0' }}>
                    {result.productivity_score}
                    <span style={{ fontSize: '1rem', color: '#64748b' }}>/100</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 600 }}>
                    vs {result.previous_yield} t/ac baseline
                  </span>
                </div>
              </div>

              {/* Explainability: Feature Importance Chart */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                    Agronomic Feature Importance (Explainability)
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Model: {result.champion_model}
                  </span>
                </div>

                <div style={{ height: '180px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={importanceChartData}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 35, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                      <XAxis type="number" unit="%" tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 40]} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }} width={70} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        formatter={(val) => [`${val}%`, 'Relative Influence']}
                      />
                      <Bar dataKey="importance" fill="#10b981" radius={[0, 4, 4, 0]}>
                        {importanceChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={index === 0 ? '#059669' : index === 1 ? '#10b981' : '#34d399'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Dynamic Optimization Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b', marginBottom: '10px' }}>
                    Prescribed Agronomic Action Plan
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {result.recommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: `1px solid ${
                            rec.priority === 'Critical'
                              ? '#fecdd3'
                              : rec.priority === 'High'
                              ? '#fde68a'
                              : '#bbf7d0'
                          }`,
                          backgroundColor:
                            rec.priority === 'Critical'
                              ? '#fff1f2'
                              : rec.priority === 'High'
                              ? '#fffbeb'
                              : '#f0fdf4',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0f172a' }}>
                            {rec.title}
                          </span>
                          <span
                            className={`badge ${
                              rec.priority === 'Critical'
                                ? 'badge-danger'
                                : rec.priority === 'High'
                                ? 'badge-warning'
                                : 'badge-success'
                            }`}
                            style={{ fontSize: '0.675rem', padding: '2px 8px' }}
                          >
                            {rec.priority}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.785rem', color: '#475569', margin: 0, lineHeight: 1.4 }}>
                          {rec.advice}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '50px 20px',
                color: '#94a3b8',
                textAlign: 'center',
              }}
            >
              <Scale size={48} strokeWidth={1.5} style={{ marginBottom: '14px' }} />
              <p style={{ fontWeight: 600, fontSize: '1rem', color: '#64748b', margin: '0 0 4px 0' }}>
                Awaiting Parameter Input
              </p>
              <p style={{ fontSize: '0.825rem', maxWidth: '320px', margin: 0 }}>
                Adjust the agronomic parameters on the left or select a preset, then click "Predict Yield & Optimize" to trigger the ML regressor.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
