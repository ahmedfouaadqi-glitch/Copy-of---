import React, { useRef } from 'react';
import { Camera, Image as ImageIcon, X } from 'lucide-react';

interface MediaInputProps {
  onImagesChange?: (base64Images: string[]) => void;
  image?: string | null;
  onImageChange?: (base64Image: string) => void;
  onClearImage?: () => void;
  promptText?: string;
}

const MediaInput: React.FC<MediaInputProps> = ({ 
    onImagesChange,
    image,
    onImageChange,
    onClearImage,
    promptText = 'اختر الصور للتحليل'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const isSingleImageMode = !!onImageChange;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const readers = Array.from(files).map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then(base64Images => {
        if (isSingleImageMode && onImageChange && base64Images.length > 0) {
            onImageChange(base64Images[0]);
        } else if (onImagesChange) {
            onImagesChange(base64Images);
        }
      });
    }
    if (event.target) {
        event.target.value = '';
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const triggerCameraInput = () => {
    cameraInputRef.current?.click();
  };

  if (isSingleImageMode && image && onClearImage) {
    return (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
            <img src={image} alt="Preview" className="w-full h-full object-cover" />
            <button 
                onClick={onClearImage} 
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition-colors"
                aria-label="Remove image"
            >
                <X size={16} />
            </button>
        </div>
    );
  }

  return (
    <div className="w-full aspect-video rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-black">
      <ImageIcon size={48} className="text-gray-400 dark:text-gray-600 mb-4" />
      <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-4">{promptText}</p>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          onClick={triggerFileInput}
          className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-md text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition flex items-center justify-center gap-2"
        >
          <ImageIcon size={16} />
          {isSingleImageMode ? 'رفع صورة' : 'رفع الصور'}
        </button>
        <button
          onClick={triggerCameraInput}
          className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-md text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition flex items-center justify-center gap-2"
        >
          <Camera size={16} />
          التقاط صورة
        </button>
      </div>
      <input
        type="file"
        accept="image/*"
        multiple={!isSingleImageMode}
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={cameraInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default MediaInput;
