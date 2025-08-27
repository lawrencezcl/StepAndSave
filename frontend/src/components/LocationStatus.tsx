import React from 'react';

interface LocationStatusProps {
  position?: GeolocationPosition | null;
  error?: GeolocationPositionError | null;
}

const LocationStatus: React.FC<LocationStatusProps> = ({ position, error }) => {
  const getLocationStatus = () => {
    if (error) {
      return {
        status: 'error',
        message: 'Location access denied',
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      };
    }
    
    if (position) {
      return {
        status: 'success',
        message: 'Location detected',
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      };
    }
    
    return {
      status: 'loading',
      message: 'Getting location...',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    };
  };

  const { message, color, bgColor } = getLocationStatus();

  return (
    <div className={`rounded-2xl p-4 ${bgColor}`}>
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${color}`}>
          📍 {message}
        </span>
        {position && (
          <span className="text-xs text-gray-500">
            Accuracy: ~{Math.round(position.coords.accuracy)}m
          </span>
        )}
      </div>
    </div>
  );
};

export default LocationStatus;