import React from 'react';
import Canvas from '../components/Canvas/Canvas';
import PromptBar from '../components/PromptBar/PromptBar';
import NodeCount from '../components/ui/NodeCount';
import { useSocket } from '../hooks/useSocket';
import { useCanvasStore } from '../store/canvas.store';

const HomePage: React.FC = () => {
  useSocket();

  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId);
  const nodes = useCanvasStore((s) => s.nodes);
  const setSelectedNode = useCanvasStore((s) => s.setSelectedNode);
  const deleteNode = useCanvasStore((s) => s.deleteNode);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  const handleDelete = () => {
    if (selectedNodeId) deleteNode(selectedNodeId);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg-app)', position: 'relative', overflow: 'hidden' }}
    >
      {/* ── Ambient background glows ── */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute',
          width: 700, height: 480,
          borderRadius: '50%',
          background: 'rgba(124,110,245,0.09)',
          filter: 'blur(100px)',
          top: -160, left: '5%',
        }} />
        <div style={{
          position: 'absolute',
          width: 560, height: 400,
          borderRadius: '50%',
          background: 'rgba(232,93,138,0.06)',
          filter: 'blur(100px)',
          bottom: -80, right: '-4%',
        }} />
        <div style={{
          position: 'absolute',
          width: 300, height: 300,
          borderRadius: '50%',
          background: 'rgba(62,207,203,0.04)',
          filter: 'blur(80px)',
          top: '40%', left: '55%',
        }} />
      </div>

      {/* ── Header ── */}
      <header
        className="relative z-10 flex items-center justify-between flex-wrap"
        style={{
          padding: '12px 16px',
          minHeight: 56,
          borderBottom: '1px solid var(--border)',
          background: 'rgba(7,7,13,0.7)',
          backdropFilter: 'blur(16px)',
          gap: 12,
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          {/* Logomark */}
          <div style={{
            width: 32, height: 32,
            borderRadius: 9,
            background: 'var(--gradient-brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)',
            flexShrink: 0,
          }}>
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
              <rect x="2" y="2" width="5.5" height="5.5" rx="1.8" fill="white" opacity="0.95" />
              <rect x="9.5" y="2" width="5.5" height="5.5" rx="1.8" fill="white" opacity="0.55" />
              <rect x="2" y="9.5" width="5.5" height="5.5" rx="1.8" fill="white" opacity="0.55" />
              <rect x="9.5" y="9.5" width="5.5" height="5.5" rx="1.8" fill="white" opacity="0.95" />
            </svg>
          </div>

          {/* Wordmark */}
          <div>
            <div style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              fontSize: 14.5,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
            }}>
              Canvas AI Studio
            </div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: '0.12em',
              color: 'var(--accent)',
              textTransform: 'uppercase',
              lineHeight: 1,
            }}>
              v2.4 · Beta
            </div>
          </div>
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          {/* Node count pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 10px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--border)',
            background: 'var(--bg-secondary)',
            fontSize: 11.5,
            whiteSpace: 'nowrap',
          }}>
            <span style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}>
              <NodeCount />
            </span>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main
        className="flex-1 flex flex-col relative z-10"
        style={{
          padding: '16px',
          gap: 16,
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        {/* Prompt section */}
        <div style={{ width: '100%' }}>
          <PromptBar />
        </div>

        {/* Canvas section - Full width */}
        <div
          className="flex-1 animate-fade-in"
          style={{
            minHeight: 0,
            width: '100%',
            animationDelay: '0.1s',
          }}
        >
          <Canvas />
        </div>
      </main>

      {/* ── Selected node floating toolbar ── */}
      {selectedNode && (
        <div
          className="animate-spring-up"
          style={{
            position: 'fixed',
            bottom: 28,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 14px',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-active)',
            boxShadow: 'var(--shadow-lg), var(--shadow-glow)',
            zIndex: 50,
            whiteSpace: 'nowrap',
          }}
        >
          {/* Node label + type badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 10, borderRight: '1px solid var(--border)' }}>
            <span style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 12.5,
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}>
              {selectedNode.label}
            </span>
            <span className="badge badge-accent">{selectedNode.type}</span>
          </div>

          {/* Deselect */}
          <button
            onClick={() => setSelectedNode(null)}
            className="btn-secondary"
            style={{ padding: '5px 12px', fontSize: 12, gap: 5 }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
            Deselect
          </button>

          {/* Vertical divider */}
          <div className="divider-v" style={{ height: 20 }} />

          {/* Delete */}
          <button
            onClick={handleDelete}
            className="btn-icon"
            title="Delete node (Del)"
            style={{
              width: 'auto',
              padding: '5px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--error-bg)',
              border: '1px solid var(--error-border)',
              color: 'var(--error)',
              fontSize: 12,
              fontWeight: 500,
              display: 'flex',
              gap: 5,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
            Delete
          </button>

          {/* Keyboard hint */}
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9.5,
            color: 'var(--text-dim)',
            letterSpacing: '0.04em',
            paddingLeft: 4,
          }}>
            Del · Esc
          </span>
        </div>
      )}
    </div>
  );
};

export default HomePage;