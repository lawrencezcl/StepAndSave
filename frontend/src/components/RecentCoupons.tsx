import React from 'react';

interface RecentCouponsProps {
  address?: string;
}

const RecentCoupons: React.FC<RecentCouponsProps> = ({ address }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h3 className="font-semibold text-gray-900 mb-4">Recent Coupons</h3>
      <div className="text-center text-gray-500 py-8">
        <p>No coupons minted yet</p>
        <p className="text-sm mt-2">
          Take 1,000 steps to mint your first coupon!
        </p>
      </div>
    </div>
  );
};

export default RecentCoupons;