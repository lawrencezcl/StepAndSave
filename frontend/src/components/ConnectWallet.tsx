import React from 'react';

const ConnectWallet: React.FC = () => {
  const handleConnect = () => {
    alert('Wallet connection simulation - Web3 features disabled for Node.js 14 compatibility');
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

export default ConnectWallet;