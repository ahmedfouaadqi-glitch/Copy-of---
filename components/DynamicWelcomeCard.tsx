import React from 'react';
import { UserProfile, WeatherInfo, SpiritMessage } from '../types';
import { User, Edit2, Lightbulb, Smile, Sparkles, Bell } from 'lucide-react';

interface DynamicWelcomeCardProps {
  userProfile: UserProfile | null;
  weatherInfo: WeatherInfo | null;
  spiritMessage: SpiritMessage | null;
  onEdit: () => void;
}

const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير،';
    if (hour < 18) return 'يومك سعيد،';
    return 'مساء الخير،';
};

const WeatherIcon: React.FC<{ weather: WeatherInfo }> = ({ weather }) => {
    const displayIcon = !weather.isDay && weather.icon === '☀️' ? '🌙' : weather.icon;
    return <span className="text-2xl">{displayIcon}</span>;
};

const SpiritMessageContent: React.FC<{ spiritMessage: SpiritMessage | null }> = ({ spiritMessage }) => {
    if (!spiritMessage) {
        return <div className="text-sm text-gray-400 text-left flex-1">...جاري تحضير رسالة اليوم</div>;
    }

    const { type, content } = spiritMessage;
    let Icon, title, colorClass;

    switch (type) {
        case 'tip':
            Icon = Lightbulb;
            title = 'همسة اليوم';
            colorClass = 'text-amber-500';
            break;
        case 'joke':
            Icon = Smile;
            title = 'ضحكة اليوم';
            colorClass = 'text-pink-500';
            break;
        case 'hint':
            Icon = Sparkles;
            title = 'تلميح الروح';
            colorClass = 'text-purple-500';
            break;
        case 'alert':
            Icon = Bell;
            title = 'تنبيه ودي';
            colorClass = 'text-red-500';
            break;
        default:
            Icon = Lightbulb;
            title = 'رسالة اليوم';
            colorClass = 'text-gray-500';
    }

    return (
        <div className="flex-1 text-left">
            <div className={`flex items-center justify-end gap-1 text-xs font-semibold ${colorClass}`}>
                <p>{title}</p>
                <Icon size={14} />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 text-left italic mt-1">"{content}"</p>
        </div>
    );
};


const DynamicWelcomeCard: React.FC<DynamicWelcomeCardProps> = ({ userProfile, weatherInfo, spiritMessage, onEdit }) => {
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
                <WeatherIcon weather={weatherInfo} />
                <div>
                    <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{weatherInfo.temperature}°C</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{weatherInfo.condition}</p>
                </div>
            </div>
        ) : (
            <div className="text-sm text-gray-400">...جاري تحميل الطقس</div>
        )}

        <SpiritMessageContent spiritMessage={spiritMessage} />
      </div>
    </div>
  );
};

export default DynamicWelcomeCard;