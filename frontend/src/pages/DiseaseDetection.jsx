import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  HelpCircle,
  FileImage,
  RefreshCw,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { api } from '../services/api';

export default function DiseaseDetection({ modelStatus }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Load diagnostic history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await api.getDiseaseHistory();
      setHistory(data);
    } catch {
      // Historical logs optional
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }
    setError(null);
    setSelectedFile(file);
    setPrediction(null);

    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await api.predictDisease(selectedFile);
      setPrediction(result);
      loadHistory();
    } catch (err) {
      setError(err.message || 'Failed to complete disease analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isModelUnavailable = modelStatus && !modelStatus.disease_model_loaded;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Model Status Alert Banner if not loaded */}
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
              ML Model Checkpoint Unavailable
            </h4>
            <p style={{ color: '#be123c', fontSize: '0.825rem', margin: 0, lineHeight: 1.5 }}>
              The Crop Disease computer vision weights (<code>crop_disease_model.pt</code>) have not been trained yet.
              Run <strong><code>python ml/disease/train.py</code></strong> or <strong><code>python bootstrap_models.py</code></strong> in your terminal to initialize and train the MobileNetV2 pipeline.
            </p>
          </div>
        </div>
      )}

      {/* Main Analysis Section */}
      <div className="grid-2">
        {/* Left Column: Image Upload & Preview */}
        <div className="card">
          <div className="card-header" style={{ alignItems: 'flex-start' }}>
            <div>
              <h3 className="card-title">
                <FileImage size={18} color="#059669" />
                Upload Foliar Sample
              </h3>
              <p className="card-subtitle">Upload a clear photo of an infected or healthy crop leaf</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                <span style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-muted)' }}>Supported Crops:</span>
                {['Tomato', 'Potato', 'Corn', 'Rice'].map((c) => (
                  <span
                    key={c}
                    style={{
                      fontSize: '0.725rem',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: 'var(--primary-50)',
                      color: 'var(--primary-700)',
                      border: '1px solid var(--primary-200)',
                      fontWeight: 600,
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <span className="badge badge-info">MobileNetV2</span>
          </div>

          {/* Drag and Drop Zone */}
          <div
            className={`dropzone ${isDragging ? 'active' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              minHeight: '260px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
            />

            {previewUrl ? (
              <div style={{ position: 'relative', width: '100%', maxWidth: '320px', borderRadius: '12px', overflow: 'hidden' }}>
                <img
                  src={previewUrl}
                  alt="Leaf preview"
                  style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '12px' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'rgba(0,0,0,0.65)',
                    color: '#ffffff',
                    padding: '6px 12px',
                    fontSize: '0.75rem',
                    textAlign: 'center',
                  }}
                >
                  Click or drop to replace image
                </div>
              </div>
            ) : (
              <>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#ecfdf5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <UploadCloud size={30} color="#059669" />
                </div>
                <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', margin: '0 0 6px 0' }}>
                  Drag & Drop leaf photo here, or browse
                </p>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                  Supports JPEG, PNG, WebP up to 15MB
                </p>
              </>
            )}
          </div>

          {selectedFile && (
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Selected: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || isModelUnavailable}
                className="btn btn-primary"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Analyzing Leaf Tissue...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Run AI Diagnosis
                  </>
                )}
              </button>
            </div>
          )}

          {error && (
            <div
              style={{
                marginTop: '16px',
                backgroundColor: '#fff1f2',
                border: '1px solid #fecdd3',
                color: '#9f1239',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.825rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right Column: Diagnostic Results */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <CheckCircle2 size={18} color="#059669" />
                Diagnostic Report
              </h3>
              <p className="card-subtitle">Real-time deep learning inference analysis</p>
            </div>
            {prediction && (
              <span
                className={`badge ${
                  prediction.severity === 'High'
                    ? 'badge-danger'
                    : prediction.severity === 'Moderate'
                    ? 'badge-warning'
                    : 'badge-success'
                }`}
              >
                Severity: {prediction.severity}
              </span>
            )}
          </div>

          {prediction ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
              {/* Primary Detected Diagnosis */}
              <div
                style={{
                  background: prediction.severity === 'None' ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${prediction.severity === 'None' ? '#bbf7d0' : '#fecaca'}`,
                  borderRadius: '12px',
                  padding: '18px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                    Identified Condition
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669' }}>
                    {prediction.crop} Foliage
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {prediction.disease}
                  </h2>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669' }}>
                    {prediction.confidence}% Confidence
                  </span>
                </div>

                {/* Progress bar */}
                <div className="progress-bar-bg" style={{ marginTop: '12px' }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${prediction.confidence}%`,
                      backgroundColor: prediction.confidence > 80 ? '#10b981' : '#f59e0b',
                    }}
                  />
                </div>
              </div>

              {/* Top-K Class Confidence Distribution */}
              {prediction.top_predictions && prediction.top_predictions.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                    Top Class Probability Distribution
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {prediction.top_predictions.map((top) => (
                      <div key={top.class_name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ color: '#475569', fontWeight: 500 }}>{top.display_name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '45%' }}>
                          <div className="progress-bar-bg" style={{ height: '6px' }}>
                            <div className="progress-bar-fill" style={{ width: `${top.confidence}%`, backgroundColor: '#3b82f6' }} />
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e293b', minWidth: '40px', textAlign: 'right' }}>
                            {top.confidence}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Symptoms */}
              {prediction.symptoms && prediction.symptoms.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Observed Pathology Symptoms
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.825rem', color: '#475569', lineHeight: 1.6 }}>
                    {prediction.symptoms.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommended Treatments */}
              {prediction.treatment && prediction.treatment.length > 0 && (
                <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px 16px' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#92400e', marginBottom: '6px' }}>
                    Immediate Agronomic Treatment Protocol
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#78350f', lineHeight: 1.5 }}>
                    {prediction.treatment.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Prevention Protocols */}
              {prediction.prevention && prediction.prevention.length > 0 && (
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 16px' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#166534', marginBottom: '6px' }}>
                    Long-Term Prevention & Field Sanitation
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#14532d', lineHeight: 1.5 }}>
                    {prediction.prevention.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
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
                padding: '40px 20px',
                color: '#94a3b8',
                textAlign: 'center',
              }}
            >
              <HelpCircle size={44} strokeWidth={1.5} style={{ marginBottom: '12px' }} />
              <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#64748b', margin: '0 0 4px 0' }}>
                Awaiting Foliar Scan
              </p>
              <p style={{ fontSize: '0.8rem', maxWidth: '300px', margin: 0 }}>
                Upload an image on the left and click "Run AI Diagnosis" to inspect the crop leaf with MobileNetV2.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Historical Diagnostics Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Clock size={18} color="#059669" />
              Recent Field Diagnostic Logs
            </h3>
            <p className="card-subtitle">Historical records stored in local database</p>
          </div>
          <button onClick={loadHistory} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.775rem' }}>
            <RefreshCw size={13} /> Refresh Logs
          </button>
        </div>

        {history.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Timestamp</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Filename</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Crop</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Detected Diagnosis</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Confidence</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Severity</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', color: '#64748b' }}>{item.created_at}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 500, color: '#334155' }}>{item.filename}</td>
                    <td style={{ padding: '10px 12px', color: '#059669', fontWeight: 600 }}>{item.crop}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>{item.disease}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{item.confidence}%</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span
                        className={`badge ${
                          item.severity === 'High'
                            ? 'badge-danger'
                            : item.severity === 'Moderate'
                            ? 'badge-warning'
                            : 'badge-success'
                        }`}
                      >
                        {item.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>
            No prior scan records found. Run your first diagnosis above to begin logging.
          </p>
        )}
      </div>
    </div>
  );
}
