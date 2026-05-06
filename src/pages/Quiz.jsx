import { useState } from 'react';
import { Flower, ChevronRight, Upload, ChevronLeft, Plus, Download } from 'lucide-react';
import QUIZZES_ENC from '../data/quizzes.enc.json';
import './Quiz.css';

import { deobfuscate, obfuscate } from '../utils/quizUtils';
import './Quiz.css';

export default function Quiz() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [customQuizzes, setCustomQuizzes] = useState(() => {
    const saved = localStorage.getItem('custom_quizzes');
    const raw = saved ? JSON.parse(saved) : [];
    return raw.map(deobfuscate);
  });

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target.result);
        let list = Array.isArray(json) ? json : [json];
        const isEncoded = list.every(q => {
          try { atob(q.title); return true; } catch { return false; }
        });
        const decodedList = (isEncoded ? list.map(deobfuscate) : list).map(q => ({
          ...q,
          id: q.id?.startsWith('custom') ? q.id : `custom_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
        }));
        const encodedToSave = decodedList.map(obfuscate);
        const updatedDecoded = [...customQuizzes, ...decodedList];
        const updatedEncoded = [...customQuizzes.map(obfuscate), ...encodedToSave];
        setCustomQuizzes(updatedDecoded);
        localStorage.setItem('custom_quizzes', JSON.stringify(updatedEncoded));
      } catch (err) {
        alert("Error: Please upload a valid JSON quiz file.");
      }
    };
    reader.readAsText(file);
  };

  const downloadQuiz = (e, quiz) => {
    e.stopPropagation();
    const encoded = obfuscate(quiz);
    const blob = new Blob([JSON.stringify(encoded, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${quiz.title.toLowerCase().replace(/\s+/g, '_')}_quiz.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearCustom = () => {
    if (confirm("Clear all uploaded quizzes?")) {
      setCustomQuizzes([]);
      localStorage.removeItem('custom_quizzes');
      setCurrentPage(1);
    }
  };

  const [showPopup, setShowPopup] = useState(() => !localStorage.getItem('disclaimer_accepted'));
  const [expandDisclaimer, setExpandDisclaimer] = useState(false);

  const acceptDisclaimer = () => {
    localStorage.setItem('disclaimer_accepted', 'true');
    setShowPopup(false);
  };

  const allQuizzes = [...customQuizzes, ...QUIZZES_ENC.map(deobfuscate)];
  const totalPages = Math.ceil(allQuizzes.length / itemsPerPage);
  const currentQuizzes = allQuizzes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="qz-wrap">
      {showPopup && (
        <div className="qz-modal-overlay fade-in">
          <div className="qz-modal disclaimer-popup">
            <span className="qz-modal-tag">Terms of Use</span>
            <h2 className="qz-modal-title">Important Notice</h2>
            <div className="qz-disclaimer-content">
              <p>By using this platform, you acknowledge that:</p>
              <ul>
                <li>These tools are for <strong>educational and research purposes only</strong>.</li>
                <li>They are <strong>not clinical instruments</strong> and do not provide medical diagnoses.</li>
                <li>Results should not be used as a substitute for professional consultation.</li>
              </ul>
              <p>For any health or mental concerns, please visit a qualified professional.</p>
            </div>
            <button className="qz-start-btn" onClick={acceptDisclaimer}>I UNDERSTAND & AGREE</button>
          </div>
        </div>
      )}

      <div className="qz-home fade-in">
        <div className="qz-home-header">
          <div className="qz-header-main">
            <h1>Tests</h1>
            <div className="qz-header-actions">
              <button className="qz-create-btn" onClick={() => window.location.href = '/quiz/create'} title="Create new quiz">
                <Plus size={16} />
              </button>
              <label className="qz-upload-btn" title="Upload custom JSON quiz">
                <Upload size={16} />
                <input type="file" accept=".json" onChange={handleUpload} hidden />
              </label>
              {customQuizzes.length > 0 && (
                <button className="qz-clear-btn" onClick={clearCustom} title="Clear custom tests">×</button>
              )}
            </div>
          </div>
        </div>

        <div className="qz-list">
          {currentQuizzes.map((quiz, i) => {
            const globalIndex = (currentPage - 1) * itemsPerPage + i + 1;
            const isCustom = quiz.id?.startsWith('custom');
            return (
              <div
                key={quiz.id + i}
                className={`qz-row ${isCustom ? 'custom' : ''}`}
                onClick={() => window.location.href = `/quiz/${quiz.id}`}
              >
                <span className="qz-row-num">{String(globalIndex).padStart(2, '0')}</span>
                <div className="qz-row-info">
                  <div className="qz-row-title-wrap">
                    <span className="qz-row-title">{quiz.title}</span>
                    {isCustom && <span className="qz-badge">USER</span>}
                  </div>
                  <span className="qz-row-tag">{quiz.tag || 'User Uploaded'} · {quiz.questions?.length || 0} questions</span>
                </div>
                {isCustom ? (
                  <div className="qz-row-actions">
                    <button className="qz-row-download" onClick={(e) => downloadQuiz(e, quiz)} title="Download JSON">
                      <Download size={14} />
                    </button>
                    <ChevronRight size={16} className="qz-row-arrow" />
                  </div>
                ) : (
                  <ChevronRight size={16} className="qz-row-arrow" />
                )}
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="qz-pagination">
            <button
              className="qz-pag-btn"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} /> PREV
            </button>
            <span className="qz-pag-info">PAGE {currentPage} / {totalPages}</span>
            <button
              className="qz-pag-btn"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              NEXT <ChevronRight size={16} />
            </button>
          </div>
        )}

        <div className={`qz-disclaimer-fold ${expandDisclaimer ? 'expanded' : ''}`} onClick={() => setExpandDisclaimer(!expandDisclaimer)}>
           <span className="qz-disclaimer-trigger">
             {expandDisclaimer ? '− HIDE DISCLAIMER' : '+ READ MEDICAL DISCLAIMER'}
           </span>
           {expandDisclaimer && (
             <p className="qz-disclaimer-text">
               <strong>Important Notice:</strong> These psychometric tools and general knowledge tests are for educational and entertainment purposes only. They are not clinical instruments and do not constitute professional psychological advice, medical diagnosis, or treatment. If you are experiencing symptoms or have concerns about your mental health, please consult a qualified healthcare professional.
             </p>
           )}
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
