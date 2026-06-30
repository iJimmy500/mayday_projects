import React, { useEffect, useRef } from 'react';

export default function LyricView({
  lyrics,
  parsedLyrics = [],
  finishChallenge = null,
  hintLines = [],
  currentTime = 0,
  attempts, 
  startIndex, 
  gameState, 
  loading,
  settings,
  statusMessage,
  isPlaying = false
}) {
  const containerRef = useRef(null);
  const activeLineRef = useRef(null);

  const isRevealed = gameState !== 'playing' && gameState !== 'error';
  const hasSync = parsedLyrics && parsedLyrics.length > 0;
  
  const hintDepth = settings?.hintDepth || 1;
  const isClipMode = settings?.challengeMode === 'clip';
  const isFinishMode = settings?.challengeMode === 'finish';
  const revealedLines = hintLines.slice(startIndex, startIndex + (attempts + 1) * hintDepth);

  
  const activeIndex = hasSync 
    ? parsedLyrics.findIndex((l, i) => {
        const next = parsedLyrics[i + 1];
        return currentTime >= l.time && (!next || currentTime < next.time);
      })
    : -1;

  
  useEffect(() => {
    if (hasSync && activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    } else if (containerRef.current && !hasSync) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [activeIndex, revealedLines.length, hasSync]);
  
  if (loading) {
    return (
      <div className="am-main-content am-loading-lyrics">
        {statusMessage && (
          <div className="am-flash-notification">
            <div className="am-status-text">{statusMessage}</div>
          </div>
        )}
        <div className="am-shimmer-skeleton-simple" />
      </div>
    );
  }

  return (
    <main className="am-main-content">
      <div className="am-lyrics-container" ref={containerRef}>
        {isFinishMode && finishChallenge ? (

          <div className="am-finish-block">
            <div className="am-finish-prompt-line">{finishChallenge.prompt}</div>
            <div className={`am-finish-answer-line ${isRevealed ? 'revealed' : ''}`}>
              {isRevealed ? finishChallenge.answer : '. . .'}
            </div>
            {!isRevealed && (
              <div className="am-finish-hint">What's the next line?</div>
            )}
          </div>
        ) : !isRevealed && isClipMode ? (

          <div className="am-clip-prompt">
            <div className={`am-clip-equalizer ${isPlaying ? '' : 'paused'}`}>
              <span /><span /><span /><span /><span />
            </div>
            <div className="am-clip-title">{isPlaying ? 'Playing' : 'Paused'}</div>
            <div className="am-clip-sub">
              {isPlaying
                ? 'Name the song from the clip.'
                : 'To start playback, tap the play button below.'}
            </div>
          </div>
        ) : !isRevealed ? (

          <div className="am-progressive-hints">
            {revealedLines.map((line, i) => {
              const isLastGroup = i >= attempts * hintDepth;
              const delay = isLastGroup ? (i % hintDepth) * 0.15 : 0;
              
              return (
                <div 
                  key={`${startIndex}-${i}`} 
                  className={`am-lyric-line ${isLastGroup ? 'active am-line-new' : 'am-line-old'}`}
                  style={{ animationDelay: `${delay}s` }}
                >
                  {line}
                </div>
              );
            })}
          </div>
        ) : (
          
          <div className="am-revealed-lyrics">
            {hasSync ? (
              parsedLyrics.map((line, i) => {
                const isActive = i === activeIndex;
                const isPast = i < activeIndex;
                
                return (
                  <div
                    key={i}
                    ref={isActive ? activeLineRef : null}
                    className={`am-lyric-line revealed synced ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}`}
                  >
                    {line.text}
                  </div>
                );
              })
            ) : (
              lyrics.split('\n').map((line, i) => {
                if (!line.trim()) return null;
                const isInSnippet = revealedLines.includes(line.trim());
                return (
                  <div
                    key={i}
                    className={`am-lyric-line revealed ${isInSnippet ? 'active' : ''}`}
                  >
                    {line}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </main>
  );
}
