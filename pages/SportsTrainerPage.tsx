import React, { useState, useEffect, useCallback } from 'react';
import { NavigationProps, WorkoutPlan, WorkoutDay, WorkoutExercise } from '../types';
import { callGeminiJsonApi } from '../services/geminiService';
import { addInspiration } from '../services/inspirationService';
import PageHeader from '../components/PageHeader';
import { Dumbbell, Sparkles, ArrowLeft, Trash2, Edit, Save, Share2 } from 'lucide-react';
import { FEATURES } from '../constants';
import { Type } from '@google/genai';
import toast from 'react-hot-toast';

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
    const [originalPlan, setOriginalPlan] = useState<WorkoutPlan | null>(null);
    const [editedPlan, setEditedPlan] = useState<WorkoutPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formState, setFormState] = useState({
        goal: 'فقدان الوزن',
        level: 'مبتدئ',
        days: '3',
        equipment: 'لا يوجد (وزن الجسم)'
    });
    const [activeDayIndex, setActiveDayIndex] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    
    useEffect(() => {
        const savedPlan = localStorage.getItem(PLAN_STORAGE_KEY);
        if (savedPlan) {
            const parsedPlan = JSON.parse(savedPlan);
            setOriginalPlan(parsedPlan);
            setEditedPlan(parsedPlan); // Initialize edited plan
        }
    }, []);

    const handleFormChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const generatePlan = async () => {
        setIsLoading(true);
        setError(null);
        setOriginalPlan(null);
        setEditedPlan(null);
        setActiveDayIndex(null);

        const prompt = `**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت مدرب رياضي شخصي معتمد وخبير في إنشاء خطط تمارين. بناءً على المعلومات التالية للمستخدم:
- **الهدف:** ${formState.goal}
- **المستوى:** ${formState.level}
- **أيام التمرين الأسبوعية:** ${formState.days}
- **المعدات المتاحة:** ${formState.equipment}

أنشئ جدول تمارين أسبوعي مفصل. يجب أن يكون الرد بتنسيق JSON. يجب أن يحتوي الـ JSON على مفتاح 'weeklyPlan' وهو عبارة عن مصفوفة من الكائنات، كل كائن يمثل يوماً من أيام التمرين ويحتوي على 'day' (e.g., "اليوم الأول"), و 'focus' (e.g., "تمارين الجزء العلوي"), و 'exercises' (مصفوفة من التمارين). كل تمرين يجب أن يحتوي على 'name', 'sets', 'reps', و 'description' تشرح طريقة الأداء الصحيحة. تأكد من تضمين أيام راحة مناسبة.`;
        
        try {
            const result = await callGeminiJsonApi(prompt, planSchema);
            if (result && result.weeklyPlan) {
                setOriginalPlan(result);
                setEditedPlan(JSON.parse(JSON.stringify(result))); // Deep copy for editing
                localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(result));
            } else {
                throw new Error("لم يتمكن الذكاء الاصطناعي من إنشاء خطة بالصيغة الصحيحة.");
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "فشل إنشاء الخطة.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const clearPlan = () => {
        setOriginalPlan(null);
        setEditedPlan(null);
        setActiveDayIndex(null);
        setIsEditing(false);
        localStorage.removeItem(PLAN_STORAGE_KEY);
    }
    
    const handleExerciseChange = (dayIndex: number, exIndex: number, field: keyof WorkoutExercise, value: string) => {
        if (!editedPlan) return;
        const newPlan = JSON.parse(JSON.stringify(editedPlan)); // Deep copy
        newPlan.weeklyPlan[dayIndex].exercises[exIndex][field] = value;
        setEditedPlan(newPlan);
    };

    const saveChanges = () => {
        if (!originalPlan || !editedPlan) return;
        
        const correctionData = {
            timestamp: Date.now(),
            originalPlan,
            correctedPlan: editedPlan,
        };
        
        const corrections = JSON.parse(localStorage.getItem('plan_corrections') || '[]');
        corrections.push(correctionData);
        localStorage.setItem('plan_corrections', JSON.stringify(corrections));
        
        localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(editedPlan));
        setOriginalPlan(editedPlan);
        setIsEditing(false);
        toast.success('تم حفظ تعديلاتك على الخطة!');
    };
    
    const handleShareInspiration = () => {
        if (originalPlan) {
            addInspiration({
                type: 'workout',
                title: `خطة ${formState.goal} للمستوى ${formState.level}`,
                content: originalPlan,
            });
            toast.success('تمت مشاركة خطتك مع المجتمع!');
        }
    };


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
                        <option>تحسين الأداء الرياضي</option>
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
            <button onClick={generatePlan} className="w-full mt-6 p-3 bg-cyan-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-600 transition active:scale-95">
                <Sparkles size={20} />
                أنشئ الخطة بالذكاء الاصطناعي
            </button>
        </div>
    );
    
    const renderPlanView = () => (
      <div>
        <div className="bg-white dark:bg-black p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-800 mb-4 flex justify-between items-center flex-wrap gap-2">
            <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">خطتك الأسبوعية</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">هذه هي خطتك المخصصة. اضغط على أي يوم لعرض التمارين.</p>
            </div>
            <div className="flex gap-2">
                 {!isEditing && (
                     <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-sm font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
                        <Edit size={16} /> تعديل
                    </button>
                )}
                 <button onClick={handleShareInspiration} className="flex items-center gap-2 px-3 py-2 bg-pink-100 dark:bg-black text-pink-700 dark:text-pink-300 text-sm font-semibold rounded-lg hover:bg-pink-200 dark:hover:bg-pink-900/50 border border-pink-200 dark:border-pink-500/50">
                    <Share2 size={16} /> مشاركة
                </button>
            </div>
        </div>
        <div className="space-y-3">
        {editedPlan?.weeklyPlan.map((day, index) => (
            <div key={index} className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <button onClick={() => setActiveDayIndex(activeDayIndex === index ? null : index)} className="w-full p-4 text-right flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-900/50 transition">
                    <div>
                        <p className="text-sm text-cyan-600 dark:text-cyan-400 font-semibold">{day.day}</p>
                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{day.focus}</h3>
                    </div>
                     <ArrowLeft className={`w-5 h-5 transition-transform duration-300 ${activeDayIndex === index ? '-rotate-90' : 'rotate-180'}`} />
                </button>
                {activeDayIndex === index && (
                    <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-black/50">
                        {day.exercises && day.exercises.length > 0 ? (
                            <ul className="space-y-4">
                                {day.exercises.map((ex, exIndex) => (
                                <li key={exIndex} className="p-3 bg-white dark:bg-black rounded-md border dark:border-gray-700">
                                    <input value={ex.name} onChange={(e) => handleExerciseChange(index, exIndex, 'name', e.target.value)} disabled={!isEditing} className="font-bold text-gray-700 dark:text-gray-100 bg-transparent w-full disabled:pointer-events-none p-1 -m-1 rounded-md focus:bg-gray-100 dark:focus:bg-gray-800" />
                                    <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        <span><input value={ex.sets} onChange={(e) => handleExerciseChange(index, exIndex, 'sets', e.target.value)} disabled={!isEditing} className="font-semibold w-8 text-center bg-transparent disabled:pointer-events-none p-1 -m-1 rounded-md focus:bg-gray-100 dark:focus:bg-gray-800" /> مجموعات</span>
                                        <span><input value={ex.reps} onChange={(e) => handleExerciseChange(index, exIndex, 'reps', e.target.value)} disabled={!isEditing} className="font-semibold w-16 text-center bg-transparent disabled:pointer-events-none p-1 -m-1 rounded-md focus:bg-gray-100 dark:focus:bg-gray-800"/> تكرار</span>
                                    </div>
                                    <textarea value={ex.description} onChange={(e) => handleExerciseChange(index, exIndex, 'description', e.target.value)} disabled={!isEditing} className="text-sm text-gray-600 dark:text-gray-300 mt-2 w-full bg-transparent resize-none disabled:pointer-events-none p-1 -m-1 rounded-md focus:bg-gray-100 dark:focus:bg-gray-800" rows={2}/>
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
         <div className="flex flex-col sm:flex-row gap-2 mt-6">
             {isEditing ? (
                <button onClick={saveChanges} className="w-full p-3 bg-green-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 transition active:scale-95">
                    <Save size={20} /> حفظ التغييرات
                </button>
             ) : (
                <button onClick={clearPlan} className="w-full p-3 bg-red-500/90 text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-red-500 transition active:scale-95">
                    <Trash2 size={20} /> مسح الخطة والبدء من جديد
                </button>
             )}
        </div>
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
                        <button onClick={() => setError(null)} className="mt-2 text-sm text-red-700 dark:text-red-300 underline">حاول مرة أخرى</button>
                    </div>
                )}

                {!isLoading && !error && (originalPlan ? renderPlanView() : renderPlanSetup())}
            </main>
        </div>
    );
};

export default SportsTrainerPage;