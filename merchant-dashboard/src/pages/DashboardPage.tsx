import React from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import {
  ChartBarIcon,
  QrCodeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  PlusIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

import DashboardCard from '../components/DashboardCard';
import RecentActivity from '../components/RecentActivity';
import QuickActions from '../components/QuickActions';
import AnalyticsOverview from '../components/AnalyticsOverview';

import { useMerchantData } from '../hooks/useMerchantData';
import { useMerchantRegistry } from '../hooks/useMerchantRegistry';

const DashboardPage: React.FC = () => {
  const { address } = useAccount();
  const { merchant, isRegistered } = useMerchantRegistry();
  const {
    totalOffers,
    activeOffers,
    totalRedemptions,
    totalRevenue,
    recentActivity,
    isLoading
  } = useMerchantData(address);

  if (!isRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Merchant Registration Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please register as a merchant to access the dashboard.
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Register as Merchant
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {merchant?.name || 'Merchant'}
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your Step-and-Save integration today.
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <DashboardCard
            title="Active Offers"
            value={activeOffers}
            subtitle={`${totalOffers} total offers`}
            icon={<CurrencyDollarIcon className="w-6 h-6" />}
            color="blue"
            loading={isLoading}
          />
          
          <DashboardCard
            title="Total Redemptions"
            value={totalRedemptions}
            subtitle="This month"
            icon={<QrCodeIcon className="w-6 h-6" />}
            color="green"
            loading={isLoading}
          />
          
          <DashboardCard
            title="Revenue Generated"
            value={`${totalRevenue} VERY`}
            subtitle="From coupons"
            icon={<ChartBarIcon className="w-6 h-6" />}
            color="purple"
            loading={isLoading}
          />
          
          <DashboardCard
            title="Customer Reach"
            value="2.3k"
            subtitle="Unique walkers"
            icon={<UserGroupIcon className="w-6 h-6" />}
            color="yellow"
            loading={isLoading}
          />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <QuickActions />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Analytics Overview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <AnalyticsOverview />
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <RecentActivity activities={recentActivity} loading={isLoading} />
          </motion.div>
        </div>

        {/* Performance Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-white rounded-lg shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performance Insights
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">85%</div>
              <div className="text-sm text-gray-600">Coupon Acceptance Rate</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">12.5</div>
              <div className="text-sm text-gray-600">Avg. Steps per Customer</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">4.2x</div>
              <div className="text-sm text-gray-600">ROI on AD VERY Spend</div>
            </div>
          </div>
        </motion.div>

        {/* Tips and Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            💡 Tips to Increase Foot Traffic
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Optimize Offer Timing</h4>
                <p className="text-sm text-gray-600">
                  Peak walking hours are 7-9 AM and 6-8 PM. Schedule offers accordingly.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Increase Discount Percentage</h4>
                <p className="text-sm text-gray-600">
                  Offers with 20%+ discounts have 3x higher acceptance rates.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;