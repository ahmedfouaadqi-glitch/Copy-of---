import React from 'react';
import { Page, NavigationProps } from '../types';
import { Home, Camera, NotebookText, MessageCircle, Search, BrainCircuit } from 'lucide-react';
import { useFeatureUsage } from '../hooks/useFeatureUsage';

interface BottomNavBarProps extends NavigationProps {
  currentPage: Page;
}

const NAV_ITEMS = [
  { page: { type: 'home' } as Page, pageType: 'home', Icon: Home, label: 'الرئيسية' },
  { page: { type: 'imageAnalysis' } as Page, pageType: 'imageAnalysis', Icon: Camera, label: 'الكاميرا' },
  { page: { type: 'healthDiary' } as Page, pageType: 'healthDiary', Icon: NotebookText, label: 'يومياتي' },
  { page: { type: 'chat' } as Page, pageType: 'chat', Icon: BrainCircuit, label: 'الدردشة' },
  { page: { type: 'globalSearch' } as Page, pageType: 'globalSearch', Icon: Search, label: 'البحث' },
];

const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentPage, navigateTo }) => {
  const { trackFeatureUsage } = useFeatureUsage();

  const handleNavigation = (page: Page, pageType: string) => {
    trackFeatureUsage(pageType);
    navigateTo(page);
  };

  const isCurrentPage = (itemPage: Page): boolean => {
    if (currentPage.type === 'smartHealth' && 'pageType' in itemPage) {
        return currentPage.pageType === (itemPage as any).pageType;
    }
    return currentPage.type === itemPage.type;
  };
    
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 shadow-t-lg z-50">
      <div className="flex justify-around max-w-4xl mx-auto">
        {NAV_ITEMS.map(({ page, pageType, Icon, label }) => {
          const isActive = isCurrentPage(page);
          return (
            <button
              key={page.type}
              onClick={() => handleNavigation(page, pageType)}
              className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs transition-colors duration-200 ${
                isActive
                  ? 'text-teal-500 dark:text-teal-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-400'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span>{label}</span>
               {isActive && <div className="w-8 h-1 bg-teal-500 rounded-full mt-1"></div>}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavBar;