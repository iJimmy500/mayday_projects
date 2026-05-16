import { useState, useEffect, useRef } from 'react';
import { SUBJECTS, generateProblem } from '../utils/mathEngine';
import { ArrowLeft, BookOpen, GraduationCap, ChevronRight, Lightbulb } from 'lucide-react';
import './MathAcademy.css';

/* ── KaTeX renderer ────────────────────────────────── */
function MathRender({ latex }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && window.katex) {
      window.katex.render(latex, ref.current, {
        throwOnError: false,
        displayMode: true,
      });
    }
  }, [latex]);
  return <span ref={ref} />;
}

/* ── Main component ────────────────────────────────── */
export default function MathAcademy() {
  const [view, setView] = useState('menu');
  const [curriculum, setCurriculum] = useState('JUNIOR');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [problem, setProblem] = useState(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'incorrect'
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef(null);

  const maxLevel = selectedSubject ? selectedSubject.levels.length : 3;
  const level = Math.min(Math.floor(streak / 5) + 1, maxLevel);

  const startPractice = (subject) => {
    setSelectedSubject(subject);
    setProblem(generateProblem(subject.id, 1));
    setView('practice');
    setFeedback(null);
    setAnswer('');
    setShowHint(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answer.trim() || feedback === 'correct') return;
    const isCorrect = answer.trim().toLowerCase() === problem.answer.trim().toLowerCase();
    if (isCorrect) {
      setFeedback('correct');
      setScore(s => s + 10);
      setStreak(s => s + 1);
    } else {
      setFeedback('incorrect');
      setStreak(0);
    }
  };

  const nextProblem = () => {
    setProblem(generateProblem(selectedSubject.id, level));
    setFeedback(null);
    setAnswer('');
    setShowHint(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  /* ── Menu ─────────────────────────────────────────── */
  if (view === 'menu') {
    return (
      <div className="ma-page">
        <div className="ma-topbar">
          <div className="ma-topbar-actions">
            <button className="ma-icon-btn" onClick={() => window.location.href = '/'} title="Exit">
              <ArrowLeft size={14} />
            </button>
          </div>
          <div className="ma-logo">Mathday</div>
          <a href="https://mayinflight.com" className="ma-portal-btn">
            mayday
          </a>
        </div>

        {/* Content */}
        <div className="ma-menu">
          <div className="ma-menu-heading">
            <h1>Choose a subject</h1>
          </div>

          {/* Curriculum tabs */}
          <div className="ma-tabs">
            <button
              className={`ma-tab ${curriculum === 'JUNIOR' ? 'active' : ''}`}
              onClick={() => setCurriculum('JUNIOR')}
            >
              <BookOpen size={13} /> Grades 3–6
            </button>
            <button
              className={`ma-tab ${curriculum === 'COLLEGIATE' ? 'active' : ''}`}
              onClick={() => setCurriculum('COLLEGIATE')}
            >
              <GraduationCap size={13} /> Collegiate
            </button>
          </div>

          {/* Subject rows */}
          <div className="ma-subject-list">
            {SUBJECTS[curriculum].map(sub => (
              <div
                key={sub.id}
                className="ma-subject-row"
                onClick={() => startPractice(sub)}
              >
                <span className="ma-subject-name">{sub.name}</span>
                <div className="ma-subject-meta">
                  <span className="ma-level-pill">{sub.levels.length} levels</span>
                  <span className="ma-row-arrow">
                    <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── Practice ─────────────────────────────────────── */
  return (
    <div className="ma-page ma-practice">
      {/* Top bar (Swapped) */}
      <div className="ma-topbar">
        <div className="ma-topbar-actions">
          <button className="ma-icon-btn" onClick={() => setView('menu')} title="Back">
            <ArrowLeft size={14} />
          </button>
        </div>
        <div className="ma-logo">Mathday</div>
        <a href="https://mayinflight.com" className="ma-portal-btn">
          mayday
        </a>
      </div>

      {/* Session header: breadcrumb + stats in one line */}
      <div className="ma-session-header">
        <div className="ma-breadcrumb">
          <button onClick={() => setView('menu')}>Subjects</button>
          <span className="ma-breadcrumb-sep">/</span>
          <span className="ma-breadcrumb-current">{selectedSubject.name}</span>
        </div>

        <div className="ma-stats-inline">
          <div className="ma-stat">
            Score <span className="ma-stat-value">{score}</span>
          </div>
          <div className="ma-stat-dot" />
          <div className="ma-stat">
            Streak <span className="ma-stat-value">{streak}</span>
          </div>
          <div className="ma-stat-dot" />
          <div className="ma-stat">
            Level <span className="ma-stat-value">{level}</span>
          </div>
        </div>
      </div>

      {/* Problem */}
      <div className="ma-problem-area">
        <div className="ma-problem-wrap">
          <div className="ma-problem-display">
            <MathRender latex={problem.latex} />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="ma-answer-row">
              <input
                ref={inputRef}
                className="ma-answer-input"
                type="text"
                placeholder="Your answer"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                autoFocus
                autoComplete="off"
                disabled={feedback === 'correct'}
              />
              <button
                type="submit"
                className="ma-submit-btn"
                disabled={!answer.trim() || feedback === 'correct'}
              >
                Check
              </button>
            </div>
          </form>

          {feedback && (
            <div className={`ma-feedback ${feedback}`}>
              <span>
                {feedback === 'correct' ? 'Correct!' : 'Not quite — try again.'}
              </span>
              <div className="ma-feedback-actions">
                {feedback === 'correct' ? (
                  <button className="ma-next-btn" onClick={nextProblem}>
                    <ChevronRight size={14} /> Next
                  </button>
                ) : (
                  !showHint && (
                    <button className="ma-hint-btn" onClick={() => setShowHint(true)}>
                      <Lightbulb size={11} /> Hint
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {showHint && (
            <div className="ma-hint">
              <strong>Hint:</strong> {problem.hint}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
