import numpy as np
from PIL import Image
import cv2

def apply_adversarial_noise(img):
    arr = np.array(img)

    noise = np.random.randint(-2, 3, arr.shape, dtype='int16')
    arr = np.clip(arr + noise, 0, 255).astype('uint8')

    return Image.fromarray(arr)


def embed_watermark(img, message="SHIELD"):
    arr = np.array(img)

    binary = ''.join(format(ord(c), '08b') for c in message)
    flat = arr.reshape(-1, 3)

    for i in range(min(len(binary), len(flat))):
        flat[i][0] = (flat[i][0] & 0xFE) | int(binary[i])

    return Image.fromarray(flat.reshape(arr.shape))


def apply_honey_pixels(img):
    arr = np.array(img)
    h, w, _ = arr.shape

    for y in range(h):
        for x in range(w):
            if (x + y) % 12 == 0:
                arr[y, x, 0] = min(255, arr[y, x, 0] + 15)
                arr[y, x, 1] = max(0, arr[y, x, 1] - 10)
                arr[y, x, 2] = min(255, arr[y, x, 2] + 5)

    return Image.fromarray(arr)


def apply_smart_blur(img):
    # Convert PIL → OpenCV format
    cv_img = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    )

    gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    for (x, y, w, h) in faces:
        roi = cv_img[y:y+h, x:x+w]
        blurred = cv2.GaussianBlur(roi, (51, 51), 0)
        cv_img[y:y+h, x:x+w] = blurred

    # Convert back to PIL
    return Image.fromarray(cv2.cvtColor(cv_img, cv2.COLOR_BGR2RGB))

def protect_image(img):
    # Step 1: Adversarial noise
    img = apply_adversarial_noise(img)

    # Step 2: Watermark
    img = embed_watermark(img)

    # Step 3: Honey pixels
    img = apply_honey_pixels(img)

    # Step 4: Smart Blur (NEW)
    img = apply_smart_blur(img)

    return img