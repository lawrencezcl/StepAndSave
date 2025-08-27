import React from 'react';
import { useParams } from 'react-router-dom';

const CouponDetailPage: React.FC = () => {
  const { tokenId } = useParams<{ tokenId: string }>();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Coupon Details
        </h1>
        <p className="text-gray-600">Token ID: {tokenId}</p>
        <p className="text-gray-600">Coupon details coming soon...</p>
      </div>
    </div>
  );
};

export default CouponDetailPage;