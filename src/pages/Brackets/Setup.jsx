import React, { useRef, useState } from 'react';
import { PRESETS, SIZES } from './presets';
import { uid, isImageUrl, fitSize } from './bracket';

export default function Setup({
  title, setTitle, entries, setEntries, size, setSize,
  activePreset, setActivePreset, onStart, hasInProgress, onResume,
}) {
  const fileRef = useRef(null);
  const nameInputRef = useRef(null);
  const [pendingImgFor, setPendingImgFor] = useState(null);

  const loadPreset = (p) => {
    setActivePreset(p.id);
    setTitle(`Best ${p.label}`);
    setEntries(p.items.map(name => ({ id: uid(), name, image: '' })));
    setSize(Math.min(16, fitSize(p.items.length)));
  };

  const useCustom = () => {
    setActivePreset(null);
    setTitle('My Bracket');
    setEntries([]);
  };

  const addEntry = () => {
    setEntries(prev => [...prev, { id: uid(), name: '', image: '' }]);
    setTimeout(() => nameInputRef.current?.focus(), 30);
  };

  const updateEntry = (id, patch) =>
    setEntries(prev => prev.map(e => (e.id === id ? { ...e, ...patch } : e)));
  const removeEntry = (id) => setEntries(prev => prev.filter(e => e.id !== id));

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file || !pendingImgFor) return;
    const reader = new FileReader();
    reader.onload = () => updateEntry(pendingImgFor, { image: reader.result });
    reader.readAsDataURL(file);
    e.target.value = '';
    setPendingImgFor(null);
  };

  const triggerUpload = (id) => {
    setPendingImgFor(id);
    setTimeout(() => fileRef.current?.click(), 0);
  };

  const validCount = entries.filter(e => e.name.trim()).length;
  const canStart = validCount >= 2;
  const maxSize = fitSize(validCount);

  return (
    <div className="bk-setup">
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />

      <header className="bk-head">
        <div className="bk-logo">brackets</div>
        <p className="bk-tag">Make a bracket out of anything.</p>
      </header>

      {hasInProgress && (
        <button className="bk-resume" onClick={onResume}>Resume bracket in progress</button>
      )}

      <div className="bk-field">
        <label className="bk-label">Presets</label>
        <div className="bk-presets">
          {PRESETS.map(p => (
            <button
              key={p.id}
              className={`bk-chip ${activePreset === p.id ? 'is-on' : ''}`}
              onClick={() => loadPreset(p)}
            >
              {p.label}
            </button>
          ))}
          <button
            className={`bk-chip ${activePreset === null && entries.length === 0 ? 'is-on' : ''}`}
            onClick={useCustom}
          >
            Custom
          </button>
        </div>
      </div>

      <div className="bk-field">
        <label className="bk-label">Title</label>
        <input
          className="bk-input bk-input--title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Bracket title"
          maxLength={48}
        />
      </div>

      <div className="bk-field">
        <label className="bk-label">Entries <span className="bk-count">{validCount}</span></label>
        <div className="bk-entries">
          {entries.map((e, i) => (
            <div className="bk-entry" key={e.id}>
              <button className="bk-entry-img" onClick={() => triggerUpload(e.id)} title="Add image or GIF">
                {e.image ? (
                  isImageUrl(e.image)
                    ? <img src={e.image} alt="" />
                    : <span className="bk-emoji">{e.image}</span>
                ) : <span className="bk-img-plus">+</span>}
              </button>
              <input
                ref={i === entries.length - 1 ? nameInputRef : null}
                className="bk-input bk-entry-name"
                value={e.name}
                placeholder={`Entry ${i + 1}`}
                onChange={ev => updateEntry(e.id, { name: ev.target.value })}
                onKeyDown={ev => { if (ev.key === 'Enter') addEntry(); }}
              />
              <input
                className="bk-input bk-entry-url"
                value={isImageUrl(e.image) ? e.image : ''}
                placeholder="Image / GIF url"
                onChange={ev => updateEntry(e.id, { image: ev.target.value })}
              />
              <button className="bk-entry-del" onClick={() => removeEntry(e.id)} title="Remove">×</button>
            </div>
          ))}
        </div>
        <button className="bk-add" onClick={addEntry}>+ Add entry</button>
      </div>

      <div className="bk-field">
        <label className="bk-label">Size</label>
        <div className="bk-segment">
          {SIZES.map(s => (
            <button
              key={s}
              className={`bk-seg ${size === s ? 'is-on' : ''}`}
              disabled={s > maxSize && validCount > 0}
              onClick={() => setSize(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <p className="bk-hint">Empty slots become byes. At least 2 entries needed.</p>
      </div>

      <div className="bk-actions">
        <button className="bk-btn bk-btn--ghost" disabled={!canStart} onClick={() => onStart(false)}>
          Keep order
        </button>
        <button className="bk-btn" disabled={!canStart} onClick={() => onStart(true)}>
          Shuffle &amp; start
        </button>
      </div>
    </div>
  );
}
