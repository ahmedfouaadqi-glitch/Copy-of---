
import React, { useState, useEffect, useCallback } from 'react';
import { NavigationProps, UserPlant } from '../types';
import { getPlants, addPlant, deletePlant } from '../services/plantService';
import { callGeminiApi } from '../services/geminiService';
import PageHeader from '../components/PageHeader';
import { Sprout, Trash2, Camera, PlusCircle, Leaf, ArchiveX } from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';

const PlantCard: React.FC<{ plant: UserPlant; onDelete: (id: string) => void }> = ({ plant, onDelete }) => {
    return (
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm overflow-hidden">
            <img src={plant.image} alt={plant.name} className="w-full h-40 object-cover" />
            <div className="p-3">
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{plant.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    تمت الإضافة: {new Date(plant.addedDate).toLocaleDateString('ar-EG')}
                </p>
                 {plant.careSchedule && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        <p>💧 **الري:** {plant.careSchedule.watering}</p>
                        <p>🌱 **التسميد:** {plant.careSchedule.fertilizing}</p>
                    </div>
                )}
            </div>
             <div className="p-2 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-800 flex justify-end">
                <button onClick={() => onDelete(plant.id)} className="text-gray-500 hover:text-red-500 dark:hover:text-red-400 p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition">
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};

const MyPlantsPage: React.FC<NavigationProps> = ({ navigateTo }) => {
    const [plants, setPlants] = useState<UserPlant[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { analysisData, setAnalysisData } = useAnalysis();

    const fetchPlants = useCallback(() => {
        setPlants(getPlants());
    }, []);

    useEffect(() => {
        fetchPlants();
    }, [fetchPlants]);

    const handleAddNewPlant = useCallback(async (plantName: string, plantImage: string) => {
        setIsLoading(true);
        try {
            const prompt = `**مهمتك: الرد باللغة العربية الفصحى فقط.** بصفتك خبير نباتات، قدم جدول عناية بسيط وموجز لنبتة "${plantName}". اذكر فقط:
1.  **الري:** (مثال: مرة كل أسبوع)
2.  **التسميد:** (مثال: مرة كل شهر في الربيع والصيف)`;

            const careInfo = await callGeminiApi(prompt);
            
            let watering = "حسب الحاجة";
            let fertilizing = "حسب التوصيات";

            const wateringMatch = careInfo.match(/الري:\s*(.*)/);
            if (wateringMatch) watering = wateringMatch[1];
            
            const fertilizingMatch = careInfo.match(/التسميد:\s*(.*)/);
            if (fertilizingMatch) fertilizing = fertilizingMatch[1];

            addPlant({
                name: plantName,
                image: plantImage,
                addedDate: Date.now(),
                careSchedule: { watering, fertilizing },
            });
            fetchPlants();
        } catch (error) {
            console.error("Failed to get care schedule:", error);
            // Add plant without schedule if API fails
            addPlant({
                name: plantName,
                image: plantImage,
                addedDate: Date.now(),
            });
            fetchPlants();
        } finally {
            setIsLoading(false);
            setAnalysisData(null); // Clear context after use
        }
    }, [fetchPlants, setAnalysisData]);
    
    useEffect(() => {
        if (analysisData && analysisData.analysisType === 'plant_id' && analysisData.analysisDetails && analysisData.image) {
            handleAddNewPlant(analysisData.analysisDetails, analysisData.image);
        }
    }, [analysisData, handleAddNewPlant]);


    const handleDeletePlant = (id: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذه النبتة من مجموعتك؟')) {
            deletePlant(id);
            fetchPlants();
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-black min-h-screen">
            <PageHeader navigateTo={navigateTo} title="مجموعتي النباتية" Icon={Leaf} color="amber" backPage={{type: 'smartHealth', pageType: 'decorations'}}/>
            <main className="p-4">
                 <div className="mb-6 bg-white dark:bg-black p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
                    <h2 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2"><PlusCircle size={20} className="text-amber-700" /> إضافة نبتة جديدة</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">استخدم الكاميرا الذكية للتعرف على نبتتك وإضافتها لمجموعتك للحصول على جدول عناية مخصص.</p>
                    <button onClick={() => navigateTo({ type: 'imageAnalysis' })} className="w-full flex items-center justify-center gap-2 p-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition">
                       <Camera size={20} /> الذهاب إلى الكاميرا الذكية
                    </button>
                </div>

                {isLoading && (
                     <div className="text-center p-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-700 mx-auto"></div>
                        <p className="mt-3 text-gray-600 dark:text-gray-300">...جاري إضافة النبتة وإنشاء جدول العناية</p>
                    </div>
                )}

                <div>
                    <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-2 text-xl">نباتاتك الحالية</h3>
                    {plants.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {plants.map(plant => <PlantCard key={plant.id} plant={plant} onDelete={handleDeletePlant} />)}
                        </div>
                    ) : (
                         <div className="flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 py-12 bg-white dark:bg-black rounded-lg border-2 border-dashed dark:border-gray-800">
                            <ArchiveX size={48} className="mb-4 text-gray-400 dark:text-gray-600" />
                            <h3 className="font-bold text-lg text-gray-600 dark:text-gray-200">مجموعتك فارغة</h3>
                            <p className="text-sm mt-1">ابدأ بإضافة نبتتك الأولى باستخدام الكاميرا الذكية.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MyPlantsPage;