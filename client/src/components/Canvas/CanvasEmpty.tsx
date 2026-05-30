import React from 'react';

const CanvasEmpty: React.FC = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
    <div className="relative mb-8">
      {/* Animated rings */}
      <div
        className="absolute inset-0 rounded-full border-2 animate-ping"
        style={{
          width: 100,
          height: 100,
          top: -16,
          left: -16,
          borderColor: 'rgba(139, 92, 246, 0.15)'
        }}
      />
      <div
        className="w-20 h-20 rounded-full border-2 flex items-center justify-center"
        style={{
          borderColor: 'rgba(139, 92, 246, 0.25)',
          background: 'rgba(139, 92, 246, 0.04)'
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </div>
    </div>
    <p className="text-sm font-semibold tracking-wide mb-2" style={{ color: 'var(--text-secondary)' }}>
      Empty Canvas
    </p>
    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
      Enter a prompt to generate shapes
    </p>
    {/* Decorative dots */}
    <div className="flex gap-2.5 mt-8">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{
            background: 'var(--accent)',
            opacity: 0.2,
            animationDelay: `${i * 200}ms`
          }}
        />
      ))}
    </div>
  </div>
);

export default CanvasEmpty;
