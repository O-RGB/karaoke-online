import { useEffect } from 'react';
import useOrientationStore from '@/stores/orientation-store';

export const useOrientation = () => {
  const {
    orientation,
    isMobile,
    initializeOrientationListeners,
  } = useOrientationStore();

  useEffect(() => {
    const cleanup = initializeOrientationListeners();
    return cleanup;
  }, [initializeOrientationListeners]);

  return {
    orientation,
    isMobile,
  };
};