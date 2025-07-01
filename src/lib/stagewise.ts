// Stagewise toolbar setup for Vibler
import { initToolbar } from '@stagewise/toolbar';

// Define your toolbar configuration
const stagewiseConfig = {
  plugins: [],
  // Add any additional configuration options here
  // For example:
  // position: 'bottom-right',
  // theme: 'dark',
  // etc.
};

// Initialize the toolbar when your app starts
// Framework-agnostic approach - call this when your app initializes
export function setupStagewise() {
  // Only initialize once and only in development mode
  if (process.env.NODE_ENV === 'development') {
    try {
      initToolbar(stagewiseConfig);
      console.log('🚀 Stagewise toolbar initialized successfully');
    } catch (error) {
      console.warn('⚠️ Failed to initialize Stagewise toolbar:', error);
    }
  }
}

// Alternative setup function that can be called conditionally
export function initializeStageWiseToolbar(config = stagewiseConfig) {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    try {
      initToolbar(config);
      console.log('🚀 Stagewise toolbar initialized');
    } catch (error) {
      console.error('Failed to initialize Stagewise toolbar:', error);
    }
  }
}

// Export the config in case you want to modify it elsewhere
export { stagewiseConfig }; 