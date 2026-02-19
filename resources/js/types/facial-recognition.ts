/**
 * Facial Recognition Type Definitions
 */

export interface FacialEncodingData {
    encoding: number[];
    hash: string;
    timestamp: number;
}

export interface FacialVerificationResult {
    success: boolean;
    matched: boolean;
    userId?: number;
    distance?: number;
    message?: string;
}

export interface FacialStatus {
    enabled: boolean;
    registeredAt: string | null;
}

export interface FacialRegistrationResult {
    success: boolean;
    message: string;
}

export interface FacialDetection {
    face: HTMLCanvasElement;
    encoding: number[];
    confidence: number;
}

export interface CameraConstraints {
    video: {
        width?: { ideal: number };
        height?: { ideal: number };
        facingMode?: 'user' | 'environment';
    };
    audio?: boolean;
}
