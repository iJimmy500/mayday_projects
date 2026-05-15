import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
      
      <main className="wii-main-area">
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
                  />
                ) : (
                  <span className="wii-channel-empty-text">Wii</span>
                )}
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
