#!/bin/bash

# Create models directory
mkdir -p public/models

echo "Downloading face-api.js models..."

# Download TinyFaceDetector model
wget -q https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/tiny_face_detector_model-weights_manifest.json -O public/models/tiny_face_detector_model-weights_manifest.json
wget -q https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/tiny_face_detector_model-weights_0.bin -O public/models/tiny_face_detector_model-weights_0.bin

# Download Face Landmarks model
wget -q https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/face_landmark_68_model-weights_manifest.json -O public/models/face_landmark_68_model-weights_manifest.json
wget -q https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/face_landmark_68_model-weights_0.bin -O public/models/face_landmark_68_model-weights_0.bin

# Download Face Recognition model
wget -q https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/face_recognition_model-weights_manifest.json -O public/models/face_recognition_model-weights_manifest.json
wget -q https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/face_recognition_model-weights_0.bin -O public/models/face_recognition_model-weights_0.bin

echo "✓ Models downloaded successfully!"
