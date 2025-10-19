import React from 'react';
import { HeartPulse } from 'lucide-react';

const SplashScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-teal-50 dark:bg-black">
      <HeartPulse className="w-24 h-24 text-teal-500 dark:text-teal-400 animate-pulse" />
      <h1 className="text-3xl font-bold text-teal-700 dark:text-gray-200 mt-4">صحتك/كي</h1>
      <p className="text-teal-600 dark:text-gray-400 mt-2">...جارٍ تهيئة الروح الرقمية</p>
    </div>
  );
};

export default SplashScreen;