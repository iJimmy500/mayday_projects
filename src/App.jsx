import { useEffect } from 'react';
import { Flower } from 'lucide-react';
import Birthday from './pages/Birthday';

import Randomizer from './pages/Randomizer';

export default function App() {
  const path = window.location.pathname;

  if (path === '/' || path === '') {
    return <Redirect />;
  }

  if (path === '/birthday' || path === '/bday' || path === '/day2') {
    return <Birthday />;
  }

  if (path === '/random' || path === '/gen' || path === '/day3' || path === '/pro') {
    return <Randomizer />;
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
