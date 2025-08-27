import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
        <p className="mt-4 text-gray-600">Loading Step-and-Save...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;