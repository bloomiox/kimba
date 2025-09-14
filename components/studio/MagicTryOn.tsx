import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Hairstyle, UserImage, GeneratedImage } from '../../types';
import { generateHairstyle } from '../../services/geminiService';
import LoadingSpinner from '../common/LoadingSpinner';
import { useSettings } from '../../contexts/SettingsContext';

interface MagicTryOnProps {
  hairstyles: Hairstyle[];
  onComplete: (capturedImage: UserImage, generatedImage: GeneratedImage) => void;
  onExit: () => void;
}

type Status = 'LIVE' | 'GENERATING' | 'RESULT' | 'ERROR';

const MagicTryOn: React.FC<MagicTryOnProps> = ({ hairstyles, onComplete, onExit }) => {
  const [status, setStatus] = useState<Status>('LIVE');
  const [error, setError] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [capturedFrame, setCapturedFrame] = useState<UserImage | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<Hairstyle | null>(null);
  const { t } = useSettings();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setStatus('ERROR');
      setError(t('studio.imageUploader.cameraError'));
    }
  }, [t]);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);
  
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const captureFrame = (): UserImage | null => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg');
        return { base64, mimeType: 'image/jpeg' };
      }
    }
    return null;
  };

  const handleStyleSelect = async (style: Hairstyle) => {
    const frame = captureFrame();
    if (!frame) {
      setStatus('ERROR');
      setError(t('studio.magicTryOn.captureError'));
      return;
    }
    
    setSelectedStyle(style);
    setCapturedFrame(frame);
    setStatus('GENERATING');
    stopCamera(); // Pause the camera feed while generating

    try {
      const resultBase64 = await generateHairstyle(frame.base64, frame.mimeType, style.prompt);
      if (resultBase64) {
        setResultImage(`data:image/png;base64,${resultBase64}`);
        setStatus('RESULT');
      } else {
        throw new Error(t('studio.generating.error.generic'));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : t('common.error.generic');
      setError(message);
      setStatus('ERROR');
    }
  };
  
  const handleTryAgain = () => {
      setResultImage(null);
      setCapturedFrame(null);
      setSelectedStyle(null);
      setError(null);
      setStatus('LIVE');
      startCamera();
  }
  
  const handleUseThisLook = () => {
      if (capturedFrame && resultImage && selectedStyle) {
          const finalImage: GeneratedImage = {
              src: resultImage,
              prompt: selectedStyle.prompt,
              hairstyleId: selectedStyle.id,
              hairstyleName: selectedStyle.name,
          };
          onComplete(capturedFrame, finalImage);
      }
  }

  return (
    <div className="p-4 sm:p-6 flex flex-col h-full">
        <div className="relative w-full aspect-video bg-gray-200 dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 mb-4">
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className={`absolute inset-0 w-full h-full object-cover -scale-x-100 transition-opacity duration-300 ${status === 'LIVE' ? 'opacity-100' : 'opacity-0'}`}
                aria-hidden={status !== 'LIVE'}
            ></video>
            
            {capturedFrame && (
                <img src={capturedFrame.base64} alt="Captured frame" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${status === 'GENERATING' ? 'opacity-100' : 'opacity-0'}`}/>
            )}
            
            {resultImage && (
                 <img src={resultImage} alt="Generated Hairstyle" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${status === 'RESULT' ? 'opacity-100' : 'opacity-0'}`}/>
            )}

            {(status === 'GENERATING' || status === 'ERROR') && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center p-4">
                    {status === 'GENERATING' && <LoadingSpinner />}
                    <h2 className={`text-2xl font-semibold mt-6 ${status === 'ERROR' ? 'text-red-500' : 'text-white'}`}>
                        {status === 'GENERATING' ? t('studio.magicTryOn.applyingStyle') : t('common.error.title')}
                    </h2>
                    <p className="text-gray-300 dark:text-gray-400 mt-2 max-w-sm">
                        {status === 'GENERATING' ? t('studio.magicTryOn.generatingMessage') : error}
                    </p>
                    {status === 'ERROR' && (
                        <button onClick={handleTryAgain} className="mt-6 px-6 py-2 bg-accent hover:opacity-90 rounded-lg font-semibold text-white transition-all">
                            {t('studio.magicTryOn.tryAgain')}
                        </button>
                    )}
                </div>
            )}
        </div>
        <canvas ref={canvasRef} className="hidden"></canvas>
        
        {status === 'RESULT' ? (
             <div className="flex-grow flex items-center justify-center">
                <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={handleTryAgain} className="px-8 py-3 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 rounded-lg font-semibold text-white transition-colors">{t('studio.magicTryOn.tryAnother')}</button>
                    <button onClick={handleUseThisLook} className="px-8 py-3 bg-accent hover:opacity-90 rounded-lg font-semibold text-white transition-all">{t('studio.magicTryOn.useThisLook')}</button>
                </div>
             </div>
        ): (
            <div className="flex-grow flex flex-col min-h-0">
                <p className="text-center text-gray-600 dark:text-gray-300 mb-3">{t('studio.magicTryOn.prompt')}</p>
                <div className="flex-grow overflow-x-auto overflow-y-hidden py-2 -mx-2">
                    <div className="flex gap-3 px-2">
                        {hairstyles.map(style => (
                        <button key={style.id} onClick={() => handleStyleSelect(style)} disabled={status !== 'LIVE'} className="group relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed ring-2 ring-transparent hover:ring-accent focus:ring-accent transition-all">
                            <img src={style.previewUrl} alt={style.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all"></div>
                            <p className="absolute bottom-0 left-0 w-full p-1 text-white text-xs font-semibold text-center truncate bg-gradient-to-t from-black/80 to-transparent">{style.name}</p>
                        </button>
                        ))}
                    </div>
                </div>
            </div>
        )}
        
        <div className="mt-4 text-center">
            <button onClick={onExit} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors text-sm">
                {t('studio.magicTryOn.backToStart')}
            </button>
        </div>
    </div>
  );
};

export default MagicTryOn;
