import React, { useState, useEffect } from 'react';
import { NavigationProps, AnalysisHistoryItem } from '../types';
import { callGeminiApi } from '../services/geminiService';
import { getAnalysisHistory, addAnalysisToHistory, clearAnalysisHistory, deleteAnalysisHistoryItem } from '../services/analysisHistoryService';
import PageHeader from '../components/PageHeader';
import { Camera, Sparkles, Leaf, Utensils, Pill, User, Trash2, X, ArchiveX, Eye, QrCode } from 'lucide-react';
import { FEATURES } from '../constants';
import { useAnalysis } from '../context/AnalysisContext';
import MediaInput from '../components/MediaInput';
import MarkdownRenderer from '../components/MarkdownRenderer';
import Feedback from '../components/Feedback';
import SmartTip from '../components/SmartTip';

const feature = FEATURES.find(f => f.pageType === 'imageAnalysis')!;

type AnalysisType = 'plant_id' | 'food' | 'medication' | 'skin' | 'general' | 'barcode';

const ANALYSIS_OPTIONS: { type: AnalysisType; label: string; prompt: string; Icon: React.ElementType; color: string; targetPage?: 'calorieCounter' | 'pharmacy' | 'myPlants' }[] = [
    { type: 'plant_id', label: 'التعرف على النبات', prompt: "**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت خبير نباتات. تعرف على اسم هذا النبات من الصورة. اذكر فقط اسم النبات الشائع.", Icon: Leaf, color: 'green', targetPage: 'myPlants' },
    { type: 'food', label: 'تحليل الطعام', prompt: "**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت خبير تغذية. من خلال الصورة، صف الطعام الظاهر وقدم تقديرًا أوليًا لنوعه (مثلاً: وجبة غداء، فاكهة، حلوى).", Icon: Utensils, color: 'orange', targetPage: 'calorieCounter' },
    { type: 'medication', label: 'مسح الدواء', prompt: "**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت صيدلي. من خلال الصورة، حاول تحديد اسم الدواء أو نوعه. اذكر الاسم فقط.", Icon: Pill, color: 'blue', targetPage: 'pharmacy' },
    { type: 'skin', label: 'تحليل البشرة', prompt: "**مهمتك: الرد باللغة العربية الفصحى فقط وبلهجة خبير تجميل.** من خلال صورة البشرة هذه، قدم تحليلاً موجزاً لحالتها الظاهرة (مثال: جافة, دهنية) واقترح نصيحة عامة واحدة فقط للعناية بها. **تنبيه:** ابدأ ردك بعبارة: 'تحليل أولي بناءً على الصورة:'.", Icon: User, color: 'pink' },
    { type: 'barcode', label: 'مسح باركود', prompt: "**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت نظام تعرف على المنتجات. إذا كانت الصورة تحتوي على باركود، استخرج الرقم منه. إذا لم تتمكن من قراءة الباركود، اذكر ذلك. إذا كانت الصورة تحتوي على اسم المنتج، فاذكر اسم المنتج.", Icon: QrCode, color: 'indigo' },
];

const GENERAL_PROMPT = "**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت مساعد ذكي متعدد الاستخدامات. حلل الصور المقدمة وقدم وصفاً تفصيلياً لكل منها. إذا كانت هناك عدة صور, افصل بين تحليل كل صورة بـ '---'.";

const ImageAnalysisPage: React.FC<NavigationProps> = ({ navigateTo }) => {
    const [images, setImages] = useState<string[]>([]);
    const [analysisType, setAnalysisType] = useState<AnalysisType | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [responseId, setResponseId] = useState<string | null>(null);
    const { setAnalysisData } = useAnalysis();
    const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
    const [viewingHistoryItem, setViewingHistoryItem] = useState<AnalysisHistoryItem | null>(null);
    
    useEffect(() => {
        setHistory(getAnalysisHistory());
    }, []);

    const resetState = () => {
        setImages([]);
        setAnalysisType(null);
        setIsLoading(false);
        setResult('');
        setError(null);
        setResponseId(null);
        setViewingHistoryItem(null);
    };

    const handleImagesChange = (newImages: string[]) => {
        setImages(prev => [...prev, ...newImages]);
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleAnalysis = async () => {
        if (images.length === 0 || (!analysisType && images.length === 1)) return;

        setIsLoading(true);
        setResult('');
        setError(null);
        
        const isMultiImage = images.length > 1;
        const currentAnalysisType = isMultiImage ? 'general' : analysisType!;
        const option = ANALYSIS_OPTIONS.find(opt => opt.type === currentAnalysisType);
        const prompt = isMultiImage ? GENERAL_PROMPT : option!.prompt;
        
        try {
            const imagePayloads = images.map(img => ({
                mimeType: img.match(/data:(.*);base64,/)?.[1] || 'image/jpeg',
                data: img.split(',')[1],
            }));
            const apiResult = await callGeminiApi(prompt, imagePayloads);
            
            const analysisTypeLabel = isMultiImage ? 'تحليل عام' : option!.label;
            addAnalysisToHistory({ images, analysisTypeLabel, result: apiResult });
            setHistory(getAnalysisHistory());

            if (option?.targetPage && !isMultiImage) {
                setAnalysisData({
                    analysisType: option.type,
                    images: images,
                    text: `تحليل صورة ${option.label}`,
                    analysisDetails: apiResult,
                });
                navigateTo({ type: option.targetPage } as any);
            } else {
                setResult(apiResult);
                setResponseId(`image-analysis-${Date.now()}`);
            }

        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleClearHistory = () => {
        if (window.confirm('هل أنت متأكد من حذف كل سجل التحليلات؟ لا يمكن التراجع عن هذا الإجراء.')) {
            clearAnalysisHistory();
            setHistory([]);
        }
    };
    
    const handleDeleteHistoryItem = (id: string) => {
        deleteAnalysisHistoryItem(id);
        setHistory(getAnalysisHistory());
    }

    if (viewingHistoryItem) {
        return (
            <div className="bg-gray-50 dark:bg-black min-h-screen">
                <PageHeader onBack={() => setViewingHistoryItem(null)} navigateTo={navigateTo} title="عرض السجل" Icon={feature.Icon} color={feature.color} />
                <main className="p-4">
                     <div className={`bg-blue-50 dark:bg-black p-4 rounded-lg shadow-md border border-blue-200 dark:border-blue-500/50`}>
                        <h3 className={`text-lg font-bold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300`}>
                            <Sparkles size={20} />
                            نتيجة تحليل ({viewingHistoryItem.analysisTypeLabel})
                        </h3>
                        <div className="grid grid-cols-2 gap-2 my-4">
                             {viewingHistoryItem.images.map((img, i) => <img key={i} src={img} className="rounded-md w-full object-cover" />)}
                        </div>
                        <MarkdownRenderer content={viewingHistoryItem.result} />
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="bg-gray-50 dark:bg-black min-h-screen">
            <PageHeader navigateTo={navigateTo} title="الكاميرا الذكية" Icon={Camera} color="blue" onBack={result || error || images.length > 0 ? resetState : undefined} />
            <main className="p-4">
                <SmartTip
                    tipId="multi_image_tip"
                    message="هل تعلم؟ يمكنك رفع عدة صور معًا ليقوم الذكاء الاصطناعي بتحليلها وتقديم وصف شامل لها جميعًا."
                />
                <div className="bg-white dark:bg-black p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-800 mt-4">
                    {images.length === 0 ? (
                        <MediaInput onImagesChange={handleImagesChange} />
                    ) : (
                         <div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                                {images.map((img, index) => (
                                    <div key={index} className="relative aspect-square">
                                        <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover rounded-md" />
                                        <button onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"><X size={14}/></button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setImages([])} className="text-sm text-red-500 hover:underline mb-4">إزالة كل الصور</button>
                         </div>
                    )}

                    {images.length > 0 && (
                        <div className="mt-4">
                            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">ماذا تريد أن تحلل؟</h3>
                            {images.length > 1 ? (
                                <p className="text-sm p-3 bg-gray-100 dark:bg-black rounded-md text-gray-600 dark:text-gray-300">سيتم إجراء تحليل عام لوجود عدة صور.</p>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {ANALYSIS_OPTIONS.map(opt => (
                                        <button key={opt.type} onClick={() => setAnalysisType(opt.type)} className={`p-3 rounded-lg border-2 transition text-center ${analysisType === opt.type ? `border-${opt.color}-500 bg-${opt.color}-50 dark:bg-black` : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black hover:border-gray-400'}`}>
                                            <opt.Icon className={`w-6 h-6 mx-auto mb-1 text-${opt.color}-500`} />
                                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                            <button onClick={handleAnalysis} disabled={isLoading || (images.length === 1 && !analysisType)} className="w-full mt-4 p-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-700 transition active:scale-95">
                                {isLoading ? '...جاري التحليل' : 'ابدأ التحليل الذكي'}
                            </button>
                        </div>
                    )}
                </div>
                
                {isLoading && <div className="text-center p-4 mt-6"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div><p className="mt-4 text-gray-600 dark:text-gray-300">...الذكاء الاصطناعي يعمل الآن</p></div>}
                {error && <div className="mt-6 bg-red-100 dark:bg-black border border-red-300 dark:border-red-500/50 text-red-800 dark:text-red-300 p-4 rounded-lg shadow-md"><h3 className="font-bold mb-2">حدث خطأ</h3><p>{error}</p></div>}
                {result && <div className="mt-6 bg-blue-50 dark:bg-black p-4 rounded-lg shadow-md border border-blue-200 dark:border-blue-500/50"><h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300"><Sparkles size={20} />نتائج التحليل</h3><MarkdownRenderer content={result} />{responseId && <Feedback responseId={responseId} />}</div>}

                 <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">سجل التحليلات</h2>
                        {history.length > 0 && <button onClick={handleClearHistory} className="text-sm text-red-500 hover:underline">مسح السجل</button>}
                    </div>
                     {history.length > 0 ? (
                        <div className="space-y-3">
                             {history.map(item => (
                                <div key={item.id} className="bg-white dark:bg-black p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 flex items-center gap-4">
                                    <img src={item.images[0]} className="w-12 h-12 rounded-md object-cover bg-gray-100" />
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-700 dark:text-gray-300">{item.analysisTypeLabel}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(item.timestamp).toLocaleString('ar-EG')}</p>
                                    </div>
                                     <button onClick={() => setViewingHistoryItem(item)} className="p-2 text-gray-500 hover:text-blue-500 rounded-full hover:bg-blue-50 dark:hover:bg-gray-900"><Eye size={18} /></button>
                                     <button onClick={() => handleDeleteHistoryItem(item.id)} className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-gray-900"><Trash2 size={18} /></button>
                                </div>
                             ))}
                        </div>
                     ) : (
                        <div className="text-center py-8 px-4 bg-white dark:bg-black rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-800">
                             <ArchiveX size={40} className="mx-auto text-gray-400 dark:text-gray-600 mb-3" />
                            <h3 className="font-bold text-md text-gray-700 dark:text-gray-200">لا يوجد سجل حتى الآن</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">نتائج تحليلاتك ستظهر هنا.</p>
                        </div>
                     )}
                </div>
            </main>
        </div>
    );
};

export default ImageAnalysisPage;