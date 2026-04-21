import json
import os

DB_FILE = "sos_db.json"

def init_db():
    if not os.path.exists(DB_FILE):
        with open(DB_FILE, "w") as f:
            json.dump({
                "guardians": [],
                "sos_events": [],
                "high_alert": {}
            }, f)

def read_db():
    with open(DB_FILE, "r") as f:
        return json.load(f)

def write_db(data):
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=4)