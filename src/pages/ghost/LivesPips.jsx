import { MAX_WRONG } from './constants';

export default function LivesPips({ wrong }) {
  return (
    <div className="gh-pips">
      {Array.from({ length: MAX_WRONG }).map((_, i) => (
        <div
          key={i}
          className={`gh-pip${i < wrong ? ' dead' : ''}${i === wrong - 1 ? ' just-died' : ''}`}
        />
      ))}
    </div>
  );
}
