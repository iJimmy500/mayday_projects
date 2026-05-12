import React from 'react';
import CrashScreen from './CrashScreen';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Critical System Failure caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const crashReason = {
        code: 'REACT_RENDER_THREAD_FAULT',
        message: 'A critical error occurred in the UI rendering engine. The process has been halted to prevent further instability.',
        details: this.state.error?.toString() || 'Unknown rendering exception'
      };

      return <CrashScreen reason={crashReason} />;
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
