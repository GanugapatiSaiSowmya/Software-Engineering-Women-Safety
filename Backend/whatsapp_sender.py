import pywhatkit
from datetime import datetime, timedelta


def send_sos_message(phone_number, user_name):

    message = f"""
🚨 TRUSTED CONTACT ALERT 🚨

{user_name} has triggered a safety alert.

Please check on them immediately.
"""

    send_time = datetime.now() + timedelta(minutes=2)

    pywhatkit.sendwhatmsg(
        phone_number,
        message,
        send_time.hour,
        send_time.minute,
        wait_time=10,
        tab_close=True,
        close_time=5
    )

    print(f"Alert scheduled for {phone_number}")
    

def send_takedown_alert(phone_number, user_name):

    message = f"""
🚨 SHIELD.ai SAFETY NOTICE 🚨

Potential harmful or manipulated content involving {user_name} has been identified.

This notification is being shared with trusted contacts to support the user's safety and well-being.

Please check in with the user as soon as possible.
"""

    send_time = datetime.now() + timedelta(minutes=2)

    pywhatkit.sendwhatmsg(
        phone_number,
        message,
        send_time.hour,
        send_time.minute,
        wait_time=10,
        tab_close=False,
        close_time=5
    )

    print(f"Takedown alert scheduled for {phone_number}")
    