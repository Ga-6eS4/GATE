import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Sparkles, RefreshCw, Info } from 'lucide-react';
import { getSignInfo } from '../utils/aslData';
import { soundFx } from '../utils/sound';

export default function TextTranslator({ soundEnabled }) {
  const [text, setText] = useState('WELCOME TO SIGN AI');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [speed, setSpeed] = useState(1); // 0.5 | 1 | 2

  // Clean characters into array of valid symbols
  const charList = text
    .toUpperCase()
    .split('')
    .map(c => (c === ' ' ? 'space' : c))
    .filter(c => /[A-Z]/.test(c) || c === 'space');

  // Animation playback loop
  useEffect(() => {
    let timer;
    if (isPlaying && charList.length > 0) {
      const delay = 1000 / speed;
      timer = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= charList.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          if (soundEnabled) soundFx.playBeep(600 + prev * 20, 0.05);
          return prev + 1;
        });
      }, delay);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, charList.length, speed, soundEnabled]);

  const handlePlayPause = () => {
    if (charList.length === 0) return;
    if (currentIndex >= charList.length - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const currentChar = charList[currentIndex] || 'A';
  const currentSignDetails = getSignInfo(currentChar);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '4px' }}>
          Text to ASL Sign Translator
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Type any sentence or word below to generate an animated ASL fingerspelling sequence.
        </p>
      </div>

      {/* Text Input Panel */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          English Input Phrase
        </label>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setCurrentIndex(0);
              setIsPlaying(false);
            }}
            placeholder="Type text to translate into ASL..."
            style={{
              flex: 1,
              minWidth: '280px',
              padding: '14px 18px',
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--surface-glass-border)',
              background: 'rgba(0, 0, 0, 0.4)',
              color: '#ffffff',
              outline: 'none'
            }}
          />
          <button
            onClick={() => soundFx.speakText(text)}
            className="btn btn-emerald"
          >
            <Volume2 size={18} /> Speak Phrase
          </button>
        </div>
      </div>

      {/* Main Animated Display Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        
        {/* Active Sign Visualizer Box */}
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '380px', position: 'relative' }}>
          
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--accent-cyan)',
            letterSpacing: '0.05em',
            marginBottom: '16px',
            background: 'rgba(6, 182, 212, 0.12)',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(6, 182, 212, 0.3)'
          }}>
            CHARACTER {currentIndex + 1} OF {charList.length || 1}
          </div>

          {/* Large Symbol Banner */}
          <div style={{
            width: '140px',
            height: '140px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
            border: '2px solid var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '4.5rem',
            fontWeight: 900,
            color: '#ffffff',
            boxShadow: 'var(--shadow-glow)',
            marginBottom: '20px'
          }}>
            {currentChar === 'space' ? '␣' : currentChar}
          </div>

          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>
            {currentSignDetails.name}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', maxWidth: '400px' }}>
            {currentSignDetails.tips}
          </p>

          {/* Playback Control Bar */}
          <div style={{
            marginTop: '28px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '8px 20px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--surface-glass-border)'
          }}>
            <button
              onClick={() => {
                setCurrentIndex(prev => Math.max(0, prev - 1));
                setIsPlaying(false);
              }}
              className="btn-icon"
              disabled={currentIndex === 0}
            >
              <SkipBack size={20} />
            </button>

            <button
              onClick={handlePlayPause}
              className="btn btn-primary"
              style={{ width: '44px', height: '44px', borderRadius: '50%', padding: 0 }}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '2px' }} />}
            </button>

            <button
              onClick={() => {
                setCurrentIndex(prev => Math.min(charList.length - 1, prev + 1));
                setIsPlaying(false);
              }}
              className="btn-icon"
              disabled={currentIndex >= charList.length - 1}
            >
              <SkipForward size={20} />
            </button>

            <div style={{ width: '1px', height: '24px', background: 'var(--surface-glass-border)', margin: '0 4px' }} />

            {/* Speed Selector */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {[0.5, 1, 2].map(s => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: speed === s ? 'var(--accent-cyan)' : 'transparent',
                    color: speed === s ? '#000000' : 'var(--text-muted)'
                  }}
                >
                  {s}x
                </button>
              ))}
            </div>

          </div>

        </div>

        {/* Sequence Ribbon list */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="var(--accent-cyan)" />
            Sequence Flow
          </h3>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: '320px',
            overflowY: 'auto',
            paddingRight: '4px'
          }}>
            {charList.map((ch, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  setIsPlaying(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: idx === currentIndex ? 'rgba(99, 102, 241, 0.18)' : 'rgba(255, 255, 255, 0.02)',
                  border: idx === currentIndex ? '1px solid var(--accent-primary)' : '1px solid var(--surface-glass-border)',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: idx === currentIndex ? 'var(--accent-primary)' : 'rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    color: '#fff'
                  }}>
                    {ch === 'space' ? '␣' : ch}
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: idx === currentIndex ? '#fff' : 'var(--text-secondary)' }}>
                    {ch === 'space' ? 'Space Bar' : `Letter ${ch}`}
                  </span>
                </div>

                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  #{idx + 1}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
