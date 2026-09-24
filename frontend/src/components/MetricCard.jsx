import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function MetricCard({
  title,
  value,
  unit,
  change,
  changeType = 'positive', // positive, negative, neutral
  icon: Icon,
  iconBg = '#ecfdf5',
  iconColor = '#059669',
  description,
  details = [],
  onInspect,
  inspectLabel = 'Details',
}) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0, width: '100%' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div>
            <p style={{ fontSize: '0.785rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
              {title}
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
                {value}
              </span>
              {unit && (
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {unit}
                </span>
              )}
            </div>
          </div>

          {Icon && (
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={22} color={iconColor} strokeWidth={2.2} />
            </div>
          )}
        </div>

        {/* In-Frame Detailed Breakdown Stats */}
        {details && details.length > 0 && (
          <div
            style={{
              marginTop: '12px',
              marginBottom: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {details.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.775rem',
                  lineHeight: 1.4,
                  gap: '8px',
                  minWidth: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: iconColor || '#10b981', flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.label}
                  </span>
                </div>
                <span
                  style={{
                    color: 'var(--text-main)',
                    fontWeight: 700,
                    textAlign: 'right',
                    marginLeft: '6px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                  title={item.value}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        {onInspect && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: '12px',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <button
              type="button"
              onClick={onInspect}
              style={{
                background: 'transparent',
                border: 'none',
                color: iconColor || 'var(--primary-accent)',
                fontSize: '0.785rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '6px',
                transition: 'opacity 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <span>{inspectLabel}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
