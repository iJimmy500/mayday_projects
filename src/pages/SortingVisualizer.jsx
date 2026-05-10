import React, { useState, useEffect } from 'react';
import SortingVisualizerDesktop from './sorting/SortingVisualizerDesktop';
import SortingVisualizerMobile from './sorting/SortingVisualizerMobile';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: '#0d1117', 
          color: '#c9d1d9',
          fontFamily: 'Inter, sans-serif',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <h1 style={{ color: '#f85149', marginBottom: '1rem' }}>System Crash</h1>
          <p style={{ marginBottom: '2rem', maxWidth: '400px' }}>
            The visualizer encountered an unexpected error and had to stop.
          </p>
          <div style={{ background: '#161b22', padding: '1rem', borderRadius: '8px', border: '1px solid #30363d', marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.9rem' }}>Please report this error to:</p>
            <a href="mailto:servieces@phushsia.com" style={{ color: '#58a6ff', textDecoration: 'none', fontWeight: 'bold' }}>servieces@phushsia.com</a>
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: '#58a6ff',
              color: '#0d1117',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function SortingVisualizer() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkSize();
    
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  return (
    <ErrorBoundary>
      {isMobile ? <SortingVisualizerMobile /> : <SortingVisualizerDesktop />}
    </ErrorBoundary>
  );
}
