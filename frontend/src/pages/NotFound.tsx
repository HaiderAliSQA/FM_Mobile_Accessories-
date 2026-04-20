// frontend/src/pages/NotFound.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="font-heading text-gold font-bold text-8xl sm:text-9xl mb-4">404</h1>
      <h2 className="font-heading text-text-primary text-3xl sm:text-4xl mb-6">Page Not Found</h2>
      <p className="text-text-muted text-lg font-body max-w-md mb-10">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link
        to="/"
        className="px-8 py-3.5 bg-gold text-bg font-body text-sm uppercase tracking-widest font-medium hover:bg-gold-hover transition-colors rounded shadow-lg shadow-gold/20"
      >
        Return to Home
      </Link>
    </div>
  );
};

export default NotFound;
