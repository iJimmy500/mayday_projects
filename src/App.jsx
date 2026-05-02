import { useState, useEffect } from 'react';
import { Flower } from 'lucide-react';
import wishlist from './wishlist.json';

export default function App() {
  const path = window.location.pathname;

  if (path === '/' || path === '') {
    return <Redirect />;
  }

  if (path === '/birthday' || path === '/bday' || path === '/day2') {
    return <Birthday />;
  }

  return <Redirect />;
}

function Redirect() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = 'https://mayinflight.com';
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="simple-center">
      <div className="flower-container">
        <Flower size={32} strokeWidth={1} className="spinning-flower" />
      </div>
      <div className="home-logo">mayday</div>
      <p className="redirect-msg">Select a project from mayinflight.com</p>
    </div>
  );
}

function Birthday() {
  const [timeLeft, setTimeLeft] = useState('');
  const targetDate = new Date('2026-05-23T00:00:00').getTime();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        setTimeLeft("i'm waiting...");
        clearInterval(timer);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="wishlist-page">
      <header>
        <h1>Wishlist</h1>
        <p className="countdown-text">{timeLeft}</p>
      </header>
      <main>
        {wishlist.map((item, i) => (
          <a key={item.id || i} href={item.link} className={`item-row ${item.completed ? 'completed' : ''}`} target="_blank" rel="noopener noreferrer">
            <img src={item.img} alt="" />
            <span className="name">{item.name}</span>
            <span className="price">{item.price}</span>
          </a>
        ))}
      </main>
      <footer className="page-footer">
        <a href="https://mayinflight.com" className="footer-link" target="_blank" rel="noopener noreferrer">
          mayday <Flower size={14} strokeWidth={1.5} />
        </a>
      </footer>
    </div>
  );
}
