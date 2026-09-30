import React from 'react';
import gateIcon from '../assets/gate_icon.png';
import {
  Camera, Languages, BookOpen, Trophy, BarChart3,
  Volume2, VolumeX, Hand, Activity, LogIn, LogOut, UserCircle, ShieldCheck, Lock
} from 'lucide-react';
import ThemeToggle from './ThemeToggle.jsx';

const PROTECTED_TAB_IDS = new Set(['detector', 'translator', 'practice']);

export default function Navbar({
  activeTab, setActiveTab, soundEnabled, setSoundEnabled, serverOnline,
  user, onAuthClick, onLogout
}) {
  const navItems = [
    { id: 'detector', label: 'Live Detector', icon: Camera },
    { id: 'translator', label: 'Text Translator', icon: Languages },
    { id: 'dictionary', label: 'Sign Dictionary', icon: BookOpen },
    { id: 'practice', label: 'Practice Arena', icon: Trophy },
    { id: 'analytics', label: 'ML Analytics', icon: BarChart3 },
  ];
  const isAdmin = user?.email === 'bhandariganesh2059@gmail.com';

  const visibleNavItems = isAdmin
    ? [...navItems, { id: 'admin', label: 'Admin', icon: ShieldCheck }]
    : navItems;

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'var(--nav-bg)', backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--surface-glass-border)'
    }}>
      <div style={{
        maxWidth: '1400px', margin: '0 auto', padding: '0 24px', height: '72px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px'
      }}>

        <div onClick={() => setActiveTab('home')} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flexShrink: 0 }}>
          <img
            src={gateIcon}
            alt="G.A.T.E. logo"
            style={{ width: '42px', height: '42px', objectFit: 'contain' }}
          />
          <div>
            <div style={{
              fontSize: '1.25rem', fontWeight: 800,
              background: 'var(--title-gradient)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em', lineHeight: 1.1, whiteSpace: 'nowrap'
            }}>
              G.A.T.E<span style={{ color: 'var(--accent-primary)', WebkitTextFillColor: 'initial' }}>.</span>
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
              Gesture and Text Engine
            </div>
          </div>
        </div>

        <nav className={visibleNavItems.length > 5 ? 'nav-many' : undefined} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'var(--fill-1)', padding: '4px 6px',
          borderRadius: 'var(--radius-full)', border: '1px solid var(--surface-glass-border)'
        }}>
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isLocked = PROTECTED_TAB_IDS.has(item.id) && !user;
            return (
              <button
                key={item.id}
                className={`nav-item${isActive ? ' is-active' : ''}`}
                onClick={() => setActiveTab(item.id)}
                title={isLocked ? `${item.label} (log in required)` : item.label}
                aria-label={item.label}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px',
                  whiteSpace: 'nowrap', flexShrink: 0,
                  borderRadius: 'var(--radius-full)', border: 'none', fontSize: '0.875rem',
                  fontWeight: isActive ? 700 : 500, cursor: 'pointer', transition: 'var(--transition)',
                  background: isActive ? 'linear-gradient(135deg, var(--accent-primary) 0%, #4338ca 100%)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  boxShadow: isActive ? '0 4px 14px rgba(99, 102, 241, 0.3)' : 'none',
                  opacity: isLocked ? 0.7 : 1
                }}
              >
                <Icon size={18} color={isActive ? '#ffffff' : 'var(--text-secondary)'} />
                <span className="nav-label">{item.label}</span>
                {isLocked && <Lock size={12} color="var(--text-muted)" />}
              </button>
            );
          })}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', whiteSpace: 'nowrap', flexShrink: 0,
            borderRadius: 'var(--radius-full)', background: 'var(--fill-1)',
            border: '1px solid var(--surface-glass-border)', fontSize: '0.775rem', color: 'var(--text-secondary)'
          }}
          title={serverOnline ? 'Model Online' : 'Simulation Mode'}>
            <div className={`pulse-dot ${serverOnline ? 'active' : ''}`}
              style={{ backgroundColor: serverOnline ? 'var(--accent-emerald)' : 'var(--accent-amber)' }} />
            <Activity size={14} />
            <span className="nav-status-text">{serverOnline ? 'Model Online' : 'Simulation Mode'}</span>
          </div>

          <button onClick={() => setSoundEnabled(!soundEnabled)} className="btn-icon" title={soundEnabled ? 'Disable UI Sound Effects' : 'Enable UI Sound Effects'} style={{
            width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--surface-glass-border)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', background: 'var(--fill-1)'
          }}>
            {soundEnabled ? <Volume2 size={20} color="var(--accent-cyan)" /> : <VolumeX size={20} color="var(--text-muted)" />}
          </button>

          <ThemeToggle />

          {/* Auth Section */}
          {user ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px 6px 6px', flexShrink: 0,
              borderRadius: 'var(--radius-full)', background: 'var(--fill-1)',
              border: '1px solid var(--surface-glass-border)'
            }}>
              <UserCircle size={22} color="var(--accent-cyan)" />
              <span title={user.name} style={{
                fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600,
                whiteSpace: 'nowrap', maxWidth: '96px', overflow: 'hidden', textOverflow: 'ellipsis'
              }}>
                {user.name?.split(' ')[0]}
              </span>
              <button onClick={onLogout} title="Log out" style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '4px'
              }}>
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button onClick={onAuthClick} style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', whiteSpace: 'nowrap', flexShrink: 0,
              borderRadius: 'var(--radius-full)', border: 'none', fontSize: '0.875rem', fontWeight: 700,
              cursor: 'pointer', background: 'linear-gradient(135deg, var(--accent-primary) 0%, #4338ca 100%)',
              color: '#fff', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)'
            }}>
              <LogIn size={16} />
              <span>Log In</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
