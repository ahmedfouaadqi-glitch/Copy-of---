import React, { useState } from 'react';
import { NavigationProps, GroundingChunk } from '../types';
import { callGeminiSearchApi } from '../services/geminiService';
import PageHeader from '../components/PageHeader';
import { FEATURES } from '../constants';
import { Search, Sparkles, Link, BrainCircuit, Lightbulb } from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';


const feature = FEATURES.find(f => f.pageType === 'globalSearch')!;

const GlobalSearchPage: React.FC<NavigationProps> = ({ navigateTo }) => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState('');
    const [groundingChunks, setGroundingChunks] = useState<GroundingChunk[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    

    const handleSearch = async (searchText = input) => {
        if (!searchText.trim()) return;
        const normalizedSearchText = searchText.trim().toLowerCase();

        setInput(searchText); // Ensure input is updated if called from example
        setIsLoading(true);
        setResult('');
        setError(null);
        setGroundingChunks([]);

        if (normalizedSearchText === 'احمد معروف' || normalizedSearchText === 'ahmed maaroof') {
            const bio = `### أحمد معروف: صاحب الفكرة والمالك لتطبيق "صحتك/كي"

**أحمد معروف** هو العقل المبدع وراء تطبيق "صحتك/كي"، وهو صاحب الفكرة والمالك لهذا المشروع الطموح الذي يهدف إلى دمج التكنولوجيا المتقدمة مع الحياة اليومية لتحسين الصحة والرفاهية.

بفضل رؤيته الثاقبة، وُلد تطبيق "صحتك/كي" ليكون أكثر من مجرد تطبيق صحي، بل رفيقاً ذكياً وشاملاً يساعد المستخدمين في كل جوانب حياتهم، من التغذية والجمال إلى الديكور والصحة النفسية. يجمع أحمد بين الشغف بالابتكار والالتزام العميق بتقديم حلول عملية ومؤثرة تلامس حياة الناس بشكل إيجابي.

يتمتع بخبرة واسعة في مجالات التكنولوجيا، التكنولوجيا المالية (FinTech)، والذكاء الاصطناعي، مما مكنه من بناء أساس تقني متين للتطبيق.

يؤمن أحمد معروف بأن المستقبل يكمن في تسخير قوة الذكاء الاصطناعي لخدمة الإنسان، وتطبيق "صحتك/كي" هو تجسيد حي لهذه الفلسفة.
`;
            setResult(bio);
            setIsLoading(false);
            return;
        }

        const appSearchTerms = ["صحتك/كي", "aihealthq", "تطبيقصحتك/كي", "صحتككي"];
        if (appSearchTerms.includes(normalizedSearchText.replace(/\s/g, ''))) {
            const appInfo = `### عن تطبيق "صحتك/كي" (AiHealthQ)

**صحتك/كي** هو تطبيق ذكي ومتكامل للحياة والصحة، مصمم ليكون رفيقك اليومي نحو حياة أفضل. يعتمد التطبيق على أحدث تقنيات الذكاء الاصطناعي والتحليل البصري ليقدم لك تجربة فريدة ومخصصة.

#### الميزات الرئيسية:
- **الكاميرا الذكية:** حلل الأطعمة، الأدوية، النباتات، ومنتجات التجميل بمجرد التقاط صورة.
- **مراكز استشارية متخصصة:** احصل على نصائح الخبراء في مجالات الجمال، الديكور، الطهي، وتنظيم الجداول.
- **مستشار الطهي والسعرات:** ابتكر وصفات صحية من المكونات المتاحة لديك وحلل قيمتها الغذائية.
- **يومياتي الصحية:** سجل أنشطتك وتتبع تقدمك بسهولة، واحصل على تحليل أسبوعي ذكي.
- **عقل الروح التقنية:** دردش مع مساعدك الذكي واحصل على إجابات فورية لأي سؤال يخطر ببالك.

يهدف **صحتك/كي** إلى تمكينك من اتخاذ قرارات صحية أفضل من خلال جعل المعلومات والنصائح في متناول يدك بطريقة سهلة وتفاعلية.
`;
            setResult(appInfo);
            setIsLoading(false);
            return;
        }

        try {
            const { text, groundingChunks } = await callGeminiSearchApi(searchText);
            setResult(text);
            setGroundingChunks(groundingChunks);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'حدث خطأ غير متوقع.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        if (result || error) {
            setResult('');
            setError(null);
            setGroundingChunks([]);
            setInput('');
        } else {
            navigateTo({ type: 'home' });
        }
    };
    
    return (
        <div className="bg-gray-50 dark:bg-black min-h-screen">
            <PageHeader onBack={handleBack} navigateTo={navigateTo} title={feature.title} Icon={feature.Icon} color={feature.color} />
            <main className="p-4">
                <div className="bg-white dark:bg-black p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="ابحث عن أي شيء..."
                            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-black text-gray-800 dark:text-gray-200"
                        />
                        <button onClick={() => handleSearch()} disabled={isLoading} className="p-3 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:bg-gray-400">
                            <Search size={20} />
                        </button>
                    </div>
                </div>

                {!isLoading && !result && !error && (
                    <div className="mt-6 text-center bg-white dark:bg-black p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
                        <BrainCircuit size={40} className="mx-auto text-indigo-400 mb-3" />
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                            مرحباً بك في مركز الروح التقنية
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-2 mb-4">
                            هنا، يمكنك البحث عن أي شيء يخطر ببالك. سيقوم مساعدنا الذكي بالبحث في الويب وتقديم إجابة شاملة مدعومة بالمصادر.
                        </p>
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                             <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center justify-center gap-2">
                                <Lightbulb size={18}/>
                                جرب أن تسأل:
                             </h3>
                             <div className="flex flex-wrap justify-center gap-2">
                                <button onClick={() => handleSearch('ما هي فوائد الأفوكادو؟')} className="px-3 py-1.5 bg-indigo-50 dark:bg-black text-indigo-700 dark:text-indigo-300 rounded-full text-sm border border-indigo-200 dark:border-indigo-500/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition">
                                    ما هي فوائد الأفوكادو؟
                                </button>
                                <button onClick={() => handleSearch('أفضل التمارين لتقوية الظهر')} className="px-3 py-1.5 bg-indigo-50 dark:bg-black text-indigo-700 dark:text-indigo-300 rounded-full text-sm border border-indigo-200 dark:border-indigo-500/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition">
                                    أفضل التمارين لتقوية الظهر
                                </button>
                                <button onClick={() => handleSearch('من هو مخترع الإنترنت؟')} className="px-3 py-1.5 bg-indigo-50 dark:bg-black text-indigo-700 dark:text-indigo-300 rounded-full text-sm border border-indigo-200 dark:border-indigo-500/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition">
                                    من هو مخترع الإنترنت؟
                                </button>
                             </div>
                        </div>
                    </div>
                )}
                
                {isLoading && (
                    <div className="text-center p-4 mt-6">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-300">...جاري البحث في عقل الروح التقنية</p>
                    </div>
                )}
                {error && (
                    <div className="mt-6 bg-red-100 dark:bg-black border border-red-300 dark:border-red-500/50 text-red-800 dark:text-red-300 p-4 rounded-lg shadow-md">
                        <h3 className="font-bold mb-2">حدث خطأ</h3>
                        <p>{error}</p>
                    </div>
                )}
                {result && (
                    <div className="mt-6 bg-indigo-50 dark:bg-black p-4 rounded-lg shadow-md border border-indigo-200 dark:border-indigo-500/50 text-gray-800 dark:text-gray-200">
                        <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                            <Sparkles size={20} />
                            نتائج البحث
                        </h3>
                        <MarkdownRenderer content={result} />
                        {groundingChunks.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-indigo-200 dark:border-gray-800">
                                <h4 className="font-bold text-sm mb-2 text-gray-600 dark:text-gray-400">المصادر:</h4>
                                <ul className="space-y-1">
                                    {groundingChunks.map((chunk, index) => (
                                        <li key={index} className="text-sm">
                                            <a 
                                                href={chunk.web.uri} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="flex items-center gap-1.5 text-blue-600 hover:underline dark:text-blue-400"
                                            >
                                                <Link size={14} />
                                                <span>{chunk.web.title || chunk.web.uri}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default GlobalSearchPage;