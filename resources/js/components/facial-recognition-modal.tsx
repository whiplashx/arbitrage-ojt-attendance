import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface FacialRecognitionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (encoding: number[]) => void;
    isFirstTime?: boolean;
}

interface FaceBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

let modelsLoaded = false;
let captureInProgress = false; // Prevent double captures

export function FacialRecognitionModal({
    isOpen,
    onClose,
    onSuccess,
    isFirstTime = false,
}: FacialRecognitionModalProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [facesDetected, setFacesDetected] = useState(0);
    const [modelsInitialized, setModelsInitialized] = useState(modelsLoaded);
    const [faceBox, setFaceBox] = useState<FaceBox | null>(null);

    const initializeModels = async () => {
        // Force reload models
        modelsLoaded = false;
        
        try {
            const faceapi = await import('face-api.js');
            
            // Load models from CDN
            const modelUrl = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
            
            console.log('Loading face detection model...');
            await faceapi.nets.ssdMobilenetv1.loadFromUri(modelUrl);
            console.log('Loading face landmarks model...');
            await faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl);
            console.log('Loading face recognition model...');
            await faceapi.nets.faceRecognitionNet.loadFromUri(modelUrl);

            modelsLoaded = true;
            setModelsInitialized(true);
            console.log('All models loaded successfully');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load facial recognition models';
            setError(message);
            console.error('Model initialization error:', err);
            modelsLoaded = false;
            setModelsInitialized(false);
        }
    };

    const startVideoStream = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Initialize models first
            await initializeModels();

            const constraints = {
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user',
                },
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to access camera';
            setError(message);
            console.error('Camera access error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const stopVideoStream = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach((track) => track.stop());
        }
    };

    const captureFace = async () => {
        try {
            // Prevent double captures
            if (captureInProgress) {
                console.log('Capture already in progress, skipping...');
                return;
            }
            
            captureInProgress = true;
            setIsLoading(true);
            setError(null);

            if (!videoRef.current || !canvasRef.current) {
                throw new Error('Video or canvas reference not found');
            }

            // Always ensure models are loaded before detection
            if (!modelsInitialized) {
                console.log('Models not initialized, loading...');
                await initializeModels();
            }

            // Double-check models are loaded
            if (!modelsLoaded) {
                throw new Error('Failed to load facial recognition models. Please refresh and try again.');
            }

            const faceapi = await import('face-api.js');

            const video = videoRef.current;
            const canvas = canvasRef.current;

            // Ensure video is playing
            if (video.paused) {
                throw new Error('Video stream is not active');
            }

            // Wait for video to be ready
            await new Promise<void>((resolve) => {
                if (video.readyState === 4) {
                    resolve();
                } else {
                    const onLoadedMetadata = () => {
                        video.removeEventListener('loadedmetadata', onLoadedMetadata);
                        resolve();
                    };
                    video.addEventListener('loadedmetadata', onLoadedMetadata);
                }
            });

            console.log('Starting face detection...');

            // Detect faces and get descriptors
            const detections = await faceapi
                .detectAllFaces(video)
                .withFaceLandmarks()
                .withFaceDescriptors();

            if (detections.length === 0) {
                setFacesDetected(0);
                throw new Error('No faces detected. Please position your face in the camera.');
            }

            if (detections.length > 1) {
                setFacesDetected(detections.length);
                throw new Error('Multiple faces detected. Please ensure only one face is visible.');
            }

            // Get the face descriptor (encoding)
            const descriptor = detections[0].descriptor;
            const encoding = Array.from(descriptor);

            setFacesDetected(1);

            // Draw the detection on canvas for preview
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0);
                const displaySize = {
                    width: video.videoWidth,
                    height: video.videoHeight,
                };
                (faceapi as any).matchDimensions(canvas, displaySize);
                const resizedDetections = (faceapi as any).resizeResults(detections, displaySize);
                (faceapi as any).draw.drawDetections(canvas, resizedDetections);
            }

            setSuccess(true);
            setTimeout(() => {
                stopVideoStream();
                onSuccess(encoding);
            }, 1500);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to capture face';
            setError(message);
            console.error('Capture error:', err);
        } finally {
            setIsLoading(false);
            captureInProgress = false;
        }
    };

    // Auto-capture when face is detected
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        const autoCaptureInterval = async () => {
            if (!isOpen || isLoading || success || !modelsInitialized || captureInProgress) {
                return;
            }

            try {
                if (!videoRef.current || !canvasRef.current) {
                    return;
                }

                const faceapi = await import('face-api.js');
                const video = videoRef.current;

                if (video.paused || video.readyState !== 4) {
                    return;
                }

                // Quick face detection
                const detections = await faceapi
                    .detectAllFaces(video)
                    .withFaceLandmarks()
                    .withFaceDescriptors();

                if (detections.length === 1) {
                    // Exactly one face detected - auto capture
                    setFacesDetected(1);
                    setError(null);
                    
                    // Store face box position for drawing
                    const detection = detections[0];
                    const box = detection.detection.box;
                    setFaceBox({
                        x: box.x,
                        y: box.y,
                        width: box.width,
                        height: box.height,
                    });
                    
                    // Trigger auto-capture after a short delay to ensure stable detection
                    setTimeout(() => {
                        if (facesDetected === 1 && !success && !captureInProgress) {
                            captureFace();
                        }
                    }, 500);
                } else if (detections.length === 0) {
                    setFacesDetected(0);
                    setFaceBox(null);
                } else if (detections.length > 1) {
                    setFacesDetected(detections.length);
                    setError('Multiple faces detected');
                    setFaceBox(null);
                }
            } catch (err) {
                // Silent catch for auto-detection
                console.debug('Auto-detection error:', err);
            }
        };

        if (isOpen && modelsInitialized) {
            // Run detection every 500ms
            interval = setInterval(autoCaptureInterval, 500);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isOpen, isLoading, success, modelsInitialized, facesDetected]);

    useEffect(() => {
        if (isOpen) {
            captureInProgress = false; // Reset capture flag when modal opens
            startVideoStream();
        }

        return () => {
            stopVideoStream();
            captureInProgress = false; // Reset capture flag when modal closes
        };
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isFirstTime ? 'Register Your Face' : 'Verify Your Face'}
                    </DialogTitle>
                    <DialogDescription>
                        {isFirstTime
                            ? 'Please position your face in the camera for facial recognition registration.'
                            : 'Please position your face in the camera for verification.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    {/* Video Stream with Face Detection Box */}
                    <div className="relative w-full bg-black rounded-lg overflow-hidden aspect-video">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        
                        {/* Face Detection Box - Draw box at actual face location */}
                        {facesDetected === 1 && faceBox && (
                            <div
                                className="absolute border-4 border-green-500 rounded-lg flex items-center justify-center"
                                style={{
                                    left: `${(faceBox.x / (videoRef.current?.videoWidth || 640)) * 100}%`,
                                    top: `${(faceBox.y / (videoRef.current?.videoHeight || 480)) * 100}%`,
                                    width: `${(faceBox.width / (videoRef.current?.videoWidth || 640)) * 100}%`,
                                    height: `${(faceBox.height / (videoRef.current?.videoHeight || 480)) * 100}%`,
                                    pointerEvents: 'none',
                                }}
                            >
                                <span className="text-green-500 text-xs font-bold text-center bg-green-500 bg-opacity-20 px-2 py-1 rounded">
                                    ✓ Face
                                </span>
                            </div>
                        )}
                        
                        {/* Multiple Faces Warning Box */}
                        {facesDetected > 1 && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="border-4 border-red-500 rounded-lg w-48 h-64 opacity-100 flex items-center justify-center">
                                    <span className="text-red-500 text-sm font-bold text-center">
                                        ⚠ Multiple Faces
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Canvas for Drawing Detection */}
                    <canvas
                        ref={canvasRef}
                        className="hidden"
                    />

                    {/* Loading State */}
                    {isLoading && !success && (
                        <div className="text-center py-2">
                            <div className="flex items-center justify-center gap-2">
                                <Spinner />
                                <span className="text-sm text-muted-foreground">
                                    {modelsInitialized ? 'Detecting face...' : 'Loading models...'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Error Alert */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Success Alert */}
                    {success && (
                        <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <AlertDescription className="text-green-800 dark:text-green-100">
                                Face captured successfully!
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Face Detected Count */}
                    {facesDetected > 0 && !success && (
                        <p className="text-sm text-center text-muted-foreground">
                            {facesDetected === 1 ? '✓ Face detected' : `⚠ ${facesDetected} faces detected`}
                        </p>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1"
                        >
                            {isFirstTime ? 'Skip for Now' : 'Cancel'}
                        </Button>
                        {facesDetected !== 1 && (
                            <Button
                                onClick={captureFace}
                                disabled={isLoading || success}
                                className="flex-1"
                            >
                                {isLoading && <Spinner />}
                                {success ? '✓ Captured' : 'Capture Face'}
                            </Button>
                        )}
                        {facesDetected === 1 && !success && (
                            <div className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md text-sm font-medium flex items-center justify-center">
                                <Spinner />
                                <span className="ml-2">Auto-capturing...</span>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
