import React, { useState } from 'react';
import { Search, Filter, BookOpen, Hand, ChevronRight, CheckCircle2 } from 'lucide-react';
import { ASL_DICTIONARY } from '../utils/aslData';

export default function SignDictionary({ onSelectSignForPractice }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All'); // 'All' | 'Alphabet' | 'Action'
  const [selectedSign, setSelectedSign] = useState(ASL_DICTIONARY[0]);

  const filteredDictionary = ASL_DICTIONARY.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.tips.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '4px' }}>
          ASL Gesture Dictionary & Handshapes
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Explore all 29 target classes trained on the CNN model with finger positioning guides.
        </p>
      </div>

      {/* Filter & Search Controls */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Search Input */}
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sign by letter or tip..."
            style={{
              width: '100%',
              padding: '10px 14px 10px 42px',
              fontSize: '0.9rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--surface-glass-border)',
              background: 'rgba(0, 0, 0, 0.4)',
              color: '#ffffff',
              outline: 'none'
            }}
          />
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {['All', 'Alphabet', 'Action'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="btn"
              style={{
                background: activeCategory === cat ? 'var(--accent-primary)' : 'rgba(255,255,255,0.04)',
                color: activeCategory === cat ? '#ffffff' : 'var(--text-secondary)',
                padding: '6px 14px',
                fontSize: '0.825rem'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Main Grid: Card Grid + Detail Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px' }}>
        
        {/* Card Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '14px' }}>
          {filteredDictionary.map(item => {
            const isSelected = selectedSign.symbol === item.symbol;
            return (
              <div
                key={item.symbol}
                onClick={() => setSelectedSign(item)}
                className={`glass-panel glass-panel-hover`}
                style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  borderColor: isSelected ? 'var(--accent-primary)' : 'var(--surface-glass-border)',
                  background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--surface-glass)'
                }}
              >
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  color: isSelected ? 'var(--accent-cyan)' : '#ffffff',
                  marginBottom: '8px'
                }}>
                  {item.symbol === 'space' ? '␣' : item.symbol}
                </div>

                <div style={{ fontSize: '0.85rem', fontWeight: 700, textAlign: 'center', marginBottom: '4px' }}>
                  {item.name}
                </div>

                <span className={`badge ${item.difficulty === 'Easy' ? 'badge-emerald' : item.difficulty === 'Medium' ? 'badge-cyan' : 'badge-amber'}`} style={{ fontSize: '0.65rem' }}>
                  {item.difficulty}
                </span>
              </div>
            );
          })}
        </div>

        {/* Selected Sign Details Sidebar */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            fontSize: '5rem',
            fontWeight: 900,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #ffffff 0%, var(--accent-cyan) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1
          }}>
            {selectedSign.symbol === 'space' ? '␣' : selectedSign.symbol}
          </div>

          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{selectedSign.name}</h2>
            <div style={{ marginTop: '6px', display: 'inline-flex', gap: '8px' }}>
              <span className="badge badge-indigo">{selectedSign.category}</span>
              <span className="badge badge-emerald">{selectedSign.handShape}</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--surface-glass-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                FINGER POSITIONING TIPS
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {selectedSign.tips}
              </p>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                DETAILED DESCRIPTION
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {selectedSign.description}
              </p>
            </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
            <button
              onClick={() => onSelectSignForPractice && onSelectSignForPractice(selectedSign.symbol)}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              Practice This Sign <ChevronRight size={16} />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
