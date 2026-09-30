import React, { useState } from 'react';
import { BarChart3, Cpu, Database, Server, Activity, Check, Settings, RefreshCw, Zap } from 'lucide-react';
import { checkBackendHealth } from '../services/api';

export default function AnalyticsDashboard({ serverOnline, setServerOnline }) {
  const [apiUrl, setApiUrl] = useState('http://localhost:8000/predict');
  const [latency, setLatency] = useState(null); // ms - null until a real ping has run
  const [testing, setTesting] = useState(false);

  const runLatencyTest = async () => {
    setTesting(true);
    const start = performance.now();
    const res = await checkBackendHealth();
    const duration = Math.round(performance.now() - start);

    if (res.online) {
      setLatency(duration);
      setServerOnline(true);
    } else {
      setLatency(null);
      setServerOnline(false);
    }
    setTesting(false);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '4px' }}>
          ML Model & System Analytics
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Overview of the ASL Convolutional Neural Network (CNN) architecture, dataset, and live inference endpoint.
        </p>
      </div>

      {/* Top 4 Stats Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)' }}>
            <Database size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Dataset Size</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>78,000 Images</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>26 Classes (3k per class)</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
            <Cpu size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Architecture</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>CNN (From Scratch)</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>TensorFlow / Keras</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
            <Zap size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Inference Speed</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
              {latency !== null ? `${latency} ms` : '—'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {latency !== null ? 'Measured via /health ping' : 'Ping endpoint to measure'}
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)' }}>
            <Server size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Target Classes</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>26 Classes</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>A-Z Alphabet</div>
          </div>
        </div>

      </div>

      {/* Main Grid: Architecture Details & API Configuration */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
        
        {/* CNN Pipeline Layer Specs */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={20} color="var(--accent-primary)" />
            Convolutional Neural Network Pipeline
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { layer: 'Input Layer', spec: '64x64x3 RGB Image Tensor', type: 'Rescaling (1./255)' },
              { layer: 'Conv Block 1', spec: '32 Filters (3x3), ReLU Activation + MaxPooling2D (2x2)', type: 'Feature Extraction' },
              { layer: 'Conv Block 2', spec: '64 Filters (3x3), ReLU Activation + MaxPooling2D (2x2)', type: 'Edge & Contour Maps' },
              { layer: 'Conv Block 3', spec: '128 Filters (3x3), ReLU Activation + MaxPooling2D (2x2)', type: 'Handshape Features' },
              { layer: 'Conv Block 4', spec: '128 Filters (3x3), ReLU Activation + MaxPooling2D (2x2)', type: 'Complex Handshape Features' },
              { layer: 'Dense Dropout', spec: 'Flatten -> Dropout (0.5) -> Dense (256 Units, ReLU)', type: 'Regularization' },
              { layer: 'Output Softmax', spec: 'Dense (26 Units, Softmax Activation)', type: 'Class Probability Distribution' }
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--fill-1)',
                  border: '1px solid var(--surface-glass-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {index + 1}. {item.layer}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.spec}</div>
                </div>
                <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>
                  {item.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Backend Server Settings & Benchmark */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={18} color="var(--accent-cyan)" />
              Backend API Connection
            </h3>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                MODEL INFERENCE ENDPOINT URL
              </label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '0.875rem',
                  fontFamily: 'var(--font-mono)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--surface-glass-border)',
                  background: 'var(--inset-bg)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={runLatencyTest}
                className="btn btn-secondary"
                disabled={testing}
                style={{ flex: 1 }}
              >
                <RefreshCw size={16} className={testing ? 'animate-spin' : ''} />
                {testing ? 'Testing...' : 'Ping Endpoint'}
              </button>

              {/* Status display only - no longer manually clickable/fakeable.
                  Real status comes only from runLatencyTest() and the app-wide
                  health check, never from the user clicking this. */}
              <div
                className={serverOnline ? 'btn btn-emerald' : 'btn btn-secondary'}
                style={{ cursor: 'default', pointerEvents: 'none' }}
              >
                {serverOnline ? 'Online' : 'Offline'}
              </div>
            </div>

            <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--fill-1)', border: '1px solid var(--surface-glass-border)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <strong>Status:</strong> {serverOnline ? 'Connected to local FastAPI / TensorFlow endpoint' : 'Backend unreachable - using simulated predictions'}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
