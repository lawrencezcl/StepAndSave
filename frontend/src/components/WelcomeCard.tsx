import React from 'react';

interface WelcomeCardProps {
  onGetStarted: () => void;
  onSkip: () => void;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({ onGetStarted, onSkip }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full">
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
      </div>
    </div>
  );
};

export default WelcomeCard;