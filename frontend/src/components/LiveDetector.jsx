import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Play, 
  Square, 
  Volume2, 
  Delete, 
  Copy, 
  RefreshCw, 
  Sparkles,
  Layers,
  Check,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { ASL_CLASSES, getSignInfo, generateSimulatedPrediction } from '../utils/aslData';
import { soundFx } from '../utils/sound';
import { predictSignBase64, predictSignFile } from '../services/api';

// Must match the backend model's expected input size (IMG_SIZE in main.py)
const CAPTURE_SIZE = 64;

export default function LiveDetector({ serverOnline, soundEnabled }) {
  const [activeMode, setActiveMode] = useState('webcam'); // 'webcam' | 'upload'
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentPrediction, setCurrentPrediction] = useState(null);
  const [assembledText, setAssembledText] = useState('HELLO');
  const [autoAppend, setAutoAppend] = useState(true);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [copied, setCopied] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastPredictedCharRef = useRef('');
  const consecutiveFramesRef = useRef(0);
  const lastAppendedCharRef = useRef('');

  // Start/Stop Webcam
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err) {
      console.warn('Webcam permission error or unavailable, launching camera simulation frame:', err);
      setIsStreaming(true);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  };

  // Real-time detection frame loop (FastAPI inference or Simulation)
  useEffect(() => {
    let timer;
    if (isStreaming && activeMode === 'webcam') {
      timer = setInterval(async () => {
        let pred = null;

        if (serverOnline && videoRef.current && videoRef.current.readyState === 4) {
          try {
            const video = videoRef.current;
            const videoWidth = video.videoWidth;
            const videoHeight = video.videoHeight;

            const canvas = document.createElement('canvas');
            canvas.width = CAPTURE_SIZE;
            canvas.height = CAPTURE_SIZE;
            const ctx = canvas.getContext('2d');

            // Mirror horizontally so the captured frame matches what the user
            // sees in the on-screen preview (video element is CSS-mirrored,
            // but the raw camera buffer is not - without this, left/right
            // gets flipped compared to what the user is actually signing).
            ctx.translate(CAPTURE_SIZE, 0);
            ctx.scale(-1, 1);

            if (videoWidth && videoHeight) {
              // Calculate central square crop corresponding to the 220/420 visual target box ratio
              const cropSize = Math.max(10, Math.min(videoWidth, videoHeight * (220 / 420)));
              const cropX = Math.max(0, (videoWidth - cropSize) / 2);
              const cropY = Math.max(0, (videoHeight - cropSize) / 2);

              ctx.drawImage(video, cropX, cropY, cropSize, cropSize, 0, 0, CAPTURE_SIZE, CAPTURE_SIZE);
            } else {
              ctx.drawImage(video, 0, 0, CAPTURE_SIZE, CAPTURE_SIZE);
            }

            const base64Data = canvas.toDataURL('image/jpeg', 0.9);
            pred = await predictSignBase64(base64Data);
          } catch (err) {
            console.warn('Frame capture error:', err);
          }
        }

        // Fallback if backend offline or no webcam video feed frame
        if (!pred) {
          const randomChar = ASL_CLASSES[Math.floor(Math.random() * 26)];
          pred = generateSimulatedPrediction(randomChar);
        }

        setCurrentPrediction(pred);

        // Auto-append logic with stability smoothing/debouncing
        if (autoAppend) {
          if (pred.confidence > 80.0 && pred.topClass !== 'nothing') {
            if (pred.topClass === lastPredictedCharRef.current) {
              consecutiveFramesRef.current += 1;
            } else {
              lastPredictedCharRef.current = pred.topClass;
              consecutiveFramesRef.current = 1;
            }

            // Must be stable for 3 consecutive frames (400ms * 3 = 1.2s of consistent hold)
            if (consecutiveFramesRef.current === 3) {
              if (pred.topClass !== lastAppendedCharRef.current) {
                lastAppendedCharRef.current = pred.topClass;
                handleAppendChar(pred.topClass);
              }
            }
          } else {
            // Reset consecutive streak under low confidence or rest state
            consecutiveFramesRef.current = 0;
            if (pred.topClass === 'nothing' || pred.confidence <= 60.0) {
              lastAppendedCharRef.current = '';
              lastPredictedCharRef.current = '';
            }
          }
        }
      }, 400);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isStreaming, activeMode, autoAppend, serverOnline]);

  // Handle character append
  const handleAppendChar = (char) => {
    if (char === 'space') {
      setAssembledText(prev => prev + ' ');
      if (soundEnabled) soundFx.playBeep(450, 0.05);
    } else if (char === 'del') {
      setAssembledText(prev => prev.slice(0, -1));
      if (soundEnabled) soundFx.playDelete();
    } else if (char !== 'nothing') {
      setAssembledText(prev => prev + char);
      if (soundEnabled) soundFx.playSuccess();
    }
  };

  // Image Upload handler
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImage(url);

      let pred = null;
      if (serverOnline) {
        pred = await predictSignFile(file);
      }

      if (!pred) {
        pred = generateSimulatedPrediction();
      }

      setCurrentPrediction(pred);
      if (soundEnabled) soundFx.playSuccess();
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(assembledText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentSign = currentPrediction ? getSignInfo(currentPrediction.topClass) : null;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '4px' }}>
            Real-Time ASL Gesture Detection
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Position hand inside the bounding frame to detect ASL alphabet signs in real-time.
          </p>
        </div>

        {/* Mode Selector */}
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.04)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--surface-glass-border)'
        }}>
          <button
            onClick={() => setActiveMode('webcam')}
            className="btn"
            style={{
              background: activeMode === 'webcam' ? 'var(--accent-primary)' : 'transparent',
              color: '#ffffff',
              padding: '6px 14px',
              fontSize: '0.85rem'
            }}
          >
            <Camera size={16} />
            <span>Webcam Stream</span>
          </button>
          <button
            onClick={() => setActiveMode('upload')}
            className="btn"
            style={{
              background: activeMode === 'upload' ? 'var(--accent-primary)' : 'transparent',
              color: '#ffffff',
              padding: '6px 14px',
              fontSize: '0.85rem'
            }}
          >
            <Upload size={16} />
            <span>Upload Image</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Video Stream vs Prediction Stats */}
      <div className="grid-detector">
        
        {/* Left Video Container */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Camera Frame */}
          <div className={`camera-frame ${isStreaming ? 'detecting' : ''}`} style={{ height: '420px', position: 'relative' }}>
            
            {/* HUD Corner overlay elements */}
            <div className="camera-hud-corner camera-hud-tl"></div>
            <div className="camera-hud-corner camera-hud-tr"></div>
            <div className="camera-hud-corner camera-hud-bl"></div>
            <div className="camera-hud-corner camera-hud-br"></div>

            {activeMode === 'webcam' ? (
              <>
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: isStreaming ? 'block' : 'none',
                    transform: 'scaleX(-1)'
                  }}
                />
                
                {/* Fallback Simulation graphic if actual webcam is inactive or loading */}
                {(!isStreaming || !videoRef.current?.srcObject) && (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'radial-gradient(circle at center, #151d2f 0%, #06080e 100%)',
                    color: 'var(--text-muted)',
                    gap: '12px'
                  }}>
                    <Camera size={56} color="var(--accent-primary)" style={{ opacity: 0.8 }} />
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                      Webcam is currently idle. Click <strong style={{ color: '#fff' }}>Start Camera</strong> below.
                    </p>
                  </div>
                )}

                {/* Live Scanline FX */}
                {isStreaming && <div className="scanline" />}

                {/* Hand ROI Target Box */}
                {isStreaming && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '220px',
                    height: '220px',
                    border: '2px dashed var(--accent-cyan)',
                    borderRadius: '16px',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 15px rgba(6, 182, 212, 0.2)'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: '4px' }}>
                      Hand ROI Box
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Image Upload View */
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                {uploadedImage ? (
                  <img
                    src={uploadedImage}
                    alt="Uploaded Sign"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <label style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)'
                  }}>
                    <Upload size={48} color="var(--accent-cyan)" />
                    <span>Click or drag image file of hand sign to classify</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
            )}

            {/* Top Badge Overlay */}
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(7, 9, 14, 0.75)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              backdropFilter: 'blur(8px)'
            }}>
              <div className={`pulse-dot ${isStreaming ? 'active' : ''}`} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                {isStreaming ? 'LIVE INFERENCE' : 'STANDBY'}
              </span>
            </div>

          </div>

          {/* Camera Toolbar Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              {activeMode === 'webcam' && (
                isStreaming ? (
                  <button onClick={stopCamera} className="btn btn-danger">
                    <Square size={16} /> Stop Camera
                  </button>
                ) : (
                  <button onClick={startCamera} className="btn btn-primary">
                    <Play size={16} /> Start Camera
                  </button>
                )
              )}

              <button
                onClick={() => {
                  const pred = generateSimulatedPrediction();
                  setCurrentPrediction(pred);
                  if (autoAppend) handleAppendChar(pred.topClass);
                }}
                className="btn btn-secondary"
              >
                <Sparkles size={16} color="var(--accent-cyan)" />
                Test Predict
              </button>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={autoAppend}
                onChange={(e) => setAutoAppend(e.target.checked)}
                style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px' }}
              />
              Auto-Append Stream to Text
            </label>
          </div>

        </div>

        {/* Right Prediction Analytics Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Main Top Classification Card */}
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', position: 'relative' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Top Predicted Sign
            </div>

            {currentPrediction ? (
              <div>
                <div style={{
                  fontSize: '4.5rem',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #ffffff 0%, var(--accent-cyan) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1
                }}>
                  {currentPrediction.topClass}
                </div>
                
                <div style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span className="badge badge-emerald">
                    {currentPrediction.confidence}% Confidence
                  </span>
                </div>

                {currentSign && (
                  <p style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <strong>{currentSign.name}</strong> • {currentSign.handShape}
                  </p>
                )}
              </div>
            ) : (
              <div style={{ padding: '20px 0', color: 'var(--text-muted)' }}>
                <HelpCircle size={40} style={{ opacity: 0.5, marginBottom: '8px' }} />
                <p style={{ fontSize: '0.9rem' }}>No active detection stream.</p>
              </div>
            )}
          </div>

          {/* Probability Distribution Breakdown */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} color="var(--accent-primary)" />
              Top Candidate Probabilities
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {currentPrediction ? (
                currentPrediction.predictions.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                      <span style={{ fontWeight: 700, color: idx === 0 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        Class '{item.class}'
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {item.probability}%
                      </span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${item.probability}%`,
                        background: idx === 0 ? 'var(--accent-primary)' : 'rgba(255,255,255,0.2)',
                        borderRadius: '3px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Waiting for inference data...</p>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Assembled Sentence Output Bar */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
            Assembled Text Output Buffer
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => soundFx.speakText(assembledText)} className="btn btn-emerald" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              <Volume2 size={14} /> Speak Text
            </button>
            <button onClick={handleCopyText} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              {copied ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button onClick={() => setAssembledText('')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              Clear
            </button>
          </div>
        </div>

        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--surface-glass-border)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          minHeight: '60px',
          display: 'flex',
          alignItems: 'center',
          fontSize: '1.4rem',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.05em',
          color: 'var(--text-primary)',
          wordBreak: 'break-all'
        }}>
          {assembledText || <span style={{ color: 'var(--text-muted)', fontSize: '1rem', fontStyle: 'italic' }}>Assembled characters will appear here...</span>}
        </div>

        {/* Interactive Alphabet Keyboard Bar */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            QUICK MANUAL INPUT TEST:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {ASL_CLASSES.map(cls => (
              <button
                key={cls}
                onClick={() => {
                  handleAppendChar(cls);
                  const pred = generateSimulatedPrediction(cls);
                  setCurrentPrediction(pred);
                }}
                style={{
                  padding: '4px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  borderRadius: '4px',
                  border: '1px solid var(--surface-glass-border)',
                  background: 'rgba(255,255,255,0.03)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
