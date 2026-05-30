import React from 'react';

const CanvasLoading: React.FC = () => (
  <div
    className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm"
    style={{
      background: 'rgba(248, 249, 253, 0.85)'
    }}
  >
    <div className="relative flex items-center justify-center mb-6">
      {/* Spinning rings */}
      <div
        className="absolute w-24 h-24 rounded-full border-3"
        style={{
          borderWidth: '3px',
          borderColor: 'transparent',
          borderTopColor: 'var(--accent)',
          animation: 'spin-slow 1s linear infinite'
        }}
      />
      <div
        className="absolute w-16 h-16 rounded-full border-3"
        style={{
          borderWidth: '3px',
          borderColor: 'transparent',
          borderTopColor: 'var(--accent-2)',
          animation: 'spin-slow 0.7s linear infinite reverse'
        }}
      />
      <div
        className="w-10 h-10 rounded-full border-2"
        style={{
          background: 'rgba(139, 92, 246, 0.1)',
          borderColor: 'rgba(139, 92, 246, 0.3)'
        }}
      />
    </div>
    <p className="text-sm font-semibold tracking-wide mb-2" style={{ color: 'var(--text-primary)' }}>
      Generating with AI
    </p>
    <div className="flex gap-1.5 mt-1">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: 'var(--accent)',
            animation: `pulse-dot 1s ease ${i * 200}ms infinite`
          }}
        />
      ))}
    </div>
  </div>
);

export default CanvasLoading;
