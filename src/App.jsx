import { useEffect, lazy, Suspense } from 'react';
import { Flower } from 'lucide-react';

const Birthday = lazy(() => import('./pages/Birthday'));
const Randomizer = lazy(() => import('./pages/Randomizer'));
const Vowelism = lazy(() => import('./pages/Vowelism'));
const Quiz = lazy(() => import('./pages/Quiz'));
const QuizEngine = lazy(() => import('./pages/QuizEngine'));
const QuizCreator = lazy(() => import('./pages/QuizCreator'));
const OneHitWonder = lazy(() => import('./pages/OneHitWonder'));
const CanvasBreach = lazy(() => import('./pages/CanvasBreach'));
const RedDeadLandscapes = lazy(() => import('./pages/RedDeadLandscapes'));
const SortingVisualizer = lazy(() => import('./pages/SortingVisualizer'));

const Loading = () => (
  <div className="simple-center">
    <Flower size={32} strokeWidth={1} className="spinning-flower" />
  </div>
);

export default function App() {
  const path = window.location.pathname;

  return (
    <Suspense fallback={<Loading />}>
      {(() => {
        if (path === '/' || path === '') return <Redirect />;
        if (path === '/birthday' || path === '/bday' || path === '/day2') return <Birthday />;
        if (path === '/random' || path === '/gen' || path === '/day3' || path === '/pro') return <Randomizer />;
        if (path === '/vowelism' || path === '/words' || path === '/day4') return <Vowelism />;
        if (path === '/ohw' || path === '/onehit' || path === '/day6') return <OneHitWonder />;
        if (path === '/canvas' || path === '/day7') return <CanvasBreach />;
        if (path === '/rdr' || path === '/day8' || path === '/frontier') return <RedDeadLandscapes />;
        if (path === '/sort' || path === '/day9') return <SortingVisualizer />;
        if (path === '/quiz/create' || path === '/day5/create') return <QuizCreator />;
        
        if (path.startsWith('/quiz/') || path.startsWith('/day5/')) {
          const quizId = path.split('/').pop();
          return <QuizEngine id={quizId} />;
        }

        if (path === '/quiz' || path === '/day5') return <Quiz />;

        return <Redirect />;
      })()}
    </Suspense>
  );
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
