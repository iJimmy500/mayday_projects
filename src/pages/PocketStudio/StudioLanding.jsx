import React from 'react';

export default function StudioLanding({ backingUrl, setBackingUrl, handleLocalUpload }) {
  return (
    <div className="ps-landing">
      <h1>Drop a beat.</h1>
      <p>Paste any YouTube link, then record your vocals over it.</p>
      <div className="ps-url-box">
        <input 
          type="text" 
          placeholder="youtube.com/watch?v=..." 
          value={backingUrl} 
          onChange={e => setBackingUrl(e.target.value)} 
        />
        <div className="ps-url-enter">↵</div>
      </div>
      <div className="ps-landing-hint">Try searching "lucki type beat" on YouTube</div>
      
      <div className="ps-landing-divider"><span>OR</span></div>
      
      <div className="ps-local-upload">
        <button className="ps-rec-btn" onClick={() => document.getElementById('local-file').click()}>
          Choose Local File
        </button>
        <p className="ps-landing-hint" style={{ marginTop: '8px' }}>
          Unlocks Master Mix recording. Highly recommended.
        </p>
        <input 
          type="file" 
          id="local-file" 
          accept="audio/*" 
          style={{ display: 'none' }} 
          onChange={e => handleLocalUpload(e.target.files[0])} 
        />
      </div>
    </div>
  );
}
