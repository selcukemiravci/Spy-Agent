#!/usr/bin/env python3
from picrawler import Picrawler
from vilib import Vilib
from time import sleep, time, strftime, localtime
import threading
import readchar
from os import getlogin
from robot_hat import Music, Ultrasonic, Pin, TTS
import time, random, sys

# Create a Picrawler instance for movement control.
crawler = Picrawler()
speed = 100  # Adjust the speed as needed.

# Setup for vision functionality.ll
USERNAME = getlogin()
PICTURE_PATH = f"/home/{USERNAME}/Pictures/"
tts = TTS()
music = Music()
# Create an ultrasonic sensor instance on the specified pins.
ultrasonic = Ultrasonic(Pin("D2"), Pin("D3"))

flag_face = False
flag_color = False
qr_code_flag = False

# Define a combined manual for display.
MANUAL = '''
Combined PiCrawler Control:
---------------------------
Movement:
    W: Forward
    A: Turn left
    S: Backward
    D: Turn right
    Z: Look up
    X: Look down
    K: Act dead (put all legs up)

Vision:
    q: Take photo
    1: Color detect : red
    2: Color detect : orange
    3: Color detect : yellow
    4: Color detect : green
    5: Color detect : blue
    6: Color detect : purple
    0: Switch off Color detect
    r: Toggle QR code detection
    f: Toggle face detection
    i: Display detected object information

Recording:
    v: Record/Pause/Continue
    b: Stop recording

Audio:
    m: Play distraction sound (randomly selected)

Ctrl+C: Quit
---------------------------
'''

# List of colors (index 0 reserved for 'close')
color_list = ['close', 'red', 'orange', 'yellow', 'green', 'blue', 'purple']

def show_info():
    # Clear the terminal and print the manual.
    print("\033[H\033[J", end='')  # ANSI escape sequence to clear screen
    print(MANUAL)

def face_detect(flag):
    print("Face Detect: " + str(flag))
    Vilib.face_detect_switch(flag)

def qrcode_detect():
    global qr_code_flag
    if qr_code_flag:
        Vilib.qrcode_detect_switch(True)
        print("Waiting for QR code...")
    text = None
    while True:
        temp = Vilib.detect_obj_parameter['qr_data']
        if temp != "None" and temp != text:
            text = temp
            print('QR code: %s' % text)
        if not qr_code_flag:
            break
        sleep(0.5)
    Vilib.qrcode_detect_switch(False)

def take_photo():
    _time = strftime('%Y-%m-%d-%H-%M-%S', localtime(time()))
    name = 'photo_%s' % _time
    Vilib.take_photo(name, PICTURE_PATH)
    print('Photo saved as %s%s.jpg' % (PICTURE_PATH, name))

def object_show():
    global flag_color, flag_face
    if flag_color:
        if Vilib.detect_obj_parameter['color_n'] == 0:
            print('Color Detect: None')
        else:
            color_coordinate = (Vilib.detect_obj_parameter['color_x'], Vilib.detect_obj_parameter['color_y'])
            color_size = (Vilib.detect_obj_parameter['color_w'], Vilib.detect_obj_parameter['color_h'])
            print("[Color Detect] Coordinate:", color_coordinate, "Size:", color_size)
    if flag_face:
        if Vilib.detect_obj_parameter['human_n'] == 0:
            print('Face Detect: None')
        else:
            human_coordinate = (Vilib.detect_obj_parameter['human_x'], Vilib.detect_obj_parameter['human_y'])
            human_size = (Vilib.detect_obj_parameter['human_w'], Vilib.detect_obj_parameter['human_h'])
            print("[Face Detect] Coordinate:", human_coordinate, "Size:", human_size)

def print_overwrite(msg, end='', flush=True):
    print('\r\033[2K', end='', flush=True)
    print(msg, end=end, flush=flush)
 
def act_dead():
    """Simulate the dead action by putting all legs up using custom coordinates."""
    print("Performing dead action: putting all legs up")
    # Use default coordinates from the move list
    X1 = crawler.move_list.X_DEFAULT
    Y1 = crawler.move_list.Y_DEFAULT
    X2 = crawler.move_list.X_TURN
    Y2 = crawler.move_list.Y_START
    # Use the Z_WAVE value (typically 60) to represent raised legs
    Z_dead = crawler.move_list.Z_WAVE
    # Construct the coordinate list for all 4 legs
    dead_coords = [
        [X1, Y1, Z_dead],
        [X2, Y2, Z_dead],
        [X2, Y2, Z_dead],
        [X1, Y1, Z_dead],
    ]
    # Execute the movement step with the defined coordinates
    crawler.do_step(dead_coords, speed)
    print("Dead action executed: all legs are up (simulated)")

def obstacle_monitor():
    """Continuously measure distance using the ultrasonic sensor and update overlay text.
       If the distance is between 1 and 10 cm continuously for 3 seconds, play dead.mp3 and terminate the program."""
    start_time = None
    while True:
        try:
            # Get the distance using the ultrasonic sensor as in the reference code
            distance = ultrasonic.read()
            overlay = f"Distance: {distance:.2f} cm"
            # Update the overlay text for the live video stream
            Vilib.overlay_text = overlay
            print(overlay)
            
            # Check if the distance is within 1 to 10 cm
            if 1 <= distance <= 30:
                if start_time is None:
                    start_time = time()  # start the timer
                elif time() - start_time >= 2:
                    print("Obstacle detected at 1-10 cm for 3 seconds. Terminating operation.")
                    music.music_set_volume(100)
                    music.music_play('/home/spyrobot/Music/dead.mp3')
                    sys.exit(0)
            else:
                start_time = None  # reset timer if distance is out of range
        except Exception as e:
            print("Ultrasonic sensor error:", e)
        sleep(0.1)

def main():
    global flag_face, flag_color, qr_code_flag
    qrcode_thread = None

    # Start the camera and begin video streaming.
    Vilib.camera_start(vflip=False, hflip=False)
    Vilib.display(local=True, web=True)

    # Start obstacle monitoring thread
    obstacle_thread = threading.Thread(target=obstacle_monitor)
    obstacle_thread.setDaemon(True)
    obstacle_thread.start()

    show_info()

    rec_flag = 'stop'  # can be 'start', 'pause', or 'stop'
    vname = None
    VIDEO_PATH = f"/home/{USERNAME}/Videos/"
    Vilib.rec_video_set["path"] = VIDEO_PATH

    try:
        while True:
            # Capture a single key press.
            raw_key = readchar.readkey()
            key = raw_key.lower()
            
            # Movement commands using Picrawler.
            if key in ('w', 'a', 's', 'd', 'z', 'x', 'k'):
                if key == 'w':
                    if raw_key == 'W':
                        local_speed = 45
                        print("Moving forward (boosted) at speed 45")
                    else:
                        local_speed = 90
                        print("Moving forward at speed 90")
                    crawler.do_action('forward', 1, local_speed)
                elif key == 's':
                    if raw_key == 'S':
                        local_speed = 45
                        print("Moving backward (boosted) at speed 45")
                    else:
                        local_speed = 90
                        print("Moving backward at speed 90")
                    crawler.do_action('backward', 1, local_speed)
                elif key == 'a':
                    if raw_key == 'A':
                        local_speed = 45
                        print("Turning left (boosted) at speed 45")
                    else:
                        local_speed = 90
                        print("Turning left at speed 90")
                    crawler.do_action('turn left', 1, local_speed)
                elif key == 'd':
                    if raw_key == 'D':
                        local_speed = 45
                        print("Turning right (boosted) at speed 45")
                    else:
                        local_speed = 90
                        print("Turning right at speed 90")
                    crawler.do_action('turn right', 1, local_speed)
                elif key == 'z':
                    crawler.do_action('look up', 1, speed)
                    print("Looking up")
                elif key == 'x':
                    crawler.do_action('look down', 1, speed)
                    print("Looking down")
                elif key == 'k':
                    act_dead()
            
            # Vision commands using Vilib.
            elif key == 'q':
                take_photo()
            elif key in ('1', '2', '3', '4', '5', '6', '0'):
                index = int(key)
                if index == 0:
                    flag_color = False
                    Vilib.color_detect('close')
                else:
                    flag_color = True
                    Vilib.color_detect(color_list[index])
                print('Color detect: %s' % color_list[index])
            elif key == 'r':
                # Toggle QR code detection.
                qr_code_flag = not qr_code_flag
                if qr_code_flag:
                    if qrcode_thread is None or not qrcode_thread.is_alive():
                        qrcode_thread = threading.Thread(target=qrcode_detect)
                        qrcode_thread.setDaemon(True)
                        qrcode_thread.start()
                else:
                    if qrcode_thread is not None and qrcode_thread.is_alive():
                        qrcode_thread.join()
                        print('QR code detection turned off')
            elif key == 'f':
                flag_face = not flag_face
                face_detect(flag_face)
            elif key == 'i':
                object_show()
            elif key == 'v':
                # Toggle record/pause/continue
                if rec_flag == 'stop':
                    rec_flag = 'start'
                    vname = strftime("%Y-%m-%d-%H.%M.%S", localtime())
                    Vilib.rec_video_set["name"] = vname
                    Vilib.rec_video_run()
                    Vilib.rec_video_start()
                    print_overwrite('rec start ...')
                elif rec_flag == 'start':
                    rec_flag = 'pause'
                    Vilib.rec_video_pause()
                    print_overwrite('pause')
                elif rec_flag == 'pause':
                    rec_flag = 'start'
                    Vilib.rec_video_start()
                    print_overwrite('continue')
            elif key == 'b' and rec_flag != 'stop':
                rec_flag = 'stop'
                Vilib.rec_video_stop()
                print_overwrite("The video saved as %s%s.avi" % (Vilib.rec_video_set["path"], vname), end='\n')
            elif key == 'm':
                files = [
                    '/home/spyrobot/Music/distraction_1.mp3',
                    '/home/spyrobot/Music/distraction_2.mp3',
                    '/home/spyrobot/Music/distraction_3.mp3',
                    '/home/spyrobot/Music/distraction_4.mp3'
                ]
                chosen_file = random.choice(files)
                music.music_set_volume(100)
                music.music_play(chosen_file)
                print("Playing " + chosen_file)
            elif key == readchar.key.CTRL_C:
                print("\nQuitting...")
                break

            sleep(0.05)
            show_info()
    except KeyboardInterrupt:
        print("\nKeyboardInterrupt: Exiting.")

if __name__ == "__main__":
    main()