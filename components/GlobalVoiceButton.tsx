import React, { useState } from 'react';
import { Mic } from 'lucide-react';
import VoiceConversationModal from './VoiceConversationModal';
import toast from 'react-hot-toast';
import { addDiaryEntry } from '../services/diaryService';
import { NavigationProps, PageType } from '../types';
import { FEATURES } from '../constants';
import { useScrollDirection } from '../hooks/useScrollDirection';

const GlobalVoiceButton: React.FC<NavigationProps> = ({ navigateTo }) => {
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const scrollDirection = useScrollDirection();

  const handleFunctionCall = (name: string, args: any) => {
    switch (name) {
      case 'addToDiary':
        if (args.entry) {
          addDiaryEntry(new Date(), { type: 'note', icon: '🗣️', title: 'إدخال صوتي', details: args.entry });
          toast.success(`✅ تمت إضافة "${args.entry}" إلى يومياتك.`);
        }
        break;
      case 'navigateToPage':
        if (args.page) {
            const validPages: PageType[] = ['home', 'imageAnalysis', 'calorieCounter', 'smartHealth', 'pharmacy', 'healthDiary', 'chat', 'myPlants', 'globalSearch', 'schedule', 'beauty', 'decorations'];
            if (validPages.includes(args.page)) {
                const pageType = args.page as PageType;
                
                let targetPageType: PageType = 'smartHealth';
                let subPageType: string | undefined = undefined;

                if (['beauty', 'decorations', 'schedule'].includes(pageType)) {
                    subPageType = pageType;
                } else {
                    targetPageType = pageType;
                }
                
                const pageLookup = FEATURES.find(f => f.pageType === (subPageType || targetPageType));
                
                if (pageLookup) {
                   navigateTo(pageLookup.page);
                   toast.success(`🚀 يتم الانتقال إلى ${pageLookup.title}.`);
                } else {
                   toast.error(`❌ لم يتم العثور على صفحة "${args.page}".`);
                }

            } else {
                 toast.error(`❌ الصفحة "${args.page}" غير موجودة.`);
            }
        }
        break;
      default:
        // Other functions are handled inside the modal (like image generation)
        // or just return text, which don't need global handling.
        break;
    }
  };

  return (
    <>
      <button
        onClick={() => setIsVoiceModalOpen(true)}
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-transform transform hover:scale-110 duration-300 ${
          scrollDirection === 'down' ? 'translate-y-32' : 'translate-y-0'
        }`}
        aria-label="بدء محادثة صوتية شاملة"
      >
        <Mic size={32} />
      </button>

      {isVoiceModalOpen && (
        <VoiceConversationModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          onFunctionCall={handleFunctionCall}
        />
      )}
    </>
  );
};

export default GlobalVoiceButton;