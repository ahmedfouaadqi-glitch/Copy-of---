import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface DirectCameraInputProps {
  onCapture: (image: string) => void;
  onClose: () => void;
  initialFacingMode: "user" | "environment";
}

const DirectCameraInput: React.FC<DirectCameraInputProps> = ({ onCapture, onClose, initialFacingMode }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(initialFacingMode);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const startCamera = useCallback(async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: facingMode } }
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setHasPermission(true);
    } catch (error) {
      console.error("فشل الوصول إلى الكاميرا:", error);
       try {
            const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
            setStream(fallbackStream);
            if (videoRef.current) videoRef.current.srcObject = fallbackStream;
            setHasPermission(true);
       } catch (fallbackError) {
            console.error("فشل الوصول إلى الكاميرا (Fallback):", fallbackError);
            toast.error("يرجى السماح للتطبيق باستخدام الكاميرا.");
            setHasPermission(false);
            onClose();
       }
    }
  }, [facingMode, stream, onClose]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const switchCamera = () => {
    setFacingMode(prev => (prev === "user" ? "environment" : "user"));
  };

  const captureImage = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
    }
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64Image = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(base64Image);
  };
  
  const handleConfirm = () => {
      if(capturedImage) {
        onCapture(capturedImage);
        onClose();
      }
  }

  const retake = () => {
    setCapturedImage(null);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full z-20 hover:bg-black/70 transition">
            <X size={24} />
        </button>

      {!capturedImage ? (
        <div className="relative w-full h-full flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          ></video>
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent z-10">
            <div className="flex items-center justify-around max-w-md mx-auto">
              <div className="w-16 h-16" />
              <button
                onClick={captureImage}
                className="w-20 h-20 rounded-full border-[6px] border-white/90 bg-transparent shadow-lg transition duration-200 ease-in-out hover:border-white focus:outline-none active:scale-95"
                title="التقاط"
              />
              <button
                onClick={switchCamera}
                className="bg-white/20 backdrop-blur-sm text-white p-4 rounded-full shadow-md active:scale-95 transition"
                title="تبديل الكاميرا"
              >
                <RefreshCw size={24} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full p-4 bg-black">
          <img
            src={capturedImage}
            alt="صورة ملتقطة"
            className="max-w-full max-h-[75vh] rounded-lg shadow-md"
          />
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent z-10">
            <div className="flex items-center justify-around w-full max-w-sm mx-auto">
                <button
                    onClick={retake}
                    className="text-white text-lg font-semibold flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/10 transition"
                >
                    <X size={20} />
                    إعادة
                </button>
                <button
                    onClick={handleConfirm}
                    className="bg-teal-500 text-white p-4 rounded-full shadow-lg hover:bg-teal-600 active:scale-95 transition"
                >
                    <CheckCircle size={32} />
                </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default DirectCameraInput;