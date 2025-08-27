import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import StepCounter from '../components/StepCounter';
import ConnectWallet from '../components/ConnectWallet';
import CouponProgress from '../components/CouponProgress';
import RecentCoupons from '../components/RecentCoupons';
import LocationStatus from '../components/LocationStatus';
import WelcomeCard from '../components/WelcomeCard';

// Mock hooks for testing
const useStepTracking = () => {
  const [steps, setSteps] = useState(2350);
  const [isTracking, setIsTracking] = useState(false);
  
  const startTracking = () => setIsTracking(true);
  const stopTracking = () => setIsTracking(false);
  
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

const useAccount = () => ({ address: null, isConnected: false });
const useStepCouponFactory = () => ({ 
  mintCoupon: async () => { await new Promise(r => setTimeout(r, 1000)); }, 
  isLoading: false 
});
const useGeolocation = () => ({ 
  position: { coords: { latitude: 37.5665, longitude: 126.9780, accuracy: 10 } }, 
  error: null 
});

const HomePage: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { steps, isTracking, startTracking, stopTracking } = useStepTracking();
  const { mintCoupon, isLoading: isMinting } = useStepCouponFactory();
  const { position, error: locationError } = useGeolocation();

  const [showWelcome, setShowWelcome] = useState(false);

  // Check if this is the user's first visit
  useEffect(() => {
    const isFirstVisit = !localStorage.getItem('step-and-save-visited');
    if (isFirstVisit) {
      setShowWelcome(true);
      localStorage.setItem('step-and-save-visited', 'true');
    }
  }, []);

  // Auto-start step tracking when wallet is connected
  useEffect(() => {
    if (isConnected && !isTracking) {
      startTracking();
    }
  }, [isConnected, isTracking, startTracking]);

  const handleMintCoupon = async () => {
    if (!position) {
      toast.error('Location access required to mint coupons');
      return;
    }

    try {
      await mintCoupon(position);
      toast.success('Step-Coupon minted successfully! 🎉');
    } catch (error) {
      toast.error('Failed to mint coupon. Please try again.');
      console.error('Minting error:', error);
    }
  };

  const stepsToNextCoupon = Math.max(0, 1000 - (steps % 1000));
  const canMintCoupon = steps >= 1000 && isConnected && position;

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
            <ConnectWallet />
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
            <LocationStatus
              position={position}
              error={locationError}
            />
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

        {/* Recent Coupons */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <RecentCoupons address={address} />
          </motion.div>
        )}

        {/* Quick Stats */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
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
          transition={{ delay: 0.6 }}
          className="text-center text-xs text-gray-500 pb-8"
        >
          Powered by VERY Network • Built for DoraHacks
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;