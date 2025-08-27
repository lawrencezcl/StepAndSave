import React from 'react';

interface CouponProgressProps {
  steps: number;
  stepsToNext: number;
  canMint: boolean;
  isLoading: boolean;
  onMint: () => void;
}

const CouponProgress: React.FC<CouponProgressProps> = ({
  steps,
  stepsToNext,
  canMint,
  isLoading,
  onMint,
}) => {
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
          <div
            className="bg-green-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
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

export default CouponProgress;