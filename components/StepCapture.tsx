import React, { useRef, useState, useCallback } from 'react';
import { extractRollNumbersFromImage } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';

interface StepCaptureProps {
  onDataExtracted: (numbers: string[], image: string) => void;
  onBack: () => void;
}

export const StepCapture: React.FC<StepCaptureProps> = ({ onDataExtracted, onBack }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imagePreview) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const ids = await extractRollNumbersFromImage(imagePreview);
      onDataExtracted(ids, imagePreview);
    } catch (err) {
      setError("Could not analyze the image. Please try retaking it or ensure the lighting is good.");
      setIsAnalyzing(false);
    }
  };

  const handleRetake = () => {
    setImagePreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <LoadingSpinner text="Reading roll numbers..." />
        <p className="text-slate-400 text-sm mt-4 text-center px-6">
          Gemini AI is analyzing your handwritten or printed document.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-md mx-auto w-full relative">
       {/* Header */}
       <div className="flex items-center mb-6">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h2 className="text-xl font-bold ml-2">Capture Presentees</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 relative overflow-hidden">
        {imagePreview ? (
          <img 
            src={imagePreview} 
            alt="Preview" 
            className="w-full h-full object-contain absolute inset-0 bg-black" 
          />
        ) : (
          <div className="text-center p-8">
             <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
             </div>
             <p className="text-slate-600 font-medium">Take a photo or upload</p>
             <p className="text-slate-400 text-sm mt-2">Capture the list of present roll numbers</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <div className="mt-6 flex flex-col space-y-3">
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" // This triggers the camera on mobile
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden" 
        />

        {!imagePreview ? (
          <button 
            onClick={triggerFileInput}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
              <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3h-15a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0zm12-1.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
            </svg>
            Open Camera / Upload
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-3">
             <button 
              onClick={handleRetake}
              className="w-full bg-white text-slate-700 border border-slate-300 font-semibold py-4 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Retake
            </button>
            <button 
              onClick={handleAnalyze}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-colors"
            >
              Analyze Info
            </button>
          </div>
        )}
      </div>
    </div>
  );
};