
import React, { useState, useEffect } from 'react';
import { NavigationProps, GroundingChunk } from '../types';
import { callGeminiSearchApi } from '../services/geminiService';
import PageHeader from '../components/PageHeader';
import { FEATURES } from '../constants';
import { Search, Sparkles, Mic, Link } from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import VoiceConversationModal from '../components/VoiceConversationModal';

const feature = FEATURES.find(f => f.pageType === 'globalSearch')!;

const GlobalSearchPage: React.FC<NavigationProps> = ({ navigateTo }) => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState('');
    const [groundingChunks, setGroundingChunks] = useState<GroundingChunk[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

    const handleSearch = async (searchText = input) => {
        if (!searchText.trim()) return;
        setIsLoading(true);
        setResult('');
        setError(null);
        setGroundingChunks([]);
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
                        <button
                            onClick={() => setIsVoiceModalOpen(true)}
                            className={`p-3 rounded-md transition bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200`}
                            aria-label="إجراء محادثة صوتية"
                        >
                            <Mic size={20} />
                        </button>
                        <button onClick={() => handleSearch()} disabled={isLoading} className="p-3 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:bg-gray-400">
                            <Search size={20} />
                        </button>
                    </div>
                </div>
                 {isVoiceModalOpen && (
                    // FIX: Remove invalid `onFunctionCall` prop; this logic is now handled by the modal.
                    <VoiceConversationModal
                        isOpen={isVoiceModalOpen}
                        onClose={() => setIsVoiceModalOpen(false)}
                        onSubmit={(transcript) => {
                            setInput(transcript);
                            if (transcript) handleSearch(transcript);
                        }}
                    />
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