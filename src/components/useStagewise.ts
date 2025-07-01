import { useEffect } from 'react';
import { initializeStageWiseToolbar, stagewiseConfig } from '@/lib/stagewise';

/**
 * Custom hook to initialize Stagewise toolbar in specific components
 * Useful if you want to initialize Stagewise only on certain pages
 */
export function useStagewise(config = stagewiseConfig) {
  useEffect(() => {
    initializeStageWiseToolbar(config);
  }, [config]);
}

/**
 * Hook to conditionally initialize Stagewise based on a condition
 */
export function useConditionalStagewise(condition: boolean, config = stagewiseConfig) {
  useEffect(() => {
    if (condition) {
      initializeStageWiseToolbar(config);
    }
  }, [condition, config]);
} 