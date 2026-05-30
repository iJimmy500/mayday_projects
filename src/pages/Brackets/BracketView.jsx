import React, { useState, useMemo } from 'react';
import { Competitor, Thumb } from './Competitor';
import { roundName, countProgress } from './bracket';

export default function BracketView({ title, rounds, champion, onPick, onReset, onEdit }) {
  const [copied, setCopied] = useState(false);
  const { done, total } = useMemo(() => countProgress(rounds), [rounds]);

  const copyResult = () => {
    const lines = [title];
    if (champion) lines.push(`Winner — ${champion.name}`);
    navigator.clipboard?.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="bk-play">
      <header className="bk-topbar">
        <button className="bk-mini" onClick={onEdit}>Edit</button>
        <div className="bk-topcenter">
          <div className="bk-play-title">{title}</div>
          <div className="bk-progress">
            <div className="bk-progress-bar" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
          </div>
        </div>
        <button className="bk-mini" onClick={onReset}>New</button>
      </header>

      {champion && (
        <div className="bk-winner">
          <span className="bk-winner-thumb"><Thumb entry={champion} size="lg" /></span>
          <div className="bk-winner-text">
            <span className="bk-winner-label">Champion</span>
            <span className="bk-winner-name">{champion.name}</span>
          </div>
          <button className="bk-mini" onClick={copyResult}>{copied ? 'Copied' : 'Share'}</button>
        </div>
      )}

      <div className="bk-scroll">
        <div className="bk-grid" style={{ gridTemplateColumns: `repeat(${rounds.length + 1}, minmax(196px, 1fr))` }}>
          {rounds.map((round, rIdx) => (
            <div className="bk-round" key={rIdx}>
              <div className="bk-round-head">{roundName(rIdx, rounds.length)}</div>
              <div className="bk-round-body">
                {round.map((match, mIdx) => {
                  const playable = match.a && match.b;
                  const aWin = match.winnerId && match.a && match.winnerId === match.a.id;
                  const bWin = match.winnerId && match.b && match.winnerId === match.b.id;
                  return (
                    <div className={`bk-match ${match.winnerId ? 'is-done' : playable ? 'is-live' : 'is-empty'}`} key={mIdx}>
                      <Competitor
                        entry={match.a}
                        isWinner={aWin}
                        isLoser={!!match.winnerId && !aWin && !!match.a}
                        clickable={playable}
                        onClick={() => onPick(rIdx, mIdx, match.a)}
                      />
                      <Competitor
                        entry={match.b}
                        isWinner={bWin}
                        isLoser={!!match.winnerId && !bWin && !!match.b}
                        clickable={playable}
                        onClick={() => onPick(rIdx, mIdx, match.b)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="bk-round">
            <div className="bk-round-head">Winner</div>
            <div className="bk-round-body">
              <div className={`bk-champ ${champion ? 'is-set' : ''}`}>
                {champion ? (
                  <>
                    <span className="bk-champ-thumb"><Thumb entry={champion} size="lg" /></span>
                    <span className="bk-champ-name">{champion.name}</span>
                  </>
                ) : <span className="bk-champ-wait">—</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="bk-foot">Tap an entry to advance it. Scroll for later rounds.</p>
    </div>
  );
}
