import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { generateHairstyle } from '../../services/geminiService';
import type { UserImage, GeneratedImage, AngleView, Lookbook, Client, CustomHairstyle } from '../../types';
import { useSettings } from '../../contexts/SettingsContext';
import ImageUploader from './ImageUploader';
// FIX: Updated import path to use the common LoadingSpinner component.
import LoadingSpinner from '../common/LoadingSpinner';
import ImageEditor from './ImageEditor';
import Confetti from './Confetti';
import StyleGallery from './StyleGallery';
import FinalLook from './FinalLook';
import Stepper from './Stepper';
import HistoryPanel from './HistoryPanel';
import MagicTryOn from './MagicTryOn';
import { FEMALE_HAIRSTYLES, MALE_HAIRSTYLES } from '../../constants';
// FIX: Updated import path to use the common Icons component.
import { PlusIcon, UserIcon } from '../common/Icons';
import ClientSelector from './ClientSelector';

enum StudioState {
  Step1_SelectClient,
  Step1_Upload,
  Step1_MagicTryOn,
  Step2_GeneratingInitial,
  Step2_ShowInitial,
  Step3_Refining,
  Step4_GeneratingFinal,
  Step4_ShowFinal,
  ERROR,
}

const INITIAL_STYLE_PROMPTS = [
    { name: 'Sleek Bob', prompt: 'a sleek, sharp, chin-length bob haircut, very straight and glossy' },
    { name: 'Wavy Lob', prompt: 'a shoulder-length lob with soft, beachy waves and natural-looking texture' },
    { name: 'Long Layers', prompt: 'long hair with face-framing layers that create movement and volume' },
    { name: 'Textured Pixie', prompt: 'a short, textured pixie cut with volume on top and slightly tousled styling' },
];

const DesignStudio: React.FC = () => {
    const [studioState, setStudioState] = useState<StudioState>(StudioState.Step1_SelectClient);
    const [contentVisible, setContentVisible] = useState<boolean>(true);
    
    // State for the final lookbook object
    const [lookbookPieces, setLookbookPieces] = useState<{ userImage: UserImage | null; baseStyle: GeneratedImage | null; clientId: string | null }>({ userImage: null, baseStyle: null, clientId: null });
    
    const [initialStyles, setInitialStyles] = useState<GeneratedImage[]>([]);
    const [styleToRefine, setStyleToRefine] = useState<GeneratedImage | null>(null);
    const [finalLook, setFinalLook] = useState<{mainImage: GeneratedImage, angleViews: AngleView[] } | null>(null);
    const [sessionHistory, setSessionHistory] = useState<(GeneratedImage | AngleView)[]>([]);

    const [error, setError] = useState<string | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);

    // FIX: Added missing properties (customHairstyles, studioInitialGenerations) to the context to resolve type errors.
    const { incrementImageCount, saveLookbook, clients, addClient, t, customHairstyles, studioInitialGenerations } = useSettings();

    const STEPS = useMemo(() => [
        t('studio.stepper.selectClient'), 
        t('studio.stepper.uploadPhoto'), 
        t('studio.stepper.discoverStyles'), 
        t('studio.stepper.refineLook'), 
        t('studio.stepper.finalLookbook')
    ], [t]);

    useEffect(() => {
        if (showConfetti) {
            const timer = setTimeout(() => setShowConfetti(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [showConfetti]);

    const resetStudioState = useCallback(() => {
        setLookbookPieces({ userImage: null, baseStyle: null, clientId: null });
        setInitialStyles([]);
        setStyleToRefine(null);
        setFinalLook(null);
        setSessionHistory([]);
        setError(null);
        setStudioState(StudioState.Step1_SelectClient);
    }, []);

    const changeStudioState = useCallback((newState: StudioState, postTransitionCallback?: () => void) => {
        setContentVisible(false);
        setTimeout(() => {
        if (postTransitionCallback) postTransitionCallback();
        setStudioState(newState);
        setContentVisible(true);
        }, 300);
    }, []);
    
    const handleClientSelected = (clientId: string) => {
        changeStudioState(StudioState.Step1_Upload, () => {
            setLookbookPieces(prev => ({ ...prev, clientId }));
        });
    };

    const handleImageReady = (base64: string, mimeType: string) => {
        const image = { base64, mimeType };
        changeStudioState(StudioState.Step2_GeneratingInitial, () => {
            setLookbookPieces(prev => ({...prev, userImage: image}));
        });
    };
    
    const handleMagicTryOnComplete = (userImage: UserImage, generatedImage: GeneratedImage) => {
        incrementImageCount(); // Count the successful generation from MagicTryOn
        changeStudioState(StudioState.Step3_Refining, () => {
            setLookbookPieces(prev => ({ ...prev, userImage, baseStyle: generatedImage }));
            setStyleToRefine(generatedImage);
            setSessionHistory([generatedImage]);
        });
    };

    const handleGenerateInitialStyles = useCallback(async () => {
        if (!lookbookPieces.userImage) return;

        setInitialStyles([]);

        const stylesToGenerateFrom = customHairstyles.length > 0 
            ? customHairstyles.slice(0, studioInitialGenerations)
            : INITIAL_STYLE_PROMPTS.slice(0, studioInitialGenerations);

        if (stylesToGenerateFrom.length === 0) {
            changeStudioState(StudioState.ERROR, () => {
                setError(t('settings.studio.library.noStylesError'));
            });
            return;
        }

        try {
            const generationPromises = stylesToGenerateFrom.map(styleInfo => {
                const isCustomStyle = 'frontView' in styleInfo;
                return generateHairstyle(
                    lookbookPieces.userImage!.base64, 
                    lookbookPieces.userImage!.mimeType, 
                    isCustomStyle ? `A high-quality photo of a person with a ${styleInfo.name} hairstyle.` : styleInfo.prompt,
                    isCustomStyle ? (styleInfo as CustomHairstyle).frontView : undefined
                )
                .then(resultBase64 => {
                    if (resultBase64) {
                        const newImage: GeneratedImage = {
                            src: `data:image/png;base64,${resultBase64}`,
                            prompt: isCustomStyle ? styleInfo.name : styleInfo.prompt,
                            hairstyleId: styleInfo.id || styleInfo.name.toLowerCase().replace(/\s/g, '-'),
                            hairstyleName: styleInfo.name,
                            referenceStyleId: isCustomStyle ? styleInfo.id : undefined,
                        };
                        incrementImageCount();
                        return newImage;
                    }
                    return null;
                }).catch(error => {
                    console.error(`Failed to generate initial style "${styleInfo.name}":`, error);
                    return null;
                })
            });
            
            const results = await Promise.all(generationPromises);
            const successfulCreations = results.filter((r): r is GeneratedImage => r !== null);

            if (successfulCreations.length === 0) {
                throw new Error(t('studio.generating.error.noStyles'));
            }
            
            changeStudioState(StudioState.Step2_ShowInitial, () => {
                setInitialStyles(successfulCreations);
                setSessionHistory(successfulCreations);
            });

        } catch (err) {
        const errorMessage = err instanceof Error ? err.message : t('studio.generating.error.generic');
        changeStudioState(StudioState.ERROR, () => {
            setError(errorMessage);
        });
        }
    }, [lookbookPieces.userImage, changeStudioState, incrementImageCount, t, customHairstyles, studioInitialGenerations]);

    const handleStyleSelectedToRefine = (selectedStyle: GeneratedImage) => {
        changeStudioState(StudioState.Step3_Refining, () => {
            setLookbookPieces(prev => ({ ...prev, baseStyle: selectedStyle }));
            setStyleToRefine(selectedStyle);
        });
    };

    const handleFinalize = (finalPrompt: string) => {
        if (!lookbookPieces.userImage || !styleToRefine) return;
        
        const finalMainImage: GeneratedImage = {
            ...styleToRefine,
            prompt: finalPrompt,
        };

        changeStudioState(StudioState.Step4_GeneratingFinal, () => {
            setStyleToRefine(finalMainImage); 
        });
    };

    const handleGenerateFinalViews = useCallback(async () => {
        if (!lookbookPieces.userImage || !styleToRefine || !lookbookPieces.clientId) return;

        const finalPrompt = styleToRefine.prompt;
        const referenceStyle = customHairstyles.find(s => s.id === styleToRefine.referenceStyleId);

        try {
            const mainImageBase64 = await generateHairstyle(lookbookPieces.userImage.base64, lookbookPieces.userImage.mimeType, finalPrompt, referenceStyle?.frontView);
            if (!mainImageBase64) throw new Error(t('studio.generating.error.mainFinal'));

            const mainFinalImage: GeneratedImage = {
                ...styleToRefine,
                src: `data:image/png;base64,${mainImageBase64}`,
            };
            incrementImageCount();
            
            const viewPrompts = [
                { view: 'Side', promptModifier: ', side view, from the left', reference: referenceStyle?.leftView },
                { view: 'Angled', promptModifier: ', 45-degree angle view', reference: referenceStyle?.rightView ?? referenceStyle?.leftView },
                { view: 'Back', promptModifier: ', from the back', reference: referenceStyle?.backView },
            ];

            const anglePromises = viewPrompts.map(async (view) => {
                const resultBase64 = await generateHairstyle(lookbookPieces.userImage!.base64, lookbookPieces.userImage!.mimeType, finalPrompt + view.promptModifier, view.reference);
                if (resultBase64) {
                    incrementImageCount();
                    return { view: view.view, src: `data:image/png;base64,${resultBase64}` };
                }
                return null;
            });

            const angleResults = await Promise.all(anglePromises);
            const successfulAngles = angleResults.filter((r): r is AngleView => r !== null);
            
            if (lookbookPieces.userImage && lookbookPieces.baseStyle && lookbookPieces.clientId) {
                const lookbookToSave: Omit<Lookbook, 'id' | 'createdAt'> = {
                    clientId: lookbookPieces.clientId,
                    userImage: lookbookPieces.userImage,
                    baseStyle: lookbookPieces.baseStyle,
                    finalImage: mainFinalImage,
                    angleViews: successfulAngles,
                };
                saveLookbook(lookbookToSave);
            }

            changeStudioState(StudioState.Step4_ShowFinal, () => {
                setFinalLook({
                    mainImage: mainFinalImage,
                    angleViews: successfulAngles,
                });
                setSessionHistory(prev => [...prev, mainFinalImage, ...successfulAngles]);
                setShowConfetti(true);
            });

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : t('common.error.generic');
            changeStudioState(StudioState.ERROR, () => {
                setError(errorMessage);
            });
        }

    }, [lookbookPieces, styleToRefine, changeStudioState, incrementImageCount, saveLookbook, customHairstyles, t]);

    useEffect(() => {
        if (studioState === StudioState.Step2_GeneratingInitial && lookbookPieces.userImage) {
            handleGenerateInitialStyles();
        }
    }, [studioState, lookbookPieces.userImage, handleGenerateInitialStyles]);

    useEffect(() => {
        if (studioState === StudioState.Step4_GeneratingFinal && styleToRefine) {
            handleGenerateFinalViews();
        }
    }, [studioState, styleToRefine, handleGenerateFinalViews]);

    const getCurrentStep = () => {
        switch (studioState) {
            case StudioState.Step1_SelectClient: return 1;
            case StudioState.Step1_Upload:
            case StudioState.Step1_MagicTryOn: return 2;
            case StudioState.Step2_GeneratingInitial:
            case StudioState.Step2_ShowInitial: return 3;
            case StudioState.Step3_Refining: return 4;
            case StudioState.Step4_GeneratingFinal:
            case StudioState.Step4_ShowFinal: return 5;
            default: return 0;
        }
    };
    
    // FIX: This component was moved to its own file (ClientSelector.tsx) for better organization,
    // but the logic here to handle its async nature needs to be correct.
    const handleAddNewClient = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        if (name && email) {
            const newClient = await addClient({ name, email });
            handleClientSelected(newClient.id);
        }
    };

    const renderContent = () => {
        switch (studioState) {
        case StudioState.Step1_SelectClient:
            return <ClientSelector onClientSelected={handleClientSelected} />;

        case StudioState.Step1_Upload:
            return <ImageUploader onImageReady={handleImageReady} onEnterMagicTryOn={() => changeStudioState(StudioState.Step1_MagicTryOn)} />;
        
        case StudioState.Step1_MagicTryOn:
            return <MagicTryOn 
                hairstyles={[...FEMALE_HAIRSTYLES, ...MALE_HAIRSTYLES]}
                onComplete={handleMagicTryOnComplete}
                onExit={() => changeStudioState(StudioState.Step1_Upload)}
            />;
        
        case StudioState.Step2_GeneratingInitial:
        case StudioState.Step4_GeneratingFinal:
            const messages = {
                [StudioState.Step2_GeneratingInitial]: { title: t('studio.generating.initial.title'), description: t('studio.generating.initial.subtitle')},
                [StudioState.Step4_GeneratingFinal]: { title: t('studio.generating.final.title'), description: t('studio.generating.final.subtitle')}
            }
            const currentMessage = messages[studioState];
            return (
                <div className="flex flex-col items-center justify-center text-gray-900 dark:text-white text-center p-8 h-full">
                    <LoadingSpinner />
                    <h2 className="text-2xl font-semibold mt-6">{currentMessage.title}</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">{currentMessage.description}</p>
                </div>
            );
        
        case StudioState.Step2_ShowInitial:
            return (
                <StyleGallery 
                    styles={initialStyles} 
                    onSelect={handleStyleSelectedToRefine}
                    onStartOver={resetStudioState}
                />
            );

        case StudioState.Step3_Refining:
            return null; // Handled by modal

        case StudioState.Step4_ShowFinal:
            if (finalLook) {
                return <FinalLook 
                    mainImage={finalLook.mainImage}
                    angleViews={finalLook.angleViews}
                    onStartOver={resetStudioState}
                />
            }
            return null;
        
        case StudioState.ERROR:
            return (
            <div className="text-center text-gray-900 dark:text-white p-8 flex flex-col items-center justify-center h-full">
                <h2 className="text-2xl font-bold text-red-500 mb-4">{t('common.error.title')}</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
                <button
                onClick={resetStudioState}
                className="px-6 py-2 bg-accent hover:opacity-90 rounded-lg font-semibold text-white transition-all"
                >
                {t('common.startOver')}
                </button>
            </div>
            );
        default:
            return null;
        }
    };

    const currentStep = getCurrentStep();
    const showHistoryPanel = sessionHistory.length > 0 && studioState !== StudioState.Step1_Upload && studioState !== StudioState.Step1_MagicTryOn && studioState !== StudioState.Step1_SelectClient;

    return (
        <div className="w-full h-full flex flex-col">
            {showConfetti && <Confetti />}

            {currentStep > 0 && (
                <div className="pb-8 px-4 flex-shrink-0">
                    <Stepper steps={STEPS} currentStep={currentStep} />
                </div>
            )}
            
            <div className={`w-full flex ${showHistoryPanel ? 'gap-6' : ''} flex-grow min-h-0`}>
                <div className="flex-grow flex flex-col bg-white/50 dark:bg-gray-800/50 rounded-2xl shadow-2xl backdrop-blur-lg border border-gray-200 dark:border-gray-700/50 overflow-hidden">
                    <div className={`flex-grow transition-opacity duration-300 ease-in-out ${contentVisible ? 'opacity-100' : 'opacity-0'}`}>
                        {renderContent()}
                    </div>
                </div>

                {showHistoryPanel && (
                    <div className="transition-all duration-300 ease-in-out">
                         <HistoryPanel images={sessionHistory} />
                    </div>
                )}
            </div>

            {studioState === StudioState.Step3_Refining && styleToRefine && (
                <ImageEditor 
                    imageToEdit={styleToRefine.src}
                    initialPrompt={styleToRefine.prompt}
                    onFinalize={handleFinalize}
                    onBack={() => changeStudioState(StudioState.Step2_ShowInitial)}
                />
            )}
        </div>
    )
};

export default DesignStudio;
