import React from 'react';
import { useCanvasStore } from '../../store/canvas.store';

const statusConfig = {
  connected: {
    label: 'Live',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.08)',
    border: 'rgba(34,197,94,0.3)',
    pulse: true,
  },
  disconnected: {
    label: 'Offline',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.3)',
    pulse: false,
  },
  reconnecting: {
    label: 'Reconnecting',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.08)',
    border: 'rgba(249,115,22,0.3)',
    pulse: true,
  },
} as const;

const ConnectionStatus: React.FC = () => {
  const connectionStatus = useCanvasStore((s) => s.connectionStatus);
  const cfg = statusConfig[connectionStatus];

  return (
    <div
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all duration-300"
      style={{
        background: `linear-gradient(135deg, ${cfg.bg}, ${cfg.bg})`,
        borderColor: cfg.border,
        color: cfg.color,
        boxShadow: `0 2px 8px ${cfg.bg.replace('0.08', '0.15')}`
      }}
    >
      <span
        className="w-2.5 h-2.5 rounded-full relative flex items-center justify-center"
        style={{
          background: cfg.color,
          animation: cfg.pulse ? 'pulse-dot 1.5s ease infinite' : 'none',
          boxShadow: cfg.pulse ? `0 0 12px ${cfg.color}` : 'none'
        }}
      >
        {cfg.pulse && (
          <span
            className="absolute w-full h-full rounded-full"
            style={{
              background: cfg.color,
              opacity: 0.3,
              animation: 'ping 1.5s ease-out infinite'
            }}
          />
        )}
      </span>
      {cfg.label}
    </div>
  );
};

export default ConnectionStatus;
