import { RefreshCw, ChevronDown, Check, HelpCircle } from 'lucide-react';
import { LENGTH_COUNTS } from './constants';

export default function TopBar({
  length, activeMenu, setActiveMenu,
  commonOnly, commonLoading,
  onSelectLength, onToggleCommon, onNewWord, onHelp,
}) {
  return (
    <div className="gh-top-bar" onClick={e => e.stopPropagation()}>
      <div className="gh-controls">

        {/* Length dropdown */}
        <div className="gh-dropdown-wrap">
          <button
            className={`gh-nav-btn${activeMenu === 'length' ? ' active' : ''}`}
            onClick={() => setActiveMenu(activeMenu === 'length' ? null : 'length')}
          >
            <span className="gh-nav-label">length</span>
            <span className="gh-nav-value">{length}</span>
            <ChevronDown size={10} className={activeMenu === 'length' ? 'rotated' : ''} />
          </button>
          {activeMenu === 'length' && (
            <div className="gh-dropdown-menu">
              {Object.entries(LENGTH_COUNTS).map(([len, count]) => (
                <div
                  key={len}
                  className={`gh-dropdown-item${length === Number(len) ? ' selected' : ''}`}
                  onClick={() => onSelectLength(Number(len))}
                >
                  <span>{len} letters</span>
                  <span className="gh-count">~{(count / 1000).toFixed(0)}k</span>
                  {length === Number(len) && <Check size={10} />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Common toggle */}
        <button
          className={`gh-nav-btn${commonOnly ? ' active' : ''}`}
          onClick={onToggleCommon}
          title="Common words only"
        >
          {commonLoading
            ? <span className="gh-mini-dots"><span /><span /><span /></span>
            : <><span className="gh-nav-label">common</span><span className="gh-nav-value">{commonOnly ? 'on' : 'off'}</span></>
          }
        </button>

      </div>

      <button className="gh-tool-btn" onClick={onNewWord} title="New word (Enter)">
        <RefreshCw size={14} />
      </button>
      <button className="gh-tool-btn" onClick={onHelp} title="How to play">
        <HelpCircle size={14} />
      </button>
    </div>
  );
}
