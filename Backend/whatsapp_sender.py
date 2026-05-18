import pywhatkit
from datetime import datetime, timedelta


def send_sos_message(phone_number):

    message = """
🚨 GUARDIAN SOS ALERT 🚨

Emergency triggered by user.

Please respond immediately.
"""

    # Schedule 2 minutes ahead
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

    print(f"SOS scheduled for {phone_number}")