import { useEffect } from 'react';
import { Flower } from 'lucide-react';
import Birthday from './pages/Birthday';
import Randomizer from './pages/Randomizer';
import Vowelism from './pages/Vowelism';
import Quiz from './pages/Quiz';
import QuizEngine from './pages/QuizEngine';

import QuizCreator from './pages/QuizCreator';
import OneHitWonder from './pages/OneHitWonder';
import CanvasBreach from './pages/CanvasBreach';

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

  if (path === '/vowelism' || path === '/words' || path === '/day4') {
    return <Vowelism />;
  }

  if (path === '/ohw' || path === '/onehit' || path === '/day6') {
    return <OneHitWonder />;
  }

  if (path === '/canvas' || path === '/day7') {
    return <CanvasBreach />;
  }


  if (path === '/quiz/create' || path === '/day5/create') {
    return <QuizCreator />;
  }

  if (path.startsWith('/quiz/') || path.startsWith('/day5/')) {
    const quizId = path.split('/').pop();
    return <QuizEngine id={quizId} />;
  }

  if (path === '/quiz' || path === '/day5') {
    return <Quiz />;
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
