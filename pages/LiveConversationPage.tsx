import React, { useState, useEffect, useRef } from 'react';
import { NavigationProps } from '../types';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from '@google/genai';
import { encode, decode, decodeAudioData } from '../utils/audioUtils';
import PageHeader from '../components/PageHeader';
import { FEATURES } from '../constants';
import { Mic, MicOff, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const feature = FEATURES.find(f => f.pageType === 'liveConversation')!;
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

interface TranscriptionEntry {
    speaker: 'user' | 'model';
    text: string;
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

const LiveConversationPage: React.FC<NavigationProps> = ({ navigateTo }) => {
    const [isConnecting, setIsConnecting] = useState(true);
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [transcription, setTranscription] = useState<TranscriptionEntry[]>([]);
    
    const sessionRef = useRef<LiveSession | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    
    let nextStartTime = 0;

    const stopConversation = () => {
        if (sessionRef.current) {
            sessionRef.current.close();
            sessionRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (outputAudioContextRef.current) {
            outputAudioContextRef.current.close();
            outputAudioContextRef.current = null;
        }
        setIsListening(false);
        setIsConnecting(false);
    };

    const startConversation = async () => {
        setIsConnecting(true);
        setError(null);
        setTranscription([]);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            let currentInputTranscription = '';
            let currentOutputTranscription = '';

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        const source = audioContextRef.current!.createMediaStreamSource(stream);
                        processorRef.current = audioContextRef.current!.createScriptProcessor(4096, 1, 1);

                        processorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromise.then((session) => session.sendRealtimeInput({ media: pcmBlob }));
                        };

                        source.connect(processorRef.current);
                        processorRef.current.connect(audioContextRef.current!.destination);
                        setIsConnecting(false);
                        setIsListening(true);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            currentInputTranscription += message.serverContent.inputTranscription.text;
                        }
                        if (message.serverContent?.outputTranscription) {
                            currentOutputTranscription += message.serverContent.outputTranscription.text;
                        }
                        if (message.serverContent?.turnComplete) {
                            setTranscription(prev => [...prev, 
                                { speaker: 'user', text: currentInputTranscription },
                                { speaker: 'model', text: currentOutputTranscription }
                            ]);
                            currentInputTranscription = '';
                            currentOutputTranscription = '';
                        }

                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (base64Audio && outputAudioContextRef.current) {
                             nextStartTime = Math.max(nextStartTime, outputAudioContextRef.current.currentTime);
                             const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
                             const source = outputAudioContextRef.current.createBufferSource();
                             source.buffer = audioBuffer;
                             source.connect(outputAudioContextRef.current.destination);
                             source.start(nextStartTime);
                             nextStartTime += audioBuffer.duration;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        setError(`حدث خطأ في الاتصال: ${e.message}`);
                        stopConversation();
                    },
                    onclose: (e: CloseEvent) => {
                        stopConversation();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    systemInstruction: "أنت 'الروح التقنية'، مساعد صوتي ودود ومتعاون في تطبيق صحتك/كي. كن موجزاً وواضحاً في ردودك. لا تذكر اسم 'Gemini' أبداً."
                },
            });
            sessionRef.current = await sessionPromise;

        } catch (err) {
            setError("فشل الوصول إلى المايكروفون. يرجى السماح بالوصول والمحاولة مرة أخرى.");
            setIsConnecting(false);
        }
    };

    useEffect(() => {
        startConversation();
        return () => {
            stopConversation();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const renderTranscription = () => (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {transcription.map((entry, index) => (
                <div key={index} className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3 rounded-lg max-w-sm ${entry.speaker === 'user' ? 'bg-blue-100 dark:bg-blue-900/50 text-right' : 'bg-gray-100 dark:bg-gray-800'}`}>
                        <p className="font-semibold text-xs mb-1">{entry.speaker === 'user' ? 'أنت' : 'الروح التقنية'}</p>
                        <p>{entry.text}</p>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-black">
            <PageHeader navigateTo={navigateTo} title={feature.title} Icon={feature.Icon} color={feature.color} onBack={stopConversation} />
            
            {error && (
                <div className="p-4 m-4 bg-red-100 dark:bg-black border border-red-300 dark:border-red-500/50 text-red-800 dark:text-red-300 rounded-lg shadow-md flex items-center gap-3">
                    <AlertTriangle size={24} />
                    <span>{error}</span>
                </div>
            )}
            
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-300 ${isListening ? 'bg-teal-500/20' : 'bg-gray-500/20'}`}>
                    <div className={`w-36 h-36 rounded-full flex items-center justify-center transition-all duration-300 ${isListening ? 'bg-teal-500/30' : 'bg-gray-500/30'}`}>
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${isListening ? 'bg-teal-500 shadow-lg' : 'bg-gray-500'}`}>
                             {isListening ? <Mic size={40} className="text-white animate-pulse" /> : <MicOff size={40} className="text-white" />}
                        </div>
                    </div>
                </div>
                <h2 className="text-xl font-bold mt-6">{isConnecting ? '...جاري الاتصال' : isListening ? 'المحادثة جارية...' : 'المحادثة متوقفة'}</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">تحدث بوضوح وستقوم "الروح التقنية" بالرد عليك.</p>
            </div>
            
            {transcription.length > 0 && renderTranscription()}
        </div>
    );
};

export default LiveConversationPage;