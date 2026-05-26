export default function HelpModal({ onClose }) {
  return (
    <div className="gh-modal-overlay" onClick={onClose}>
      <div className="gh-modal" onClick={e => e.stopPropagation()}>
        <span className="gh-modal-tag">how to play</span>
        <h2 className="gh-modal-title">ghost</h2>
        <p className="gh-modal-desc">guess the hidden word, one letter at a time.</p>
        <ul className="gh-modal-list">
          <li>6 wrong guesses and you lose</li>
          <li>green keys are correct letters</li>
          <li>faded keys are not in the word</li>
          <li><em>show hint</em> reveals the dictionary definition mid-game</li>
          <li><em>common</em> mode filters to everyday words only</li>
          <li>press <kbd>enter</kbd> after each round to get a new word</li>
          <li>use the length dropdown to change word difficulty</li>
        </ul>
        <button className="gh-modal-close" onClick={onClose}>got it</button>
      </div>
    </div>
  );
}
