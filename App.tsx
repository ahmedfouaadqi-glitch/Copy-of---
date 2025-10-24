import React, { useState, useEffect } from 'react';
import { Page, UserProfile } from './types';
import HomePage from './pages/HomePage';
import ImageAnalysisPage from './pages/ImageAnalysisPage';
import CalorieCounterPage from './pages/CalorieCounterPage';
import SmartHealthPage from './pages/SmartHealthPage';
import PharmacyPage from './pages/PharmacyPage';
import HealthDiaryPage from './pages/HealthDiaryPage';
import ChatPage from './pages/ChatPage';
import MyPlantsPage from './pages/MyPlantsPage';
import GlobalSearchPage from './pages/GlobalSearchPage';
import SportsTrainerPage from './pages/SportsTrainerPage';
import ShoppingListPage from './pages/ShoppingListPage';
import ChallengesPage from './pages/ChallengesPage';
import CommunityInspirationsPage from './pages/CommunityInspirationsPage';
import DietPlanPage from './pages/DietPlanPage';
import FavoriteMoviesPage from './pages/FavoriteMoviesPage';
import ImageEditingPage from './pages/ImageEditingPage';
import VideoAnalysisPage from './pages/VideoAnalysisPage';
import VideoGenerationPage from './pages/VideoGenerationPage';
import LiveConversationPage from './pages/LiveConversationPage';
import TranscriptionPage from './pages/TranscriptionPage';
import UserProfileSetupPage from './pages/UserProfileSetupPage';


import { ThemeProvider } from './context/ThemeContext';
import { AnalysisProvider } from './context/AnalysisContext';
import { CameraProvider, useCamera } from './context/CameraContext';
import SplashScreen from './components/SplashScreen';
import { FEATURES } from './constants';
import { Toaster } from 'react-hot-toast';
import BottomNavBar from './components/BottomNavBar';
import OnboardingGuide from './components/OnboardingGuide';
import { playSound } from './services/soundService';
import { getActiveChallenges } from './services/challengeService';
import { getUserProfile } from './services/profileService';


const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>({ type: 'home' });
  const [isLoading, setIsLoading] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { isCameraOpen } = useCamera();
  const [diaryIndicatorActive, setDiaryIndicatorActive] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);


  useEffect(() => {
    const timer = setTimeout(() => {
        setIsLoading(false);
        playSound('start');

        const hasSetup = localStorage.getItem('hasCompletedProfileSetup');
        if (!hasSetup) {
            setShowProfileSetup(true);
        } else {
            setUserProfile(getUserProfile());
            const hasOnboarded = localStorage.getItem('hasOnboarded');
            if (!hasOnboarded) {
                setShowOnboarding(true);
            }
        }
    }, 1500);
    
    // Indicator logic
    const lastBriefingDate = localStorage.getItem('lastBriefingShownDate');
    const today = new Date().toDateString();
    const isBriefingNew = lastBriefingDate !== today;
    const activeChallenges = getActiveChallenges();
    const hasActiveChallenge = activeChallenges.length > 0;

    setDiaryIndicatorActive(isBriefingNew || hasActiveChallenge);

    return () => clearTimeout(timer);
  }, []);
  
  const handleProfileSetupComplete = () => {
    localStorage.setItem('hasCompletedProfileSetup', 'true');
    setShowProfileSetup(false);
    setUserProfile(getUserProfile()); // Refresh profile after setup
    const hasOnboarded = localStorage.getItem('hasOnboarded');
    if (!hasOnboarded) {
        setShowOnboarding(true);
    }
  };

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
        return <HomePage navigateTo={navigateTo} diaryIndicatorActive={diaryIndicatorActive} userProfile={userProfile} />;
      case 'imageAnalysis':
        return <ImageAnalysisPage navigateTo={navigateTo} />;
      case 'calorieCounter':
        return <CalorieCounterPage navigateTo={navigateTo} />;
      case 'smartHealth':
        const healthFeature = FEATURES.find(f => f.pageType === currentPage.pageType);
        if (healthFeature) {
            return <SmartHealthPage feature={healthFeature} navigateTo={navigateTo} />;
        }
        return <HomePage navigateTo={navigateTo} diaryIndicatorActive={diaryIndicatorActive} userProfile={userProfile}/>; // Fallback
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
      case 'sportsTrainer':
          return <SportsTrainerPage navigateTo={navigateTo} />;
      case 'shoppingList':
          return <ShoppingListPage navigateTo={navigateTo} />;
      case 'challenges':
          return <ChallengesPage navigateTo={navigateTo} />;
      case 'communityInspirations':
          return <CommunityInspirationsPage navigateTo={navigateTo} />;
      case 'dietPlan':
          return <DietPlanPage navigateTo={navigateTo} />;
      case 'favoriteMovies':
          return <FavoriteMoviesPage navigateTo={navigateTo} />;
      case 'imageEditing':
          return <ImageEditingPage navigateTo={navigateTo} />;
      case 'videoAnalysis':
          return <VideoAnalysisPage navigateTo={navigateTo} />;
      case 'videoGeneration':
          return <VideoGenerationPage navigateTo={navigateTo} />;
      case 'liveConversation':
          return <LiveConversationPage navigateTo={navigateTo} />;
      case 'transcription':
          return <TranscriptionPage navigateTo={navigateTo} />;
      default:
        // Check if it's a smartHealth pageType that was passed without the container type
        const page = currentPage as any;
        const possibleFeature = FEATURES.find(f => f.pageType === page.type);
        if(possibleFeature && possibleFeature.page.type === 'smartHealth') {
            return <SmartHealthPage feature={possibleFeature} navigateTo={navigateTo} />;
        }
        return <HomePage navigateTo={navigateTo} diaryIndicatorActive={diaryIndicatorActive} userProfile={userProfile} />;
    }
  };
  
  if (isLoading) {
    return <SplashScreen />;
  }
  
  if (showProfileSetup) {
    return <UserProfileSetupPage onComplete={handleProfileSetupComplete} />;
  }
  
  return (
      <div className="bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 min-h-screen font-sans">
          <div className="pb-20"> {/* Padding for classic nav bar */}
              {renderPage()}
          </div>
          {!isCameraOpen && <BottomNavBar currentPage={currentPage} navigateTo={navigateTo} diaryIndicatorActive={diaryIndicatorActive} />}
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