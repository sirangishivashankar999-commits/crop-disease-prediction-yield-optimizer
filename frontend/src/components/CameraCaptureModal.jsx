import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, X, RotateCcw, Check, SwitchCamera, AlertTriangle, Sparkles } from 'lucide-react';

/**
 * CameraCaptureModal
 * Additive camera capture interface for CROPWISE AI.
 * Captures a foliar photograph and returns a standard File object
 * to the existing image upload pipeline.
 */
export default function CameraCaptureModal({ isOpen, onClose, onPhotoCaptured }) {
  const [stream, setStream] = useState(null);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [capturedPreviewUrl, setCapturedPreviewUrl] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // Prefer rear camera on mobile
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Stop all active MediaStream tracks
  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // Ignore track stop errors
        }
      });
      setStream(null);
    }
  }, [stream]);

  // Clean up object URLs to prevent memory leaks
  const cleanupPreview = useCallback(() => {
    if (capturedPreviewUrl) {
      URL.revokeObjectURL(capturedPreviewUrl);
      setCapturedPreviewUrl(null);
    }
    setCapturedBlob(null);
  }, [capturedPreviewUrl]);

  // Check if multiple camera devices exist
  const checkCameraDevices = useCallback(async () => {
    try {
      if (navigator.mediaDevices?.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);
      }
    } catch {
      // Non-critical: keep default
    }
  }, []);

  // Start camera stream with appropriate constraints
  const startCamera = useCallback(async (mode = facingMode) => {
    setCameraError(null);
    setIsInitializing(true);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        'Camera capture is not supported by this browser. Please use Upload Image instead.'
      );
      setIsInitializing(false);
      return;
    }

    // Stop existing stream before starting a new one
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }

    try {
      // Attempt 1: preferred facingMode with ideal high resolution
      const constraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false, // Strict requirement: NEVER request microphone
      };

      let newStream;
      try {
        newStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        // Fallback: standard video access without specific facingMode or resolution constraints
        newStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.play().catch(() => {});
      }
      checkCameraDevices();
    } catch (err) {
      let message = 'Unable to access camera. Please use Upload Image instead.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message =
          'Camera access was denied. Please allow camera permission in your browser settings or use Upload Image instead.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'Camera is not available on this device. Please use Upload Image instead.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        message =
          'Camera is currently in use by another application. Please close other camera apps or use Upload Image instead.';
      }
      setCameraError(message);
    } finally {
      setIsInitializing(false);
    }
  }, [facingMode, stream, checkCameraDevices]);

  // Manage camera lifecycle based on modal open state
  useEffect(() => {
    if (isOpen) {
      cleanupPreview();
      startCamera();
    } else {
      stopStream();
      cleanupPreview();
      setCameraError(null);
    }

    // Cleanup on unmount or close
    return () => {
      stopStream();
      cleanupPreview();
    };
  }, [isOpen]);

  // Ensure video element receives stream when ref changes
  useEffect(() => {
    if (videoRef.current && stream && !capturedBlob) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream, capturedBlob]);

  // Toggle between front and rear cameras (if available)
  const handleSwitchCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capture current video frame to canvas and create Blob
  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const previewUrl = URL.createObjectURL(blob);
        setCapturedBlob(blob);
        setCapturedPreviewUrl(previewUrl);
        // Stop active camera tracks while reviewing the captured frame
        stopStream();
      },
      'image/jpeg',
      0.95
    );
  };

  // Retake photo: discard captured blob and restart camera
  const handleRetake = () => {
    cleanupPreview();
    startCamera();
  };

  // Use Photo: create standard File object and pass to existing upload handler
  const handleUsePhoto = () => {
    if (!capturedBlob) return;

    // Create a standard File instance matching existing upload handler expectations
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 14);
    const file = new File([capturedBlob], `camera-leaf-${timestamp}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });

    // Invoke parent callback (bridges directly to existing handleFileSelect)
    onPhotoCaptured(file);

    // Clean up and close modal
    stopStream();
    cleanupPreview();
    onClose();
  };

  const handleClose = () => {
    stopStream();
    cleanupPreview();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Capture Crop Leaf with Camera"
    >
      <div
        style={{
          backgroundColor: '#064e3b',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '620px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 30px rgba(16, 185, 129, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          color: '#ffffff',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.35)',
              }}
            >
              <Camera size={20} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                {capturedPreviewUrl ? 'Preview Captured Leaf' : 'Live Leaf Camera Scanner'}
              </h3>
              <p style={{ fontSize: '0.725rem', color: '#a7f3d0', margin: '2px 0 0 0' }}>
                {capturedPreviewUrl
                  ? 'Confirm photo before running AI diagnostic pipeline'
                  : 'Position leaf inside targeting guide'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close camera"
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: 'none',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Viewport Area: Live Video or Captured Preview */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '380px',
            backgroundColor: '#022c22',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {cameraError ? (
            /* Error Fallback Panel */
            <div
              style={{
                padding: '28px',
                textAlign: 'center',
                maxWidth: '420px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertTriangle size={28} color="#b91c1c" />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#fecaca' }}>
                Camera Access Notice
              </h4>
              <p style={{ fontSize: '0.825rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                {cameraError}
              </p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="btn btn-secondary"
                  style={{
                    backgroundColor: '#065f46',
                    color: '#ffffff',
                    borderColor: '#10b981',
                    fontSize: '0.8rem',
                    padding: '8px 14px',
                  }}
                >
                  <RotateCcw size={14} /> Retry Camera
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '8px 14px' }}
                >
                  Use Upload Image
                </button>
              </div>
            </div>
          ) : capturedPreviewUrl ? (
            /* Review Captured Photo */
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <img
                src={capturedPreviewUrl}
                alt="Captured leaf preview"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  backgroundColor: '#022c22',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(6, 78, 59, 0.85)',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  color: '#a7f3d0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={13} color="#10b981" /> Frame Captured Ready
              </div>
            </div>
          ) : (
            /* Live Camera Stream with Foliar Guide Overlay */
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />

              {/* Foliar Targeting Guide Box */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                {/* Targeting Frame with Emerald Corner Accents */}
                <div
                  style={{
                    position: 'relative',
                    width: '74%',
                    height: '68%',
                    maxWidth: '380px',
                    maxHeight: '260px',
                    borderRadius: '16px',
                    border: '2px dashed rgba(16, 185, 129, 0.55)',
                    boxShadow: '0 0 0 9999px rgba(6, 78, 59, 0.35)',
                  }}
                >
                  {/* Top-Left Corner Bracket */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-2px',
                      left: '-2px',
                      width: '24px',
                      height: '24px',
                      borderTop: '3px solid #10b981',
                      borderLeft: '3px solid #10b981',
                      borderTopLeftRadius: '14px',
                    }}
                  />
                  {/* Top-Right Corner Bracket */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      width: '24px',
                      height: '24px',
                      borderTop: '3px solid #10b981',
                      borderRight: '3px solid #10b981',
                      borderTopRightRadius: '14px',
                    }}
                  />
                  {/* Bottom-Left Corner Bracket */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-2px',
                      left: '-2px',
                      width: '24px',
                      height: '24px',
                      borderBottom: '3px solid #10b981',
                      borderLeft: '3px solid #10b981',
                      borderBottomLeftRadius: '14px',
                    }}
                  />
                  {/* Bottom-Right Corner Bracket */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-2px',
                      right: '-2px',
                      width: '24px',
                      height: '24px',
                      borderBottom: '3px solid #10b981',
                      borderRight: '3px solid #10b981',
                      borderBottomRightRadius: '14px',
                    }}
                  />
                </div>

                {/* Instructional Tagline */}
                <div
                  style={{
                    marginTop: '12px',
                    background: 'rgba(6, 78, 59, 0.85)',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    padding: '5px 14px',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#ffffff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    textAlign: 'center',
                  }}
                >
                  Place the crop leaf inside the frame
                </div>
              </div>

              {/* Optional Camera Switch Button (Top Right of Stream) */}
              {hasMultipleCameras && (
                <button
                  type="button"
                  onClick={handleSwitchCamera}
                  aria-label="Switch camera"
                  title="Switch front/rear camera"
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(6, 78, 59, 0.85)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <SwitchCamera size={14} color="#10b981" /> Switch
                </button>
              )}
            </>
          )}

          {/* Hidden Canvas for High-Fidelity Frame Rendering */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        {/* Modal Controls Footer */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#04382a',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {capturedPreviewUrl ? (
            /* Post-Capture Review Actions */
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="btn btn-secondary"
                aria-label="Retake photo"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '9px 16px',
                  fontSize: '0.85rem',
                }}
              >
                <RotateCcw size={16} /> Retake
              </button>

              <button
                type="button"
                onClick={handleUsePhoto}
                className="btn btn-primary"
                aria-label="Use captured photo"
                style={{
                  padding: '10px 22px',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                }}
              >
                <Check size={18} /> Use Photo
              </button>
            </>
          ) : (
            /* Live Capture Controls */
            <>
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-secondary"
                aria-label="Cancel camera scan"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#e2e8f0',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '9px 16px',
                  fontSize: '0.85rem',
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCapture}
                disabled={isInitializing || !!cameraError}
                className="btn btn-primary"
                aria-label="Capture leaf image"
                style={{
                  padding: '10px 24px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                }}
              >
                <Camera size={18} /> Capture Photo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
