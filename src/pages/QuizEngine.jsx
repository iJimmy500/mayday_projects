import { useState, useEffect, useRef } from 'react';
import { Flower, ChevronRight, RefreshCw, ChevronLeft } from 'lucide-react';
import QUIZZES_ENC from '../data/quizzes.enc.json';
import { RESULTS } from '../data/quizConfig';
import './Quiz.css';

import { deobfuscate } from '../utils/quizUtils';
import './Quiz.css';

export default function QuizEngine({ id }) {
  const transitionRef = useRef(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [expandDisclaimer, setExpandDisclaimer] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isTimed, setIsTimed] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [nextProgress, setNextProgress] = useState(0);
  const [autoNextTimer, setAutoNextTimer] = useState(null);
  const [nextInterval, setNextInterval] = useState(null);

  useEffect(() => {
    if (!activeQuiz || !activeQuiz.questions[currentIndex] || answers[currentIndex] === undefined || submitted) return;
    
    setIsTransitioning(true);
    const start = Date.now();
    const duration = 800;
    
    const interval = setInterval(() => {
      setNextProgress(Math.min(100, ((Date.now() - start) / duration) * 100));
    }, 16);
    
    const timer = setTimeout(() => {
      jumpTo(currentIndex + 1);
      setIsTransitioning(false);
    }, duration);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
      setNextProgress(0);
      setIsTransitioning(false);
    };
  }, [answers[currentIndex], currentIndex, activeQuiz, submitted]);
  const [trackTotalTime, setTrackTotalTime] = useState(true);
  const [allowAutoNext, setAllowAutoNext] = useState(true);

  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [qTimer, setQTimer] = useState(15);

  const shuffle = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  useEffect(() => {
    const saved = localStorage.getItem('custom_quizzes');
    const custom = (saved ? JSON.parse(saved) : []).map(deobfuscate);
    const internal = QUIZZES_ENC.map(deobfuscate);
    const all = [...internal, ...custom];
    
    const quiz = all.find(q => q.id === id);
    if (quiz) {
      let qs = shuffle(quiz.questions);
      const isScale = ['autism', 'anxiety', 'depression', 'ipip', 'moral', 'jungian', 'political', 'chronotype'].includes(quiz.id);

      if (!isScale) {
        qs = qs.map(q => {
          // Only shuffle if it's multiple choice with a correct answer index
          if (q.options && typeof q.correct === 'number') {
            const correctValue = q.options[q.correct];
            const shuffledOptions = shuffle(q.options);
            const newCorrectIndex = shuffledOptions.indexOf(correctValue);
            return { ...q, options: shuffledOptions, correct: newCorrectIndex };
          }
          // Handle object-based options (like in Culture Profile)
          if (q.options && q.options[0]?.text) {
             return { ...q, options: shuffle(q.options) };
          }
          return q;
        });
      }

      setActiveQuiz({ ...quiz, questions: qs });
      setAnswers({});
      setCurrentIndex(0);
      setSubmitted(false);
      setHasStarted(false);
      setNextProgress(0);
      setInputValue("");
    } else {
      window.location.href = '/quiz';
    }
  }, [id]);

  const handleStart = () => {
    setHasStarted(true);
    setStartTime(Date.now());
  };

  useEffect(() => {
    if (!hasStarted || submitted || !trackTotalTime) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - (startTime || Date.now())) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [hasStarted, startTime, submitted, trackTotalTime]);

  useEffect(() => {
    if (!hasStarted || submitted || !isTimed) return;
    setQTimer(15);
    const interval = setInterval(() => {
      setQTimer(prev => {
        if (prev <= 1) {
          jumpTo(currentIndex + 1);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [hasStarted, currentIndex, submitted, isTimed]);

  if (!activeQuiz) return <div className="qz-wrap">Loading...</div>;


  const handleSelect = (val) => {
    if (isTransitioning) return;
    setAnswers(prev => ({ ...prev, [currentIndex]: val }));
  };

  const jumpTo = (idx) => {
    setNextProgress(0);
    setInputValue("");
    
    if (idx < 0) return;
    if (idx >= activeQuiz.questions.length) {
      setSubmitted(true);
      return;
    }
    setCurrentIndex(idx);
  };

  const isQuestionCorrect = (q, ans) => {
    if (ans === undefined) return false;
    if (q.type === 'input') return String(ans).toLowerCase().trim() === String(q.correct).toLowerCase().trim();
    if (q.type === 'click') return ans === q.correct;
    if (q.scoreOn === 'agree') return ans < 2;
    if (q.scoreOn === 'disagree') return ans >= 2;
    return ans === q.correct;
  };

  const calculateScore = () => {
    // Multi-trait scoring (Personality, Vocational, etc)
    const traitQuizzes = ['ipip', 'riasec', 'panas', 'sd3', 'mft', 'schwartz', 'jungian', 'political'];
    
    if (traitQuizzes.includes(activeQuiz.id)) {
      const scores = {};
      activeQuiz.questions.forEach((q, i) => {
        const ans = answers[i];
        if (ans === undefined) return;
        
        const trait = q.trait;
        if (!trait) return;
        
        let val = ans + 1; // Default 1-5 scale
        if (q.reverse) val = (activeQuiz.options?.length || 5) + 1 - val;
        
        scores[trait] = (scores[trait] || 0) + val;
      });

      if (activeQuiz.id === 'jungian') {
        const s = scores;
        const type = (s.E >= s.I ? 'E' : 'I') + (s.S >= s.N ? 'S' : 'N') + (s.T >= s.F ? 'T' : 'F') + (s.J >= s.P ? 'J' : 'P');
        return { type: 'jungian', label: type, scores };
      }

      if (activeQuiz.id === 'political') {
        let econ = 0, soc = 0;
        activeQuiz.questions.forEach((q, i) => {
          const ans = answers[i];
          if (ans === undefined) return;
          const mult = [1, 0.5, 0, -0.5, -1][ans];
          if (q.type === 'econ') econ += q.weight * mult;
          if (q.type === 'soc') soc += q.weight * mult;
        });
        return { econ, soc, type: 'political' };
      }

      return { type: activeQuiz.id, scores };
    }

    if (activeQuiz.id === 'chronotype') {
      let total = 0;
      activeQuiz.questions.forEach((q, i) => {
        const ans = answers[i];
        if (ans === undefined) return;
        total += q.score[ans];
      });
      return { score: total, type: 'chronotype' };
    }

    // Default numeric scoring
    return activeQuiz.questions.reduce((total, q, i) => {
      return total + (isQuestionCorrect(q, answers[i]) ? 1 : 0);
    }, 0);
  };

  const finalScore = calculateScore();
  const getResultInfo = () => {
    if (finalScore.type === 'political') return { label: "Political Map", sub: "Ideological coordinates." };
    if (finalScore.type === 'ipip') return { label: "Personality Breakdown", sub: "Big Five Traits (Mini-IPIP)." };
    if (finalScore.type === 'jungian') return { label: `Type: ${finalScore.label}`, sub: "Jungian personality archetype prediction." };
    if (finalScore.type === 'chronotype') return { label: finalScore.score > 17 ? "Morning Type" : (finalScore.score < 12 ? "Evening Type" : "Intermediate"), sub: `Circadian rhythm score: ${finalScore.score}` };
    
    const configFn = RESULTS[activeQuiz.id];
    if (typeof configFn === 'function') {
      return configFn(finalScore.scores || finalScore, activeQuiz.questions.length);
    }
    
    return { label: "Assessment Complete", sub: `Final Score: ${typeof finalScore === 'number' ? finalScore : 'N/A'}` };
  };

  const handleShare = () => {
    const result = getResultInfo();
    const text = `I just finished the ${activeQuiz.title} test!\nResult: ${result.label}\n${result.sub}\n\nTake the test here: ${window.location.href}`;
    if (navigator.share) {
      navigator.share({ title: activeQuiz.title, text });
    } else {
      navigator.clipboard.writeText(text);
      alert("Result copied to clipboard!");
    }
  };

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const traitLabels = { ext: "Extraversion", agr: "Agreeableness", con: "Conscientiousness", neu: "Neuroticism", ope: "Openness" };
  const currentQ = activeQuiz.questions[currentIndex];

  return (
    <div className="qz-wrap">
      
      {!hasStarted && (
        <div className="qz-modal-overlay fade-in">
          <div className="qz-modal">
            <span className="qz-modal-tag">Assessment Settings</span>
            <h2 className="qz-modal-title">{activeQuiz.title}</h2>
            <p className="qz-modal-sub">{activeQuiz.tag} · {activeQuiz.questions.length} questions</p>
            
            {activeQuiz.warning && (
              <div className="qz-warning-box">
                <span className="qz-warning-label">NOTICE</span>
                <p>{activeQuiz.warning}</p>
              </div>
            )}
            
            <div className="qz-challenge-list">
              <button className={`qz-challenge-item ${trackTotalTime ? 'active' : ''}`} onClick={() => setTrackTotalTime(!trackTotalTime)}>
                <div className="qz-ch-info">
                  <span className="qz-ch-name">Track Total Time</span>
                  <span className="qz-ch-desc">Record completion time on results page.</span>
                </div>
              </button>
              <button className={`qz-challenge-item ${isTimed ? 'active' : ''}`} onClick={() => setIsTimed(!isTimed)}>
                <div className="qz-ch-info">
                  <span className="qz-ch-name">Question Timer</span>
                  <span className="qz-ch-desc">15s countdown for each item.</span>
                </div>
              </button>
              <button className={`qz-challenge-item ${allowAutoNext ? 'active' : ''}`} onClick={() => setAllowAutoNext(!allowAutoNext)}>
                <div className="qz-ch-info">
                  <span className="qz-ch-name">Auto-Advance</span>
                  <span className="qz-ch-desc">Automatically move to next question after selection.</span>
                </div>
              </button>
            </div>

            <button className="qz-start-btn" onClick={handleStart}>START ASSESSMENT</button>
            <button className="qz-modal-back" onClick={() => window.location.href = '/quiz'}>BACK TO MENU</button>
          </div>
        </div>
      )}

      {hasStarted && !submitted && (
        <div className="qz-layout fade-in">
          <aside className="qz-sidebar">
            <div className="qz-sidebar-top">
              <span className="qz-sidebar-title">{activeQuiz.title}</span>
              <span className="qz-sidebar-count">{Object.keys(answers).length}/{activeQuiz.questions.length}</span>
            </div>
            
            <div className="qz-sidebar-stats">
              {trackTotalTime && <div className="qz-stat">TIME: {formatTime(elapsed)}</div>}
              {isTimed && <div className="qz-stat q-time">REMAINING: {qTimer}s</div>}
            </div>

            <div className="qz-dot-grid">
              {activeQuiz.questions.map((_, idx) => (
                <button key={idx} className={`qz-dot ${idx === currentIndex ? 'active' : ''} ${answers[idx] !== undefined ? 'done' : ''}`} onClick={() => jumpTo(idx)}>{idx + 1}</button>
              ))}
            </div>
            <div className="qz-sidebar-footer">
              {Object.keys(answers).length === activeQuiz.questions.length && <button className="qz-submit-btn" onClick={() => setSubmitted(true)}>SUBMIT</button>}
              <button className="qz-quit-btn" onClick={() => window.location.href = '/quiz'}>QUIT</button>
            </div>
          </aside>

          <div className="qz-content">
            <div className="qz-q-header">
              <span className="qz-q-num">Q{currentIndex + 1}</span>
              <div className="qz-bar">
                <div className="qz-bar-fill" style={{ width: `${((currentIndex + 1) / activeQuiz.questions.length) * 100}%` }} />
                {isTimed && <div className="qz-timer-fill" style={{ width: `${(qTimer / 15) * 100}%` }} />}
              </div>
            </div>
            <p className="qz-question">{currentQ.question}</p>
            
            <div className="qz-task-area">
              {currentQ.type === 'input' && (
                <div className="qz-input-task">
                  <input 
                    type="text"
                    value={inputValue} 
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSelect(inputValue)}
                    placeholder="Type your answer..."
                    autoFocus
                  />
                  <button onClick={() => handleSelect(inputValue)}>SUBMIT ANSWER</button>
                </div>
              )}

              {currentQ.type === 'click' && (
                <div className="qz-click-task">
                  {currentQ.text.split('').map((char, i) => (
                    <span 
                      key={i} 
                      className={`qz-char ${answers[currentIndex] === i ? 'selected' : ''}`}
                      onClick={() => handleSelect(i)}
                    >{char}</span>
                  ))}
                </div>
              )}

              {!currentQ.type && (
                <div className="qz-options" style={{ pointerEvents: isTransitioning ? 'none' : 'auto' }}>
                  {(currentQ.options || currentQ.choices || activeQuiz.options || activeQuiz.choices || []).map((opt, idx) => {
                    const text = typeof opt === 'string' ? opt : (opt?.text || '');
                    const selected = answers[currentIndex];
                    return <button key={idx} className={`qz-option ${selected === idx ? 'selected' : ''} ${selected !== undefined && selected !== idx ? 'dimmed' : ''}`} onClick={() => handleSelect(idx)}><span className="qz-opt-letter">{String.fromCharCode(65 + idx)}</span><span className="qz-opt-text">{text}</span></button>;
                  })}
                </div>
              )}
            </div>

            {answers[currentIndex] !== undefined && currentIndex < activeQuiz.questions.length - 1 && (
              <button className="qz-next" onClick={() => jumpTo(currentIndex + 1)}>
                <div className="qz-next-progress" style={{ width: `${nextProgress}%` }} />
                <span className="qz-next-label">NEXT</span>
                <ChevronRight size={15} />
              </button>
            )}
          </div>
        </div>
      )}

      {submitted && (
        <div className="qz-result fade-in">
          <div className="qz-result-inner">
            <span className="qz-result-tag">{activeQuiz.title} {isTimed && "/ TIMED"}</span>
            <h2 className="qz-result-label">{getResultInfo().label}</h2>
            <p className="qz-result-sub">{getResultInfo().sub}</p>
            {trackTotalTime && <div className="qz-result-time">TOTAL TIME: {formatTime(elapsed)}</div>}
            
            {finalScore.type === 'ipip' && (
              <div className="qz-traits">{Object.entries(finalScore.traits).map(([id, val]) => (
                <div key={id} className="qz-trait-row"><div className="qz-trait-header"><span>{traitLabels[id]}</span><span>{val} / 20</span></div><div className="qz-trait-bar"><div className="qz-trait-fill" style={{ width: `${(val / 20) * 100}%` }} /></div></div>
              ))}</div>
            )}
            {finalScore.type === 'political' && (
              <div className="qz-pol-map-wrap">
                <div className="qz-pol-map"><div className="qz-pol-quad q-tl"><span>Auth Left</span></div><div className="qz-pol-quad q-tr"><span>Auth Right</span></div><div className="qz-pol-quad q-bl"><span>Lib Left</span></div><div className="qz-pol-quad q-br"><span>Lib Right</span></div><div className="qz-pol-dot" style={{ left: `${((finalScore.econ + 12) / 24) * 100}%`, top: `${((12 - finalScore.soc) / 24) * 100}%` }} /><div className="axis-h" /><div className="axis-v" /></div>
                <div className="qz-pol-coords">Econ: {finalScore.econ.toFixed(1)} · Social: {finalScore.soc.toFixed(1)}</div>
              </div>
            )}
            {typeof finalScore === 'number' && <div className="qz-result-score"><span className="qz-score-big">{finalScore}</span><span className="qz-score-denom">/ {activeQuiz.questions.length}</span></div>}
            <div className="qz-breakdown">{activeQuiz.questions.map((q, i) => {
              const isTrait = ['ipip', 'riasec', 'panas', 'sd3', 'mft', 'schwartz', 'jungian', 'political', 'chronotype', 'autism'].includes(activeQuiz.id);
              const isCorrect = isQuestionCorrect(q, answers[i]);
              const opt = (q.options || activeQuiz.options)?.[answers[i]];
              const ansText = typeof opt === 'string' ? opt : (opt?.text ?? (q.type === 'input' ? answers[i] : (q.type === 'click' ? 'Clicked' : '—')));
              return (
                <div key={i} className={`qz-breakdown-row ${isTrait ? 'trait' : (isCorrect ? 'right' : 'wrong')}`}>
                  <span className="qz-breakdown-num">Q{i + 1}</span>
                  {!isTrait && <span className="qz-breakdown-mark">{isCorrect ? '✓' : '✗'}</span>}
                  <span className="qz-breakdown-ans">{ansText}</span>
                </div>
              );
            })}</div>

            <div className={`qz-disclaimer-fold ${expandDisclaimer ? 'expanded' : ''}`} onClick={() => setExpandDisclaimer(!expandDisclaimer)}>
               <span className="qz-disclaimer-trigger">
                 {expandDisclaimer ? '− HIDE DISCLAIMER' : '+ READ MEDICAL DISCLAIMER'}
               </span>
               {expandDisclaimer && (
                 <p className="qz-disclaimer-text">
                   <strong>Medical Disclaimer:</strong> This assessment is not a clinical tool. It is intended for educational purposes and should not be used to diagnose or treat any health condition. Please visit a doctor or qualified mental health professional for any clinical concerns.
                 </p>
               )}
            </div>
            <div className="qz-result-actions">
              <button className="qz-action-btn primary" onClick={handleShare}>SHARE RESULTS</button>
              {['trivia', 'java', 'c_prog', 'python', 'devskiller', 'generations', 'icar', 'bible', 'literacy', 'vocab', 'commonsense'].includes(activeQuiz.id) && (
                <button className="qz-action-btn secondary" onClick={() => window.location.reload()}>RETRY</button>
              )}
              <button className="qz-action-btn secondary" onClick={() => window.location.href = '/quiz'}>BACK TO MENU</button>
            </div>
          </div>
        </div>
      )}
      <footer className="page-footer"><a href="https://mayinflight.com" className="footer-link" target="_blank" rel="noopener noreferrer">mayday <Flower size={14} strokeWidth={1.5} /></a></footer>
    </div>
  );
}
