import { useState, useEffect } from 'react';
import { getApiHealth } from '@/services/api';

interface ApiStatus {
  isConnected: boolean;
  components: {
    model: string;
    chatbot: string;
  } | null;
  checking: boolean;
  error: string | null;
}

/**
 * Hook to check and monitor API health status
 */
export const useApiStatus = (checkInterval = 60000) => {
  const [status, setStatus] = useState<ApiStatus>({
    isConnected: false,
    components: null,
    checking: true,
    error: null
  });

  const checkApiStatus = async () => {
    setStatus(prev => ({ ...prev, checking: true, error: null }));
    try {
      const response = await getApiHealth();
      setStatus({
        isConnected: response.status === 'healthy',
        components: response.components,
        checking: false,
        error: response.status === 'degraded' ? 'API is in degraded state' : null
      });
    } catch (error) {
      setStatus({
        isConnected: false,
        components: null,
        checking: false,
        error: 'Unable to connect to the API'
      });
    }
  };

  // Check status on mount
  useEffect(() => {
    checkApiStatus();
    
    // Set up interval for checking status if needed
    if (checkInterval > 0) {
      const interval = setInterval(checkApiStatus, checkInterval);
      return () => clearInterval(interval);
    }
  }, [checkInterval]);

  return {
    ...status,
    refreshStatus: checkApiStatus
  };
};