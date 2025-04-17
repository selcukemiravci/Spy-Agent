# logger.py
import json
import time
import os

LOG_FILE_PATH = os.path.expanduser('/home/spyrobot/CPSC584_spyrobot/logs/spy_logs.json')

def append_log(description, log_type='auto', severity='info'):
    """
    Appends a log entry to spy_logs.json with a timestamp, description, 
    type (e.g., 'auto' or 'manual'), and severity ('info', 'warning', 'critical').
    """
    timestamp_str = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())

    # Try to read existing logs
    try:
        with open(LOG_FILE_PATH, 'r') as f:
            logs = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        logs = []

    new_event = {
        "id": len(logs) + 1,               # Simple numeric ID
        "timestamp": timestamp_str,
        "description": description,
        "type": log_type,                  # 'auto' for system logs, 'manual' for user logs
        "severity": severity               # e.g., 'info', 'warning', 'critical'
    }

    logs.append(new_event)

    # Write updated logs
    with open(LOG_FILE_PATH, 'w') as f:
        json.dump(logs, f, indent=2)

    # For debugging:
    print(f"[LOG] {timestamp_str} {severity.upper()} - {description}")