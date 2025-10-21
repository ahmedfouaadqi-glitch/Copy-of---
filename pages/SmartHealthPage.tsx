import React, { useState, useEffect, useMemo } from 'react';
import { NavigationProps, Feature, PageType } from '../types';
import { callGeminiApi, suggestMovieBasedOnDiary } from '../services/geminiService';
import { addItemToShoppingList } from '../services/shoppingListService';
import { addFavoriteMovie } from '../services/movieService';
import PageHeader from '../components/PageHeader';
import { Sparkles, ShoppingCart, CheckCircle, Heart } from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import Feedback from '../components/Feedback';
import { PERSONAL_ADVISOR_BEAUTY_SUB_FEATURES, DECORATIONS_SUB_FEATURES, SCHEDULE_SUB_FEATURES, GAMING_ADVISOR_SUB_FEATURES, FINANCIAL_ADVISOR_SUB_FEATURES, AUTO_TECH_ADVISOR_SUB_FEATURES } from '../constants';
import { useAnalysis } from '../context/AnalysisContext';
import MediaInput from '../components/MediaInput';
import FollowUpChat from '../components/FollowUpChat';
import toast from 'react-hot-toast';
import TTSButton from '../components/TTSButton';

interface SmartHealthPageProps extends NavigationProps {
  feature: Feature;
}

type SubCategory = {
  id: string;
  name: string;
  icon: string;
  prompt?: string;
  requiresImage?: boolean;
  page?: any;
  subCategories?: SubCategory[];
};

const SHOPPING_LIST_HEADER = "🛍️ منتجات مقترحة";

const SmartHealthPage: React.FC<SmartHealthPageProps> = ({ feature, navigateTo }) => {
  const [navigationStack, setNavigationStack] = useState<SubCategory[]>([]);
  const [result, setResult] = useState('');
  const [mainResult, setMainResult] = useState('');
  const [shoppingListItems, setShoppingListItems] = useState<string[]>([]);
  const [addedItems, setAddedItems] = useState<string[]>([]);
  const [suggestedMovieTitle, setSuggestedMovieTitle] = useState<string | null>(null);
  const [isMovieAdded, setIsMovieAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseId, setResponseId] = useState<string | null>(null);
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [initialUserQuery, setInitialUserQuery] = useState('');
  
  const { analysisData, setAnalysisData } = useAnalysis();

  const categories = useMemo(() => {
    switch (feature.pageType) {
      case 'beauty':
        return PERSONAL_ADVISOR_BEAUTY_SUB_FEATURES.subCategories;
      case 'decorations':
        return DECORATIONS_SUB_FEATURES.subCategories;
      case 'schedule':
        return SCHEDULE_SUB_FEATURES.subCategories;
      case 'gaming':
        return GAMING_ADVISOR_SUB_FEATURES.subCategories;
      case 'financial':
        return FINANCIAL_ADVISOR_SUB_FEATURES.subCategories;
      case 'auto':
        return AUTO_TECH_ADVISOR_SUB_FEATURES.subCategories;
      default:
        return [];
    }
  }, [feature.pageType]);

  useEffect(() => {
    if (analysisData) {
        if (analysisData.image && !localImage) {
            setLocalImage(analysisData.image);
        }

        if (analysisData.analysisType === 'skin' && feature.pageType === 'beauty') {
            const skinCareBranch = categories.find(c => c.id === 'skincare');
            if (skinCareBranch && 'subCategories' in skinCareBranch && skinCareBranch.subCategories) {
                const skinType = analysisData.analysisDetails?.toLowerCase();
                let targetCategory;
                
                if (skinType?.includes('دهنية')) targetCategory = skinCareBranch.subCategories.find(sc => sc.id === 'skin-oily');
                else if (skinType?.includes('جافة')) targetCategory = skinCareBranch.subCategories.find(sc => sc.id === 'skin-type');
                else if (skinType?.includes('مختلطة')) targetCategory = skinCareBranch.subCategories.find(sc => sc.id === 'skin-combo');
                
                if (targetCategory) {
                     setNavigationStack([skinCareBranch, targetCategory]);
                } else {
                     setNavigationStack([skinCareBranch]);
                }
            }
            setAnalysisData(null); 
        }
    }
  }, [analysisData, categories, feature.pageType, setAnalysisData, localImage]);
  
  const currentCategories = navigationStack.length > 0 ? navigationStack[navigationStack.length - 1].subCategories : categories;
  const currentSubTitle = navigationStack.length > 0 ? navigationStack.map(item => item.name).join(' > ') : undefined;

  const resetState = () => {
    setResult('');
    setMainResult('');
    setShoppingListItems([]);
    setAddedItems([]);
    setSuggestedMovieTitle(null);
    setIsMovieAdded(false);
    setIsLoading(false);
    setError(null);
    setResponseId(null);
    setLocalImage(null);
    setInitialUserQuery('');
  };

  const handleBack = () => {
    if (result || error) {
      setResult('');
      setMainResult('');
      setShoppingListItems([]);
      setAddedItems([]);
      setSuggestedMovieTitle(null);
      setIsMovieAdded(false);
      setError(null);
      setInitialUserQuery('');
    } else if (navigationStack.length > 0) {
      setNavigationStack(prev => prev.slice(0, -1));
    } else {
      navigateTo({ type: 'home' });
    }
  };
  
  const handleAddToShoppingList = (item: string) => {
      addItemToShoppingList({
          id: `item-${Date.now()}-${Math.random()}`,
          name: item,
          relatedFeature: feature.pageType as PageType,
          isChecked: false,
      });
      setAddedItems(prev => [...prev, item]);
      toast.success(`تمت إضافة "${item}" إلى قائمة التسوق!`);
  };
  
  const handleAddMovieToFavorites = () => {
    if (suggestedMovieTitle && result) {
        addFavoriteMovie({
            title: suggestedMovieTitle,
            details: result,
        });
        setIsMovieAdded(true);
        toast.success(`تمت إضافة "${suggestedMovieTitle}" إلى أفلامك المفضلة!`);
    }
  };

  const handleCategorySelect = async (category: SubCategory) => {
    if (category.page) {
        navigateTo(category.page);
        return;
    }
    
    if (category.subCategories && category.subCategories.length > 0) {
      setNavigationStack([...navigationStack, category]);
    } else {
      const fullStack = [...navigationStack, category];
      let prompt = `**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت خبير في مجال "${feature.title}". `;
      prompt += fullStack.map(s => s.prompt).filter(Boolean).join(' ');

      if (category.requiresImage && !localImage) {
        setError("هذه الميزة تتطلب رفع صورة أولاً.");
        return;
      }
      
      let fullPrompt = `بناءً على الاختيارات التالية: ${fullStack.map(s => s.name).join(' -> ')}. ${prompt}`;
      setInitialUserQuery(fullPrompt);
      
      if (category.id === 'product_analysis' && analysisData?.analysisDetails) {
          fullPrompt += ` مع الأخذ في الاعتبار أن نوع بشرة المستخدم هو ${analysisData.analysisDetails}.`;
      }

      setIsLoading(true);
      resetState(); // Reset partially to clear previous results

      try {
        let apiResult = '';
        if (category.prompt === 'special_case_movie_suggestion') {
            apiResult = await suggestMovieBasedOnDiary();
        } else {
            const imagePayload = localImage ? [{
                mimeType: localImage.match(/data:(.*);base64,/)?.[1] || 'image/jpeg',
                data: localImage.split(',')[1]
            }] : undefined;
            apiResult = await callGeminiApi(fullPrompt, imagePayload);
        }
        
        setResult(apiResult);
        
        // Handle shopping list parsing
        if (apiResult.includes(SHOPPING_LIST_HEADER)) {
            const parts = apiResult.split(SHOPPING_LIST_HEADER);
            setMainResult(parts[0]);
            const listPart = parts[1].split('\n').filter(line => line.trim() !== '' && !line.includes('منتجات مقترحة'));
            setShoppingListItems(listPart.map(item => item.replace(/[-*]\s*/, '').trim()));
        } else {
            setMainResult(apiResult);
            setShoppingListItems([]);
        }

        // Handle movie title parsing
        const titleMatch = apiResult.match(/اسم الفيلم:\s*(.*)/);
        if (titleMatch && titleMatch[1]) {
            setSuggestedMovieTitle(titleMatch[1].trim());
        } else {
            setSuggestedMovieTitle(null);
        }

        setResponseId(`smart-health-${Date.now()}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const requiresImageForSomeSubcategories = useMemo(() => 
    (currentCategories || []).some(cat => cat.requiresImage), 
  [currentCategories]);


  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen">
      <PageHeader 
        onBack={handleBack} 
        navigateTo={navigateTo} 
        title={feature.title} 
        subTitle={currentSubTitle}
        Icon={feature.Icon} 
        color={feature.color} 
      />
      <main className="p-4">
        {result === '' && !isLoading && !error && (
          <div className="bg-white dark:bg-black p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
             
            {requiresImageForSomeSubcategories && (
                 <MediaInput image={localImage} onImageChange={setLocalImage} onClearImage={() => setLocalImage(null)} promptText="ارفع صورة للاستشارة البصرية" />
            )}

            <div className="flex items-center justify-between mt-4">
                <h3 className="font-bold text-gray-700 dark:text-gray-300">
                    {navigationStack.length > 0 ? navigationStack[navigationStack.length-1].name : 'اختر الخدمة:'}
                </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {currentCategories?.map(category => {
                const isDisabled = !!(category.requiresImage && !localImage);
                return (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category)}
                      disabled={isDisabled}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-right flex items-center gap-4 bg-${feature.color}-50/50 dark:bg-black border-${feature.color}-500/30 ${isDisabled ? 'opacity-50 cursor-not-allowed' : `hover:border-${feature.color}-500 hover:bg-${feature.color}-50/80 dark:hover:bg-${feature.color}-500/10 active:scale-95`}`}
                    >
                      <span className="text-2xl">{category.icon}</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{category.name}</span>
                    </button>
                )
              })}
            </div>
          </div>
        )}
        
        {isLoading && (
          <div className="text-center p-4">
            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 border-${feature.color}-500 mx-auto`}></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">...الخبير يفكر الآن</p>
          </div>
        )}
        {error && (
          <div className="bg-red-100 dark:bg-black border border-red-300 dark:border-red-500/50 text-red-800 dark:text-red-300 p-4 rounded-lg shadow-md">
            <h3 className="font-bold mb-2">حدث خطأ</h3>
            <p>{error}</p>
          </div>
        )}
        {result && (
          <div className={`bg-${feature.color}-50 dark:bg-black p-4 rounded-lg shadow-md border border-${feature.color}-200 dark:border-${feature.color}-500/50`}>
            <div className="flex justify-between items-start">
              <h3 className={`text-lg font-bold mb-2 flex items-center gap-2 text-${feature.color}-700 dark:text-${feature.color}-300`}>
                <Sparkles size={20} />
                نصيحة الخبراء
              </h3>
              <TTSButton textToRead={result} />
            </div>
            {localImage && (
                <div className="mb-4">
                    <img src={localImage} alt="Analyzed content" className="rounded-lg max-h-60 w-auto mx-auto shadow-md" />
                </div>
            )}
            <MarkdownRenderer content={mainResult} />
            
            {shoppingListItems.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800">
                    <h4 className={`font-bold mb-2 text-${feature.color}-800 dark:text-${feature.color}-300 flex items-center gap-2`}>
                        <ShoppingCart size={18} />
                        قائمة المنتجات المقترحة
                    </h4>
                    <div className="space-y-2">
                        {shoppingListItems.map((item, index) => (
                            <div key={index} className="flex items-center justify-between bg-white dark:bg-black p-2 rounded-md border dark:border-gray-800">
                                <span className="text-sm text-gray-800 dark:text-gray-200">{item}</span>
                                <button 
                                    onClick={() => handleAddToShoppingList(item)} 
                                    disabled={addedItems.includes(item)}
                                    className="text-xs px-2 py-1 rounded-md transition-colors flex items-center gap-1 disabled:opacity-60 bg-green-100 text-green-800 dark:bg-black dark:border dark:border-green-500/50 dark:text-green-300"
                                >
                                    {addedItems.includes(item) ? <CheckCircle size={14} /> : '+ إضافة'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {suggestedMovieTitle && (
                <div className="mt-4 text-center">
                    <button
                        onClick={handleAddMovieToFavorites}
                        disabled={isMovieAdded}
                        className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed bg-red-100 text-red-800 hover:bg-red-200 dark:bg-black dark:border dark:border-red-500/50 dark:text-red-300 disabled:opacity-70"
                    >
                        {isMovieAdded ? <><CheckCircle size={18} /> تمت الإضافة للمفضلة</> : <><Heart size={16} /> إضافة إلى المفضلة</>}
                    </button>
                </div>
            )}

            {responseId && <Feedback responseId={responseId} />}
            <FollowUpChat
                initialUserPrompt={initialUserQuery}
                initialModelContent={result}
                context={null}
                systemInstruction={`أنت خبير في ${feature.title}. أجب عن أسئلة المستخدم المتابعة بوضوح.`}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default SmartHealthPage;