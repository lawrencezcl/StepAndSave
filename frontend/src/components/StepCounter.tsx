import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface StepCounterProps {
  steps: number;
  isTracking: boolean;
  onStartTracking: () => void;
  onStopTracking: () => void;
}

const StepCounter: React.FC<StepCounterProps> = ({
  steps,
  isTracking,
  onStartTracking,
  onStopTracking,
}) => {
  const [animatedSteps, setAnimatedSteps] = useState(steps);

  // Animate step count changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedSteps(steps);
    }, 100);

    return () => clearTimeout(timer);
  }, [steps]);

  // Calculate progress to next coupon (1000 steps = 1 coupon)
  const progressPercentage = ((steps % 1000) / 1000) * 100;
  const stepsToNext = 1000 - (steps % 1000);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl p-6 shadow-lg"
    >
      {/* Header */}
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

      {/* Step Count Circle */}
      <div className="relative mb-6">
        <div className="flex items-center justify-center">
          <div className="relative w-40 h-40">
            {/* Background circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#e5e7eb"
                strokeWidth="6"
                fill="transparent"
              />
              {/* Progress circle */}
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

            {/* Step count in center */}
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

        {/* Tracking indicator */}
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

      {/* Progress Info */}
      <div className="text-center">
        <div className="text-lg font-semibold text-gray-900 mb-1">
          {stepsToNext === 1000 ? '1,000' : stepsToNext.toLocaleString()} steps to next coupon
        </div>
        <div className="text-sm text-gray-600">
          {Math.floor(steps / 1000)} coupons earned today
        </div>
      </div>

      {/* Status */}
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

      {/* Tracking Controls */}
      <div className="mt-4">
        {!isTracking && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onStartTracking}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            Start Tracking Steps
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default StepCounter;