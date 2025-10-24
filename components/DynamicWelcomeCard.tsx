import React from 'react';
import { UserProfile, WeatherInfo } from '../types';
import { User, Edit2, Sun, Cloud, CloudRain, Snowflake, Zap, Wind } from 'lucide-react';

interface DynamicWelcomeCardProps {
  userProfile: UserProfile | null;
  weatherInfo: WeatherInfo | null;
  dailyTip: string | null;
  onEdit: () => void;
}

const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير،';
    if (hour < 18) return 'مساء الخير،';
    return 'مساء الخير،';
};

// A simple component to render the weather icon emoji
const WeatherIcon: React.FC<{ icon: string }> = ({ icon }) => {
    return <span className="text-2xl">{icon}</span>;
};


const DynamicWelcomeCard: React.FC<DynamicWelcomeCardProps> = ({ userProfile, weatherInfo, dailyTip, onEdit }) => {
  if (!userProfile) {
    return null;
  }

  const greeting = getGreeting();

  return (
    <div className="bg-white dark:bg-black p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:shadow-lg mb-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-md text-gray-500 dark:text-gray-400">{greeting}</p>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{userProfile.name}</h2>
        </div>
        <button 
          onClick={onEdit}
          className="p-3 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors flex-shrink-0"
          aria-label="تعديل الملف الشخصي"
        >
          <Edit2 size={20} />
        </button>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between gap-4">
        {weatherInfo ? (
            <div className="flex items-center gap-2">
                <WeatherIcon icon={weatherInfo.icon} />
                <div>
                    <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{weatherInfo.temperature}°C</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{weatherInfo.condition}</p>
                </div>
            </div>
        ) : (
            <div className="text-sm text-gray-400">...جاري تحميل الطقس</div>
        )}

        {dailyTip ? (
             <p className="text-sm text-gray-600 dark:text-gray-300 text-left flex-1 italic">"{dailyTip}"</p>
        ): (
             <div className="text-sm text-gray-400 text-left flex-1">...جاري تحميل النصيحة</div>
        )}
      </div>
    </div>
  );
};

export default DynamicWelcomeCard;
