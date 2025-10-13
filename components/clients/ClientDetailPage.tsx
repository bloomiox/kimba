import React, { useState, useRef, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { mapToAccentColor } from '../../utils/colorUtils';
import type { Client, Appointment, ClientPhotoPair } from '../../types';
import {
  ChevronLeftIcon,
  UserIcon,
  CalendarIcon,
  DesignStudioIcon,
  MapPinIcon,
  EditIcon,
  TrashIcon,
  CreditCardIcon,
  PhotoIcon,
  CameraIcon,
} from '../common/Icons';
import AppointmentPaymentModal from '../booking/AppointmentPaymentModal';
import { uploadImage } from '../../services/imageStorageService';
import { getClientPhotoPairs, addClientPhotoPair } from '../../services/clientPhotoService';

interface ClientDetailPageProps {
  client: Client;
  onBack: () => void;
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
}

const ClientDetailPage: React.FC<ClientDetailPageProps> = ({
  client,
  onBack,
  onEdit,
  onDelete,
}) => {
  const {
    appointments,
    services,
    hairstylists,
    getCurrentUserLookbooks,
    t,
    currency,
    updateClient,
    session,
  } = useSettings();
  const [paymentModalAppointment, setPaymentModalAppointment] = useState<Appointment | null>(null);
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [cameraActive, setCameraActive] = useState<'before' | 'after' | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<{ before?: string; after?: string }>({});
  const [clientPhotoPairs, setClientPhotoPairs] = useState<ClientPhotoPair[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const clientAppointments = appointments
    .filter(app => app.clientId === client.id)
    .sort(
      (a, b) =>
        new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime()
    );

  const clientLookbooks = getCurrentUserLookbooks().filter(lb => lb.clientId === client.id);

  const servicesById = React.useMemo(
    () =>
      services.reduce(
        (acc, s) => ({ ...acc, [s.id]: s }),
        {} as Record<string, (typeof services)[0]>
      ),
    [services]
  );
  const hairstylistsById = React.useMemo(
    () =>
      hairstylists.reduce(
        (acc, h) => ({ ...acc, [h.id]: h }),
        {} as Record<string, (typeof hairstylists)[0]>
      ),
    [hairstylists]
  );

  // Load existing client photo pairs when component mounts
  useEffect(() => {
    const loadPhotoPairs = async () => {
      if (session?.user?.id) {
        setLoadingPhotos(true);
        try {
          const pairs = await getClientPhotoPairs(client.id, session.user.id);
          setClientPhotoPairs(pairs);
        } catch (error) {
          console.error('Error loading photo pairs:', error);
        } finally {
          setLoadingPhotos(false);
        }
      }
    };

    loadPhotoPairs();
  }, [client.id, session?.user?.id]);

  // Effect to manage camera stream
  useEffect(() => {
    if (!cameraActive) {
      return;
    }

    let stream: MediaStream | null = null;
    const enableStream = async () => {
      try {
        setCameraError(null);
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setCameraError('Could not access camera. Please check permissions and try again.');
        setCameraActive(null);
      }
    };

    enableStream();

    // Cleanup function
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const mediaStream = videoRef.current.srcObject as MediaStream;
        mediaStream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [cameraActive]);

  const getStatusLabel = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return t('booking.status.confirmed');
      case 'unconfirmed':
        return t('booking.status.notConfirmed');
      case 'late':
        return t('booking.status.late');
      case 'cancelled':
        return t('booking.status.cancelled');
      default:
        return t('booking.status.confirmed');
    }
  };

  // Function to handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src =
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM2NjYiPlBob3RvIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
  };

  const handlePhotoCapture = async (type: 'before' | 'after', file: File) => {
    try {
      // Upload the file to Supabase storage
      const result = await uploadImage(file, 'appointment-photos');

      if (result.error) {
        console.error(`Error uploading ${type} photo:`, result.error);
        alert(`Failed to upload ${type} photo: ${result.error}`);
        return;
      }

      // Store the URL in captured photos state
      setCapturedPhotos(prev => ({
        ...prev,
        [type]: result.url,
      }));

      console.log(`${type} photo uploaded successfully:`, result.url);
    } catch (error) {
      console.error(`Unexpected error uploading ${type} photo:`, error);
      alert(`Unexpected error uploading ${type} photo`);
    }
  };

  const startCamera = (type: 'before' | 'after') => {
    setCameraActive(type);
  };

  const stopCamera = () => {
    setCameraActive(null);
  };

  const capturePhoto = () => {
    if (!cameraActive || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (context) {
      // Flip the image horizontally (mirror effect)
      context.translate(canvas.width, 0);
      context.scale(-1, 1);

      // Draw the video frame to the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to blob and create file
      canvas.toBlob(
        blob => {
          if (blob) {
            const fileName = `${cameraActive}-photo-${Date.now()}.jpg`;
            const file = new File([blob], fileName, { type: 'image/jpeg' });

            // Create a preview URL
            const url = URL.createObjectURL(file);
            setCapturedPhotos(prev => ({
              ...prev,
              [cameraActive]: url,
            }));

            // Stop the camera after capture
            stopCamera();
          }
        },
        'image/jpeg',
        0.95
      );
    }
  };

  const savePhotos = async () => {
    try {
      if (!session?.user?.id) {
        alert('You must be logged in to save photos.');
        return;
      }

      // For photos that were uploaded via file input, they already have URLs from appointment-photos storage
      // For photos that were captured via camera, we need to upload them
      const uploadedPhotos: { before?: string; after?: string } = {};

      // Handle before photo
      if (capturedPhotos.before) {
        // Check if it's already a storage URL (from file upload) or a blob URL (from camera capture)
        if (capturedPhotos.before.startsWith('http')) {
          // Already uploaded, just use the URL
          uploadedPhotos.before = capturedPhotos.before;
        } else {
          // Convert the blob URL back to a file and upload it
          const response = await fetch(capturedPhotos.before);
          const blob = await response.blob();
          const file = new File([blob], `before-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });

          const result = await uploadImage(file, 'appointment-photos');
          if (result.error) {
            console.error('Error uploading before photo:', result.error);
            alert('Error uploading before photo: ' + result.error);
            return;
          }
          uploadedPhotos.before = result.url;
        }
      }

      // Handle after photo
      if (capturedPhotos.after) {
        // Check if it's already a storage URL (from file upload) or a blob URL (from camera capture)
        if (capturedPhotos.after.startsWith('http')) {
          // Already uploaded, just use the URL
          uploadedPhotos.after = capturedPhotos.after;
        } else {
          // Convert the blob URL back to a file and upload it
          const response = await fetch(capturedPhotos.after);
          const blob = await response.blob();
          const file = new File([blob], `after-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });

          const result = await uploadImage(file, 'appointment-photos');
          if (result.error) {
            console.error('Error uploading after photo:', result.error);
            alert('Error uploading after photo: ' + result.error);
            return;
          }
          uploadedPhotos.after = result.url;
        }
      }

      // Add the new photo pair to the database
      const newPhotoPair = await addClientPhotoPair(
        client.id,
        session.user.id,
        uploadedPhotos.before,
        uploadedPhotos.after
      );

      if (!newPhotoPair) {
        alert('Failed to save photos. Please try again.');
        return;
      }

      // Update client photo pairs state with the new pair
      setClientPhotoPairs(prev => [newPhotoPair, ...prev]);

      // Show success message
      alert('Photos saved successfully!');

      // Clean up captured photos and close modal
      setCapturedPhotos({});
      setShowPhotoCapture(false);
    } catch (error) {
      console.error('Error saving photos:', error);
      alert('Error saving photos. Please try again.');
    }
  };

  const renderPhotoCapture = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Before & After Photos
            </h3>
            <button
              onClick={() => {
                stopCamera();
                setShowPhotoCapture(false);
                setCapturedPhotos({});
              }}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {cameraError && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
              {cameraError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Before Photo */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Before</h4>
              <div className="relative">
                {cameraActive === 'before' ? (
                  <div className="flex flex-col items-center">
                    <div className="relative w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden mb-3">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="absolute inset-0 w-full h-full object-cover -scale-x-100"
                      ></video>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-32 h-32 border-2 border-white/50 rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={capturePhoto}
                        className="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg font-medium"
                      >
                        Capture
                      </button>
                      <button
                        onClick={() => stopCamera()}
                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : capturedPhotos.before ? (
                  <div className="relative">
                    <img
                      src={capturedPhotos.before}
                      alt="Before"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setCapturedPhotos(prev => {
                          const newPhotos = { ...prev };
                          delete newPhotos.before;
                          return newPhotos;
                        });
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span> before photo
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or JPEG</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handlePhotoCapture('before', file);
                        }}
                      />
                    </label>
                    <button
                      onClick={() => startCamera('before')}
                      className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>Take Photo with Camera</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* After Photo */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">After</h4>
              <div className="relative">
                {cameraActive === 'after' ? (
                  <div className="flex flex-col items-center">
                    <div className="relative w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden mb-3">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="absolute inset-0 w-full h-full object-cover -scale-x-100"
                      ></video>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-32 h-32 border-2 border-white/50 rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={capturePhoto}
                        className="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg font-medium"
                      >
                        Capture
                      </button>
                      <button
                        onClick={() => stopCamera()}
                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : capturedPhotos.after ? (
                  <div className="relative">
                    <img
                      src={capturedPhotos.after}
                      alt="After"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setCapturedPhotos(prev => {
                          const newPhotos = { ...prev };
                          delete newPhotos.after;
                          return newPhotos;
                        });
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span> after photo
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or JPEG</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handlePhotoCapture('after', file);
                        }}
                      />
                    </label>
                    <button
                      onClick={() => startCamera('after')}
                      className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>Take Photo with Camera</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Save Photos Button */}
          {(capturedPhotos.before || capturedPhotos.after) && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={savePhotos}
                className="px-6 py-3 bg-accent-600 hover:bg-accent-700 focus:bg-accent-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl focus:ring-4 focus:ring-accent-500/30 transition-all"
              >
                Save Photos to Profile
              </button>
            </div>
          )}
        </div>
        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in h-full flex flex-col">
      <div className="flex-shrink-0 mb-6 flex justify-between items-center">
        <button
          onClick={onBack}
          className={`flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 ${mapToAccentColor('hover:text-accent-600 dark:hover:text-accent-400')} transition-colors`}
        >
          <ChevronLeftIcon className="w-5 h-5" /> {t('clients.detail.back')}
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPhotoCapture(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <CameraIcon className="w-4 h-4" /> Take Photos
          </button>
          <button
            onClick={() => onEdit(client)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <EditIcon className="w-4 h-4" /> {t('common.edit')}
          </button>
          <button
            onClick={() => onDelete(client.id)}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 text-sm font-semibold rounded-lg hover:bg-red-500/20 transition-colors"
          >
            <TrashIcon className="w-4 h-4" /> {t('common.delete')}
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 overflow-hidden">
                  {client.photoUrl ? (
                    <img
                      src={client.photoUrl}
                      alt={client.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-12 h-12 text-gray-500 dark:text-gray-400" />
                  )}
                </div>
                <h2 className="text-2xl font-bold">{client.name}</h2>
                <p className="text-gray-500 dark:text-gray-400">{client.email}</p>
                {client.phone && (
                  <p className="text-gray-500 dark:text-gray-400 mt-1">{client.phone}</p>
                )}
                {client.address && (
                  <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
                    <MapPinIcon className="w-4 h-4" /> {client.address}
                  </p>
                )}
              </div>
              <hr className="my-6 border-gray-200 dark:border-gray-700" />
              <div>
                <h3
                  className={`font-semibold ${mapToAccentColor('text-accent-600 dark:text-accent-400')} mb-2`}
                >
                  {t('clients.detail.notes')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {client.notes || t('clients.detail.noNotes')}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            {/* Client Photos Section */}
            {clientPhotoPairs.length > 0 && (
              <div>
                <h3 className={`text-2xl font-bold flex items-center gap-3 mb-4`}>
                  <PhotoIcon className={`w-6 h-6 ${mapToAccentColor('text-accent-500')}`} />
                  Client Photos
                </h3>
                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50">
                  <div className="space-y-6">
                    {clientPhotoPairs.map((photoPair, index) => (
                      <div
                        key={photoPair.id}
                        className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0 last:pb-0"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Session {clientPhotoPairs.length - index}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(photoPair.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {photoPair.beforePhotoUrl && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Before
                              </p>
                              <div className="aspect-square rounded-lg overflow-hidden">
                                <img
                                  src={photoPair.beforePhotoUrl}
                                  alt="Before"
                                  className="w-full h-full object-cover"
                                  onError={handleImageError}
                                />
                              </div>
                            </div>
                          )}

                          {photoPair.afterPhotoUrl && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                After
                              </p>
                              <div className="aspect-square rounded-lg overflow-hidden">
                                <img
                                  src={photoPair.afterPhotoUrl}
                                  alt="After"
                                  className="w-full h-full object-cover"
                                  onError={handleImageError}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Before and After Photos from Appointments */}
            {clientAppointments.some(app => app.beforePhotoUrl || app.afterPhotoUrl) && (
              <div>
                <h3 className={`text-2xl font-bold flex items-center gap-3 mb-4`}>
                  <PhotoIcon className={`w-6 h-6 ${mapToAccentColor('text-accent-500')}`} />
                  {t('clients.detail.appointmentPhotos')}
                </h3>
                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {clientAppointments
                      .filter(app => app.beforePhotoUrl || app.afterPhotoUrl)
                      .map(app => {
                        const service = servicesById[app.serviceId];
                        const hairstylist = hairstylistsById[app.hairstylistId];
                        const appointmentDate = new Date(`${app.date}T${app.time}`);

                        return (
                          <div key={app.id} className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold">
                                  {service?.name || t('clients.detail.unknownService')}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {appointmentDate.toLocaleString(t('language.code'), {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                  })}
                                </p>
                              </div>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  app.status === 'confirmed'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                    : app.status === 'unconfirmed'
                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                      : app.status === 'late'
                                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                }`}
                              >
                                {getStatusLabel(app.status)}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              {app.beforePhotoUrl && (
                                <div className="space-y-2">
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Before
                                  </p>
                                  <div className="aspect-square rounded-lg overflow-hidden">
                                    <img
                                      src={app.beforePhotoUrl}
                                      alt="Before"
                                      className="w-full h-full object-cover"
                                      onError={handleImageError}
                                    />
                                  </div>
                                </div>
                              )}

                              {app.afterPhotoUrl && (
                                <div className="space-y-2">
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    After
                                  </p>
                                  <div className="aspect-square rounded-lg overflow-hidden">
                                    <img
                                      src={app.afterPhotoUrl}
                                      alt="After"
                                      className="w-full h-full object-cover"
                                      onError={handleImageError}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className={`text-2xl font-bold flex items-center gap-3 mb-4`}>
                <CalendarIcon className={`w-6 h-6 ${mapToAccentColor('text-accent-500')}`} />{' '}
                {t('clients.detail.appointmentHistory')}
              </h3>
              <div className="bg-white dark:bg-gray-800/50 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 space-y-4 max-h-80 overflow-y-auto">
                {clientAppointments.length > 0 ? (
                  clientAppointments.map(app => {
                    const service = servicesById[app.serviceId];
                    const hairstylist = hairstylistsById[app.hairstylistId];
                    const appointmentDate = new Date(`${app.date}T${app.time}`);
                    const isUpcoming = appointmentDate > new Date();

                    return (
                      <div key={app.id} className="p-3 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-grow">
                            <p className="font-semibold">
                              {service?.name || t('clients.detail.unknownService')}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {appointmentDate.toLocaleString(t('language.code'), {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })}{' '}
                              {t('clients.detail.with')}{' '}
                              {hairstylist?.name || t('clients.detail.unknownStylist')}
                            </p>
                            {service && (
                              <p
                                className={`text-sm font-medium ${mapToAccentColor('text-accent-600 dark:text-accent-400')} mt-1`}
                              >
                                {service.price.toLocaleString(t('language.code'), {
                                  style: 'currency',
                                  currency: currency,
                                })}
                              </p>
                            )}
                          </div>
                          {service && hairstylist && (
                            <button
                              onClick={() => setPaymentModalAppointment(app)}
                              className={`ml-3 flex items-center gap-2 px-3 py-1.5 ${mapToAccentColor('bg-accent-500 hover:bg-accent-600')} text-white text-sm font-semibold rounded-lg transition-colors`}
                            >
                              <CreditCardIcon className="w-4 h-4" />
                              {t('booking.payment.payNow')}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    {t('clients.detail.noAppointments')}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className={`text-2xl font-bold flex items-center gap-3 mb-4`}>
                <DesignStudioIcon className={`w-6 h-6 ${mapToAccentColor('text-accent-500')}`} />{' '}
                {t('clients.detail.lookbookGallery')}
              </h3>
              <div className="bg-white dark:bg-gray-800/50 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50">
                {clientLookbooks.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {clientLookbooks.map(lb => (
                      <button
                        key={lb.id}
                        className={`group relative aspect-square rounded-lg overflow-hidden shadow-md ${mapToAccentColor('focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2')} dark:focus:ring-offset-gray-800 transition-all hover:shadow-lg`}
                      >
                        <img
                          src={lb.finalImage.src}
                          alt={lb.finalImage.hairstyleName}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                          <p className="text-white text-xs text-center">
                            {lb.finalImage.hairstyleName}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    {t('clients.detail.noLookbooks')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentModalAppointment && (
        <AppointmentPaymentModal
          appointment={paymentModalAppointment}
          client={client}
          service={servicesById[paymentModalAppointment.serviceId]}
          hairstylist={hairstylistsById[paymentModalAppointment.hairstylistId]}
          isOpen={!!paymentModalAppointment}
          onClose={() => setPaymentModalAppointment(null)}
          onPaymentComplete={() => {
            // Optionally refresh data or show success message
            console.log('Payment completed for appointment:', paymentModalAppointment.id);
          }}
        />
      )}

      {/* Photo Capture Modal */}
      {showPhotoCapture && renderPhotoCapture()}
    </div>
  );
};

export default ClientDetailPage;
