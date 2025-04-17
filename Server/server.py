#!/usr/bin/env python3
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import threading
import time
import random
import os
import subprocess
from picrawler import Picrawler
from robot_hat import Music, Ultrasonic, Pin, TTS
from os import getlogin
import json

# NEW: import our logging function
from logger import append_log, LOG_FILE_PATH

app = Flask(__name__)
CORS(app)

video_process = subprocess.Popen(["python3", "video_stream.py"])
time.sleep(30)

# Create a Picrawler instance for movement control
crawler = Picrawler()
default_speed = 100

USERNAME = getlogin()
PICTURE_PATH = f"/home/{USERNAME}/Pictures/"
VIDEO_PATH = f"/home/{USERNAME}/Videos/"
AVI_PATH = os.path.join(VIDEO_PATH, "avi/")

# Initialize additional modules
tts = TTS()
music = Music()
ultrasonic = Ultrasonic(Pin("D2"), Pin("D3"))

shutdown_signal = False
RUNNING = True  # Controls background threads

def act_dead():
    """Put all legs in a raised 'dead' position."""
    print("Performing dead action: putting all legs up")
    X1 = crawler.move_list.X_DEFAULT
    Y1 = crawler.move_list.Y_DEFAULT
    X2 = crawler.move_list.X_TURN
    Y2 = crawler.move_list.Y_START
    Z_dead = crawler.move_list.Z_WAVE
    dead_coords = [
        [X1, Y1, Z_dead],
        [X2, Y2, Z_dead],
        [X2, Y2, Z_dead],
        [X1, Y1, Z_dead],
    ]
    crawler.do_step(dead_coords, default_speed)
    msg = "Dead action executed: all legs are up (simulated)"
    print(msg)
    return msg

def execute_action(action, speed_value):
    print(f"Executing action: {action} with speed {speed_value}")
    try:
        if action == "forward":
            crawler.do_action('forward', 1, speed_value)
        elif action == "backward":
            crawler.do_action('backward', 1, speed_value)
        elif action == "turn_left":
            crawler.do_action('turn left', 1, speed_value)
        elif action == "turn_right":
            crawler.do_action('turn right', 1, speed_value)
        elif action == "look_up":
            crawler.do_action('look up', 1, speed_value)
        elif action == "look_down":
            crawler.do_action('look down', 1, speed_value)
        elif action == "act_dead":
            act_dead()
        print(f"Action {action} executed successfully.")
    except Exception as e:
        print(f"Error executing {action} command: {e}")

# ----------------------------------------------------------------------------
# DISTANCE LOGIC:
# We'll define 4 "categories" for the measured distance:
# 1) <= 30 cm => "critical"
# 2) <= 70 cm => "warning"
# 3) <= 100 cm => "info"
# 4) > 100 cm => "safe"
# We only LOG after the robot remains in that category for >1s to avoid spamming.
# ----------------------------------------------------------------------------

def get_distance_category(dist):
    if dist <= 30:
        return "critical"
    elif dist <= 70:
        return "warning"
    elif dist <= 100:
        return "info"
    else:
        return "safe"

# We'll track the last category/time we entered that category, and log once we pass 1s
last_category = None
last_category_time = 0
category_logged = False

def obstacle_monitor():
    """Continuously measure distance using the ultrasonic sensor."""
    global shutdown_signal, RUNNING
    global last_category, last_category_time, category_logged

    start_time_for_dead = None

    while RUNNING and not shutdown_signal:
        try:
            distance = ultrasonic.read()

            # -------------- (A) Distance Logging --------------
            current_category = get_distance_category(distance)
            current_time = time.time()

            # If we've changed category, reset timing/log flags
            if current_category != last_category:
                last_category = current_category
                last_category_time = current_time
                category_logged = False

            # If we've been in the same category for >1s and haven't logged yet, log now
            if (current_time - last_category_time) >= 1.0 and not category_logged:
                # Build a message and severity based on the category
                if current_category == "critical":
                    msg = f"Ultrasonic: CRITICAL, distance <= 30cm for 1s!"
                    severity = "critical"
                elif current_category == "warning":
                    msg = f"Ultrasonic: WARNING, distance <= 70cm for 1s."
                    severity = "warning"
                elif current_category == "info":
                    msg = f"Ultrasonic: distance <= 100cm (moderate range) for 1s."
                    severity = "info"
                else:
                    msg = f"Ultrasonic: SAFE distance > 100cm."
                    severity = "info"  # or "normal"
                
                append_log(msg, log_type='auto', severity=severity)
                category_logged = True

            # -------------- (B) 2-second "dead" logic --------------
            # If distance <= 30 for 2+ seconds => do dead action
            if distance <= 30:
                if start_time_for_dead is None:
                    start_time_for_dead = time.time()
                elif time.time() - start_time_for_dead >= 2:
                    print("Obstacle <= 30cm for 2+ seconds. Triggering dead action and shutdown.")
                    music.music_set_volume(100)
                    music.music_play('/home/spyrobot/Music/death.mp3')
                    act_dead()
                    shutdown_signal = True
                    # If you want to kill the video process, uncomment below
                    # video_process.terminate()
                    RUNNING = False
                    time.sleep(4)
                    break
            else:
                start_time_for_dead = None

        except Exception as e:
            print("Ultrasonic sensor error:", e)

        time.sleep(0.1)

#######################################
# Flask Endpoints
#######################################
@app.route("/")
def index():
    return "Test Server for Movement Control Running on port 5000!"

@app.route("/movement", methods=["POST"])
def movement():
    data = request.get_json() or {}
    action = data.get("action", "")
    speed_value = data.get("speed", default_speed)
    print(f"Received movement command: action={action}, speed={speed_value}")
    valid_actions = ["forward", "backward", "turn_left", "turn_right", "look_up", "look_down", "act_dead"]
    if action not in valid_actions:
        return jsonify({"error": "Invalid movement action"}), 400
    threading.Thread(target=execute_action, args=(action, speed_value), daemon=True).start()
    return jsonify({"message": f"Executing {action} at speed {speed_value}."})

@app.route("/speed", methods=["POST"])
def set_speed_endpoint():
    global default_speed
    data = request.get_json() or {}
    try:
        new_speed = int(data.get("speed"))
        default_speed = new_speed
        print(f"Speed updated to: {default_speed}")
        return jsonify({"message": f"Speed updated to {default_speed}."})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/play-sound', methods=['POST'])
def play_sound():
    """Play a random distraction sound."""
    files = [
        '/home/spyrobot/Music/distraction_1.mp3',
        '/home/spyrobot/Music/distraction_2.mp3',
        '/home/spyrobot/Music/distraction_3.mp3',
        '/home/spyrobot/Music/distraction_4.mp3'
    ]
    chosen_file = random.choice(files)
    music.music_set_volume(100)
    music.music_play(chosen_file)
    msg = f"Playing sound: {chosen_file}"
    print(msg)
    return jsonify({"message": msg})

@app.route("/dead", methods=["POST"])
def dead_endpoint():
    try:
        result = act_dead()
        return jsonify({"message": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/distance", methods=["GET"])
def get_distance():
    try:
        distance = ultrasonic.read()
        return jsonify({"distance": distance})
    except Exception as e:
        return jsonify({"error": "Could not read ultrasonic sensor", "details": str(e)}), 500

@app.route("/status", methods=["GET"])
def status():
    return jsonify({"shutdown": shutdown_signal})

@app.route("/latest", methods=["GET"])
def latest_recording():
    """
    Returns the filename of the latest .mp4 in /home/<USERNAME>/Videos/
    """
    try:
        files = [f for f in os.listdir(VIDEO_PATH) if f.endswith('.mp4')]
        files.sort()
        latest = files[-1] if files else None
        return jsonify({"latest": latest})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/logs", methods=["GET"])
def get_logs():
    """
    Return the entire spy_logs.json file as JSON.
    """
    try:
        with open(LOG_FILE_PATH, 'r') as f:
            logs = json.load(f)
        return jsonify(logs)  # Logs is a Python list of log objects
    except FileNotFoundError:
        return jsonify([])  # Return empty list if no file
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------------------------------------------
# Serve video files directly from VIDEO_PATH
# ---------------------------------------------------
@app.route("/recordings/<path:filename>")
def get_recording(filename):
    """
    Serve the mp4 file from /home/<USERNAME>/Videos/<filename>.
    Allows front-end to load video at:
      http://<IP>:5000/recordings/<filename>.mp4
    """
    try:
        return send_from_directory(VIDEO_PATH, filename)
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404

#######################################
# /events endpoint
#######################################
EVENTS_FILE = "events.json"

def load_events():
    if os.path.exists(EVENTS_FILE):
        with open(EVENTS_FILE, "r") as f:
            return json.load(f)
    return []

def save_events(events_list):
    with open(EVENTS_FILE, "w") as f:
        json.dump(events_list, f, indent=2)

@app.route("/events", methods=["GET", "POST", "OPTIONS"])
def events():
    # Handle the OPTIONS request for CORS preflight
    if request.method == "OPTIONS":
        return jsonify({"ok": True}), 200

    if request.method == "POST":
        data = request.get_json() or {}
        description = data.get("description", "").strip()
        if not description:
            return jsonify({"error": "No description provided"}), 400

        # Build an event object
        event = {
            "id": str(int(time.time() * 1000)),  # quick unique ID
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()),
            "description": description,
            "type": "manual",
        }

        # Save to events.json as before
        all_events = load_events()
        all_events.append(event)
        save_events(all_events)

        append_log(
            description,      # the main message
            log_type='manual', 
            severity='info'
        )
        # ^ You could also include the event ID or any other fields in the description.

        return jsonify({"message": "Event added", "event": event}), 201

    elif request.method == "GET":
        all_events = load_events()
        return jsonify(all_events), 200

#######################################

if __name__ == "__main__":
    monitor_thread = threading.Thread(target=obstacle_monitor, daemon=True)
    monitor_thread.start()
    print("Starting Test Server for Movement Control on port 5000")
    app.run(host="0.0.0.0", port=5000)