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
const LyricFinder = lazy(() => import('./pages/LyricFinder'));
const IOU = lazy(() => import('./pages/IOU'));

const Loading = () => (
  <div className="simple-center">
    <div className="flower-container">
      <Flower size={32} strokeWidth={1} className="spinning-flower" />
    </div>
    <div className="home-logo">mayday</div>
    <p className="redirect-msg" style={{ opacity: 0.4 }}>loading ur page...</p>
  </div>
);

const PageWrapper = ({ children }) => (
  <div className="page-transition">
    {children}
  </div>
);

export default function App() {
  const path = window.location.pathname;

  return (
    <Suspense fallback={<Loading />}>
      <PageWrapper key={path}>
        {(() => {
          if (path === '/' || path === '') return <Redirect />;
          if (path === '/birthday' || path === '/bday' || path === '/day2') return <Birthday />;
          if (path === '/random' || path === '/gen' || path === '/day3' || path === '/pro') return <Randomizer />;
          if (path === '/vowelism' || path === '/words' || path === '/day4') return <Vowelism />;
          if (path === '/ohw' || path === '/onehit' || path === '/day6') return <OneHitWonder />;
          if (path === '/canvas' || path === '/day7') return <CanvasBreach />;
          if (path === '/rdr' || path === '/day8' || path === '/frontier') return <RedDeadLandscapes />;
          if (path === '/day11/globalsongs' || path === '/lyrics/globalsongs') return <LyricFinder isGlobal={true} />;
          if (path === '/sort' || path === '/day9') return <SortingVisualizer />;
          if (path === '/day10') return <IOU />;
          if (path.startsWith('/lyrics/artist/') || path.startsWith('/day11/artist/')) {
            const parts = path.split('/').filter(p => p.length > 0);
            const artist = parts[parts.length - 1];
            return <LyricFinder artistName={decodeURIComponent(artist)} />;
          }
          if (path.startsWith('/lyrics/') || path.startsWith('/day11/')) {
            const parts = path.split('/').filter(p => p.length > 0);
            const last = parts[parts.length - 1];
            const secondLast = parts[parts.length - 2];
            
            // Only pass as artistName if it's NOT a sub-route (custom, genre, mixtape, artist, globalsongs)
            const isSubRoute = ['custom', 'genre', 'mixtape', 'artist', 'globalsongs'].includes(secondLast) || 
                              ['custom', 'genre', 'mixtape', 'artist', 'globalsongs'].includes(last);
            
            if (!isSubRoute && last && last !== 'day11' && last !== 'lyrics') {
              return <LyricFinder artistName={decodeURIComponent(last)} />;
            }
          }
          if (path === '/lyrics' || path === '/day11' || path.startsWith('/lyrics/') || path.startsWith('/day11/')) return <LyricFinder />;
          if (path === '/quiz/create' || path === '/day5/create') return <QuizCreator />;

          if (path.startsWith('/quiz/') || path.startsWith('/day5/')) {
            const quizId = path.split('/').pop();
            return <QuizEngine id={quizId} />;
          }

          if (path === '/quiz' || path === '/day5') return <Quiz />;

          return <Redirect />;
        })()}
      </PageWrapper>
    </Suspense>
  );
}

function Redirect() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = 'https://mayinflight.com';
    }, 4000);
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
