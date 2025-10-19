import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob as GenAI_Blob, FunctionCall } from '@google/genai';
import { X, Mic, Info, Loader2, Sparkles } from 'lucide-react';
import { TOOLS } from '../constants/tools';
import { generateImage, analyzeCaloriesForVoice, generateSpeech } from '../services/geminiService';
import { decode, decodeAudioData, encode, playBase64Audio } from '../utils/audioUtils';
import CommandGuide from './CommandGuide';
import toast from 'react-hot-toast';

type HistoryItem = { role: 'user' | 'model'; text: string; imageUrl?: string };

interface VoiceConversationModalProps {
  isOpen: boolean;
  onClose: (history?: HistoryItem[]) => void;
  onSubmit?: (transcript: string) => void;
  onFunctionCall?: (name: string, args: any) => void;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const VoiceConversationModal: React.FC<VoiceConversationModalProps> = ({ isOpen, onClose, onSubmit, onFunctionCall }) => {
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [error, setError] = useState<string | null>(null);

  const [currentInput, setCurrentInput] = useState('');
  const [currentOutput, setCurrentOutput] = useState('');
  const [isCommandGuideOpen, setIsCommandGuideOpen] = useState(false);
  const [followUpFor, setFollowUpFor] = useState<FunctionCall | null>(null);

  const isSingleShotMode = !!onSubmit;
  
  const historyRef = useRef(history);
  historyRef.current = history;

  const currentInputRef = useRef(currentInput);
  currentInputRef.current = currentInput;

  const currentOutputRef = useRef(currentOutput);
  currentOutputRef.current = currentOutput;
  
  const followUpForRef = useRef(followUpFor);
  followUpForRef.current = followUpFor;
  
  // FIX: Add a ref to track the current status without causing re-renders of dependent callbacks.
  const statusRef = useRef(status);
  statusRef.current = status;


  // Audio refs
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const audioProcessorRef = useRef<{ cleanup: () => void } | null>(null);
  const currentSpeechRef = useRef<AudioBufferSourceNode | null>(null);


  const handleClose = useCallback(() => {
    sessionPromiseRef.current?.then(session => {
      session.close();
    }).catch(() => {});
    sessionPromiseRef.current = null;
    
    audioProcessorRef.current?.cleanup();
    audioProcessorRef.current = null;
    
    if (outputAudioContextRef.current?.state !== 'closed') {
      outputAudioContextRef.current?.close();
      outputAudioContextRef.current = null;
    }
    
    onClose(isSingleShotMode ? undefined : historyRef.current);
  }, [onClose, isSingleShotMode]);
  
    const playOutputSpeech = useCallback(async (base64Audio: string) => {
    if (!outputAudioContextRef.current || outputAudioContextRef.current.state === 'closed') {
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const outputAudioContext = outputAudioContextRef.current;
    
    if (outputAudioContext.state === 'suspended') {
      await outputAudioContext.resume();
    }

    nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
    
    const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
    const source = outputAudioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outputAudioContext.destination);
    
    source.addEventListener('ended', () => {
      sourcesRef.current.delete(source);
      if (sourcesRef.current.size === 0) {
        setStatus(prev => (prev === 'speaking' ? 'idle' : prev));
      }
    });
    
    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += audioBuffer.duration;
    sourcesRef.current.add(source);
  }, []);

  // The core message handler
  const handleMessage = useCallback(async (message: LiveServerMessage) => {
    if (message.serverContent?.inputTranscription) {
        if (currentSpeechRef.current) {
            currentSpeechRef.current.stop();
            currentSpeechRef.current = null;
        }
        setStatus('processing');
        const text = message.serverContent.inputTranscription.text;
        setCurrentInput(prev => prev + text);
    }
    
    if (message.serverContent?.outputTranscription) {
        setStatus('speaking');
        const text = message.serverContent.outputTranscription.text;
        setCurrentOutput(prev => prev + text);
    }
  
    if (message.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
        setStatus('speaking');
        playOutputSpeech(message.serverContent.modelTurn.parts[0].inlineData.data);
    }
  
    if (message.toolCall?.functionCalls) {
        for (const fc of message.toolCall.functionCalls) {
            // Conversational action for adding a note
            if (fc.name === 'addToDiary' && !fc.args.entry) {
                setFollowUpFor(fc);
                setStatus('speaking');
                const question = "بالتأكيد. ما هي الملاحظة التي تود إضافتها؟";
                setCurrentOutput(question);
                generateSpeech(question).then(base64 => playBase64Audio(base64).then(source => {
                    currentSpeechRef.current = source;
                    source.onended = () => { if(status === 'speaking') setStatus('idle') };
                }));
                continue; // Skip sending tool response for now
            }
            
            let result = "تم تنفيذ الإجراء بنجاح.";
            if (onFunctionCall) {
                onFunctionCall(fc.name, fc.args);
            }
            // Handle internal functions
            if (fc.name === 'generateImage') {
                toast.promise(generateImage(fc.args.prompt), {
                    loading: '...جاري إنشاء الصورة',
                    success: (imageUrl) => {
                        setHistory(prev => [...prev, { role: 'model', text: `تفضل، هذه هي الصورة التي طلبتها.`, imageUrl }]);
                        return 'تم إنشاء الصورة!';
                    },
                    error: 'فشل إنشاء الصورة.',
                });
            } else if (fc.name === 'analyzeCaloriesForVoice') {
                result = await analyzeCaloriesForVoice(fc.args.foodName);
                toast.success('✅ تم تحليل السعرات بنجاح.');
            }
            
            sessionPromiseRef.current?.then(session => session.sendToolResponse({
                functionResponses: { id: fc.id, name: fc.name, response: { result } }
            }));
        }
    }
  
    if (message.serverContent?.turnComplete) {
        const finalInput = currentInputRef.current.trim();
        const finalOutput = currentOutputRef.current.trim();
        const currentFollowUp = followUpForRef.current;

        if (currentFollowUp && finalInput) {
            if (currentFollowUp.name === 'addToDiary') {
                const completedArgs = { ...currentFollowUp.args, entry: finalInput };
                if (onFunctionCall) {
                    onFunctionCall(currentFollowUp.name, completedArgs);
                }
                sessionPromiseRef.current?.then(session => session.sendToolResponse({
                    functionResponses: { id: currentFollowUp.id, name: currentFollowUp.name, response: { result: `تمت إضافة الملاحظة: "${finalInput}"` } }
                }));
            }
            setFollowUpFor(null);
        } else {
             if (finalInput) {
                if (isSingleShotMode) {
                    if (onSubmit) onSubmit(finalInput);
                    handleClose();
                    return;
                }
                setHistory(prev => [...prev, { role: 'user', text: finalInput }]);
            }
            if (finalOutput) {
                setHistory(prev => [...prev, { role: 'model', text: finalOutput }]);
            }
        }

        setCurrentInput('');
        setCurrentOutput('');
        setStatus('idle');
    }
  
    if (message.serverContent?.interrupted) {
        for (const source of sourcesRef.current.values()) {
            source.stop();
        }
        sourcesRef.current.clear();
        nextStartTimeRef.current = 0;
        setStatus('idle');
    }
  }, [onFunctionCall, onSubmit, isSingleShotMode, handleClose, playOutputSpeech]);
  
  const startListening = useCallback(async () => {
    // FIX: Use statusRef to prevent re-entry, making the function stable.
    if (statusRef.current === 'listening' || !sessionPromiseRef.current) return;
    setStatus('listening');

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const source = inputAudioContext.createMediaStreamSource(stream);
        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
        
        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            const pcmBlob: GenAI_Blob = {
                data: encode(new Uint8Array(new Int16Array(inputData.map(f => f * 32768)).buffer)),
                mimeType: 'audio/pcm;rate=16000',
            };
            sessionPromiseRef.current?.then((session) => {
              session.sendRealtimeInput({ media: pcmBlob });
            });
        };
        
        source.connect(scriptProcessor);
        scriptProcessor.connect(inputAudioContext.destination);

        audioProcessorRef.current = {
            cleanup: () => {
                stream.getTracks().forEach(track => track.stop());
                source.disconnect();
                scriptProcessor.disconnect();
                if (inputAudioContext.state !== 'closed') {
                    inputAudioContext.close();
                }
            }
        };

    } catch (err) {
        console.error('Error starting audio stream:', err);
        setError('حدث خطأ عند محاولة الوصول إلى الميكروفون. يرجى التأكد من منح الإذن.');
        setStatus('idle');
    }
    // FIX: Removed `status` dependency to stabilize the function and prevent re-render loops.
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    
    setStatus('idle');
    setHistory([]);
    setCurrentInput('');
    setCurrentOutput('');
    setError(null);
    setFollowUpFor(null);
    nextStartTimeRef.current = 0;
    
    const systemInstruction = isSingleShotMode
        ? "مهمتك هي فقط تحويل كلام المستخدم إلى نص مكتوب بدقة باللغة العربية. لا تقم بالرد أو بدء حوار."
        : "أنت 'عقل الروح التقنية'، مساعد صوتي ذكي ومتعدد الاستخدامات في تطبيق صحتك/كي. كن موجزاً ومتعاوناً ومباشراً. استجب للأوامر ونفذ الوظائف عند الطلب. خاطب المستخدم دائماً بصيغة المؤنث.";

    sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: () => console.log('Live session opened'),
            onmessage: handleMessage,
            onerror: (e: ErrorEvent) => {
                console.error('Live session error:', e);
                setError('حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.');
                setStatus('idle');
            },
            onclose: () => console.log('Live session closed'),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { voiceName: 'Kore' } },
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          tools: [{ functionDeclarations: TOOLS }],
          systemInstruction: systemInstruction,
        },
    });

    sessionPromiseRef.current.then(() => {
      startListening();
    }).catch(err => {
      console.error("Failed to connect to Live API", err);
      setError("فشل الاتصال بمساعد الصوت.");
    });

    return () => {
      handleClose();
    };
  }, [isOpen, handleMessage, handleClose, startListening, isSingleShotMode]);

  const MicButton = () => {
    let Icon = Mic;
    let color = 'bg-indigo-600 hover:bg-indigo-700';
    let pulse = false;
    if (status === 'listening' || status === 'processing') {
      color = 'bg-red-600 hover:bg-red-700';
      pulse = true;
    }
    if (status === 'speaking') {
      Icon = Sparkles;
      color = 'bg-teal-500';
    }
    if (status === 'processing' && !isSingleShotMode) {
      Icon = Loader2;
    }

    return (
      <button
        onClick={status === 'listening' ? () => {} : startListening}
        disabled={status === 'speaking'}
        className={`relative w-20 h-20 rounded-full text-white transition-all duration-300 flex items-center justify-center shadow-lg ${color} disabled:opacity-70`}
      >
        {pulse && <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>}
        <Icon className={`w-10 h-10 ${status === 'processing' && 'animate-spin'}`} />
      </button>
    );
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
        <div className="absolute top-4 right-4 flex items-center gap-2">
           <button onClick={() => setIsCommandGuideOpen(true)} className="p-2.5 rounded-full text-white/80 hover:bg-white/20 transition">
             <Info size={24} />
           </button>
           <button onClick={handleClose} className="p-2.5 rounded-full text-white/80 hover:bg-white/20 transition">
             <X size={24} />
           </button>
        </div>

        <div className="flex-1 flex flex-col justify-end items-center text-center w-full max-w-2xl">
            <div className="min-h-[100px] text-white/90 text-2xl font-semibold p-4">
                {status === 'speaking' ? currentOutput : (currentInput || (status === 'listening' ? '...تحدثي الآن' : ''))}
            </div>
            {error && <p className="text-red-400 bg-red-900/50 px-4 py-2 rounded-md mb-4">{error}</p>}
        </div>

        <div className="flex-1 flex flex-col justify-center items-center">
          <MicButton />
        </div>
        
        <div className="h-1/5 w-full text-center text-white/60">
            {isSingleShotMode ? 'سيتم إغلاق النافذة بعد إدخالك' : 'مساعدك الصوتي'}
        </div>

        {isCommandGuideOpen && <CommandGuide onClose={() => setIsCommandGuideOpen(false)} />}
    </div>
  );
};

export default VoiceConversationModal;