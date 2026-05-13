import React from 'react';
import { AlertCircle } from 'lucide-react';
import './ErrorAlert.css';

export default function ErrorAlert({ message }) {
  if (!message) return null;

  return (
    <div className="nwts-error-alert">
      <AlertCircle size={16} />
      <span>{message}</span>
    </div>
  );
}
