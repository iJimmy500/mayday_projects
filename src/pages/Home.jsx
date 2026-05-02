import { useEffect, useState } from 'react';

const Home = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    const timeout = setTimeout(() => {
      window.location.href = 'https://mayinflight.com';
    }, 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="home-container">
      <div className="message-box">
        <h1>Projects by Mayinflight</h1>
        <p>A project must be selected from Mayinflight.</p>
        <p className="redirect-text">Redirecting to main site{dots}</p>
      </div>
    </div>
  );
};

export default Home;
