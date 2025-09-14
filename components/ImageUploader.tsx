import React, { useRef, useState, useEffect } from 'react';
// FIX: Updated import path to use the common Icons component.
import { CameraIcon, UploadIcon, LogoIcon } from './common/Icons';
import { useSettings } from '../contexts/SettingsContext';

interface ImageUploaderProps {
  onImageReady: (base64: string, mimeType: string) => void;
  onEnterMagicTryOn: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageReady, onEnterMagicTryOn }) => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isAligned, setIsAligned] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { salonName, salonLogo, welcomeMessage } = useSettings();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        onImageReady(base64, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartCamera = () => {
    setError(null);
    setIsAligned(false);
    setIsCameraOn(true);
  };

  const handleCancelCamera = () => {
    setIsCameraOn(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        // Flip the canvas context horizontally to match the mirrored video preview
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg');
        onImageReady(base64, 'image/jpeg');
        setIsCameraOn(false); // This will trigger the useEffect cleanup
      }
    }
  };
  
  // Effect to handle the alignment timer
  useEffect(() => {
    if (isCameraOn) {
        const timer = setTimeout(() => setIsAligned(true), 1500);
        return () => clearTimeout(timer);
    }
  }, [isCameraOn]);

  useEffect(() => {
    if (!isCameraOn) {
      return;
    }

    let stream: MediaStream | null = null;
    const enableStream = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, facingMode: 'user' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Could not access camera. Please check permissions and try again.');
        setIsCameraOn(false);
      }
    };

    enableStream();

    // Cleanup function: will be called when isCameraOn becomes false or component unmounts.
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const mediaStream = videoRef.current.srcObject as MediaStream;
        mediaStream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [isCameraOn]);


  return (
    <div className="p-8 flex flex-col items-center justify-center">
      {salonLogo ? (
        <img src={salonLogo} alt={`${salonName} Logo`} className="w-20 h-20 rounded-2xl object-cover mb-4 shadow-md"/>
      ) : (
        <LogoIcon className="w-20 h-20 text-accent mb-4" />
      )}
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">{salonName}</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8 text-center max-w-md">
        {welcomeMessage}
      </p>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {!isCameraOn ? (
        <div className="w-full max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="group flex flex-col items-center justify-center p-8 bg-gray-100/50 dark:bg-gray-700/50 hover:bg-accent/10 dark:hover:bg-accent/30 border-2 border-dashed border-gray-400 dark:border-gray-600 hover:border-accent rounded-xl transition-all duration-300"
            >
              <UploadIcon className="w-12 h-12 text-gray-400 dark:text-gray-400 group-hover:text-accent dark:group-hover:text-accent mb-4 transition-colors" />
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Upload a Photo</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Select an image from your device</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />
            <button
              onClick={handleStartCamera}
              className="group flex flex-col items-center justify-center p-8 bg-gray-100/50 dark:bg-gray-700/50 hover:bg-accent/10 dark:hover:bg-accent/30 border-2 border-dashed border-gray-400 dark:border-gray-600 hover:border-accent rounded-xl transition-all duration-300"
            >
              <CameraIcon className="w-12 h-12 text-gray-400 dark:text-gray-400 group-hover:text-accent dark:group-hover:text-accent mb-4 transition-colors" />
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Use Camera</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Take a new photo</span>
            </button>
          </div>
          <div className="mt-6 text-center">
            <div className="inline-flex items-center justify-center w-full">
              <hr className="w-64 h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
              <span className="absolute px-3 font-medium text-gray-900 -translate-x-1/2 bg-white/0 left-1/2 dark:text-white dark:bg-gray-800/0 backdrop-blur-sm">OR</span>
            </div>
            <button
                onClick={onEnterMagicTryOn}
                className="group flex w-full items-center justify-center gap-4 p-6 bg-accent/10 dark:bg-accent/20 hover:bg-accent/20 dark:hover:bg-accent/30 border-2 border-accent rounded-xl transition-all duration-300 shadow-lg hover:shadow-accent/40"
            >
                <CameraIcon className="w-12 h-12 text-accent"/>
                <div className="text-left">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Magic Try-On</span>
                    <span className="block text-sm text-gray-500 dark:text-gray-400">Try on hairstyles with a live camera feed</span>
                </div>
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-2xl flex flex-col items-center">
          <div className="w-full aspect-video bg-gray-200 dark:bg-gray-900 rounded-lg overflow-hidden mb-4 border border-gray-300 dark:border-gray-700 relative">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover -scale-x-100"></video>
            
            {/* Face Outline Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 160 90" preserveAspectRatio="xMidYMid meet">
                <path
                  d="M 80,18 C 68,18 58,28 58,42 C 58,56 68,66 80,66 C 92,66 102,56 102,42 C 102,28 92,18 80,18 Z M 52,80 C 52,68 108,68 108,80 L 108,85 L 52,85 Z"
                  fill="none"
                  stroke={isAligned ? '#22c55e' : 'rgba(255, 255, 255, 0.6)'}
                  strokeWidth="1"
                  strokeDasharray="5 3"
                  style={{ transition: 'stroke 0.5s ease-in-out' }}
                />
              </svg>
            </div>
            
            <p className={`absolute bottom-3 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-md transition-opacity duration-500 ${isAligned ? 'opacity-0' : 'opacity-100'}`}>
              Position your face in the outline
            </p>
          </div>
          <canvas ref={canvasRef} className="hidden"></canvas>
          <div className="flex gap-4">
            <button
              onClick={takePhoto}
              disabled={!isAligned}
              className="px-8 py-3 bg-accent hover:opacity-90 rounded-lg font-semibold text-white transition-all disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              Take Photo
            </button>
            <button
              onClick={handleCancelCamera}
              className="px-8 py-3 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 rounded-lg font-semibold text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;