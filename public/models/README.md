# Face-API Models

This directory contains the pre-trained face detection and recognition models used by face-api.js.

## Models Included

- **tiny_face_detector_model** - Lightweight face detection model
- **face_landmark_68_model** - 68-point face landmark detection
- **face_recognition_model** - Face encoding/descriptor generation

## Downloading Models

If models are missing, run:

```bash
bash download-models.sh
```

Or use npm:

```bash
npm run download-models
```

## File Size

Total size: ~35-40 MB

These models are required for facial recognition features to work properly.
