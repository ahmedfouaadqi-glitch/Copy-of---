import React, { useState, useMemo } from 'react';
import { NavigationProps, GroundingChunk } from '../types';
import { callGeminiSearchApi } from '../services/geminiService';
import PageHeader from '../components/PageHeader';
import { FEATURES, SEARCH_SUGGESTIONS } from '../constants';
import { Search, Sparkles, Link, BrainCircuit, Lightbulb } from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { useFeatureUsage } from '../hooks/useFeatureUsage';


const feature = FEATURES.find(f => f.pageType === 'globalSearch')!;

const GlobalSearchPage: React.FC<NavigationProps> = ({ navigateTo }) => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState('');
    const [groundingChunks, setGroundingChunks] = useState<GroundingChunk[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { getUsageSortedFeatures } = useFeatureUsage();

    const suggestions = useMemo(() => {
        const sortedFeatures = getUsageSortedFeatures(FEATURES);
        
        const topFeatureSuggestions = sortedFeatures
            .filter(f => SEARCH_SUGGESTIONS[f.pageType]) 
            .map(f => SEARCH_SUGGESTIONS[f.pageType]!) 
            .flat();

        const allSuggestions = [
            ...topFeatureSuggestions,
            ...(SEARCH_SUGGESTIONS.globalSearch || [])
        ];

        const uniqueSuggestions = [...new Set(allSuggestions)];
        const shuffled = uniqueSuggestions.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3);
    }, [getUsageSortedFeatures]);
    

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
            const appInfo = `### عن تطبيق "صحتك/كي" (AiHealthQ): مستشارك الذكي للحياة العصرية

**"صحتك/كي"** هو أكثر من مجرد تطبيق صحي؛ إنه منصة حياة متكاملة مصممة لتكون رفيقك اليومي الذكي في كل جوانب حياتك. باستخدام قوة الذكاء الاصطناعي المتقدم والكاميرا الذكية، نقدم لك استشارات مخصصة وحلولاً فورية تجعل حياتك أسهل وأفضل.

#### انطلق في رحلتك مع مراكزنا الاستشارية المتخصصة:

- **📸 الكاميرا الذكية:** بوابتك للمعرفة الفورية. حلل أي شيء من حولك، من الأطعمة والأدوية إلى النباتات ومنتجات التجميل.
- **🏋️‍♂️ المستشار الرياضي:** احصل على خطط تمارين مخصصة لأهدافك، سواء كانت فقدان الوزن، بناء العضلات، أو تحسين الأداء.
- **🥗 مستشار الطهي والسعرات:** ابتكر وصفات صحية من مكوناتك، وحلل وجباتك بصرياً لتقدير قيمتها الغذائية.
- **💄 مستشار الجمال:** اكتشف روتين العناية المثالي لبشرتك وشعرك، وحلل مكونات المنتجات، واحصل على إلهام للمكياج.
- **🎮 مستشار الألعاب والترفيه:** حسّن أداءك كلاعب بنصائح صحية وذهنية، وتعرف على أحدث الألعاب والعتاد.
- **💼 المستشار المالي والمهني:** استعد لمقابلات العمل، حلل سيرتك الذاتية، واحصل على خطط ذكية لإدارة ميزانيتك.
- **🚗 مستشار السيارات والتكنولوجيا:** شخص أعطال سيارتك من خلال صورة، واحصل على إرشادات لاختيار أفضل الأجهزة التقنية.
- **🏠 مستشار الديكور والنباتات:** استلهم أفكاراً لمنزلك، واعتنِ بنباتاتك مع طبيب النباتات الذكي.
- **📓 يومياتي الذكية:** سجل أنشطتك وتتبع تقدمك، ودع الذكاء الاصطناعي يحلل أسبوعك ويقدم لك رؤى قيمة.
- **🧠 عقل الروح التقنية:** مساعدك الشخصي للدردشة والبحث. اسأل عن أي شيء، أو اطلب منه أن يرسم لك صورة!

**رؤيتنا** هي تمكينك من خلال التكنولوجيا، ووضع خبير في كل جانب من جوانب حياتك بين يديك. "صحتك/كي" هو شريكك في رحلة نحو حياة أكثر صحة، ذكاءً، وتنظيماً.

---
*تم تطوير هذا التطبيق بناءً على فكرة ورؤية المالك والمؤسس: **أحمد معروف**.*
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
                                {suggestions.map((suggestion, index) => (
                                    <button 
                                        key={index} 
                                        onClick={() => handleSearch(suggestion)} 
                                        className="px-3 py-1.5 bg-indigo-50 dark:bg-black text-indigo-700 dark:text-indigo-300 rounded-full text-sm border border-indigo-200 dark:border-indigo-500/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
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