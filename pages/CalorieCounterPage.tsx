import React, { useState, useEffect, useRef } from 'react';
import { NavigationProps } from '../types';
import { callGeminiApi } from '../services/geminiService';
import { addDiaryEntry } from '../services/diaryService';
import PageHeader from '../components/PageHeader';
import { UtensilsCrossed, Sparkles, ChefHat, CheckCircle, Info, X } from 'lucide-react';
import { FEATURES } from '../constants';
import Feedback from '../components/Feedback';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { useAnalysis } from '../context/AnalysisContext';
import FollowUpChat from '../components/FollowUpChat';
import MediaInput from '../components/MediaInput';


const feature = FEATURES.find(f => f.pageType === 'calorieCounter')!;

type Mode = 'calories' | 'recipe';

const CalorieCounterPage: React.FC<NavigationProps> = ({ navigateTo }) => {
    const [mode, setMode] = useState<Mode>('calories');
    const [input, setInput] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [localImage, setLocalImage] = useState<string | null>(null);
    const [responseId, setResponseId] = useState<string | null>(null);
    const [isAddedToDiary, setIsAddedToDiary] = useState(false);
    const { analysisData, setAnalysisData } = useAnalysis();
    const contextApplied = useRef(false);
    
    const [initialUserQuery, setInitialUserQuery] = useState('');
    const [showContextBanner, setShowContextBanner] = useState(false);


    useEffect(() => {
        if (analysisData && !contextApplied.current) {
            if (analysisData.analysisType === 'food' && analysisData.images && analysisData.images.length > 0) {
                setLocalImage(analysisData.images[0]);
                 setInput(analysisData.analysisDetails || ''); // Use details for better context
                 setShowContextBanner(true);
            }
            setMode('calories');
            contextApplied.current = true;
        }
    }, [analysisData]);

    const resetState = (clearInput: boolean = true) => {
        if (clearInput) {
            setInput('');
            setLocalImage(null);
            setAnalysisData(null);
            setShowContextBanner(false);
        }
        setResult('');
        setError(null);
        setResponseId(null);
        setIsLoading(false);
        setIsAddedToDiary(false);
    };

    const handleBack = () => {
        if (result || error) {
            resetState(false);
        } else {
            navigateTo({ type: 'home' });
        }
    };
    
    const handleClearContext = () => {
        setAnalysisData(null);
        setShowContextBanner(false);
        setInput('');
        setLocalImage(null);
    }

    const handleAddToDiary = () => {
        const title = input || (mode === 'calories' ? "وجبة من صورة" : "وصفة جديدة");
        if (!title || !result) return;
        addDiaryEntry(new Date(), {
            type: 'food',
            icon: '🍽️',
            title: `${mode === 'calories' ? 'تحليل وجبة' : 'وصفة'}: ${title}`,
            details: result
        });
        setIsAddedToDiary(true);
    };

    const handleSubmit = async () => {
        if (!input.trim() && !localImage) return;

        const userQuery = mode === 'calories'
            ? (localImage ? `تحليل صورة ${input || 'وجبة'}` : input)
            : `ابتكر وصفة من: ${input}`;
        setInitialUserQuery(userQuery);

        resetState(false);
        setIsLoading(true);

        let prompt = '';
        if (mode === 'calories') {
            prompt = `**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت خبير تغذية. حلل الوجبة التالية. `;
            if (localImage) {
                prompt += `من خلال الصورة المقدمة ووصف المستخدم "${input}", `;
            } else {
                prompt += `بناءً على الوصف التالي "${input}", `;
            }
            prompt += `قدم تقديراً مفصلاً للسعرات الحرارية والمكونات الرئيسية (بروتين، كربوهhidرات، دهون). قدم نصيحة صحية سريعة حول هذه الوجبة.`;
        } else { // recipe mode
            prompt = `**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت طاهٍ مبدع. ابتكر وصفة طعام صحية ولذيذة باستخدام المكونات التالية فقط: "${input}". قدم الوصفة بتنسيق واضح يشمل:
            1.  **اسم الوصفة المقترح**
            2.  **المكونات**
            3.  **طريقة التحضير**
            4.  **نصيحة الطاهي**`;
        }
        
        try {
            const imagePayload = localImage ? {
                mimeType: localImage.match(/data:(.*);base64,/)?.[1] || 'image/jpeg',
                data: localImage.split(',')[1]
            } : undefined;

            const apiResult = await callGeminiApi(prompt, imagePayload ? [imagePayload] : undefined);
            setResult(apiResult);
            setResponseId(`chef-${Date.now()}`);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'حدث خطأ غير متوقع.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-black min-h-screen">
            <PageHeader onBack={handleBack} navigateTo={navigateTo} title="مستشار الطهي" Icon={UtensilsCrossed} color="orange" />
            <main className="p-4">
                 {showContextBanner && (
                    <div className="bg-teal-50 dark:bg-black border-l-4 border-teal-500 text-teal-800 dark:text-teal-300 p-3 mb-4 rounded-r-lg flex items-center gap-3 relative text-sm">
                        <Info size={20} className="flex-shrink-0" />
                        <p>تم جلب السياق من الكاميرا الذكية. هل تريد تحليل السعرات؟</p>
                         <button onClick={handleClearContext} className="absolute top-2 left-2 p-1 rounded-full hover:bg-teal-200 dark:hover:bg-gray-900">
                            <X size={16} />
                        </button>
                    </div>
                 )}
                <div className="bg-white dark:bg-black p-4 rounded-lg shadow-md mb-6 border border-gray-200 dark:border-gray-800">
                    <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg p-1 mb-4 bg-gray-100 dark:bg-black">
                        <button onClick={() => setMode('calories')} className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${mode === 'calories' ? 'bg-orange-500 text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>تقدير السعرات</button>
                        <button onClick={() => setMode('recipe')} className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${mode === 'recipe' ? 'bg-orange-500 text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>ابتكار وصفة</button>
                    </div>

                    {mode === 'calories' && (
                        <MediaInput image={localImage} onImageChange={(img) => setLocalImage(img)} onClearImage={() => { setLocalImage(null); handleClearContext(); }} promptText="ارفع صورة لوجبتك" />
                    )}

                    <div className="relative mt-3">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={mode === 'calories' ? 'صف وجبتك (اختياري مع الصورة)...' : 'اكتب المكونات المتوفرة لديك...'}
                            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-black text-gray-800 dark:text-gray-200"
                            rows={3}
                        />
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || (!input.trim() && !localImage)}
                        className={`w-full p-3 mt-2 rounded-md text-white font-bold transition flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 active:scale-95`}
                    >
                        {mode === 'calories' ? <UtensilsCrossed size={20} /> : <ChefHat size={20} />}
                        {mode === 'calories' ? 'تحليل الوجبة' : 'ابتكر لي وصفة'}
                    </button>
                </div>
                
                {isLoading && (
                    <div className="text-center p-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-300">...جاري التحليل الذكي</p>
                    </div>
                )}
                {error && (
                    <div className="bg-red-100 dark:bg-black border border-red-300 dark:border-red-500/50 text-red-800 dark:text-red-300 p-4 rounded-lg shadow-md">
                        <h3 className="font-bold mb-2">حدث خطأ</h3>
                        <p>{error}</p>
                        <button onClick={() => resetState(true)} className="mt-3 px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition">إعادة المحاولة</button>
                    </div>
                )}
                {result && (
                    <div className="mt-6 bg-orange-50 dark:bg-black p-4 rounded-lg shadow-md border border-orange-200 dark:border-orange-500/50 text-gray-800 dark:text-gray-200">
                        <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-orange-700 dark:text-orange-300">
                            <Sparkles size={20} />
                            {mode === 'calories' ? 'التحليل الغذائي' : 'وصفتك المقترحة'}
                        </h3>
                        <MarkdownRenderer content={result} />

                        <div className="mt-4 text-center">
                            <button
                                onClick={handleAddToDiary}
                                disabled={isAddedToDiary}
                                className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-black dark:border dark:border-purple-500/50 dark:text-purple-300 disabled:opacity-70"
                            >
                                {isAddedToDiary ? <><CheckCircle size={18} /> تمت الإضافة لليوميات</> : '📌 إضافة لليوميات'}
                            </button>
                        </div>
                        
                        {responseId && <Feedback responseId={responseId} />}
                        <FollowUpChat 
                            initialUserPrompt={initialUserQuery}
                            initialModelContent={result} 
                            context={analysisData} 
                            systemInstruction={mode === 'calories' ? "أنت خبير تغذية. أجب عن أسئلة المستخدم المتابعة." : "أنت طاهٍ خبير. أجب عن أسئلة المستخدم المتابعة."} 
                        />
                    </div>
                )}
            </main>
        </div>
    );
};

export default CalorieCounterPage;