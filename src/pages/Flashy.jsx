import { useState, useEffect, useRef } from 'react';
import { Mail, Flower } from 'lucide-react';
import FlashPlayer from '../components/FlashPlayer/FlashPlayer';
import gamesData from '../data/games.json';
import './Flashy.css';

export default function Flashy({ initialGameId }) {
  const [time, setTime] = useState(new Date());
  const [activeGame, setActiveGame] = useState(() => {
    if (initialGameId) {
      return gamesData.find(g => g.id === initialGameId) || null;
    }
    return null;
  });

  const scrollRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // QoL: let a vertical mouse-wheel / trackpad scroll move the channel grid
  // left and right (the grid is laid out horizontally).
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e) => {
      // Don't hijack when the user is already scrolling horizontally.
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      el.scrollLeft += e.deltaY;
      e.preventDefault();
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [activeGame]);

  // QoL: arrow keys nudge the grid horizontally (disabled while a game is open).
  useEffect(() => {
    const onKey = (e) => {
      if (activeGame || !scrollRef.current) return;
      if (e.key === 'ArrowRight') scrollRef.current.scrollBy({ left: 240, behavior: 'smooth' });
      else if (e.key === 'ArrowLeft') scrollRef.current.scrollBy({ left: -240, behavior: 'smooth' });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeGame]);

  const formatTime = (date) => {
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours} ${minutes} ${ampm}`;
  };

  const formatDate = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return `${days[date.getDay()]} ${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="throwback-container">
      
      <main className="wii-main-area" ref={scrollRef}>
        <div className="wii-channel-grid">
          {gamesData.map((channel) => (
            <div 
              key={channel.id} 
              className="wii-channel"
              onClick={() => {
                if (channel.url) {
                  setActiveGame(channel);
                  const currentPath = window.location.pathname;
                  const newPath = currentPath.includes('/play/') ? currentPath : `${currentPath}/play/${channel.id}`;
                  window.history.pushState({}, '', newPath);
                }
              }}
            >
              <div className="wii-channel-content">
                {channel.image ? (
                  <img
                    src={channel.image}
                    alt={channel.title}
                    className="wii-channel-img"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Broken archive thumbnail → fall back to a titled tile.
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement
                        .querySelector('.wii-channel-empty-text')
                        ?.style.removeProperty('display');
                    }}
                  />
                ) : null}
                <span
                  className="wii-channel-empty-text"
                  style={channel.image ? { display: 'none' } : undefined}
                >
                  {channel.title}
                </span>
                <div className="wii-channel-title-overlay">
                  {channel.title}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="wii-bottom-bar">
        <a href="https://mayinflight.com" target="_blank" rel="noopener noreferrer" className="wii-circle-btn">
          <Flower size={32} color="#888" strokeWidth={1.5} />
        </a>
        
        <div className="wii-clock-area">
          <div className="wii-time">{formatTime(time)}</div>
          <div className="wii-date">{formatDate(time)}</div>
        </div>

        <a href="https://www.instagram.com/phushsiafirst" target="_blank" rel="noopener noreferrer" className="wii-circle-btn wii-btn-blue-ring">
          <Mail size={32} color="#00bfff" strokeWidth={1.5} />
        </a>
      </footer>

      {activeGame && (
        <FlashPlayer 
          game={activeGame} 
          onClose={() => {
            setActiveGame(null);
            const currentPath = window.location.pathname;
            const newPath = currentPath.split('/play/')[0];
            window.history.pushState({}, '', newPath);
          }} 
        />
      )}
    </div>
  );
}
