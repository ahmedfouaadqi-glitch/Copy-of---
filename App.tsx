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
import { CameraProvider, useCamera } from './context/CameraContext';
import SplashScreen from './components/SplashScreen';
import { FEATURES } from './constants';
import { Toaster } from 'react-hot-toast';
import BottomNavBar from './components/BottomNavBar';
import OnboardingGuide from './components/OnboardingGuide';
import { playSound } from './services/soundService';


const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>({ type: 'home' });
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { isCameraOpen } = useCamera();

  useEffect(() => {
    const timer = setTimeout(() => {
        setIsLoading(false);
        playSound('start'); // Play start sound
        const hasOnboarded = localStorage.getItem('hasOnboarded');
        if (!hasOnboarded) {
            setShowOnboarding(true);
        }
    }, 1500); // Simulate loading
    return () => clearTimeout(timer);
  }, []);
  
  const handleOnboardingComplete = () => {
    localStorage.setItem('hasOnboarded', 'true');
    setShowOnboarding(false);
  };

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
      <div className="bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 min-h-screen font-sans">
          <div className="pb-20"> {/* Padding bottom to prevent content from being hidden by the nav bar */}
              {renderPage()}
          </div>
          {!isCameraOpen && <BottomNavBar currentPage={currentPage} navigateTo={navigateTo} />}
           {showOnboarding && <OnboardingGuide onComplete={handleOnboardingComplete} />}
      </div>
  );
}


const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AnalysisProvider>
        <CameraProvider>
            <Toaster position="top-center" reverseOrder={false} />
            <AppContent />
        </CameraProvider>
      </AnalysisProvider>
    </ThemeProvider>
  );
};

export default App;
