import React from 'react';
import { X, Mic, NotebookText, UtensilsCrossed, Brush, Navigation } from 'lucide-react';

interface CommandGuideProps {
  onClose: () => void;
}

const CommandGuide: React.FC<CommandGuideProps> = ({ onClose }) => {
    const commands = [
        { icon: Mic, category: 'أوامر عامة', examples: ['"ابحثي عن فوائد الشاي الأخضر"', '"ما هو الطقس اليوم؟"'] },
        { icon: NotebookText, category: 'اليوميات', examples: ['"أضيفي كوب ماء إلى يومياتي"', '"سجلي أنني مشيت لمدة 20 دقيقة"'] },
        { icon: UtensilsCrossed, category: 'الطهي', examples: ['"حللي السعرات في تفاحة"', '"ابتكري لي وصفة بالدجاج والأرز"'] },
        { icon: Brush, category: 'الإبداع', examples: ['"ارسمي لي صورة لقطة ترتدي قبعة فضاء"'] },
        { icon: Navigation, category: 'التنقل', examples: ['"اذهبي إلى صفحة اليوميات"', '"افتحي الكاميرا الذكية"'] },
    ];

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-gray-800 rounded-2xl p-6 w-full max-w-lg text-white shadow-2xl border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">ماذا يمكنك أن تقول؟</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {commands.map(cmd => (
                <div key={cmd.category}>
                    <h3 className="font-semibold text-lg flex items-center gap-2 text-indigo-300 mb-2">
                        <cmd.icon size={20} />
                        {cmd.category}
                    </h3>
                    <ul className="list-disc list-inside space-y-1 mr-4 text-gray-300">
                        {cmd.examples.map((ex, i) => <li key={i}>{ex}</li>)}
                    </ul>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CommandGuide;
