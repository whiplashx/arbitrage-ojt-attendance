import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useFacialRecognition } from '@/hooks/useFacialRecognition';

interface FacialRegistrationProps {
    onCapture: (encoding: string) => void;
    isOptional?: boolean;
}

export default function FacialRegistration({ onCapture, isOptional = true }: FacialRegistrationProps) {
    const {
        videoRef,
        canvasRef,
        isLoading,
        error,
        facesDetected,
        startVideoStream,
        stopVideoStream,
        captureFacialEncoding,
    } = useFacialRecognition();

    const [isCapturing, setIsCapturing] = useState(false);
    const [isCaptured, setIsCaptured] = useState(false);
    const [streamActive, setStreamActive] = useState(false);

    useEffect(() => {
        return () => {
            stopVideoStream();
        };
    }, []);

    const handleStartCapture = async () => {
        setIsCapturing(true);
        await startVideoStream();
        setStreamActive(true);
    };

    const handleCapture = async () => {
        const result = await captureFacialEncoding();

        if (result.success && result.encoding) {
            // Convert encoding to JSON string for storage
            const encodingJson = JSON.stringify(result.encoding);
            onCapture(encodingJson);
            setIsCaptured(true);
            stopVideoStream();
            setStreamActive(false);
        }
    };

    const handleRetake = () => {
        setIsCaptured(false);
        setIsCapturing(false);
        setStreamActive(false);
        stopVideoStream();
    };

    if (!streamActive && !isCaptured) {
        return (
            <div className="grid gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">
                        Facial Recognition {!isOptional && '*'}
                    </label>
                    <p className="text-xs text-muted-foreground">
                        {isOptional
                            ? 'Optionally add facial recognition for faster login'
                            : 'Facial recognition is required for registration'}
                    </p>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    onClick={handleStartCapture}
                    disabled={isLoading}
                    className="w-full"
                >
                    {isLoading ? <Spinner /> : 'Enable Camera'}
                </Button>

                {error && <div className="text-sm text-red-500">{error}</div>}
            </div>
        );
    }

    if (streamActive && !isCaptured) {
        return (
            <div className="grid gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Position Your Face</label>
                    <p className="text-xs text-muted-foreground">
                        Look directly at the camera and keep your face centered
                    </p>
                </div>

                <div className="relative w-full overflow-hidden rounded-lg bg-black">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full"
                        style={{ maxHeight: '300px' }}
                    />
                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 hidden"
                        style={{ maxHeight: '300px' }}
                    />
                </div>

                {facesDetected === 0 && (
                    <div className="text-sm text-yellow-600">No face detected. Position your face in the camera.</div>
                )}
                {facesDetected > 1 && (
                    <div className="text-sm text-red-500">Multiple faces detected. Please show only one face.</div>
                )}
                {facesDetected === 1 && (
                    <div className="text-sm text-green-600">Face detected successfully!</div>
                )}

                {error && <div className="text-sm text-red-500">{error}</div>}

                <div className="flex gap-2">
                    <Button
                        type="button"
                        onClick={handleCapture}
                        disabled={facesDetected !== 1 || isCapturing}
                        className="flex-1"
                    >
                        {isCapturing ? <Spinner /> : 'Capture'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            stopVideoStream();
                            setStreamActive(false);
                            setIsCapturing(false);
                        }}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        );
    }

    if (isCaptured) {
        return (
            <div className="grid gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Facial Recognition Captured</label>
                    <p className="text-xs text-green-600">Your face has been successfully registered!</p>
                </div>

                <canvas
                    ref={canvasRef}
                    className="w-full rounded-lg border border-green-500"
                    style={{ maxHeight: '300px' }}
                />

                <Button
                    type="button"
                    variant="outline"
                    onClick={handleRetake}
                    className="w-full"
                >
                    Retake Photo
                </Button>
            </div>
        );
    }

    return null;
}
