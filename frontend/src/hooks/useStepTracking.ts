import { useState, useEffect, useCallback } from 'react';
import CryptoJS from 'crypto-js';

interface StepData {
  count: number;
  timestamp: number;
  proofHash: string;
}

export const useStepTracking = () => {
  const [steps, setSteps] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());

  // Simulate step counting (in a real app, this would interface with device sensors)
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTracking) {
      interval = setInterval(() => {
        // Simulate steps being added (1-5 steps every 2 seconds when active)
        const newSteps = Math.floor(Math.random() * 5) + 1;
        setSteps(prev => {
          const updated = prev + newSteps;
          
          // Store steps locally
          localStorage.setItem('step-and-save-steps', updated.toString());
          localStorage.setItem('step-and-save-last-update', Date.now().toString());
          
          return updated;
        });
        
        setLastUpdateTime(Date.now());
      }, 2000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTracking]);

  // Load steps from localStorage on mount
  useEffect(() => {
    const savedSteps = localStorage.getItem('step-and-save-steps');
    const savedTime = localStorage.getItem('step-and-save-last-update');
    
    if (savedSteps) {
      const stepCount = parseInt(savedSteps, 10);
      const timeStamp = savedTime ? parseInt(savedTime, 10) : Date.now();
      
      // Check if saved data is from today
      const now = new Date();
      const savedDate = new Date(timeStamp);
      const isToday = now.toDateString() === savedDate.toDateString();
      
      if (isToday) {
        setSteps(stepCount);
        setLastUpdateTime(timeStamp);
      } else {
        // Reset for new day
        setSteps(0);
        localStorage.removeItem('step-and-save-steps');
        localStorage.removeItem('step-and-save-last-update');
      }
    }
  }, []);

  // Generate ZK proof hash (simplified simulation)
  const generateProofHash = useCallback((stepCount: number, timestamp: number): string => {
    const deviceId = getDeviceId();
    const data = `${stepCount}-${timestamp}-${deviceId}`;
    return CryptoJS.SHA256(data).toString();
  }, []);

  // Get or create device ID
  const getDeviceId = (): string => {
    let deviceId = localStorage.getItem('step-and-save-device-id');
    if (!deviceId) {
      deviceId = CryptoJS.lib.WordArray.random(16).toString();
      localStorage.setItem('step-and-save-device-id', deviceId);
    }
    return deviceId;
  };

  // Create step attestation data
  const createStepAttestation = useCallback((): StepData => {
    const timestamp = Date.now();
    const proofHash = generateProofHash(steps, timestamp);
    
    return {
      count: steps,
      timestamp,
      proofHash
    };
  }, [steps, generateProofHash]);

  // Request permission for device motion (for real implementation)
  const requestMotionPermission = useCallback(async (): Promise<boolean> => {
    if (typeof DeviceMotionEvent !== 'undefined' && 
        typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        return permission === 'granted';
      } catch (error) {
        console.error('Motion permission request failed:', error);
        return false;
      }
    }
    return true; // Assume granted for non-iOS devices
  }, []);

  // Start step tracking
  const startTracking = useCallback(async () => {
    const hasPermission = await requestMotionPermission();
    if (hasPermission) {
      setIsTracking(true);
    } else {
      throw new Error('Motion permission required for step tracking');
    }
  }, [requestMotionPermission]);

  // Stop step tracking
  const stopTracking = useCallback(() => {
    setIsTracking(false);
  }, []);

  // Reset steps (for testing)
  const resetSteps = useCallback(() => {
    setSteps(0);
    localStorage.removeItem('step-and-save-steps');
    localStorage.removeItem('step-and-save-last-update');
  }, []);

  // Manually add steps (for testing)
  const addSteps = useCallback((count: number) => {
    setSteps(prev => {
      const updated = prev + count;
      localStorage.setItem('step-and-save-steps', updated.toString());
      localStorage.setItem('step-and-save-last-update', Date.now().toString());
      return updated;
    });
  }, []);

  // Get step history for verification
  const getStepHistory = useCallback((): StepData[] => {
    const history = localStorage.getItem('step-and-save-history');
    return history ? JSON.parse(history) : [];
  }, []);

  // Save step verification to history
  const saveStepVerification = useCallback((stepData: StepData) => {
    const history = getStepHistory();
    history.push(stepData);
    
    // Keep only last 100 verifications
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    localStorage.setItem('step-and-save-history', JSON.stringify(history));
  }, [getStepHistory]);

  return {
    steps,
    isTracking,
    lastUpdateTime,
    startTracking,
    stopTracking,
    resetSteps,
    addSteps,
    createStepAttestation,
    getStepHistory,
    saveStepVerification,
    canMintCoupon: steps >= 1000
  };
};