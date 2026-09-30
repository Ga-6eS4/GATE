import React from 'react';
import { Camera, Languages, BookOpen, Trophy, ArrowRight, Sparkles } from 'lucide-react';

const FEATURES = [
  {
    id: 'detector',
    icon: Camera,
    title: 'Live Detector',
    desc: 'Point your webcam at your hand and watch ASL letters get recognized in real time.',
    locked: true
  },
  {
    id: 'translator',
    icon: Languages,
    title: 'Text Translator',
    desc: 'Type any phrase and see it broken down into an animated ASL fingerspelling sequence.',
    locked: true
  },
  {
    id: 'dictionary',
    icon: BookOpen,
    title: 'Sign Dictionary',
    desc: 'Browse every letter with real hand-sign photos and finger positioning tips.',
    locked: false
  },
  {
    id: 'practice',
    icon: Trophy,
    title: 'Practice Arena',
    desc: 'Test yourself letter by letter and track how you improve over time.',
    locked: true
  }
];

export default function Home({ onNavigate, onLoginClick }) {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '40px 16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)',
          padding: '6px 14px', borderRadius: 'var(--radius-full)',
          fontSize: '0.8rem', fontWeight: 700, color: 'var(--badge-cyan)'
        }}>
          <Sparkles size={14} />
          Real-time ASL alphabet recognition
        </div>

        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, lineHeight: 1.15, maxWidth: '640px' }}>
          Turn hand signs into text,{' '}
          <span style={{
            background: 'linear-gradient(135deg, var(--hero-from) 0%, var(--accent-cyan) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            instantly.
          </span>
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '520px', lineHeight: 1.6 }}>
          G.A.T.E. uses a from-scratch convolutional neural network to recognize the American Sign
          Language alphabet live from your webcam, translate text into signs, and help you practice.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' }}>
          <button
            onClick={() => onNavigate('dictionary')}
            className="btn btn-secondary"
            style={{ padding: '12px 22px', fontSize: '0.95rem' }}
          >
            <BookOpen size={18} />
            Browse the Sign Dictionary
          </button>
          <button
            onClick={onLoginClick}
            className="btn btn-primary"
            style={{ padding: '12px 22px', fontSize: '0.95rem' }}
          >
            Get Started <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Feature grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '18px' }}>
        {FEATURES.map(f => {
          const Icon = f.icon;
          return (
            <div
              key={f.id}
              onClick={() => onNavigate(f.id)}
              className="glass-panel glass-panel-hover"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon size={22} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {f.title}
                {f.locked && (
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', border: '1px solid var(--surface-glass-border)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                    LOG IN
                  </span>
                )}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {f.desc}
              </p>
            </div>
          );
        })}
      </div>

    </div>
  );
}
