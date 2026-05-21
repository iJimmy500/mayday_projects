import React, { useState, useRef } from 'react';
import { fetchScrobbles, aggregate, enrichArtistImages } from '../utils/throwbackApi';
import { shareCard, saveCard } from '../utils/throwbackCard';
import { TODAY_LABEL, MIN_LOADING_MS, CURRENT_YEAR } from '../components/throwback/constants';
import LoadingScreen    from '../components/throwback/LoadingScreen';
import SearchScreen     from '../components/throwback/SearchScreen';
import BrowseScreen     from '../components/throwback/BrowseScreen';
import QuizScreen       from '../components/throwback/QuizScreen';
import QuizResultScreen from '../components/throwback/QuizResultScreen';
import './Throwback.css';

export default function Throwback() {
  const [username,   setUsername]   = useState('');
  const [year,       setYear]       = useState(CURRENT_YEAR - 1);
  const [mode,       setMode]       = useState('browse');
  const [phase,      setPhase]      = useState('idle');
  const [result,     setResult]     = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [errorMsg,   setErrorMsg]   = useState('');
  const [cardBusy,   setCardBusy]   = useState('');
  const inputRef = useRef(null);

  async function handleSearch(e) {
    e.preventDefault();
    const user = username.trim();
    if (!user) return;
    setPhase('loading');
    setErrorMsg('');
    try {
      const [scrobbles] = await Promise.all([
        fetchScrobbles(user, year),
        new Promise(r => setTimeout(r, MIN_LOADING_MS)),
      ]);
      if (!scrobbles.length) {
        setErrorMsg(`Nothing scrobbled on ${TODAY_LABEL}, ${year} for @${user}.`);
        setPhase('error');
        return;
      }
      const data = aggregate(scrobbles);
      const resultObj = { data, user, year, total: scrobbles.length };
      setResult(resultObj);
      setPhase(mode === 'quiz' && data.tracks.length >= 2 ? 'quiz' : 'results');
      enrichArtistImages(data.artists, (idx, img) => {
        setResult(prev => {
          if (!prev) return prev;
          const artists = prev.data.artists.map((a, i) => i === idx ? { ...a, art: img } : a);
          return { ...prev, data: { ...prev.data, artists } };
        });
      });
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong. Check the username and try again.');
      setPhase('error');
    }
  }

  function reset() {
    setPhase('idle');
    setResult(null);
    setQuizResult(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  async function handleShare() {
    if (cardBusy || !result) return;
    setCardBusy('share');
    try { await shareCard(result); } catch { /* cancelled */ }
    setCardBusy('');
  }

  async function handleSave() {
    if (cardBusy || !result) return;
    setCardBusy('save');
    try { saveCard(result); } catch { /* ignore */ }
    setTimeout(() => setCardBusy(''), 800);
  }

  return (
    <div className="tb-container">
      <div className="tb-content">

        {phase === 'loading' && (
          <LoadingScreen user={username.trim()} year={year} />
        )}

        {phase === 'idle' && (
          <SearchScreen
            username={username} setUsername={setUsername}
            year={year}         setYear={setYear}
            mode={mode}         setMode={setMode}
            onSubmit={handleSearch}
            inputRef={inputRef}
          />
        )}

        {phase === 'error' && (
          <div className="tb-fade-in tb-error-page">
            <p className="tb-error-msg">{errorMsg}</p>
            <button className="tb-submit" onClick={reset}>try again</button>
          </div>
        )}

        {phase === 'results' && result && (
          <BrowseScreen
            result={result}
            onBack={reset}
            onShare={handleShare}
            onSave={handleSave}
            cardBusy={cardBusy}
          />
        )}

        {phase === 'quiz' && result && (
          <QuizScreen
            data={result.data}
            onSubmit={r => { setQuizResult(r); setPhase('quiz-result'); }}
            onBack={() => setPhase('results')}
          />
        )}

        {phase === 'quiz-result' && quizResult && (
          <QuizResultScreen
            {...quizResult}
            onRetry={() => setPhase('quiz')}
            onBrowse={() => setPhase('results')}
          />
        )}

      </div>
    </div>
  );
}
