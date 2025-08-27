import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
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

// Mock Components
const StepCounter: React.FC<{
  steps: number;
  isTracking: boolean;
  onStartTracking: () => void;
  onStopTracking: () => void;
}> = ({ steps, isTracking, onStartTracking, onStopTracking }) => {
  const [animatedSteps, setAnimatedSteps] = useState(steps);
  const progressPercentage = ((steps % 1000) / 1000) * 100;
  const stepsToNext = 1000 - (steps % 1000);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedSteps(steps), 100);
    return () => clearTimeout(timer);
  }, [steps]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl p-6 shadow-lg"
    >
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
          {isTracking ? (
            <span className="w-5 h-5 flex items-center justify-center text-sm">⏸️</span>
          ) : (
            <span className="w-5 h-5 flex items-center justify-center text-sm">▶️</span>
          )}
        </button>
      </div>

      <div className="relative mb-6">
        <div className="flex items-center justify-center">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#e5e7eb"
                strokeWidth="6"
                fill="transparent"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                stroke="#10b981"
                strokeWidth="6"
                fill="transparent"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                animate={{
                  strokeDashoffset:
                    2 * Math.PI * 45 - (progressPercentage / 100) * 2 * Math.PI * 45,
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                key={animatedSteps}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-3xl font-bold text-gray-900"
              >
                {animatedSteps.toLocaleString()}
              </motion.div>
              <div className="text-sm text-gray-600">steps</div>
            </div>
          </div>
        </div>

        {isTracking && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-full h-full bg-green-500 rounded-full"
            />
          </motion.div>
        )}
      </div>

      <div className="text-center">
        <div className="text-lg font-semibold text-gray-900 mb-1">
          {stepsToNext === 1000 ? '1,000' : stepsToNext.toLocaleString()} steps to next coupon
        </div>
        <div className="text-sm text-gray-600">
          {Math.floor(steps / 1000)} coupons earned today
        </div>
      </div>

      <div className="mt-4 text-center">
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
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onStartTracking}
          className="w-full mt-4 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
        >
          Start Tracking Steps
        </motion.button>
      )}
    </motion.div>
  );
};

const ConnectWallet: React.FC = () => {
  const handleConnect = () => {
    toast.success('Demo: Wallet connection simulated!', {
      icon: '🔗',
      duration: 3000
    });
  };

  return (
    <div className="text-center">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Welcome to Step-and-Save
      </h2>
      <p className="text-gray-600 mb-6">
        Connect your wallet to start earning coupons from your daily steps
      </p>
      <button
        onClick={handleConnect}
        className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
      >
        Connect Wallet (Demo)
      </button>
    </div>
  );
};

const CouponProgress: React.FC<{
  steps: number;
  stepsToNext: number;
  canMint: boolean;
  isLoading: boolean;
  onMint: () => void;
}> = ({ steps, stepsToNext, canMint, isLoading, onMint }) => {
  const progress = Math.min(((steps % 1000) / 1000) * 100, 100);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h3 className="font-semibold text-gray-900 mb-4">Coupon Progress</h3>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress to next coupon</span>
          <span>{stepsToNext} steps remaining</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            className="bg-green-500 h-3 rounded-full transition-all duration-300"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <button
        onClick={onMint}
        disabled={!canMint || isLoading}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          canMint && !isLoading
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isLoading ? 'Minting...' : canMint ? 'Mint Coupon NFT' : 'Not Ready'}
      </button>
    </div>
  );
};

const LocationStatus: React.FC = () => {
  const [status, setStatus] = useState('detecting');
  
  useEffect(() => {
    const timer = setTimeout(() => setStatus('detected'), 1500);
    return () => clearTimeout(timer);
  }, []);

  const getLocationInfo = () => {
    switch (status) {
      case 'detected':
        return {
          message: 'Location detected',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          accuracy: '~10m'
        };
      case 'error':
        return {
          message: 'Location access denied',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          accuracy: null
        };
      default:
        return {
          message: 'Getting location...',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          accuracy: null
        };
    }
  };

  const { message, color, bgColor, accuracy } = getLocationInfo();

  return (
    <div className={`rounded-2xl p-4 ${bgColor}`}>
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${color}`}>
          📍 {message}
        </span>
        {accuracy && (
          <span className="text-xs text-gray-500">
            Accuracy: {accuracy}
          </span>
        )}
      </div>
    </div>
  );
};

const WelcomeCard: React.FC<{
  onGetStarted: () => void;
  onSkip: () => void;
}> = ({ onGetStarted, onSkip }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">👟</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Step-and-Save!
          </h1>
          <p className="text-gray-600">
            Turn your daily steps into valuable NFT coupons that you can spend at local merchants.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-start space-x-3">
            <div className="text-green-500 text-xl">🚶</div>
            <div>
              <h3 className="font-medium text-gray-900">Track Your Steps</h3>
              <p className="text-sm text-gray-600">
                Every 1,000 steps earns you a coupon NFT
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="text-blue-500 text-xl">🎫</div>
            <div>
              <h3 className="font-medium text-gray-900">Mint Coupons</h3>
              <p className="text-sm text-gray-600">
                Convert your steps into tradeable NFT coupons
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="text-purple-500 text-xl">🛍️</div>
            <div>
              <h3 className="font-medium text-gray-900">Spend & Save</h3>
              <p className="text-sm text-gray-600">
                Use coupons at participating merchants for discounts
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onGetStarted}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-lg transition-colors"
          >
            Get Started
          </button>
          <button
            onClick={onSkip}
            className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 transition-colors"
          >
            Skip Introduction
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Main App Component
const HomePage: React.FC = () => {
  const { steps, isTracking, startTracking, stopTracking } = useStepTracking();
  const [showWelcome, setShowWelcome] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMinting, setIsMinting] = useState(false);

  // Check if this is the user's first visit
  useEffect(() => {
    const isFirstVisit = !localStorage.getItem('step-and-save-visited');
    if (isFirstVisit) {
      setShowWelcome(true);
      localStorage.setItem('step-and-save-visited', 'true');
    }
  }, []);

  const handleConnect = () => {
    setIsConnected(true);
    toast.success('Wallet connected! 🎉');
  };

  const handleMintCoupon = async () => {
    setIsMinting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsMinting(false);
    toast.success('Step-Coupon minted successfully! 🎉');
  };

  const stepsToNextCoupon = Math.max(0, 1000 - (steps % 1000));
  const canMintCoupon = steps >= 1000 && isConnected;

  if (showWelcome) {
    return (
      <WelcomeCard
        onGetStarted={() => setShowWelcome(false)}
        onSkip={() => setShowWelcome(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-8 pb-4"
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Step-and-Save
          </h1>
          <p className="text-gray-600 text-sm">
            Walking turns steps into instant discounts
          </p>
        </motion.div>

        {/* Connection Status */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Welcome to Step-and-Save
              </h2>
              <p className="text-gray-600 mb-6">
                Connect your wallet to start earning coupons from your daily steps
              </p>
              <button
                onClick={handleConnect}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Connect Wallet (Demo)
              </button>
            </div>
          </motion.div>
        )}

        {/* Step Counter */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <StepCounter
              steps={steps}
              isTracking={isTracking}
              onStartTracking={startTracking}
              onStopTracking={stopTracking}
            />
          </motion.div>
        )}

        {/* Location Status */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <LocationStatus />
          </motion.div>
        )}

        {/* Coupon Progress */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <CouponProgress
              steps={steps}
              stepsToNext={stepsToNextCoupon}
              canMint={canMintCoupon}
              isLoading={isMinting}
              onMint={handleMintCoupon}
            />
          </motion.div>
        )}

        {/* Quick Stats */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
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
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-gray-500 pb-8"
        >
          Powered by VERY Network • Built for DoraHacks
        </motion.div>
      </div>
    </div>
  );
};

// Simple placeholder pages
const WalletPage = () => (
  <div className="min-h-screen bg-gray-50 p-4">
    <div className="max-w-md mx-auto pt-20">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Wallet</h1>
      <p className="text-gray-600">Wallet functionality coming soon...</p>
    </div>
  </div>
);

const OffersPage = () => (
  <div className="min-h-screen bg-gray-50 p-4">
    <div className="max-w-md mx-auto pt-20">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Available Offers</h1>
      <p className="text-gray-600">Merchant offers coming soon...</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      
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
    </Router>
  );
}

export default App;