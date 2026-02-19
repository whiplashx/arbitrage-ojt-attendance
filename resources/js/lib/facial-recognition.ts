/**
 * Facial Recognition Utility Functions
 */

/**
 * Calculate Euclidean distance between two facial encodings
 */
export function euclideanDistance(encoding1: number[], encoding2: number[]): number {
    if (encoding1.length !== encoding2.length) {
        throw new Error('Encoding dimensions do not match');
    }

    let sum = 0;
    for (let i = 0; i < encoding1.length; i++) {
        sum += Math.pow(encoding1[i] - encoding2[i], 2);
    }

    return Math.sqrt(sum);
}

/**
 * Upload facial encoding to server
 */
export async function uploadFacialEncoding(
    encodingJson: string,
    userId: number
): Promise<{ success: boolean; message: string }> {
    const response = await fetch('/api/facial-recognition/store', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
            facial_encoding: encodingJson,
            user_id: userId,
        }),
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to upload facial encoding');
    }

    return response.json();
}

/**
 * Verify facial encoding against registered users
 */
export async function verifyFacialEncoding(encodingJson: string): Promise<{
    success: boolean;
    matched: boolean;
    user_id?: number;
    distance?: number;
    message?: string;
}> {
    const response = await fetch('/api/facial-recognition/verify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
            facial_encoding: encodingJson,
        }),
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Verification failed');
    }

    return response.json();
}

/**
 * Get facial recognition status for current user
 */
export async function getFacialStatus(): Promise<{
    enabled: boolean;
    registered_at: string | null;
}> {
    const response = await fetch('/api/facial-recognition/status', {
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to get facial recognition status');
    }

    return response.json();
}

/**
 * Disable facial recognition for current user
 */
export async function disableFacialRecognition(): Promise<{ success: boolean; message: string }> {
    const response = await fetch('/api/facial-recognition/disable', {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to disable facial recognition');
    }

    return response.json();
}
