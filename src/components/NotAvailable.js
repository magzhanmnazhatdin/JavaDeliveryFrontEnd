import React from 'react';
import { Link } from 'react-router-dom';

const NotAvailable = ({ title }) => {
  return (
    <div className="not-available">
      <div className="not-available-card">
        <h1>{title || 'Not available'}</h1>
        <p>This section is not wired to the current backend.</p>
        <Link to="/" className="back-link">
          Back to home
        </Link>
      </div>
    </div>
  );
};

export default NotAvailable;
