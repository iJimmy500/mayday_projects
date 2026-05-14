import React from 'react';

export default function LegalModal({ acceptDisclaimer }) {
  return (
    <div className="ps-modal-overlay">
      <div className="ps-modal">
        <h2>pocket<span>.studio</span></h2>
        <h3>Terms of Use</h3>
        <p>
          PocketStudio is a browser-based recording utility designed for 
          <strong> demo and reference purposes only</strong>.
        </p>
        <p>
          By using this application, you acknowledge that we hold 
          <strong> no liability</strong> for copyright infringement, royalties, or 
          legal issues arising from the use of third-party content (including YouTube audio).
        </p>
        <p>
          Users are responsible for securing necessary rights for any 
          commercial use of recordings made here.
        </p>
        <button className="ps-modal-btn" onClick={acceptDisclaimer}>
          I UNDERSTAND & AGREE
        </button>
      </div>
    </div>
  );
}
