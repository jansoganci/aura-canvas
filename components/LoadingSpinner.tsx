import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10 rounded-lg">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mb-4"></div>
        <p className="text-indigo-700 text-lg font-semibold">Generating your aura...</p>
        <p className="text-indigo-500 text-sm mt-2">This might take a few moments.</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;