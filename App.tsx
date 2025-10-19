
import React, { useState, useEffect } from 'react';
import { Page } from './types';
import HomePage from './pages/HomePage';
import ImageAnalysisPage from './pages/ImageAnalysisPage';
import CalorieCounterPage from './pages/CalorieCounterPage';
import SmartHealthPage from './pages/SmartHealthPage';
import PharmacyPage from './pages/PharmacyPage';
import HealthDiaryPage from './pages/HealthDiaryPage';
import ChatPage from './pages/ChatPage';
import MyPlantsPage from './pages/MyPlantsPage';
import GlobalSearchPage from './pages/GlobalSearchPage';

import { ThemeProvider } from './context/ThemeContext';
import { AnalysisProvider } from './context/AnalysisContext';
import SplashScreen from './components/SplashScreen';
import { FEATURES } from './constants';


const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>({ type: 'home' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500); // Simulate loading
    return () => clearTimeout(timer);
  }, []);

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage.type) {
      case 'home':
        return <HomePage navigateTo={navigateTo} />;
      case 'imageAnalysis':
        return <ImageAnalysisPage navigateTo={navigateTo} />;
      case 'calorieCounter':
        return <CalorieCounterPage navigateTo={navigateTo} />;
      case 'smartHealth':
        const healthFeature = FEATURES.find(f => f.pageType === currentPage.pageType);
        if (healthFeature) {
            return <SmartHealthPage feature={healthFeature} navigateTo={navigateTo} />;
        }
        return <HomePage navigateTo={navigateTo} />; // Fallback
      case 'pharmacy':
        return <PharmacyPage navigateTo={navigateTo} />;
      case 'healthDiary':
        return <HealthDiaryPage navigateTo={navigateTo} />;
      case 'chat':
        return <ChatPage navigateTo={navigateTo} />;
      case 'myPlants':
          return <MyPlantsPage navigateTo={navigateTo} />;
      case 'globalSearch':
          return <GlobalSearchPage navigateTo={navigateTo} />;
      case 'schedule': // Handle the new schedule page type
          const scheduleFeature = FEATURES.find(f => f.pageType === currentPage.type);
          if (scheduleFeature) {
              return <SmartHealthPage feature={scheduleFeature} navigateTo={navigateTo} />;
          }
           return <HomePage navigateTo={navigateTo} />; // Fallback
      default:
        return <HomePage navigateTo={navigateTo} />;
    }
  };
  
  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <ThemeProvider>
      <AnalysisProvider>
        <div className="bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 min-h-screen">
          {renderPage()}
        </div>
      </AnalysisProvider>
    </ThemeProvider>
  );
};

export default App;