#!/usr/bin/env python3
import os
import cv2
import numpy as np

# Path to your Haar cascade XML
CASCADE_PATH = os.path.expanduser("/home/spyrobot/CPSC584_spyrobot/cascades/haarcascade_frontalface_default.xml")
face_cascade = cv2.CascadeClassifier(CASCADE_PATH)

DATASET_PATH = os.path.expanduser("/home/spyrobot/CPSC584_spyrobot/target_images")
MODEL_SAVE_PATH = os.path.expanduser("/home/spyrobot/CPSC584_spyrobot/trained_model.yml")

# Initialize LBPH face recognizer
recognizer = cv2.face.LBPHFaceRecognizer_create()

training_images = []
labels = []

# We'll use "1" as the label ID for this target
TARGET_LABEL_ID = 1

def detect_and_crop_face(img):
    """
    Detect the largest face in the given color image using Haar cascade,
    then return the grayscale cropped face region resized to 200x200.
    If no face is found, returns None.
    """
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(50, 50)
    )
    if len(faces) == 0:
        return None

    # Option 1: just grab the first face
    # Option 2: grab the largest face
    # Here we just pick the first face found:
    (x, y, w, h) = faces[0]

    # Crop and resize
    face_roi = gray[y:y+h, x:x+w]
    face_roi = cv2.resize(face_roi, (200, 200))
    return face_roi

def main():
    # Go through each image in the dataset folder
    files = os.listdir(DATASET_PATH)
    image_count = 0
    for file in files:
        if file.lower().endswith(('.jpg', '.png', '.jpeg')):
            img_path = os.path.join(DATASET_PATH, file)
            img = cv2.imread(img_path)
            if img is None:
                print(f"[WARNING] Could not read {img_path}, skipping...")
                continue

            face_crop = detect_and_crop_face(img)
            if face_crop is not None:
                training_images.append(face_crop)
                labels.append(TARGET_LABEL_ID)
                image_count += 1
                print(f"[INFO] Processed face from {file}")
            else:
                print(f"[WARNING] No face found in {file}, skipping...")

    if image_count == 0:
        print("[ERROR] No faces were processed. Training aborted.")
        return

    # Train the LBPH recognizer
    print(f"[INFO] Training on {image_count} face images...")
    recognizer.train(training_images, np.array(labels))
    recognizer.save(MODEL_SAVE_PATH)
    print(f"[INFO] Training complete. Model saved to {MODEL_SAVE_PATH}")

if __name__ == "__main__":
    main()