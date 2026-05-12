import React from 'react';
import { Flower } from 'lucide-react';
import '../../pages/LyricFinder.css';

export default function CrashScreen({ reason }) {
  const errorCode = reason?.code || 'UNEXPECTED_KERNEL_MODE_TRAP';
  const errorMessage = reason?.message || "Your device ran into a problem and needs to restart. We're just collecting some error info, and then we'll restart for you.";
  const details = reason?.details || 'system_service_exception';

  return (
    <div className="am-crash-overlay">
      <div className="am-crash-sad-face">
        <Flower size={120} strokeWidth={1} />
      </div>

      <h1 className="am-crash-title">
        {errorMessage}
      </h1>

      <div className="am-crash-info-row">
        <div className="am-crash-qr-sim">
          {[...Array(144)].map((_, i) => (
            <div
              key={i}
              className="am-crash-qr-dot"
              style={{ opacity: Math.random() > 0.5 ? 1 : 0 }}
            />
          ))}
        </div>

        <div className="am-crash-details">
          <p>For more information about this issue and possible fixes, visit https://mayday.system/stopcode</p>
          <p>Report this bug to <a href="https://instagram.com/phushsiafirst" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'underline' }}>@phushsiafirst</a> on Instagram.</p>
          <div style={{ marginTop: '20px' }}>
            <p>Stop code: <code>{errorCode}</code></p>
            <p>Technical details: <code>{details}</code></p>
          </div>
        </div>
      </div>

      <button className="am-crash-reboot" onClick={() => window.location.reload()}>
        Refresh Page
      </button>
    </div>
  );
}
