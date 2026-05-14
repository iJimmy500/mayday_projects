import { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';
import './Throwback.css';

const CHANNELS = [
  { id: 1, title: 'Super Smash Flash 2', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x4n.png' },
  { id: 2, title: 'Bloons TD 5', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2kzh.png' },
  { id: 3, title: 'Run 3', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2l0g.png' },
  { id: 4, title: 'Papa\'s Pizzeria', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x9j.png' },
  { id: 5, title: 'Fireboy & Watergirl', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2kzi.png' },
  { id: 6, title: 'Happy Wheels', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x4m.png' },
  // Leave the rest empty for the authentic Wii experience
  { id: 7, title: '', image: null },
  { id: 8, title: '', image: null },
  { id: 9, title: '', image: null },
  { id: 10, title: '', image: null },
  { id: 11, title: '', image: null },
  { id: 12, title: '', image: null }
];

export default function Throwback() {
  const [time, setTime] = useState(new Date());

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
          {CHANNELS.map((channel) => (
            <div key={channel.id} className="wii-channel">
              <div className="wii-channel-content">
                {channel.image ? (
                  <img src={channel.image} alt={channel.title} className="wii-channel-img" />
                ) : (
                  <span className="wii-channel-empty-text">Wii</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="wii-bottom-bar">
        <div className="wii-circle-btn">
          Wii
        </div>
        
        <div className="wii-clock-area">
          <div className="wii-time">{formatTime(time)}</div>
          <div className="wii-date">{formatDate(time)}</div>
        </div>

        <div className="wii-circle-btn wii-btn-blue-ring">
          <Mail size={32} color="#00bfff" strokeWidth={1.5} />
        </div>
      </footer>

    </div>
  );
}
