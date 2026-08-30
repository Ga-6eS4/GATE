import React from 'react';
import { 
  Camera, 
  Languages, 
  BookOpen, 
  Trophy, 
  BarChart3, 
  Volume2, 
  VolumeX, 
  Hand,
  Activity
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, soundEnabled, setSoundEnabled, serverOnline }) {
  const navItems = [
    { id: 'detector', label: 'Live Detector', icon: Camera },
    { id: 'translator', label: 'Text Translator', icon: Languages },
    { id: 'dictionary', label: 'Sign Dictionary', icon: BookOpen },
    { id: 'practice', label: 'Practice Arena', icon: Trophy },
    { id: 'analytics', label: 'ML Analytics', icon: BarChart3 },
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(7, 9, 14, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--surface-glass-border)'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 24px',
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('detector')} 
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-cyan) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Hand size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              background: 'linear-gradient(90deg, #ffffff 0%, #cbd5e1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
              lineHeight: 1.1
            }}>
              Sign<span style={{ color: 'var(--accent-primary)', WebkitTextFillColor: 'initial' }}>AI</span>
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              ASL Vision Recognition
            </div>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '4px 6px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--surface-glass-border)'
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  background: isActive 
                    ? 'linear-gradient(135deg, var(--accent-primary) 0%, #4338ca 100%)' 
                    : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  boxShadow: isActive ? '0 4px 14px rgba(99, 102, 241, 0.3)' : 'none'
                }}
              >
                <Icon size={18} color={isActive ? '#ffffff' : 'var(--text-secondary)'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Status Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* Server Connection Status */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--surface-glass-border)',
            fontSize: '0.775rem',
            color: 'var(--text-secondary)'
          }}>
            <div className={`pulse-dot ${serverOnline ? 'active' : ''}`} 
                 style={{ backgroundColor: serverOnline ? 'var(--accent-emerald)' : 'var(--accent-amber)' }} />
            <Activity size={14} />
            <span>{serverOnline ? 'Model Online' : 'Simulation Mode'}</span>
          </div>

          {/* Mute/Unmute Audio Button */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="btn-icon"
            title={soundEnabled ? 'Disable UI Sound Effects' : 'Enable UI Sound Effects'}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--surface-glass-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.04)'
            }}
          >
            {soundEnabled ? <Volume2 size={20} color="var(--accent-cyan)" /> : <VolumeX size={20} color="var(--text-muted)" />}
          </button>

        </div>

      </div>
    </header>
  );
}
