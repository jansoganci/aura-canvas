import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="px-4 py-6 text-center">
      <p className="text-sm text-gray-500">
        © {new Date().getFullYear()} Aura Canvas
      </p>
    </footer>
  );
};
