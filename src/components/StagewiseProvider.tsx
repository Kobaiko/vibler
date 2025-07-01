'use client'

import { useEffect } from 'react';
import { setupStagewise } from '@/lib/stagewise';

export function StagewiseProvider() {
  useEffect(() => {
    // Initialize Stagewise toolbar when component mounts (client-side only)
    setupStagewise();
  }, []);

  // This component doesn't render anything, it just sets up Stagewise
  return null;
} 