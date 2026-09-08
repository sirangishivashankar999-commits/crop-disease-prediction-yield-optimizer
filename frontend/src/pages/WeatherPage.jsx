import React from 'react';
import {
  CloudSun,
  Thermometer,
  Droplets,
  CloudRain,
  Wind,
  Sun,
  AlertTriangle,
  Compass,
  Calendar,
  Layers,
  MapPin
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export default function WeatherPage({ weatherData }) {
  const weather = weatherData || {
    location: 'Central Valley Farm',
    temperature: 26.8,
    feels_like: 28.1,
    humidity: 68.0,
    rainfall: 2.4,
    wind_speed: 12.5,
    wind_direction: 'NNW',
    solar_radiation: 21.4,
    weather_risk: 'Moderate',
    risk_description: 'Elevated relative humidity and incoming precipitation front may foster foliar fungal incubation.',
    condition: 'Partly Cloudy',
    forecast_7day: []
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Current Agro-Weather Hero Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '16px',
          padding: '28px 32px',
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '8px' }}>
              <MapPin size={16} color="#10b981" />
              <span>{weather.location}</span>
              <span>•</span>
              <span>Microclimate Monitoring Station #1</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
              <span style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                {weather.temperature}°C
              </span>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
                  {weather.condition}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  Feels like {weather.feels_like}°C
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              maxWidth: '380px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <AlertTriangle size={18} color={weather.weather_risk === 'Low' ? '#34d399' : '#fbbf24'} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                Agro-Climatic Risk: {weather.weather_risk}
              </span>
            </div>
            <p style={{ fontSize: '0.785rem', color: '#cbd5e1', margin: 0, lineHeight: 1.45 }}>
              {weather.risk_description}
            </p>
          </div>
        </div>

        {/* 5 Real-Time Environmental Readings */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '16px',
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}
          className="weather-metrics-grid"
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.75rem' }}>
              <Droplets size={14} color="#38bdf8" />
              Humidity
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, marginTop: '4px' }}>
              {weather.humidity}%
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.75rem' }}>
              <CloudRain size={14} color="#60a5fa" />
              Precipitation (24h)
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, marginTop: '4px' }}>
              {weather.rainfall} mm
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.75rem' }}>
              <Wind size={14} color="#a78bfa" />
              Wind Speed
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, marginTop: '4px' }}>
              {weather.wind_speed} km/h
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.75rem' }}>
              <Compass size={14} color="#fbbf24" />
              Wind Direction
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, marginTop: '4px' }}>
              {weather.wind_direction}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.75rem' }}>
              <Sun size={14} color="#f59e0b" />
              Solar Radiation
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, marginTop: '4px' }}>
              {weather.solar_radiation} MJ/m²
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Agricultural Meteorological Forecast Cards */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Calendar size={18} color="#059669" />
              7-Day Agro-Meteorological Forecast
            </h3>
            <p className="card-subtitle">Projected precipitation probabilities and diurnal temperature shifts</p>
          </div>
          <span className="badge badge-success">Updated Hourly</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '12px',
          }}
          className="forecast-grid"
        >
          {weather.forecast_7day.map((day, idx) => (
            <div
              key={idx}
              style={{
                padding: '16px 12px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                backgroundColor: idx === 0 ? '#ecfdf5' : '#ffffff',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '10px',
              }}
            >
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: idx === 0 ? '#047857' : '#0f172a' }}>
                  {idx === 0 ? 'Today' : day.day}
                </div>
                <div style={{ fontSize: '0.725rem', color: '#64748b' }}>{day.date}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
                <CloudSun size={28} color={idx === 0 ? '#059669' : '#64748b'} />
              </div>

              <div>
                <div style={{ fontSize: '0.925rem', fontWeight: 800, color: '#0f172a' }}>
                  {day.temp_max}°
                  <span style={{ fontSize: '0.775rem', fontWeight: 500, color: '#64748b', marginLeft: '4px' }}>
                    {day.temp_min}°
                  </span>
                </div>
                <div style={{ fontSize: '0.725rem', color: '#475569', marginTop: '2px' }}>
                  {day.condition}
                </div>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: day.rainfall_prob > 50 ? '#2563eb' : '#64748b',
                  backgroundColor: day.rainfall_prob > 50 ? '#eff6ff' : '#f8fafc',
                  padding: '3px 6px',
                  borderRadius: '6px',
                }}
              >
                <CloudRain size={12} />
                {day.rainfall_prob}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Temperature Trend Visualization */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Thermometer size={18} color="#059669" />
              Diurnal Temperature Trend (°C)
            </h3>
            <p className="card-subtitle">Comparing maximum and minimum diurnal temperatures</p>
          </div>
        </div>

        <div style={{ height: '240px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weather.forecast_7day} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={[10, 35]} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Line type="monotone" dataKey="temp_max" name="Max Temp (°C)" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="temp_min" name="Min Temp (°C)" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .weather-metrics-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
          .forecast-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .weather-metrics-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .forecast-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
