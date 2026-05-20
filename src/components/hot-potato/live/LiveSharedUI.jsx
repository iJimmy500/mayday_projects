import React, { useState, useEffect } from 'react';
import { Flower, ArrowLeft, LogOut, Copy, Check, X } from 'lucide-react';
import { QRCode } from 'react-qr-code';

export function BackBtn({ to = '/hotpotato' }) {
  return (
    <button className="hpl-back-btn" onClick={() => window.location.href = to}>
      <ArrowLeft size={16} />
    </button>
  );
}

export function QuitBtn({ onQuit }) {
  return (
    <button className="hpl-quit-btn" onClick={onQuit}>
      <LogOut size={14} /> Quit
    </button>
  );
}

export function Footer() {
  return (
    <footer className="page-footer">
      <a href="https://mayinflight.com" className="footer-link" target="_blank" rel="noopener noreferrer">
        mayday <Flower size={14} strokeWidth={1.5} />
      </a>
    </footer>
  );
}

export function TimeoutBanner({ countdown }) {
  if (countdown === null) return null;
  return (
    <div className="hpl-timeout-banner">
      <span className="hpl-timeout-icon">⏳</span>
      <span>No activity — game ends in <strong>{countdown}s</strong></span>
    </div>
  );
}

export function ConnectionDot({ connected }) {
  return (
    <span
      className={`hpl-conn-dot ${connected ? 'hpl-conn-dot--on' : 'hpl-conn-dot--off'}`}
      title={connected ? 'Connected' : 'Connecting…'}
    />
  );
}

export function ShareModal({ roomUrl, roomCode, copied, onCopy, onClose }) {
  return (
    <div className="hpl-modal-overlay" onClick={onClose}>
      <div className="hpl-modal" onClick={e => e.stopPropagation()}>
        <button className="hpl-modal-close" onClick={onClose}>
          <X size={18} />
        </button>
        <p className="hpl-modal-label">Scan to join</p>
        <div className="hpl-modal-qr">
          <QRCode value={roomUrl} size={180} bgColor="#0e0e0e" fgColor="#ffffff" />
        </div>
        <div className="hpl-modal-code">{roomCode}</div>
        <p className="hpl-modal-url">{roomUrl}</p>
        <button className="hpl-copy-btn" onClick={onCopy}>
          {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy link</>}
        </button>
      </div>
    </div>
  );
}

export function PassCountdown({ ms }) {
  const [remaining, setRemaining] = useState(Math.ceil(ms / 1000));
  useEffect(() => {
    const iv = setInterval(() => setRemaining(r => Math.max(0, r - 1)), 1000);
    return () => clearInterval(iv);
  }, []);
  return <span>{remaining}</span>;
}
