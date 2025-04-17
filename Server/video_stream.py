#!/usr/bin/env python3
import threading
import time
import signal
import sys
import os
import subprocess
import cv2
import numpy as np
from vilib import Vilib
from os import getlogin, makedirs, path

# If you have a logger, import your append_log
# from logger import append_log

USERNAME = getlogin()
VIDEO_PATH = f"/home/{USERNAME}/Videos/"
if not path.exists(VIDEO_PATH):
    makedirs(VIDEO_PATH)

recording_active = False
stop_recording = False
vname = None

##############################
# Example Face Recognition Setup
##############################
try:
    recognizer = cv2.face.LBPHFaceRecognizer_create()
    recognizer.read('trained_model.yml')
    print("LBPH model loaded successfully.")
except Exception as e:
    print("Error loading LBPH model:", e)
    recognizer = None

# Haar cascade for face detection
cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
face_cascade = cv2.CascadeClassifier(cascade_path)

# Optional logging/time checks
last_known_face_time = 0
known_face_logged = False
last_unknown_face_time = 0
unknown_face_logged = False
last_no_face_time = 0
no_face_logged = False

def custom_face_detect_func(frame):
    """
    Example detection pipeline:
    1) Convert to grayscale & detect faces
    2) Optionally do LBPH recognition
    3) Optionally log events
    """
    global last_known_face_time, known_face_logged
    global last_unknown_face_time, unknown_face_logged
    global last_no_face_time, no_face_logged

    if recognizer is None:
        return frame

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(
        gray, scaleFactor=1.1, minNeighbors=5, minSize=(50, 50)
    )

    found_known = False
    found_unknown = False

    for (x, y, w, h) in faces:
        face_roi = gray[y:y+h, x:x+w]
        face_roi = cv2.resize(face_roi, (200, 200))
        label, confidence = recognizer.predict(face_roi)

        if label == 1 and confidence < 65:
            # This is our "known" target
            found_known = True
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
            cv2.putText(frame, "TARGET", (x, y - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
        else:
            found_unknown = True
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 0, 255), 2)
            cv2.putText(frame, "UNKNOWN", (x, y - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)

    # Example: do some logging after 1s
    current_time = time.time()
    any_face_found = (found_known or found_unknown)

    # Known face logic
    if found_known:
        if last_known_face_time == 0:
            last_known_face_time = current_time
        if (current_time - last_known_face_time) >= 1.0 and not known_face_logged:
            # append_log("Mission success: target face confirmed > 1s!", log_type='auto', severity='success')
            known_face_logged = True
    else:
        last_known_face_time = 0
        known_face_logged = False

    # Unknown face logic
    if found_unknown:
        if last_unknown_face_time == 0:
            last_unknown_face_time = current_time
        if (current_time - last_unknown_face_time) >= 1.0 and not unknown_face_logged:
            # append_log("Warning: unknown face detected > 1s.", log_type='auto', severity='warning')
            unknown_face_logged = True
    else:
        last_unknown_face_time = 0
        unknown_face_logged = False

    # No face logic
    if not any_face_found:
        if last_no_face_time == 0:
            last_no_face_time = current_time
        if (current_time - last_no_face_time) >= 1.0 and not no_face_logged:
            # append_log("No face detected > 1s. Scene is clear.", log_type='auto', severity='info')
            no_face_logged = True
    else:
        last_no_face_time = 0
        no_face_logged = False

    return frame

# Hook it into Vilib
Vilib.face_detect_func = custom_face_detect_func

def graceful_exit(signum, frame):
    """
    If we get SIGTERM or Ctrl+C, gracefully finalize recording
    before actually exiting.
    """
    global recording_active, stop_recording
    print("Signal received, initiating graceful shutdown for video recording...")

    # Tell our recording loop to stop
    stop_recording = True

    # Wait for the recording to actually finalize
    while recording_active:
        time.sleep(0.1)

    print("Recording loop ended. Exiting now.")
    sys.exit(0)

def video_record_service():
    """
    1) Record in 'mp4v' (which usually works with OpenCV on a Pi).
    2) On stop, run ffmpeg to produce H.264 .mp4 for browser playback.
    """
    global recording_active, stop_recording, vname

    # Make a timestamped filename
    vname = time.strftime("%Y-%m-%d-%H.%M.%S", time.localtime())
    raw_file = path.join(VIDEO_PATH, f"{vname}_temp.mp4")   # The 'raw' OpenCV file
    final_file = path.join(VIDEO_PATH, f"{vname}.mp4")      # The final H.264 file

    print("Starting OpenCV-based recording to (temporary):", raw_file)

    writer = None
    recording_active = True

    try:
        while recording_active and not stop_recording:
            frame = Vilib.img
            if frame is not None:
                if writer is None:
                    height, width = frame.shape[:2]
                    fps = 20.0
                    # We'll use 'mp4v' as a fallback because it's usually supported by Pi's OpenCV.
                    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
                    writer = cv2.VideoWriter(raw_file, fourcc, fps, (width, height))

                # Optionally, run detection again here if you want bounding boxes in the recording.
                processed_frame = custom_face_detect_func(frame)
                writer.write(processed_frame)

            time.sleep(0.03)
    finally:
        if writer is not None:
            writer.release()
        recording_active = False
        stop_recording = False
        print("OpenCV recording has stopped. Converting to H.264...")

        # --------------------------------------------------------------
        # Use ffmpeg to produce a final .mp4 with H.264 + AAC
        # --------------------------------------------------------------
        try:
            cmd = [
                "ffmpeg", "-y",
                "-i", raw_file,        # input
                "-c:v", "libx264",
                "-preset", "fast",
                "-crf", "23",
                "-c:a", "aac",
                final_file
            ]
            subprocess.run(cmd, check=True)
            # Remove the raw file if conversion is successful
            os.remove(raw_file)
            print(f"Conversion successful, final file at: {final_file}")
        except Exception as e:
            print("FFmpeg conversion error:", e)
            print("The raw file is still at:", raw_file)

def main():
    # Attach signal handlers
    signal.signal(signal.SIGTERM, graceful_exit)
    signal.signal(signal.SIGINT, graceful_exit)

    print("Starting camera + web display (Vilib)...")
    Vilib.camera_start(vflip=False, hflip=False)
    Vilib.display(local=False, web=True)

    # Record in the background
    recording_thread = threading.Thread(target=video_record_service, daemon=True)
    recording_thread.start()

    print("video_stream.py now running. Press Ctrl+C or send SIGTERM to stop.")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        graceful_exit(None, None)

if __name__ == "__main__":
    main()