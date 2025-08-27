import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

// Mock Step Tracking Hook
const useStepTracking = () => {
  const [steps, setSteps] = useState(2350);
  const [isTracking, setIsTracking] = useState(false);
  
  const startTracking = () => {
    setIsTracking(true);
    toast.success('Step tracking started! 👟');
  };
  
  const stopTracking = () => {
    setIsTracking(false);
    toast('Step tracking paused', { icon: '⏸️' });
  };
  
  useEffect(() => {
    if (isTracking) {
      const interval = setInterval(() => {
        setSteps(prev => prev + Math.floor(Math.random() * 5) + 1);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isTracking]);
  
  return { steps, isTracking, startTracking, stopTracking };
};

// Simple Step Counter Component (without framer-motion)
const StepCounter: React.FC<{
  steps: number;
  isTracking: boolean;
  onStartTracking: () => void;
  onStopTracking: () => void;
}> = ({ steps, isTracking, onStartTracking, onStopTracking }) => {
  const progressPercentage = ((steps % 1000) / 1000) * 100;
  const stepsToNext = 1000 - (steps % 1000);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Steps Today</h2>
        <button
          onClick={isTracking ? onStopTracking : onStartTracking}
          className={`p-2 rounded-full transition-colors ${
            isTracking
              ? 'bg-red-100 text-red-600 hover:bg-red-200'
              : 'bg-green-100 text-green-600 hover:bg-green-200'
          }`}
        >
          {isTracking ? '⏸️' : '▶️'}
        </button>
      </div>

      <div className="text-center mb-6">
        <div className="text-6xl font-bold text-gray-900 mb-2">
          {steps.toLocaleString()}
        </div>
        <div className="text-sm text-gray-600">steps</div>
        
        {/* Simple progress bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {stepsToNext} steps to next coupon
          </p>
        </div>
      </div>

      <div className="text-center">
        <div className="text-lg font-semibold text-gray-900 mb-1">
          {Math.floor(steps / 1000)} coupons earned today
        </div>
        <div
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            isTracking
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full mr-2 ${
              isTracking ? 'bg-green-600' : 'bg-gray-600'
            }`}
          />
          {isTracking ? 'Tracking Active' : 'Tracking Paused'}
        </div>
      </div>

      {!isTracking && (
        <button
          onClick={onStartTracking}
          className="w-full mt-4 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
        >
          Start Tracking Steps
        </button>
      )}
    </div>
  );
};

// Simple Connect Wallet Component
const ConnectWallet: React.FC<{ onConnect: () => void }> = ({ onConnect }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Welcome to Step-and-Save
      </h2>
      <p className="text-gray-600 mb-6">
        Connect your wallet to start earning coupons from your daily steps
      </p>
      <button
        onClick={onConnect}
        className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
      >
        Connect Wallet (Demo)
      </button>
    </div>
  );
};

// Main App Component (simplified)
function SimpleApp() {
  const { steps, isTracking, startTracking, stopTracking } = useStepTracking();
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = () => {
    setIsConnected(true);
    toast.success('Wallet connected! 🎉');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pt-8 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Step-and-Save
          </h1>
          <p className="text-gray-600 text-sm">
            Walking turns steps into instant discounts
          </p>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <ConnectWallet onConnect={handleConnect} />
        )}

        {/* Step Counter */}
        {isConnected && (
          <StepCounter
            steps={steps}
            isTracking={isTracking}
            onStartTracking={startTracking}
            onStopTracking={stopTracking}
          />
        )}

        {/* Quick Stats */}
        {isConnected && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="font-semibold text-gray-900 mb-4">Today's Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.floor(steps / 1000)}
                </div>
                <div className="text-sm text-gray-600">Coupons Earned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {steps.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Steps</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 pb-8">
          Powered by VERY Network • Built for DoraHacks
        </div>
      </div>
      
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '12px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

export default SimpleApp;