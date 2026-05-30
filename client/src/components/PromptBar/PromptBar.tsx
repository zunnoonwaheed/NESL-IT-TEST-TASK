import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { useCanvasStore } from '../../store/canvas.store';
import { canvasService } from '../../services/canvas.service';
import { EXAMPLE_PROMPTS } from '../../constants';

const PromptBar: React.FC = () => {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isGenerating    = useCanvasStore((s) => s.isGenerating);
  const connectionStatus = useCanvasStore((s) => s.connectionStatus);
  const clearCanvas     = useCanvasStore((s) => s.clearCanvas);
  const setGenerating   = useCanvasStore((s) => s.setGenerating);
  const setLastPrompt   = useCanvasStore((s) => s.setLastPrompt);
  const setError        = useCanvasStore((s) => s.setError);
  const error           = useCanvasStore((s) => s.error);

  const isConnected = connectionStatus === 'connected';
  const isDisabled  = isGenerating || !isConnected;
  const canSubmit   = input.trim().length > 0 && !isDisabled;

  // ⌘K / Ctrl+K focuses the input
  useEffect(() => {
    const down = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, []);

  const handleGenerate = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isDisabled) return;
    setGenerating(true);
    setError(null);
    setLastPrompt(trimmed);
    canvasService.generate(trimmed);
    setInput('');
  }, [input, isDisabled, setGenerating, setError, setLastPrompt]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleGenerate();
      }
    },
    [handleGenerate],
  );

  const handleChipClick = (text: string) => {
    if (isDisabled) return;
    setInput(text);
    inputRef.current?.focus();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* ── Error banner ── */}
      {error && (
        <div
          className="animate-slide-down"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--error-bg)',
            border: '1px solid var(--error-border)',
            fontSize: 13,
            color: 'var(--error)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          {error}
        </div>
      )}

      {/* ── Input row ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 6px 6px 14px',
          borderRadius: 'var(--radius-lg)',
          border: `1px solid ${
            isGenerating
              ? 'var(--border-active)'
              : isFocused
              ? 'rgba(124,110,245,0.5)'
              : 'var(--border)'
          }`,
          background: 'var(--bg-secondary)',
          boxShadow: isFocused
            ? '0 0 0 3px var(--accent-glow)'
            : isGenerating
            ? '0 0 0 3px var(--accent-glow)'
            : 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
      >
        {/* Left icon */}
        <div style={{
          width: 28, height: 28,
          borderRadius: 8,
          background: isGenerating ? 'var(--gradient-brand)' : 'var(--bg-tertiary)',
          border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          transition: 'background 0.25s',
        }}>
          {isGenerating ? (
            <div className="spinner" style={{ width: 14, height: 14, borderWidth: 1.8 }} />
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(124,110,245,0.7)" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          )}
        </div>

        {/* Text input */}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={
            isGenerating
              ? 'Generating your canvas…'
              : !isConnected
              ? 'Waiting for connection…'
              : 'Describe a diagram, flow, or shape…'
          }
          disabled={isDisabled}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: 14,
            color: isDisabled ? 'var(--text-muted)' : 'var(--text-primary)',
            fontFamily: "'DM Sans', sans-serif",
            caretColor: 'var(--accent)',
          }}
        />

        {/* Keyboard shortcut hint */}
        {!isFocused && !isGenerating && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            flexShrink: 0,
            marginRight: 4,
          }}>
            {['⌘', 'K'].map((k) => (
              <span key={k} style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                color: 'var(--text-dim)',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                padding: '2px 5px',
                lineHeight: 1.4,
              }}>
                {k}
              </span>
            ))}
          </div>
        )}

        {/* Character count when typing */}
        {input.length > 0 && (
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: 'var(--text-dim)',
            flexShrink: 0,
            marginRight: 4,
          }}>
            {input.length}
          </span>
        )}

        {/* Submit button */}
        <button
          onClick={handleGenerate}
          disabled={!canSubmit}
          className={`btn-primary ${isGenerating ? 'generating' : ''}`}
          style={{ padding: '7px 18px', fontSize: 13, borderRadius: 9 }}
        >
          {isGenerating ? (
            <>
              <div className="spinner" style={{ width: 13, height: 13, borderWidth: 1.8 }} />
              Generating
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
              Generate
            </>
          )}
        </button>
      </div>

      {/* ── Quick chips row ── */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
        {/* Section label */}
        <span style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 9.5,
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--text-dim)',
          marginRight: 2,
          flexShrink: 0,
        }}>
          Try
        </span>

        {EXAMPLE_PROMPTS.map((prompt) => (
          <button
            key={prompt.label}
            onClick={() => handleChipClick(prompt.text)}
            disabled={isDisabled}
            className="chip"
          >
            {prompt.label}
          </button>
        ))}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Clear canvas */}
        <button
          onClick={clearCanvas}
          disabled={isGenerating}
          className="chip chip-danger"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
          </svg>
          Clear canvas
        </button>
      </div>
    </div>
  );
};

export default PromptBar;