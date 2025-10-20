import { useCallback } from 'react';
import { Feature } from '../types';

const USAGE_STATS_KEY = 'featureUsageStats';

interface UsageStats {
  [key: string]: number;
}

export const useFeatureUsage = () => {
  const getUsageStats = useCallback((): UsageStats => {
    try {
      const stats = localStorage.getItem(USAGE_STATS_KEY);
      return stats ? JSON.parse(stats) : {};
    } catch {
      return {};
    }
  }, []);

  const trackFeatureUsage = useCallback((pageType: string) => {
    const stats = getUsageStats();
    stats[pageType] = (stats[pageType] || 0) + 1;
    localStorage.setItem(USAGE_STATS_KEY, JSON.stringify(stats));
  }, [getUsageStats]);

  const getUsageSortedFeatures = useCallback((features: Feature[]): Feature[] => {
    const stats = getUsageStats();
    const sortedFeatures = [...features].sort((a, b) => {
      const usageA = stats[a.pageType] || 0;
      const usageB = stats[b.pageType] || 0;
      return usageB - usageA;
    });
    return sortedFeatures;
  }, [getUsageStats]);

  return { trackFeatureUsage, getUsageSortedFeatures };
};
