import React, { useState, useRef, useEffect, useCallback } from 'react';
import { NavigationProps, ChatMessage } from '../types';
import { callGeminiChatApi, generateImage } from '../services/geminiService';
import PageHeader from '../components/PageHeader';
import { FEATURES } from '../constants';
import { Send, Paperclip, X } from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import SmartTip from '../components/SmartTip';
import { playSound } from '../services/soundService';

const feature = FEATURES.find(f => f.pageType === 'chat')!;
const SYSTEM_INSTRUCTION = "أنت 'عقل الروح التقنية'، مساعد ذكي ومتعدد الاستخدامات في تطبيق صحتك/كي. مهمتك هي الإجابة على استفسارات المستخدمين بوضوح ودقة. كن ودوداً ومتعاوناً وشخصياً.";

const ChatPage: React.FC<NavigationProps> = ({ navigateTo }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Greeting logic
  useEffect(() => {
    const storedMessages = JSON.parse(localStorage.getItem('chatHistory') || '[]') as ChatMessage[];
    if (storedMessages.length === 0) {
      const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'صباح الخير';
        if (hour < 18) return 'مساء الخير';
        return 'مساء الخير';
      };
      const initialMessage: ChatMessage = {
        role: 'model',
        content: `**${getGreeting()}!** أنا 'عقل الروح التقنية'.\nمرحباً بك، اسالني عن اي شيء يخطر ببالك.`
      };
      setMessages([initialMessage]);
    } else {
      setMessages(storedMessages);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async (text: string, attachedImage: string | null = image) => {
    if ((!text.trim() && !attachedImage) || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: text, imageUrl: attachedImage };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setImage(null);
    setIsLoading(true);
    playSound('tap');

    try {
        const imageCommandRegex = /^(ارسم|صمم|تخيل|انشئ)\s/i;
        if (imageCommandRegex.test(text.trim())) {
            const prompt = text.trim().replace(imageCommandRegex, '');
            const imageUrl = await generateImage(prompt);
            const modelMessage: ChatMessage = { role: 'model', content: `تفضل، هذه هي الصورة التي طلبتها بناءً على وصف: "${prompt}"`, imageUrl };
            setMessages(prev => [...prev, modelMessage]);
            playSound('notification');
        } else {
            const response = await callGeminiChatApi(newMessages, SYSTEM_INSTRUCTION);
            const modelMessage: ChatMessage = { role: 'model', content: response };
            setMessages(prev => [...prev, modelMessage]);
            playSound('notification');
        }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ غير متوقع.";
      const modelMessage: ChatMessage = { role: 'model', content: `**عذراً، حدث خطأ:**\n\n${errorMessage}` };
      setMessages(prev => [...prev, modelMessage]);
      playSound('error');
    } finally {
      setIsLoading(false);
    }
  }, [messages, image, isLoading]);
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setImage(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-black">
      <PageHeader navigateTo={navigateTo} title={feature.title} Icon={feature.Icon} color={feature.color} />
      
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        <SmartTip
            tipId="image_generation_tip"
            message="هل تعلم؟ يمكنك أن تطلب مني رسم أي شيء يخطر ببالك! فقط ابدأ رسالتك بكلمة 'ارسم' أو 'صمم'."
        />
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-md lg:max-w-xl p-3 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
              {msg.imageUrl && <img src={msg.imageUrl} alt="chat content" className="rounded-lg mb-2 max-h-60" />}
              <MarkdownRenderer content={msg.content} />
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-end gap-2 justify-start">
            <div className="max-w-lg p-3 rounded-2xl shadow-sm bg-white dark:bg-gray-800 rounded-bl-none">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      <footer className="p-4 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto">
            {image && (
                <div className="relative mb-2 w-24">
                    <img src={image} alt="preview" className="rounded-lg h-24 w-24 object-cover" />
                    <button onClick={() => setImage(null)} className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1"><X size={14} /></button>
                </div>
            )}
            <div className="flex items-center gap-2">
                <label className="p-3 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg transition-colors cursor-pointer">
                    <Paperclip size={20} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload}/>
                </label>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="اكتب رسالتك هنا..."
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 bg-gray-100 dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-200 resize-none"
                    rows={1}
                />
                <button
                    onClick={() => handleSend(input)}
                    disabled={isLoading || (!input.trim() && !image)}
                    className="p-3 bg-teal-500 text-white rounded-lg disabled:bg-teal-300 dark:disabled:bg-teal-800 transition-colors"
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default ChatPage;
