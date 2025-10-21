import React, { useState, useEffect } from 'react';
import { NavigationProps, WorkoutPlan, WorkoutDay } from '../types';
import { callGeminiJsonApi } from '../services/geminiService';
import PageHeader from '../components/PageHeader';
import { Dumbbell, Sparkles, Activity, Calendar, Zap, Repeat, Info, Trash2, ArrowLeft } from 'lucide-react';
import { FEATURES } from '../constants';
import { Type } from '@google/genai';
import MarkdownRenderer from '../components/MarkdownRenderer';

const feature = FEATURES.find(f => f.pageType === 'sportsTrainer')!;
const PLAN_STORAGE_KEY = 'sportsTrainerPlan';

const planSchema = {
  type: Type.OBJECT,
  properties: {
    weeklyPlan: {
      type: Type.ARRAY,
      description: "An array of daily workout objects for the week.",
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.STRING, description: "The day of the plan (e.g., 'اليوم الأول', 'اليوم الثاني', 'راحة')." },
          focus: { type: Type.STRING, description: "The main focus for the day's workout (e.g., 'الجزء العلوي', 'تمارين القلب')." },
          exercises: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Name of the exercise." },
                sets: { type: Type.STRING, description: "Number of sets, e.g., '3'." },
                reps: { type: Type.STRING, description: "Number of repetitions per set, e.g., '10-12'." },
                description: { type: Type.STRING, description: "A brief, clear explanation of how to perform the exercise correctly." }
              },
              required: ['name', 'sets', 'reps', 'description']
            }
          }
        },
        required: ['day', 'focus', 'exercises']
      }
    }
  },
  required: ['weeklyPlan']
};


const SportsTrainerPage: React.FC<NavigationProps> = ({ navigateTo }) => {
    const [plan, setPlan] = useState<WorkoutPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formState, setFormState] = useState({
        goal: 'فقدان الوزن',
        level: 'مبتدئ',
        days: '3',
        equipment: 'لا يوجد'
    });
    const [activeDayIndex, setActiveDayIndex] = useState<number | null>(null);
    
    useEffect(() => {
        const savedPlan = localStorage.getItem(PLAN_STORAGE_KEY);
        if (savedPlan) {
            setPlan(JSON.parse(savedPlan));
        }
    }, []);

    const handleFormChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const generatePlan = async () => {
        setIsLoading(true);
        setError(null);
        setPlan(null);

        const prompt = `**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت مدرب رياضي شخصي معتمد وخبير في إنشاء خطط تمارين. بناءً على المعلومات التالية للمستخدم:
- **الهدف:** ${formState.goal}
- **المستوى:** ${formState.level}
- **أيام التمرين الأسبوعية:** ${formState.days}
- **المعدات المتاحة:** ${formState.equipment}

أنشئ جدول تمارين أسبوعي مفصل. يجب أن يكون الرد بتنسيق JSON. يجب أن يحتوي الـ JSON على مفتاح 'weeklyPlan' وهو عبارة عن مصفوفة من الكائنات، كل كائن يمثل يوماً من أيام التمرين ويحتوي على 'day' (e.g., "اليوم الأول"), و 'focus' (e.g., "تمارين الجزء العلوي"), و 'exercises' (مصفوفة من التمارين). كل تمرين يجب أن يحتوي على 'name', 'sets', 'reps', و 'description' تشرح طريقة الأداء الصحيحة. تأكد من تضمين أيام راحة مناسبة.`;
        
        try {
            const result = await callGeminiJsonApi(prompt, planSchema);
            setPlan(result);
            localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(result));
        } catch (e) {
            setError(e instanceof Error ? e.message : "فشل إنشاء الخطة.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const clearPlan = () => {
        setPlan(null);
        localStorage.removeItem(PLAN_STORAGE_KEY);
    }
    
    const renderPlanSetup = () => (
        <div className="bg-white dark:bg-black p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">أنشئ خطتك المخصصة</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ما هو هدفك الرئيسي؟</label>
                    <select name="goal" value={formState.goal} onChange={handleFormChange} className="w-full p-2 border rounded-md dark:bg-black dark:border-gray-600">
                        <option>فقدان الوزن</option>
                        <option>بناء العضلات</option>
                        <option>زيادة اللياقة</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ما هو مستواك الحالي؟</label>
                    <select name="level" value={formState.level} onChange={handleFormChange} className="w-full p-2 border rounded-md dark:bg-black dark:border-gray-600">
                        <option>مبتدئ</option>
                        <option>متوسط</option>
                        <option>متقدم</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">كم يوماً في الأسبوع؟</label>
                    <select name="days" value={formState.days} onChange={handleFormChange} className="w-full p-2 border rounded-md dark:bg-black dark:border-gray-600">
                        <option>2</option>
                        <option>3</option>
                        <option>4</option>
                        <option>5</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ما هي المعدات المتاحة؟</label>
                    <select name="equipment" value={formState.equipment} onChange={handleFormChange} className="w-full p-2 border rounded-md dark:bg-black dark:border-gray-600">
                        <option>لا يوجد (وزن الجسم)</option>
                        <option>أوزان خفيفة (دمبلز)</option>
                        <option>حبال مقاومة</option>
                        <option>جيم متكامل</option>
                    </select>
                </div>
            </div>
            <button onClick={generatePlan} className="w-full mt-6 p-3 bg-cyan-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-600 transition">
                <Sparkles size={20} />
                أنشئ الخطة بالذكاء الاصطناعي
            </button>
        </div>
    );
    
    const renderPlanView = () => (
      <div>
        <div className="bg-white dark:bg-black p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-800 mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">خطتك الأسبوعية</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">هذه هي خطتك المخصصة. اضغط على أي يوم لعرض التمارين.</p>
        </div>
        <div className="space-y-3">
        {plan?.weeklyPlan.map((day, index) => (
            <div key={index} className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <button onClick={() => setActiveDayIndex(activeDayIndex === index ? null : index)} className="w-full p-4 text-right flex justify-between items-center">
                    <div>
                        <p className="text-sm text-cyan-600 dark:text-cyan-400 font-semibold">{day.day}</p>
                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{day.focus}</h3>
                    </div>
                     <ArrowLeft className={`w-5 h-5 transition-transform duration-300 ${activeDayIndex === index ? '-rotate-90' : ''}`} />
                </button>
                {activeDayIndex === index && (
                    <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-black/50">
                        {day.exercises.length > 0 ? (
                            <ul className="space-y-4">
                                {day.exercises.map((ex, exIndex) => (
                                <li key={exIndex} className="p-3 bg-white dark:bg-black rounded-md border dark:border-gray-700">
                                    <h4 className="font-bold text-gray-700 dark:text-gray-100">{ex.name}</h4>
                                    <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        <span><span className="font-semibold">{ex.sets}</span> مجموعات</span>
                                        <span><span className="font-semibold">{ex.reps}</span> تكرار</span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{ex.description}</p>
                                </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400">يوم راحة. استرخ واستعد لليوم التالي!</p>
                        )}
                    </div>
                )}
            </div>
        ))}
        </div>
        <button onClick={clearPlan} className="w-full mt-6 p-3 bg-red-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-red-600 transition">
            <Trash2 size={20} />
            مسح الخطة والبدء من جديد
        </button>
      </div>
    );

    return (
        <div className="bg-gray-50 dark:bg-black min-h-screen">
            <PageHeader navigateTo={navigateTo} title={feature.title} Icon={feature.Icon} color={feature.color} />
            <main className="p-4">
                {isLoading && (
                     <div className="text-center p-8 bg-white dark:bg-black rounded-lg shadow-md">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-300">...المدرب الذكي يقوم بإعداد خطتك</p>
                    </div>
                )}
                {error && (
                    <div className="bg-red-100 dark:bg-black border border-red-300 dark:border-red-500/50 text-red-800 dark:text-red-300 p-4 rounded-lg shadow-md">
                        <h3 className="font-bold mb-2">حدث خطأ</h3>
                        <p>{error}</p>
                    </div>
                )}

                {!isLoading && !error && (plan ? renderPlanView() : renderPlanSetup())}
            </main>
        </div>
    );
};

export default SportsTrainerPage;