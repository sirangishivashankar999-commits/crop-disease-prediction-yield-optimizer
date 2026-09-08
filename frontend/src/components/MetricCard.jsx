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
    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
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
              marginTop: '10px',
              marginBottom: '12px',
              padding: '10px 12px',
              backgroundColor: 'var(--surface-bg)',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            {details.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.735rem',
                  lineHeight: 1.3,
                }}
              >
                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{item.label}</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 700, textAlign: 'right', marginLeft: '6px' }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        {(change || description || onInspect) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '10px',
              borderTop: '1px solid var(--border-subtle)',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
              {change && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    color:
                      changeType === 'positive' ? '#047857' : changeType === 'negative' ? '#b91c1c' : '#475569',
                    backgroundColor:
                      changeType === 'positive' ? '#d1fae5' : changeType === 'negative' ? '#fee2e2' : '#f1f5f9',
                    padding: '2px 7px',
                    borderRadius: '6px',
                    flexShrink: 0,
                  }}
                >
                  {changeType === 'positive' && <ArrowUpRight size={13} />}
                  {changeType === 'negative' && <ArrowDownRight size={13} />}
                  {changeType === 'neutral' && <Minus size={13} />}
                  <span>{change}</span>
                </div>
              )}

              {description && (
                <span
                  style={{
                    fontSize: '0.715rem',
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={description}
                >
                  {description}
                </span>
              )}
            </div>

            {onInspect && (
              <button
                type="button"
                onClick={onInspect}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#059669',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  padding: '2px 4px',
                  borderRadius: '4px',
                }}
              >
                {inspectLabel} →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
