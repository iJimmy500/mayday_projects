import { TrendingUp, TrendingDown } from 'lucide-react';

export default function EventModal({ activeEvent, onClose }) {
  if (!activeEvent) return null;

  return (
    <div className="gs-event-modal-overlay">
      <div className="gs-event-modal">
        <div className={`gs-event-icon ${activeEvent.isGood ? 'good' : 'bad'}`}>
          {activeEvent.isGood ? <TrendingDown size={32} /> : <TrendingUp size={32} />}
        </div>
        <h2 className="gs-event-title">{activeEvent.title}</h2>
        <p className="gs-event-desc">{activeEvent.desc}</p>
        <div className={`gs-event-impact ${activeEvent.isGood ? 'good' : 'bad'}`}>
          {activeEvent.effect > 1 ? '+' : ''}{Math.round((activeEvent.effect - 1) * 100)}% Price Impact
        </div>
        <button className="gs-event-btn" onClick={onClose}>
          Acknowledge
        </button>
      </div>
    </div>
  );
}
