import React, { useState } from 'react';
import { CODE_SAMPLES } from '../codeSamples';

export default function DocsView() {
  const [lang, setLang] = useState('javascript');

  return (
    <div className="docs-view">
      <div className="docs-view-content">
        <section>
          <h3>Algorithms 101</h3>
          <p>A set of instructions to solve a problem. The visualizer shows how different "recipes" handle the same data.</p>
        </section>

        <section>
          <h3>Big O Notation</h3>
          <div className="docs-mini-grid">
            <div className="mini-card"><b>O(1)</b> <span>Constant</span></div>
            <div className="mini-card"><b>O(n)</b> <span>Linear</span></div>
            <div className="mini-card"><b>O(n log n)</b> <span>Efficient</span></div>
            <div className="mini-card"><b>O(n²)</b> <span>Slow</span></div>
          </div>
        </section>

        <section>
          <h3>Algorithm Structure</h3>
          <p>Implementation of Bubble Sort in various languages:</p>
          
          <div className="docs-lang-picker">
            {Object.keys(CODE_SAMPLES).map(l => (
              <button 
                key={l} 
                className={`lang-btn ${lang === l ? 'active' : ''}`}
                onClick={() => setLang(l)}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="docs-code-block">
            <pre>
              <code>{CODE_SAMPLES[lang]}</code>
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}
