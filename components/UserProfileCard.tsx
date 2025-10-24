import React from 'react';
import { UserProfile } from '../types';
import { User, Edit2 } from 'lucide-react';

interface UserProfileCardProps {
  userProfile: UserProfile | null;
  onEdit: () => void;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ userProfile, onEdit }) => {
  if (!userProfile) {
    return null; // Or a placeholder/skeleton
  }

  return (
    <div className="bg-white dark:bg-black p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 flex items-center justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
          <User className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">مرحباً بعودتك،</p>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{userProfile.name}</h2>
        </div>
      </div>
      <button 
        onClick={onEdit}
        className="p-3 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
        aria-label="تعديل الملف الشخصي"
      >
        <Edit2 size={20} />
      </button>
    </div>
  );
};

export default UserProfileCard;