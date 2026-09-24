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
  Info,
  Camera
} from 'lucide-react';
import { api } from '../services/api';
import CameraCaptureModal from '../components/CameraCaptureModal';

export default function DiseaseDetection({ modelStatus }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
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

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPrediction(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTryAnother = () => {
    handleReset();
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
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

          {/* Dual Input Method Selector: Upload Image / Use Camera */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-secondary"
              aria-label="Upload leaf image from device"
              style={{
                flex: 1,
                padding: '9px 14px',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                borderColor: '#10b981',
                color: '#065f46',
                background: '#f0fdf4',
              }}
            >
              <UploadCloud size={16} color="#059669" />
              Upload Image
            </button>

            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              className="btn btn-primary"
              aria-label="Capture leaf image with camera"
              style={{
                flex: 1,
                padding: '9px 14px',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)',
              }}
            >
              <Camera size={16} />
              Use Camera
            </button>
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
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Selected: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isAnalyzing}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                >
                  Clear
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || isModelUnavailable}
                  className="btn btn-primary"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Validating & Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Run AI Diagnosis
                    </>
                  )}
                </button>
              </div>
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
                {prediction && !prediction.is_valid ? (
                  prediction.result_state === 'UNKNOWN_LEAF' ? (
                    <>
                      <AlertTriangle size={18} color="#d97706" />
                      Plant Species Assessment
                    </>
                  ) : (
                    <>
                      <ShieldAlert size={18} color="#e11d48" />
                      Validation Outcome
                    </>
                  )
                ) : (
                  <>
                    <CheckCircle2 size={18} color="#059669" />
                    Diagnostic Report
                  </>
                )}
              </h3>
              <p className="card-subtitle">
                {prediction && !prediction.is_valid
                  ? (prediction.result_state === 'UNKNOWN_LEAF' ? 'Foliar tissue detected, but plant outside supported list' : 'Multi-stage botanical and quality screening')
                  : 'Real-time deep learning inference analysis'}
              </p>
            </div>
            {prediction && (
              <span
                className={`badge ${
                  prediction.result_state === 'UNKNOWN_LEAF'
                    ? 'badge-warning'
                    : !prediction.is_valid
                    ? 'badge-danger'
                    : prediction.severity === 'High'
                    ? 'badge-danger'
                    : prediction.severity === 'Moderate'
                    ? 'badge-warning'
                    : 'badge-success'
                }`}
              >
                {prediction.result_state === 'UNKNOWN_LEAF'
                  ? 'Undefined Leaf'
                  : !prediction.is_valid
                  ? 'Rejected'
                  : `Severity: ${prediction.severity}`}
              </span>
            )}
          </div>

          {isAnalyzing ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px',
                textAlign: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#ecfdf5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <RefreshCw size={30} color="#059669" className="animate-spin" />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
                  Multi-Stage Verification in Progress
                </h4>
                <p style={{ fontSize: '0.825rem', color: '#64748b', maxWidth: '340px', margin: 0, lineHeight: 1.5 }}>
                  Validating dimensions, exposure, foliar tissue, and crop species before running deep learning...
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '340px', textAlign: 'left', marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                  <CheckCircle2 size={14} /> Stage 1: File Integrity & Image Quality Check
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                  <CheckCircle2 size={14} /> Stage 2: ML Leaf vs Non-Leaf Detection
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                  <CheckCircle2 size={14} /> Stage 3: Crop Species Identification (with UNKNOWN class)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                  <CheckCircle2 size={14} /> Stage 4: Supported Crop Verification
                </div>
              </div>
            </div>
          ) : prediction ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              {/* Multi-Stage Status Overview Banner */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '10px',
                  background: prediction.is_valid ? '#f0fdf4' : prediction.result_state === 'UNKNOWN_LEAF' ? '#fffbeb' : '#f8fafc',
                  border: `1px solid ${prediction.is_valid ? '#bbf7d0' : prediction.result_state === 'UNKNOWN_LEAF' ? '#fde68a' : '#e2e8f0'}`,
                  borderRadius: '10px',
                  padding: '12px 14px',
                  fontSize: '0.8rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Leaf Detection:</span>
                  <strong style={{ color: prediction.is_leaf ? '#15803d' : '#e11d48' }}>
                    {prediction.is_leaf ? '✓ Leaf detected' : '✕ No crop leaf detected'}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Crop Identification:</span>
                  <strong style={{ color: (prediction.result_state === 'SUPPORTED_CROP' || (prediction.is_valid && prediction.crop)) ? '#15803d' : '#b45309' }}>
                    {prediction.result_state === 'SUPPORTED_CROP' || (prediction.is_valid && prediction.crop)
                      ? `✓ ${prediction.crop_display_name || (prediction.crop === 'Rice' ? 'Rice / Paddy' : prediction.crop)}`
                      : (prediction.result_state === 'UNKNOWN_LEAF'
                          ? `⚠ ${prediction.crop_display_name || 'Undefined Leaf'}`
                          : 'Not evaluated / Blocked')}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Crop Identification Confidence:</span>
                  <strong style={{ color: '#0f172a' }}>
                    {prediction.result_state === 'SUPPORTED_CROP' && prediction.crop_confidence ? `${Math.min(100, Math.max(0, prediction.crop_confidence)).toFixed(1)}%` : '—'}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Disease Analysis:</span>
                  <strong style={{ color: (prediction.disease_analysis_status === 'ALLOWED' || (prediction.is_valid && !prediction.result_state)) ? '#15803d' : '#e11d48' }}>
                    {prediction.disease_analysis_status === 'ALLOWED' || (prediction.is_valid && !prediction.result_state) ? 'ALLOWED' : 'BLOCKED'}
                  </strong>
                </div>
              </div>

              {prediction.result_state === 'UNKNOWN_LEAF' ? (
                /* Undefined Leaf View */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                  <div
                    style={{
                      background: '#fffbeb',
                      border: '1.5px solid #fde68a',
                      borderRadius: '12px',
                      padding: '20px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
                      <AlertTriangle size={28} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <span style={{ fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', color: '#b45309' }}>
                          IDENTIFIED CONDITION
                        </span>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#92400e', margin: '4px 0' }}>
                          {prediction.crop_display_name || 'Undefined Leaf'}
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: '#78350f', margin: 0, lineHeight: 1.5 }}>
                          {prediction.validation_reason || 'Leaf detected, but the plant is not recognized as Tomato, Potato, Corn, or Rice.'}
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#ffffff',
                        border: '1px solid #fde68a',
                        borderRadius: '8px',
                        padding: '12px 14px',
                        marginTop: '12px',
                      }}
                    >
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400e', marginBottom: '6px' }}>
                        Actionable Suggestion:
                      </div>
                      <p style={{ fontSize: '0.825rem', color: '#78350f', margin: '0 0 8px 0', lineHeight: 1.5 }}>
                        Please upload a leaf from one of the supported crops: Tomato, Potato, Corn, or Rice.
                      </p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {['Tomato', 'Potato', 'Corn', 'Rice'].map((c) => (
                          <span
                            key={c}
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '3px 10px',
                              borderRadius: '999px',
                              background: '#fef3c7',
                              color: '#92400e',
                              border: '1px solid #fde68a',
                            }}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: '#92400e', marginTop: '12px', marginBottom: 0, lineHeight: 1.5 }}>
                      <strong>Disease Analysis:</strong> <span style={{ color: '#b91c1c', fontWeight: 700 }}>BLOCKED</span>. Under no circumstances is disease classification performed on undefined leaves to eliminate false positives.
                    </p>
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
                    <button
                      onClick={handleTryAnother}
                      className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'center', padding: '10px 16px' }}
                    >
                      <RefreshCw size={15} /> Upload a Supported Crop Leaf
                    </button>
                  </div>
                </div>
              ) : prediction.result_state === 'NON_LEAF' ? (
                /* Non-Leaf Sample View */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                  <div
                    style={{
                      background: '#fff1f2',
                      border: '1.5px solid #fecdd3',
                      borderRadius: '12px',
                      padding: '20px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
                      <ShieldAlert size={28} color="#e11d48" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <span style={{ fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', color: '#be123c' }}>
                          IDENTIFIED CONDITION
                        </span>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#9f1239', margin: '4px 0' }}>
                          No Crop Leaf Detected
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: '#be123c', margin: 0 }}>
                          The uploaded image does not appear to contain a crop leaf.
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#ffffff',
                        border: '1px solid #fda4af',
                        borderRadius: '8px',
                        padding: '12px 14px',
                        marginTop: '12px',
                      }}
                    >
                      <p style={{ fontSize: '0.825rem', fontWeight: 600, color: '#881337', margin: 0, lineHeight: 1.5 }}>
                        {prediction.validation_reason || 'Classified as non-leaf sample (e.g. document, signature, screen, person, object, or surface).'}
                      </p>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: '#9f1239', marginTop: '12px', marginBottom: 0, lineHeight: 1.5 }}>
                      <strong>Disease Analysis:</strong> <span style={{ color: '#b91c1c', fontWeight: 700 }}>BLOCKED</span>.
                    </p>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Info size={16} color="#059669" /> Guidelines for Leaf Scanning:
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#475569', lineHeight: 1.6 }}>
                      <li>Capture a clear, focused photograph of a single crop leaf.</li>
                      <li>Avoid photographing signatures, documents, screens, people, or furniture.</li>
                      <li>Supported crops: <strong>Tomato, Potato, Corn, Rice</strong>.</li>
                    </ul>
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
                    <button
                      onClick={handleTryAnother}
                      className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'center', padding: '10px 16px' }}
                    >
                      <RefreshCw size={15} /> Upload a Real Crop Leaf Image
                    </button>
                  </div>
                </div>
              ) : !prediction.is_valid ? (
                /* Quality / Invalid Image View */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                  <div
                    style={{
                      background: '#fff1f2',
                      border: '1.5px solid #fecdd3',
                      borderRadius: '12px',
                      padding: '20px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
                      <ShieldAlert size={28} color="#e11d48" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <span style={{ fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', color: '#be123c' }}>
                          IDENTIFIED CONDITION
                        </span>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#9f1239', margin: '4px 0' }}>
                          {prediction.result_state === 'POOR_QUALITY' ? 'Image Quality Too Low' : 'Image Rejected'}
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: '#be123c', margin: 0 }}>
                          Please upload a clearer image of a crop leaf.
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#ffffff',
                        border: '1px solid #fda4af',
                        borderRadius: '8px',
                        padding: '12px 14px',
                        marginTop: '12px',
                      }}
                    >
                      <p style={{ fontSize: '0.825rem', fontWeight: 600, color: '#881337', margin: 0, lineHeight: 1.5 }}>
                        {prediction.validation_reason || 'Image does not meet quality requirements (blur, overexposure, or low resolution).'}
                      </p>
                    </div>
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
                    <button
                      onClick={handleTryAnother}
                      className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'center', padding: '10px 16px' }}
                    >
                      <RefreshCw size={15} /> Try Another Image
                    </button>
                  </div>
                </div>
              ) : (
                /* Valid Supported Crop Disease Diagnosis */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', flex: 1 }}>
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
                        Candidate Disease Probability Distribution
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

                  {/* Retest Action */}
                  <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
                    <button
                      onClick={handleTryAnother}
                      className="btn btn-secondary"
                      style={{ width: '100%', justifyContent: 'center', padding: '8px 14px' }}
                    >
                      <RefreshCw size={14} /> Scan Another Sample
                    </button>
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
                {history.map((item) => {
                  const isRejected = item.is_valid === false || (item.disease && item.disease.toLowerCase().includes('rejected'));
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', color: '#64748b' }}>{item.created_at}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 500, color: '#334155' }}>{item.filename}</td>
                      <td style={{ padding: '10px 12px', color: isRejected ? '#94a3b8' : '#059669', fontWeight: 600 }}>
                        {isRejected ? 'N/A' : item.crop}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: isRejected ? '#e11d48' : '#0f172a' }}>
                        {item.disease}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                        {isRejected ? '—' : `${item.confidence}%`}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          className={`badge ${
                            isRejected
                              ? 'badge-danger'
                              : item.severity === 'High'
                              ? 'badge-danger'
                              : item.severity === 'Moderate'
                              ? 'badge-warning'
                              : 'badge-success'
                          }`}
                        >
                          {isRejected ? 'Rejected' : item.severity}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>
            No prior scan records found. Run your first diagnosis above to begin logging.
          </p>
        )}
      </div>

      {/* Native Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onPhotoCaptured={(capturedFile) => {
          handleFileSelect(capturedFile);
          setIsCameraOpen(false);
        }}
      />
    </div>
  );
}
