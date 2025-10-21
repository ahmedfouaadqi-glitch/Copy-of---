import React, { useState, useEffect, useRef } from 'react';
import { NavigationProps, VisualFoodAnalysis } from '../types';
import { callGeminiApi, callGeminiVisualJsonApi } from '../services/geminiService';
import { addDiaryEntry } from '../services/diaryService';
import PageHeader from '../components/PageHeader';
import { UtensilsCrossed, Sparkles, ChefHat, CheckCircle, Info, X, Camera, Edit2, Save } from 'lucide-react';
import { FEATURES } from '../constants';
import Feedback from '../components/Feedback';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { useAnalysis } from '../context/AnalysisContext';
import FollowUpChat from '../components/FollowUpChat';
import MediaInput from '../components/MediaInput';


const feature = FEATURES.find(f => f.pageType === 'calorieCounter')!;

type Mode = 'calories' | 'recipe' | 'visual';

const CalorieCounterPage: React.FC<NavigationProps> = ({ navigateTo }) => {
    const [mode, setMode] = useState<Mode>('calories');
    const [input, setInput] = useState('');
    const [result, setResult] = useState('');
    const [analysisResult, setAnalysisResult] = useState<VisualFoodAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [localImage, setLocalImage] = useState<string | null>(null);
    const [responseId, setResponseId] = useState<string | null>(null);
    const [isAddedToDiary, setIsAddedToDiary] = useState(false);
    const { analysisData, setAnalysisData } = useAnalysis();
    const contextApplied = useRef(false);
    
    const [initialUserQuery, setInitialUserQuery] = useState('');
    const [showContextBanner, setShowContextBanner] = useState(false);

    // State for correction loop
    const [isEditingWeight, setIsEditingWeight] = useState(false);
    const [correctedWeight, setCorrectedWeight] = useState('');


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
        setAnalysisResult(null);
        setError(null);
        setResponseId(null);
        setIsLoading(false);
        setIsAddedToDiary(false);
        setIsEditingWeight(false);
        setCorrectedWeight('');
    };

    const handleBack = () => {
        if (result || error || analysisResult) {
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
    
    const handleSaveCorrection = () => {
        if (!analysisResult || !correctedWeight) return;
        const correctionData = {
            timestamp: Date.now(),
            image: localImage,
            originalEstimate: analysisResult.estimatedWeight,
            userCorrection: parseFloat(correctedWeight),
            foodName: analysisResult.foodName,
        };
        // In a real app, this would be sent to a backend. For now, log to localStorage.
        const corrections = JSON.parse(localStorage.getItem('visual_corrections') || '[]');
        corrections.push(correctionData);
        localStorage.setItem('visual_corrections', JSON.stringify(corrections));
        
        // Update the displayed result with the corrected weight
        setAnalysisResult(prev => prev ? { ...prev, estimatedWeight: parseFloat(correctedWeight) } : null);
        setIsEditingWeight(false);
    };


    const handleAddToDiary = () => {
        let title = '';
        let details = '';

        if (analysisResult) {
            title = `تقدير بصري: ${analysisResult.foodName}`;
            details = `الوزن: ${analysisResult.estimatedWeight} جم\nالسعرات: ${analysisResult.calories}\nبروتين: ${analysisResult.protein} جم | كربوهيدرات: ${analysisResult.carbohydrates} جم | دهون: ${analysisResult.fats} جم`;
        } else {
            title = input || (mode === 'calories' ? "وجبة من صورة" : "وصفة جديدة");
            details = result;
        }
        
        if (!title || (!details && !analysisResult)) return;

        addDiaryEntry(new Date(), {
            type: 'food',
            icon: '🍽️',
            title: title,
            details: details
        });
        setIsAddedToDiary(true);
    };


    const handleSubmit = async () => {
        if (mode === 'visual' && !localImage) {
            setError('الرجاء رفع صورة للتقدير البصري.');
            return;
        }
        if (!input.trim() && !localImage) return;

        let userQuery = '';
        switch (mode) {
            case 'calories':
                userQuery = localImage ? `تحليل صورة ${input || 'وجبة'}` : input;
                break;
            case 'recipe':
                userQuery = `ابتكر وصفة من: ${input}`;
                break;
            case 'visual':
                userQuery = `تقدير بصري للطعام في الصورة مع ملاحظة: ${input}`;
                break;
        }
        setInitialUserQuery(userQuery);

        resetState(false);
        setIsLoading(true);

        try {
             if (mode === 'visual' && localImage) {
                const prompt = `**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت خبير تغذية ومهندس رؤية حاسوبية. في الصورة، يوجد طعام بجانب بطاقة بنكية قياسية (85.60 مم × 53.98 مم) كمرجع للحجم.
1.  **تعرف على الطعام:** حدد نوع الطعام في الصورة.
2.  **تقدير الوزن:** استخدم البطاقة البنكية كمرجع لقياس أبعاد الطعام وتقدير حجمه. بناءً على كثافة الطعام المقدرة، قم بتقدير وزنه بالجرام.
3.  **التحليل الغذائي:** بناءً على الوزن المقدر، قدم تحليلاً مفصلاً للسعرات الحرارية والمكونات الرئيسية (بروتين، كربوهيدرات، دهون).
4.  **النصيحة:** قدم نصيحة صحية موجزة حول هذا الطعام.
5.  **ملاحظات:** إذا كان هناك أي ملاحظات إضافية من المستخدم "${input}", فخذها في الاعتبار.
قدم ردك بتنسيق JSON حصراً.`;
                 const imagePayload = {
                    mimeType: localImage.match(/data:(.*);base64,/)?.[1] || 'image/jpeg',
                    data: localImage.split(',')[1]
                 };
                 const apiResult = await callGeminiVisualJsonApi(prompt, imagePayload);
                 setAnalysisResult(apiResult);
                 setCorrectedWeight(apiResult.estimatedWeight.toString());
                 setResponseId(`chef-visual-${Date.now()}`);

             } else {
                 let prompt = '';
                 if (mode === 'calories') {
                    prompt = `**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت خبير تغذية. حلل الوجبة التالية. `;
                    if (localImage) {
                        prompt += `من خلال الصورة المقدمة ووصف المستخدم "${input}", `;
                    } else {
                        prompt += `بناءً على الوصف التالي "${input}", `;
                    }
                    prompt += `قدم تقديراً مفصلاً للسعرات الحرارية والمكونات الرئيسية (بروتين، كربوهيدرات، دهون). قدم نصيحة صحية سريعة حول هذه الوجبة.`;
                } else if (mode === 'recipe') {
                    prompt = `**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت طاهٍ مبدع. ابتكر وصفة طعام صحية ولذيذة باستخدام المكونات التالية فقط: "${input}". قدم الوصفة بتنسيق واضح يشمل:
                    1.  **اسم الوصفة المقترح**
                    2.  **المكونات**
                    3.  **طريقة التحضير**
                    4.  **نصيحة الطاهي**`;
                }
                const imagePayload = localImage ? {
                    mimeType: localImage.match(/data:(.*);base64,/)?.[1] || 'image/jpeg',
                    data: localImage.split(',')[1]
                } : undefined;

                const apiResult = await callGeminiApi(prompt, imagePayload ? [imagePayload] : undefined);
                setResult(apiResult);
                setResponseId(`chef-${Date.now()}`);
             }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'حدث خطأ غير متوقع.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const getButtonText = () => {
        switch(mode) {
            case 'calories': return 'تحليل الوجبة';
            case 'recipe': return 'ابتكر لي وصفة';
            case 'visual': return 'تقدير الوزن بالصورة';
            default: return 'إرسال';
        }
    }
     const getButtonIcon = () => {
        switch(mode) {
            case 'calories': return <UtensilsCrossed size={20} />;
            case 'recipe': return <ChefHat size={20} />;
            case 'visual': return <Camera size={20} />;
            default: return <Sparkles size={20}/>;
        }
    }
    
    const renderAnalysisResult = () => {
        if (!analysisResult) return null;

        return (
            <div className="space-y-3">
                <h4 className="text-xl font-bold text-orange-800 dark:text-orange-200 text-center">{analysisResult.foodName}</h4>
                <div className="flex items-center justify-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">الوزن المقدر:</span>
                    {isEditingWeight ? (
                        <div className="flex items-center gap-1">
                            <input
                                type="number"
                                value={correctedWeight}
                                onChange={(e) => setCorrectedWeight(e.target.value)}
                                className="w-20 p-1 text-center border rounded-md bg-white dark:bg-black dark:border-gray-600"
                                autoFocus
                            />
                            <span className="font-semibold">جم</span>
                            <button onClick={handleSaveCorrection} className="p-1 text-green-600"><Save size={18}/></button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1">
                            <span className="text-lg font-bold text-gray-800 dark:text-gray-100">{analysisResult.estimatedWeight}</span>
                            <span className="font-semibold">جم</span>
                            <button onClick={() => setIsEditingWeight(true)} className="p-1 text-gray-500 hover:text-orange-500"><Edit2 size={16}/></button>
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center p-2 bg-orange-100 dark:bg-black rounded-lg">
                    <div><p className="font-bold text-lg">{analysisResult.calories}</p><p className="text-xs">سعرة حرارية</p></div>
                    <div><p className="font-bold text-lg">{analysisResult.protein}</p><p className="text-xs">بروتين (جم)</p></div>
                    <div><p className="font-bold text-lg">{analysisResult.carbohydrates}</p><p className="text-xs">كربوهيدرات (جم)</p></div>
                    <div><p className="font-bold text-lg">{analysisResult.fats}</p><p className="text-xs">دهون (جم)</p></div>
                </div>
                <div>
                    <h5 className="font-semibold mb-1">نصيحة الخبراء:</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{analysisResult.advice}</p>
                </div>
            </div>
        );
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
                        <button onClick={() => setMode('visual')} className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${mode === 'visual' ? 'bg-orange-500 text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>تقدير بالصورة</button>
                        <button onClick={() => setMode('recipe')} className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${mode === 'recipe' ? 'bg-orange-500 text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>ابتكار وصفة</button>
                    </div>

                    {(mode === 'calories' || mode === 'visual') && (
                        <>
                            <MediaInput image={localImage} onImageChange={(img) => setLocalImage(img)} onClearImage={() => { setLocalImage(null); handleClearContext(); }} promptText="ارفع صورة لوجبتك" />
                            {mode === 'visual' && <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2 bg-yellow-50 dark:bg-black p-2 rounded-md border border-yellow-200 dark:border-yellow-500/30">لأفضل النتائج، ضع بطاقة بنكية بجانب الطعام كمرجع للحجم.</p>}
                        </>
                    )}

                    <div className="relative mt-3">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={mode === 'calories' ? 'صف وجبتك (اختياري مع الصورة)...' : mode === 'visual' ? 'أضف ملاحظات (اختياري)...' : 'اكتب المكونات المتوفرة لديك...'}
                            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-black text-gray-800 dark:text-gray-200"
                            rows={3}
                        />
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || (!input.trim() && !localImage)}
                        className={`w-full p-3 mt-2 rounded-md text-white font-bold transition flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 active:scale-95`}
                    >
                        {getButtonIcon()}
                        {getButtonText()}
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
                {(result || analysisResult) && (
                    <div className="mt-6 bg-orange-50 dark:bg-black p-4 rounded-lg shadow-md border border-orange-200 dark:border-orange-500/50 text-gray-800 dark:text-gray-200">
                        <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-orange-700 dark:text-orange-300">
                            <Sparkles size={20} />
                            {mode === 'calories' ? 'التحليل الغذائي' : mode === 'visual' ? 'التقدير البصري' : 'وصفتك المقترحة'}
                        </h3>
                        
                        {result && <MarkdownRenderer content={result} />}
                        {analysisResult && renderAnalysisResult()}

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
                            initialModelContent={result || (analysisResult ? JSON.stringify(analysisResult) : '')} 
                            context={analysisData} 
                            systemInstruction={mode === 'recipe' ? "أنت طاهٍ خبير. أجب عن أسئلة المستخدم المتابعة." : "أنت خبير تغذية. أجب عن أسئلة المستخدم المتابعة."} 
                        />
                    </div>
                )}
            </main>
        </div>
    );
};

export default CalorieCounterPage;