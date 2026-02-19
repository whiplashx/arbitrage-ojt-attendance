import { useEffect, useRef, useState } from 'react';

interface FacialRecognitionResult {
    success: boolean;
    encoding?: number[];
    error?: string;
}

export function useFacialRecognition() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [facesDetected, setFacesDetected] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // Initialize face detection library
    useEffect(() => {
        const initializeFaceDetection = async () => {
            try {
                // Dynamic import of face-api
                const faceapi = await import('face-api.js');
                
                // Load models
                const modelUrl = '/models/';
                await Promise.all([
                    faceapi.nets.faceRecognitionNet.loadFromUri(modelUrl),
                    faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl),
                    faceapi.nets.faceDetectionNet.loadFromUri(modelUrl),
                ]);
            } catch (err) {
                console.error('Failed to initialize face detection:', err);
                setError('Failed to load facial recognition models');
            }
        };

        initializeFaceDetection();
    }, []);

    // Start video stream
    const startVideoStream = async () => {
        try {
            setIsLoading(true);
            setError(null);

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

    // Stop video stream
    const stopVideoStream = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach((track) => track.stop());
        }
    };

    // Detect faces and get encoding
    const captureFacialEncoding = async (): Promise<FacialRecognitionResult> => {
        try {
            if (!videoRef.current || !canvasRef.current) {
                return {
                    success: false,
                    error: 'Video or canvas reference not found',
                };
            }

            const faceapi = await import('face-api.js');

            const video = videoRef.current;
            const canvas = canvasRef.current;

            // Ensure video is playing
            if (video.paused) {
                return {
                    success: false,
                    error: 'Video stream is not active',
                };
            }

            // Detect faces and get descriptors
            const detections = await faceapi
                .detectAllFaces(video)
                .withFaceLandmarks()
                .withFaceDescriptors();

            if (detections.length === 0) {
                setFacesDetected(0);
                return {
                    success: false,
                    error: 'No faces detected. Please position your face in the camera.',
                };
            }

            if (detections.length > 1) {
                setFacesDetected(detections.length);
                return {
                    success: false,
                    error: 'Multiple faces detected. Please ensure only one face is visible.',
                };
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
                faceapi.matchDimensions(canvas, displaySize);
                const resizedDetections = faceapi.resizeResults(detections, displaySize);
                faceapi.draw.drawDetections(canvas, resizedDetections);
            }

            return {
                success: true,
                encoding,
            };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to capture facial encoding';
            setError(message);
            return {
                success: false,
                error: message,
            };
        }
    };

    return {
        videoRef,
        canvasRef,
        isLoading,
        error,
        facesDetected,
        startVideoStream,
        stopVideoStream,
        captureFacialEncoding,
    };
}
