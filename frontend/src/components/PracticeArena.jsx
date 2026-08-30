import React, { useState, useEffect } from 'react';
import { Trophy, Zap, CheckCircle2, XCircle, RotateCcw, Award, Flame } from 'lucide-react';
import { ASL_DICTIONARY } from '../utils/aslData';
import { soundFx } from '../utils/sound';

export default function PracticeArena({ soundEnabled }) {
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [questionCount, setQuestionCount] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Generate a new random question
  const generateQuestion = () => {
    const target = ASL_DICTIONARY[Math.floor(Math.random() * 26)]; // A-Z
    
    // Pick 3 random distractor signs
    const distractors = ASL_DICTIONARY
      .filter(s => s.symbol !== target.symbol && /[A-Z]/.test(s.symbol))
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
      
    const options = [target, ...distractors].sort(() => 0.5 - Math.random());
    
    setCurrentQuestion({
      targetSign: target,
      options: options
    });
    setSelectedOption(null);
    setIsAnswered(false);
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  const handleSelectOption = (option) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option.symbol === currentQuestion.targetSign.symbol;
    if (isCorrect) {
      setScore(prev => prev + 100);
      setStreak(prev => prev + 1);
      if (soundEnabled) soundFx.playSuccess();
    } else {
      setStreak(0);
      if (soundEnabled) soundFx.playDelete();
    }
  };

  const handleNextQuestion = () => {
    setQuestionCount(prev => prev + 1);
    generateQuestion();
  };

  const handleResetQuiz = () => {
    setScore(0);
    setStreak(0);
    setQuestionCount(1);
    generateQuestion();
  };

  if (!currentQuestion) return null;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header & Stats Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '4px' }}>
            ASL Practice & Quiz Arena
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Test your knowledge of American Sign Language gestures and speed up recognition.
          </p>
        </div>

        {/* Stats Pills */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="glass-panel" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={18} color="var(--accent-amber)" />
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Score</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-amber)' }}>{score} XP</div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame size={18} color="var(--accent-rose)" />
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Streak</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-rose)' }}>{streak} 🔥</div>
            </div>
          </div>
        </div>

      </div>

      {/* Quiz Challenge Main Card */}
      <div className="glass-panel" style={{ padding: '36px', maxWidth: '720px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="badge badge-indigo">
            QUESTION #{questionCount}
          </span>
          <button onClick={handleResetQuiz} className="btn-icon" title="Reset Quiz Progress">
            <RotateCcw size={16} />
          </button>
        </div>

        {/* Question Prompt */}
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
            Which handshape tip describes the ASL sign for <span style={{ color: 'var(--accent-cyan)' }}>'{currentQuestion.targetSign.symbol}'</span>?
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Select the correct finger positioning description below:
          </p>
        </div>

        {/* Multiple Choice Options */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginTop: '12px' }}>
          {currentQuestion.options.map((opt, idx) => {
            const isSelected = selectedOption?.symbol === opt.symbol;
            const isTarget = opt.symbol === currentQuestion.targetSign.symbol;
            
            let btnStyle = {
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--surface-glass-border)',
              background: 'rgba(255, 255, 255, 0.03)',
              color: 'var(--text-primary)',
              textAlign: 'left',
              cursor: isAnswered ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'var(--transition)',
              fontSize: '0.925rem',
              fontWeight: 600
            };

            if (isAnswered) {
              if (isTarget) {
                btnStyle.background = 'rgba(16, 185, 129, 0.2)';
                btnStyle.borderColor = 'var(--accent-emerald)';
              } else if (isSelected && !isTarget) {
                btnStyle.background = 'rgba(244, 63, 94, 0.2)';
                btnStyle.borderColor = 'var(--accent-rose)';
              }
            }

            return (
              <button
                key={opt.symbol}
                onClick={() => handleSelectOption(opt)}
                style={btnStyle}
              >
                <span>{opt.tips}</span>
                {isAnswered && (
                  isTarget ? <CheckCircle2 size={20} color="var(--accent-emerald)" /> : 
                  isSelected ? <XCircle size={20} color="var(--accent-rose)" /> : null
                )}
              </button>
            );
          })}
        </div>

        {/* Next Question Action */}
        {isAnswered && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
            <button onClick={handleNextQuestion} className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '1rem' }}>
              Next Challenge <Zap size={18} />
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
