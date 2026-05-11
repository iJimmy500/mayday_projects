import React from 'react';

export default function IOU() {
  const [showWhy, setShowWhy] = React.useState(false);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#000',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style>{`
        @keyframes iou-pop {
          0% { opacity: 0; transform: translateY(10px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes iou-fade {
          0% { opacity: 0; }
          100% { opacity: 0.4; }
        }
        .iou-btn {
          background: none;
          border: 1px solid rgba(0,0,0,0.1);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 11px;
          letter-spacing: 1px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s ease;
          color: rgba(0,0,0,0.6);
          text-decoration: none;
          font-weight: 600;
        }
        .iou-btn:hover {
          background: #000;
          color: #fff;
          border-color: #000;
        }
        .iou-sub-group {
          position: relative;
          display: inline-block;
        }
        .iou-dropdown {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(-10px);
          background: #fff;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          border-radius: 12px;
          padding: 8px;
          display: none;
          flex-direction: column;
          gap: 4px;
          min-width: 160px;
          z-index: 10;
        }
        .iou-sub-group:hover .iou-dropdown {
          display: flex;
        }
        .iou-drop-item {
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 10px;
          color: rgba(0,0,0,0.5);
          text-decoration: none;
          transition: background 0.2s;
          white-space: nowrap;
          text-align: center;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        .iou-drop-item:hover {
          background: rgba(0,0,0,0.03);
          color: #000;
        }
        .iou-why-text {
          max-width: 400px;
          text-align: center;
          font-size: 11px;
          line-height: 1.8;
          color: rgba(0,0,0,0.5);
          margin-top: 24px;
          animation: iou-why-pop 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          background: rgba(0,0,0,0.03);
          padding: 12px 24px;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.02);
        }
        @keyframes iou-why-pop {
          0% { opacity: 0; transform: translateY(20px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <h1
        style={{
          fontSize: '4rem',
          fontWeight: '200',
          margin: 0,
          letterSpacing: '-2px',
          animation: 'iou-pop 0.8s ease-out forwards'
        }}
      >
        iou
      </h1>
      <p
        style={{
          fontSize: '1rem',
          marginTop: '10px',
          fontWeight: '400',
          textTransform: 'lowercase',
          opacity: 0,
          animation: 'iou-fade 0.8s ease-out 0.4s forwards'
        }}
      >
        later this week a project will be here
      </p>

      {showWhy && (
        <a
          href="https://youtube.com/playlist?list=PLi1fF_nR9hLLWGJoqsZ2Aq0lXod7fYj_G&si=5uvbD-GEYkk_b8Wd"
          target="_blank"
          rel="noopener noreferrer"
          className="iou-why-text"
          style={{ textDecoration: 'none' }}
        >
          <div>i have to lock in for my final tmrw, i'll be back tmrw tho</div>
          <div style={{ fontSize: '9px', marginTop: '4px', opacity: 0.5, letterSpacing: '1px' }}>[ click 2 watch ]</div>
        </a>
      )}

      <div style={{ position: 'absolute', bottom: '40px', display: 'flex', gap: '12px' }}>
        <button className="iou-btn" onClick={() => setShowWhy(!showWhy)}>
          {showWhy ? 'close' : 'why?'}
        </button>

        <a href="https://youtube.com/@iam.james006" target="_blank" rel="noopener noreferrer" className="iou-btn">
          subscribe
        </a>

        <a href="https://appstar.world/phushsia" target="_blank" rel="noopener noreferrer" className="iou-btn">
          appstar
        </a>
      </div>
    </div>
  );
}
