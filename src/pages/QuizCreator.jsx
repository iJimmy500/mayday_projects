import { useState } from 'react';
import { Plus, Trash2, Save, Download, ArrowLeft, Flower, MonitorOff } from 'lucide-react';
import { obfuscate } from '../utils/quizUtils';
import './QuizCreator.css';

export default function QuizCreator() {
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('');
  const [questions, setQuestions] = useState([
    { question: '', options: ['', '', '', ''], correct: 0 }
  ]);

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correct: 0 }]);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    setQuestions(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const updateOption = (qIndex, oIndex, value) => {
    setQuestions(prev => {
      const next = [...prev];
      const q = { ...next[qIndex] };
      const opts = [...q.options];
      opts[oIndex] = value;
      q.options = opts;
      next[qIndex] = q;
      return next;
    });
  };


  const generateQuiz = () => {
    if (!title) {
      alert("Please enter a quiz title.");
      return null;
    }
    const quizId = 'custom_' + Date.now();
    return {
      id: quizId,
      title,
      tag: tag || 'User Generated',
      questions: questions.map(q => ({
        ...q,
        correct: parseInt(q.correct)
      }))
    };
  };

  const handleSave = () => {
    const quiz = generateQuiz();
    if (!quiz) return;
    const encoded = obfuscate(quiz);
    const saved = localStorage.getItem('custom_quizzes');
    const customQuizzes = saved ? JSON.parse(saved) : [];
    localStorage.setItem('custom_quizzes', JSON.stringify([...customQuizzes, encoded]));
    window.location.href = '/quiz';
  };

  const handleDownload = () => {
    const quiz = generateQuiz();
    if (!quiz) return;
    const encoded = obfuscate(quiz);
    const blob = new Blob([JSON.stringify(encoded, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '_')}.json`;
    a.click();
  };

  return (
    <div className="qc-wrap">
      <div className="qc-mobile-lock">
        <MonitorOff size={48} />
        <h2>Desktop Only</h2>
        <p>The Quiz Creator requires a keyboard and larger screen for the best experience.</p>
        <button onClick={() => window.location.href = '/quiz'}>Back to Tests</button>
      </div>

      <div className="qc-container fade-in">
        <header className="qc-header">
          <button className="qc-back" onClick={() => window.location.href = '/quiz'} title="Back">
            <ArrowLeft size={20} />
          </button>
          <div className="qc-header-info">
            <input 
              className="qc-title-input"
              type="text" 
              placeholder="Untitled Quiz" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input 
              className="qc-tag-input"
              type="text" 
              placeholder="Add category tag..." 
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />
          </div>
          <div className="qc-actions">
            <button className="qc-action-btn" onClick={handleDownload} title="Export JSON">
              <Download size={18} />
            </button>
            <button className="qc-save-btn" onClick={handleSave}>
              <Plus size={18} /> Add to Quizzes
            </button>
          </div>
        </header>

        <div className="qc-questions">
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="qc-q-card">
              <div className="qc-q-row">
                <span className="qc-q-idx">{qIndex + 1}</span>
                <textarea 
                  className="qc-q-input"
                  placeholder="Ask something..."
                  value={q.question}
                  onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                />
                <button className="qc-q-delete" onClick={() => removeQuestion(qIndex)}>
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="qc-opts-grid">
                {q.options.map((opt, oIndex) => (
                  <div key={oIndex} className={`qc-opt-box ${parseInt(q.correct) === oIndex ? 'active' : ''}`}>
                    <div className="qc-opt-marker" onClick={() => updateQuestion(qIndex, 'correct', oIndex)}>
                      {String.fromCharCode(65 + oIndex)}
                    </div>
                    <input 
                      type="text" 
                      placeholder={`Option ${oIndex + 1}`}
                      value={opt}
                      onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <button className="qc-add-q" onClick={addQuestion}>
            <Plus size={18} /> Add Question
          </button>
        </div>
      </div>

      <footer className="page-footer">
        <a href="https://mayinflight.com" className="footer-link" target="_blank" rel="noopener noreferrer">
          mayday <Flower size={14} strokeWidth={1.5} />
        </a>
      </footer>
    </div>
  );
}
