import React, { useState, useEffect, useRef } from 'react';
import { Pencil, Flower, Eye, EyeOff, Plus, Share, Check, Download, Image as ImageIcon, Monitor, Smartphone } from 'lucide-react';
import LZString from 'lz-string';
import { toPng } from 'html-to-image';
import './CanvasBreach.css';

const DEFAULTS = {
  title: 'mayday',
  subtitle: "writing slop code since '23",
  p1: `ShinyHunters hacked Canvas recently and instead of paying them, the chuds did nothing. So, I made this fun little ransom note generator for everyone who is frustrated and worried about their finals (and data, I guess) to play around with to ease the pain.`,
  warning: 'ARE WE COOKED?',
  p2: `They say laughter is the best medicine, so I'm trying to laugh as much as possible at the fact that my finals have been rescheduled and pushed back because of the chuds at Canvas. ✌🏾`,
  p3: `Enjoy! :)`,
  dlTitle: '\u25bc DOWNLOAD LOCKEDIN_STUDENTS.TXT \u25bc',
  dlLink: 'lockedin_students.txt',
  footer: 'visit us: https://mayinflight.com',
};

const DEFAULT_THEME = {
  accent: '#cc2222',
  bg: '#0d0d0d',
  cardBg: '#161820',
};

const DEFAULT_VISIBILITY = {
  subtitle: true,
  p1: true,
  warning: true,
  p2: true,
  p3: true,
  dlTitle: true,
  dlLink: true,
  footer: true
};

const BREACH_PHRASE = "ShinyHunters hacked Canvas recently";
const BREACH_LINK = "https://www.theverge.com/tech/926458/canvas-shinyhunters-breach";

export default function CanvasBreach() {
  const [data, setData] = useState(DEFAULTS);
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [visibility, setVisibility] = useState(DEFAULT_VISIBILITY);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(DEFAULTS);
  const [draftTheme, setDraftTheme] = useState(DEFAULT_THEME);
  const [draftVisibility, setDraftVisibility] = useState(DEFAULT_VISIBILITY);
  const [showLockInModal, setShowLockInModal] = useState(false);
  const [lockedInLines, setLockedInLines] = useState(['James006', 'everyone else (probably)']);
  const [shareText, setShareText] = useState('Share Link');
  const [showControls, setShowControls] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareType, setShareType] = useState('both'); // 'link', 'image', 'both'
  const [forcedView, setForcedView] = useState('mobile');
  const [isCapturing, setIsCapturing] = useState(false);
  const inputRefs = useRef([]);
  const cardRef = useRef(null);

  // Load from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get('v');
    if (v) {
      setIsShared(true);
      try {
        let decodedStr = LZString.decompressFromEncodedURIComponent(v);
        if (!decodedStr) {
          // Fallback to older Base64 format
          decodedStr = decodeURIComponent(escape(atob(v)));
        }
        
        if (decodedStr && decodedStr.includes('~')) {
          const parts = decodedStr.split('~');
          // Update data
          setData({
            title: parts[0] || DEFAULTS.title,
            subtitle: parts[1] || DEFAULTS.subtitle,
            p1: parts[2] || DEFAULTS.p1,
            warning: parts[3] || DEFAULTS.warning,
            p2: parts[4] || DEFAULTS.p2,
            p3: parts[5] || DEFAULTS.p3,
            dlTitle: parts[6] || DEFAULTS.dlTitle,
            dlLink: parts[7] || DEFAULTS.dlLink,
            footer: parts[8] || DEFAULTS.footer,
          });
          // Update theme
          if (parts[9] || parts[10] || parts[11]) {
            setTheme({
              accent: parts[9] || DEFAULT_THEME.accent,
              bg: parts[10] || DEFAULT_THEME.bg,
              cardBg: parts[11] || DEFAULT_THEME.cardBg,
            });
          }
          // Update visibility mask
          if (parts[12]) {
            const mask = parseInt(parts[12], 16);
            const keys = Object.keys(DEFAULT_VISIBILITY);
            const vis = {};
            keys.forEach((key, i) => {
              vis[key] = (mask & (1 << i)) !== 0;
            });
            setVisibility(vis);
          }
          // Update file lines
          if (parts[13]) {
            setLockedInLines(parts[13].split('|'));
          }
        } else {
          // Legacy JSON format
          const decoded = JSON.parse(decodedStr);
          if (decoded.data || decoded.d) setData({ ...DEFAULTS, ...(decoded.data || decoded.d) });
          if (decoded.theme || decoded.t) setTheme({ ...DEFAULT_THEME, ...(decoded.theme || decoded.t) });
          if (decoded.visibility || decoded.v) setVisibility({ ...DEFAULT_VISIBILITY, ...(decoded.visibility || decoded.v) });
        }
      } catch (e) {
        console.error("Failed to decode share link", e);
      }
    }
  }, []);

  const generateShareUrl = () => {
    const visKeys = Object.keys(DEFAULT_VISIBILITY);
    let mask = 0;
    visKeys.forEach((key, i) => {
      if (visibility[key]) mask |= (1 << i);
    });

    const parts = [
      data.title === DEFAULTS.title ? '' : data.title,
      data.subtitle === DEFAULTS.subtitle ? '' : data.subtitle,
      data.p1 === DEFAULTS.p1 ? '' : data.p1,
      data.warning === DEFAULTS.warning ? '' : data.warning,
      data.p2 === DEFAULTS.p2 ? '' : data.p2,
      data.p3 === DEFAULTS.p3 ? '' : data.p3,
      data.dlTitle === DEFAULTS.dlTitle ? '' : data.dlTitle,
      data.dlLink === DEFAULTS.dlLink ? '' : data.dlLink,
      data.footer === DEFAULTS.footer ? '' : data.footer,
      theme.accent === DEFAULT_THEME.accent ? '' : theme.accent,
      theme.bg === DEFAULT_THEME.bg ? '' : theme.bg,
      theme.cardBg === DEFAULT_THEME.cardBg ? '' : theme.cardBg,
      mask === 255 ? '' : mask.toString(16),
      lockedInLines.join('|')
    ];

    while (parts.length > 0 && parts[parts.length - 1] === '') {
      parts.pop();
    }

    const encodedStr = parts.join('~');
    const encoded = LZString.compressToEncodedURIComponent(encodedStr);
    return `${window.location.origin}${window.location.pathname}?v=${encoded}`;
  };

  const handleShare = (e) => {
    if (e) e.stopPropagation();
    setShowShareModal(!showShareModal);
  };

  const handleFinalShare = async () => {
    if (shareType === 'link' || shareType === 'both') {
      try {
        const url = generateShareUrl();
        await navigator.clipboard.writeText(url);
      } catch (err) {
        console.error("Failed to copy link", err);
      }
    }

    if (shareType === 'image' || shareType === 'both') {
      setIsCapturing(true);
      // Give React a moment to apply the .force-view classes
      setTimeout(async () => {
        try {
          const dataUrl = await toPng(cardRef.current, {
            backgroundColor: theme.bg,
            cacheBust: true,
            pixelRatio: 2, // Higher quality
          });
          const link = document.createElement('a');
          link.download = `ransom-${data.title.toLowerCase().replace(/\s+/g, '-')}.png`;
          link.href = dataUrl;
          link.click();
        } catch (err) {
          console.error('Failed to capture screenshot', err);
        } finally {
          setIsCapturing(false);
          setShowShareModal(false);
          setShareText(shareType === 'both' ? 'Ransom shared!' : 'Image downloaded!');
          setTimeout(() => setShareText('Share Link'), 2500);
        }
      }, 150);
    } else {
      setShowShareModal(false);
      setShareText('Link copied!');
      setTimeout(() => setShareText('Share Link'), 2500);
    }
  };

  const handleHideControls = (e) => {
    if (e) e.stopPropagation();
    setShowControls(false);
    setShowHint(true);
    setTimeout(() => setShowHint(false), 2000);
  };

  const handleScreenClick = () => {
    if (!showControls) setShowControls(true);
  };

  const openModal = () => {
    setDraft(data);
    setDraftTheme(theme);
    setDraftVisibility(visibility);
    setOpen(true);
  };

  const applyChanges = () => {
    setData(draft);
    setTheme(draftTheme);
    setVisibility(draftVisibility);
    setOpen(false);
  };

  const resetDraft = () => {
    setDraft(DEFAULTS);
    setDraftTheme(DEFAULT_THEME);
    setDraftVisibility(DEFAULT_VISIBILITY);
  };

  const handleThemeChange = (e) => {
    const { name, value } = e.target;
    setDraftTheme(prev => ({ ...prev, [name]: value }));
  };

  const toggleVisibility = (key) => {
    setDraftVisibility(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDraft(prev => ({ ...prev, [name]: value }));
  };

  const renderTextWithLinks = (text) => {
    const regex = new RegExp(`(${BREACH_PHRASE})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <a key={i} href={BREACH_LINK} target="_blank" rel="noopener noreferrer" style={{ color: theme.accent, textDecoration: 'underline' }}>
          {part}
        </a>
      ) : part
    );
  };

  return (
    <div className={`cb-page ${isCapturing ? (forcedView === 'mobile' ? 'force-mobile-view' : 'force-desktop-view') : ''}`} onClick={handleScreenClick} style={{
      backgroundColor: theme.bg,
      cursor: !showControls ? 'pointer' : 'default',
      backgroundImage: `
          radial-gradient(ellipse at 0% 0%, ${theme.accent}2E 0%, transparent 55%),
          radial-gradient(ellipse at 100% 0%, ${theme.accent}2E 0%, transparent 55%),
          radial-gradient(ellipse at 0% 100%, ${theme.accent}1F 0%, transparent 45%),
          radial-gradient(ellipse at 100% 100%, ${theme.accent}1F 0%, transparent 45%)
        `
    }}>
      {/* ── RANSOM CARD ── */}
      <div className="cb-card-wrap" ref={cardRef}>
        <div className="cb-card" style={{
        background: theme.cardBg,
        borderColor: theme.accent,
        boxShadow: `
            0 0 18px ${theme.accent}59,
            0 0 60px ${theme.accent}14,
            inset 0 0 30px rgba(0, 0, 0, 0.4)
          `
      }}>
        <div className="cb-card-title">
          <a href="https://mayinflight.com" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            {data.title} <Flower size={18} strokeWidth={1.5} />
          </a>
        </div>
        {visibility.subtitle && <div className="cb-card-subtitle">{data.subtitle}</div>}

        {visibility.p1 && <div className="cb-card-p" style={{ whiteSpace: 'pre-line' }}>{renderTextWithLinks(data.p1)}</div>}

        {visibility.warning && (
          <div className="cb-card-warning">
            {data.warning}
          </div>
        )}

        {visibility.p2 && <div className="cb-card-p" style={{ whiteSpace: 'pre-line' }}>{data.p2}</div>}

        {visibility.p3 && <div className="cb-card-p" style={{ whiteSpace: 'pre-line' }}>{data.p3}</div>}

        {(visibility.dlTitle || visibility.dlLink) && (
          <div className="cb-card-download">
            {visibility.dlTitle && <div>{data.dlTitle}</div>}
            {visibility.dlLink && (
              <div
                className="cb-card-download-link"
                style={{ whiteSpace: 'pre-line', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => setShowLockInModal(true)}
              >
                {data.dlLink}
              </div>
            )}
          </div>
        )}

        {visibility.footer && (
          <div className="cb-card-footer">
            <a href="https://james006.com/links" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
              {data.footer}
            </a>
          </div>
        )}
      </div>
    </div>

    {showLockInModal && (
      <div className="cb-modal-overlay" onClick={() => setShowLockInModal(false)} style={{ zIndex: 300, background: 'rgba(0, 0, 0, 0.88)' }}>
        <div onClick={e => e.stopPropagation()} style={{
          width: '100%',
          maxWidth: '560px',
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '13px',
          borderRadius: '6px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
          border: '1px solid #2a2a2a'
        }}>
          {/* nano title bar */}
          <div style={{ background: '#1e1e2e', padding: '6px 12px', color: '#cdd6f4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #313244' }}>
            <span style={{ color: '#a6e3a1' }}>{data.dlLink}</span>
            <span style={{ color: '#6c7086', fontSize: '11px' }}>Modified</span>
          </div>

          {/* editor body with line numbers */}
          <div 
            onClick={(e) => e.target === e.currentTarget && inputRefs.current[lockedInLines.length - 1]?.focus()}
            style={{ background: '#11111b', padding: '10px 0', maxHeight: '320px', overflowY: 'auto' }}
          >
            {lockedInLines.map((line, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: '36px', textAlign: 'right', paddingRight: '12px', color: '#45475a', userSelect: 'none', fontSize: '12px', flexShrink: 0 }}>{i + 1}</span>
                <input
                  ref={el => inputRefs.current[i] = el}
                  value={line}
                  readOnly={isShared}
                  onChange={e => {
                    if (isShared) return;
                    const updated = [...lockedInLines];
                    updated[i] = e.target.value;
                    setLockedInLines(updated);
                  }}
                  onKeyDown={e => {
                    if (isShared) return;
                    const cursor = e.target.selectionStart;

                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const before = line.slice(0, cursor);
                      const after = line.slice(cursor);
                      const updated = [...lockedInLines];
                      updated[i] = before;
                      updated.splice(i + 1, 0, after);
                      setLockedInLines(updated);
                      setTimeout(() => {
                        inputRefs.current[i + 1]?.focus();
                        inputRefs.current[i + 1]?.setSelectionRange(0, 0);
                      }, 0);
                    } else if (e.key === 'Backspace' && cursor === 0 && i > 0) {
                      e.preventDefault();
                      const prevLine = lockedInLines[i - 1];
                      const updated = [...lockedInLines];
                      updated[i - 1] = prevLine + line;
                      updated.splice(i, 1);
                      setLockedInLines(updated);
                      setTimeout(() => {
                        inputRefs.current[i - 1]?.focus();
                        inputRefs.current[i - 1]?.setSelectionRange(prevLine.length, prevLine.length);
                      }, 0);
                    } else if (e.key === 'ArrowUp' && i > 0) {
                      e.preventDefault();
                      inputRefs.current[i - 1]?.focus();
                      const prevLen = lockedInLines[i - 1].length;
                      inputRefs.current[i - 1]?.setSelectionRange(Math.min(cursor, prevLen), Math.min(cursor, prevLen));
                    } else if (e.key === 'ArrowDown' && i < lockedInLines.length - 1) {
                      e.preventDefault();
                      inputRefs.current[i + 1]?.focus();
                      const nextLen = lockedInLines[i + 1].length;
                      inputRefs.current[i + 1]?.setSelectionRange(Math.min(cursor, nextLen), Math.min(cursor, nextLen));
                    }
                  }}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: isShared ? '#9399b2' : '#cdd6f4',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '13px',
                    lineHeight: '1.7',
                    padding: '0 12px 0 0',
                    caretColor: '#89b4fa',
                    cursor: isShared ? 'default' : 'text'
                  }}
                />
              </div>
            ))}
            {/* trailing empty line cursor */}
            <div style={{ display: 'flex', alignItems: 'center', opacity: 0.3 }}>
              <span style={{ width: '36px', textAlign: 'right', paddingRight: '12px', color: '#45475a', fontSize: '12px' }}>{lockedInLines.length + 1}</span>
              <span style={{ color: '#45475a' }}>~</span>
            </div>
          </div>

          {/* nano keybinding bar */}
          <div style={{ background: '#1e1e2e', borderTop: '1px solid #313244', padding: '6px 12px', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            {[['Enter', 'New line'], ['Bkspc', 'Del line'], ['Esc', 'Exit']].map(([key, label]) => (
              <span key={key} style={{ color: '#6c7086', fontSize: '11px' }}>
                <span style={{ background: '#313244', color: '#cdd6f4', padding: '1px 5px', borderRadius: '3px', marginRight: '4px' }}>^{key}</span>
                {label}
              </span>
            ))}
            <span style={{ marginLeft: 'auto' }}>
              <button onClick={() => setShowLockInModal(false)} style={{ background: '#313244', border: 'none', color: '#cdd6f4', fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', padding: '2px 10px', borderRadius: '3px', cursor: 'pointer' }}>Exit</button>
            </span>
          </div>
        </div>
      </div>
    )}

    {open && (
      <div className="cb-modal-overlay" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
        <div className="cb-modal">
          <div className="cb-modal-header">
            <span className="cb-modal-title">Edit Ransom Note</span>
            <button className="cb-modal-close" onClick={() => setOpen(false)}>×</button>
          </div>

          <div className="cb-modal-body">
            <div style={{ padding: '0 0 10px', borderBottom: '1px solid #222', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', color: '#666', letterSpacing: '1px', textTransform: 'uppercase' }}>Content Editor</span>
            </div>

            <div className="cb-field">
              <label>Group Name</label>
              <input name="title" value={draft.title} onChange={handleChange} />
            </div>
            <div className="cb-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Tagline</label>
                <button onClick={() => toggleVisibility('subtitle')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                  {draftVisibility.subtitle ? <Eye size={14} color="#888" /> : <EyeOff size={14} color="#cc2222" />}
                </button>
              </div>
              <input name="subtitle" value={draft.subtitle} onChange={handleChange} style={{ opacity: draftVisibility.subtitle ? 1 : 0.5 }} />
            </div>
            <div style={{ padding: '20px 0 10px', borderBottom: '1px solid #222', marginBottom: '10px', marginTop: '10px' }}>
              <span style={{ fontSize: '11px', color: '#666', letterSpacing: '1px', textTransform: 'uppercase' }}>Theme Editor</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Accent', name: 'accent', value: draftTheme.accent },
                { label: 'Background', name: 'bg', value: draftTheme.bg },
                { label: 'Card BG', name: 'cardBg', value: draftTheme.cardBg },
              ].map((c) => (
                <div key={c.name} className="cb-field">
                  <label>{c.label}</label>
                  <div style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    background: '#111',
                    border: '1px solid #252525',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    gap: '10px',
                    cursor: 'pointer'
                  }} onClick={(e) => e.currentTarget.querySelector('input').click()}>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '4px',
                      backgroundColor: c.value,
                      border: '1px solid rgba(255,255,255,0.1)',
                      flexShrink: 0
                    }} />
                    <span style={{ fontSize: '10px', color: '#888', fontFamily: '"JetBrains Mono", monospace' }}>
                      {c.value.toUpperCase()}
                    </span>
                    <input
                      type="color"
                      name={c.name}
                      value={c.value}
                      onChange={handleThemeChange}
                      style={{
                        position: 'absolute',
                        opacity: 0,
                        width: '100%',
                        height: '100%',
                        left: 0,
                        top: 0,
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px' }}></div>

            <div className="cb-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Opening Statement</label>
                <button onClick={() => toggleVisibility('p1')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                  {draftVisibility.p1 ? <Eye size={14} color="#888" /> : <EyeOff size={14} color="#cc2222" />}
                </button>
              </div>
              <textarea name="p1" value={draft.p1} onChange={handleChange} style={{ minHeight: '90px', opacity: draftVisibility.p1 ? 1 : 0.5 }} />
            </div>
            <div className="cb-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Warning Text</label>
                <button onClick={() => toggleVisibility('warning')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                  {draftVisibility.warning ? <Eye size={14} color="#888" /> : <EyeOff size={14} color="#cc2222" />}
                </button>
              </div>
              <input name="warning" value={draft.warning} onChange={handleChange} style={{ opacity: draftVisibility.warning ? 1 : 0.5 }} />
            </div>
            <div className="cb-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Demands &amp; Threat</label>
                <button onClick={() => toggleVisibility('p2')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                  {draftVisibility.p2 ? <Eye size={14} color="#888" /> : <EyeOff size={14} color="#cc2222" />}
                </button>
              </div>
              <textarea name="p2" value={draft.p2} onChange={handleChange} style={{ minHeight: '120px', opacity: draftVisibility.p2 ? 1 : 0.5 }} />
            </div>
            <div className="cb-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Deadline</label>
                <button onClick={() => toggleVisibility('p3')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                  {draftVisibility.p3 ? <Eye size={14} color="#888" /> : <EyeOff size={14} color="#cc2222" />}
                </button>
              </div>
              <textarea name="p3" value={draft.p3} onChange={handleChange} style={{ minHeight: '60px', opacity: draftVisibility.p3 ? 1 : 0.5 }} />
            </div>
            <div className="cb-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Download Section Title</label>
                <button onClick={() => toggleVisibility('dlTitle')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                  {draftVisibility.dlTitle ? <Eye size={14} color="#888" /> : <EyeOff size={14} color="#cc2222" />}
                </button>
              </div>
              <input name="dlTitle" value={draft.dlTitle} onChange={handleChange} style={{ opacity: draftVisibility.dlTitle ? 1 : 0.5 }} />
            </div>
            <div className="cb-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Download / Proof Link</label>
                <button onClick={() => toggleVisibility('dlLink')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                  {draftVisibility.dlLink ? <Eye size={14} color="#888" /> : <EyeOff size={14} color="#cc2222" />}
                </button>
              </div>
              <textarea name="dlLink" value={draft.dlLink} onChange={handleChange} style={{ minHeight: '60px', opacity: draftVisibility.dlLink ? 1 : 0.5 }} />
            </div>
            <div className="cb-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Contact Info</label>
                <button onClick={() => toggleVisibility('footer')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                  {draftVisibility.footer ? <Eye size={14} color="#888" /> : <EyeOff size={14} color="#cc2222" />}
                </button>
              </div>
              <textarea name="footer" value={draft.footer} onChange={handleChange} style={{ minHeight: '60px', opacity: draftVisibility.footer ? 1 : 0.5 }} />
            </div>
          </div>

          <div className="cb-modal-footer">
            <button className="cb-modal-btn reset" onClick={resetDraft}>Reset</button>
            <button className="cb-modal-btn" onClick={applyChanges}>Apply</button>
          </div>
        </div>
      </div>
    )}


      {/* ── HINT POPUP ── */}
    {showHint && (
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        background: 'rgba(0,0,0,0.8)',
        border: '1px solid #333',
        padding: '10px 20px',
        borderRadius: '20px',
        color: '#888',
        fontSize: '12px',
        zIndex: 1000,
        pointerEvents: 'none',
        animation: 'cb-hint-glow 2s ease forwards'
      }}>
        Tap anywhere to bring back icons
      </div>
    )}

    {/* ── SHARED VIEW CTA ── */}
    {isShared && (
      <a 
        href={window.location.origin + window.location.pathname} 
        className="cb-edit-trigger"
        title="Create your own ransom note"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 100,
          background: theme.accent,
          borderColor: theme.accent,
          color: '#fff'
        }}
      >
        <Flower size={18} strokeWidth={1.5} />
      </a>
    )}

    {/* ── FLOATING CONTROLS ── */}
    {showControls && !isShared && (
      <div className="cb-floating-controls" style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'row-reverse',
        gap: '12px',
        zIndex: 100
      }}>
        <div style={{ position: 'relative' }}>
          <button
            className={`cb-edit-trigger ${showShareModal ? 'active' : ''}`}
            onClick={handleShare}
            title="Share Options"
            style={{
              position: 'static',
              borderColor: showShareModal ? theme.accent : '#333',
              color: showShareModal ? theme.accent : '#555',
              transform: showShareModal ? 'rotate(45deg)' : 'none'
            }}
          >
            <Plus size={18} />
          </button>

          {showShareModal && (
            <div className="cb-share-popover" onClick={e => e.stopPropagation()}>
              <button onClick={() => { setShareType('link'); handleFinalShare(); }} className="cb-popover-item">
                <Share size={14} /> <span>Copy Link</span>
              </button>
              <button onClick={() => { setShareType('image'); handleFinalShare(); }} className="cb-popover-item">
                <ImageIcon size={14} /> <span>Save Image</span>
              </button>
              <button onClick={() => { setShareType('both'); handleFinalShare(); }} className="cb-popover-item">
                <Check size={14} /> <span>Share Both</span>
              </button>
            </div>
          )}
        </div>

        <button className="cb-edit-trigger" onClick={openModal} title="Edit ransom note" style={{ position: 'static' }}>
          <Pencil size={18} />
        </button>

        <button className="cb-edit-trigger" onClick={handleHideControls} title="Hide UI Icons" style={{ position: 'static' }}>
          <EyeOff size={18} />
        </button>
      </div>
    )}
  </div>
);
}
