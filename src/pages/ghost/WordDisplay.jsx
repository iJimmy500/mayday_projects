export default function WordDisplay({ word, guessed, endState }) {
  return (
    <div className="gh-word">
      {[...word].map((letter, i) => {
        const correct = guessed.has(letter);
        const show    = correct || !!endState;
        const missed  = endState === 'lose' && !correct;
        return (
          <div className="gh-slot" key={i}>
            <span className={`gh-char${show ? ' show' : ''}${correct && !missed ? ' correct' : ''}${missed ? ' missed' : ''}`}>
              {show ? letter : ''}
            </span>
            <div className={`gh-dash${missed ? ' missed-dash' : ''}${correct && !missed ? ' correct-dash' : ''}`} />
          </div>
        );
      })}
    </div>
  );
}
