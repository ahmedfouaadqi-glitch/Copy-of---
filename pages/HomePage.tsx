import React, { useMemo } from 'react';
import { NavigationProps } from '../types';
import { FEATURES } from '../constants';
import FeatureCard from '../components/FeatureCard';
import { HeartPulse } from 'lucide-react';
import { useFeatureUsage } from '../hooks/useFeatureUsage';
import MorningBriefing from '../components/MorningBriefing';

const HomePage: React.FC<NavigationProps> = ({ navigateTo }) => {
  const { getUsageSortedFeatures } = useFeatureUsage();

  const sortedFeatures = useMemo(() => getUsageSortedFeatures(FEATURES), [getUsageSortedFeatures]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col">
      <header className="p-4 flex justify-between items-center bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
            <HeartPulse className="w-8 h-8 text-teal-500" />
            <h1 className="text-xl font-bold text-teal-700 dark:text-gray-200">صحتك/كي</h1>
        </div>
      </header>
      <main className="p-4 flex-grow">
        <MorningBriefing />
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">تطبيق الحياة</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {sortedFeatures.map(feature => (
            <FeatureCard key={feature.pageType} feature={feature} navigateTo={navigateTo} />
          ))}
        </div>
      </main>
      <footer className="text-center p-4">
        <p className="text-xs text-gray-500 dark:text-gray-400">صاحب الفكرة والمالك</p>
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">احمد معروف</p>
      </footer>
    </div>
  );
};

export default HomePage;