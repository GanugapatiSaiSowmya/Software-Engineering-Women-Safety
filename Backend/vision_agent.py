import os
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
import mimetypes
from PIL import Image

# --- Model Registry ---
# Best model per input type. All are free on HuggingFace.
MODELS = {
    "portrait":    "dima806/deepfake_vs_real_image_detection",   # faces/portraits
    "screenshot":  "Wvolf/ViT_Deepfake_Detection",               # general/screenshots
    "video_frame": "dima806/deepfake_vs_real_image_detection",   # video frames (face-heavy)
}

_pipelines = {}  # lazy-loaded cache

def _get_pipeline(model_key: str):
    """Lazy-load and cache pipelines to avoid reloading on every call."""
    if model_key not in _pipelines:
        from transformers import pipeline
        print(f"[vision_agent] Loading model: {MODELS[model_key]}")
        _pipelines[model_key] = pipeline(
            "image-classification",
            model=MODELS[model_key],
            device=_get_device(),
        )
    return _pipelines[model_key]


def _get_device():
    """Use GPU if available, else CPU."""
    try:
        import torch
        return 0 if torch.cuda.is_available() else -1
    except ImportError:
        return -1


def _classify_input(file_path: str) -> str:
    """
    Route the file to the right model based on MIME type.
    - video/* → video_frame (extract first frame)
    - image with faces → portrait (heuristic: non-screenshot image)
    - image/png screenshot → screenshot
    """
    mime, _ = mimetypes.guess_type(file_path)
    if mime and mime.startswith("video"):
        return "video_frame"
    if mime == "image/png":
        # PNGs are commonly screenshots; portraits are usually JPEG
        return "screenshot"
    return "portrait"


def _extract_video_frame(file_path: str) -> Image.Image:
    """Extract the first frame from a video file."""
    try:
        import cv2
        cap = cv2.VideoCapture(file_path)
        success, frame = cap.read()
        cap.release()
        if not success:
            raise ValueError("Could not read video frame")
        import cv2
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        return Image.fromarray(frame_rgb)
    except ImportError:
        raise RuntimeError("opencv-python is required for video support: pip install opencv-python")


def detect_deepfake(file_path: str) -> dict:
    """
    Run deepfake detection on an image or video file.
    Returns a standardized result dict.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Input file not found: {file_path}")

    input_type = _classify_input(file_path)

    # Load the image (or extract frame from video)
    try:
        if input_type == "video_frame":
            image = _extract_video_frame(file_path)
        else:
            image = Image.open(file_path).convert("RGB")
    except Exception as e:
        return {
            "score": None,
            "is_deepfake": None,
            "label": "error",
            "details": f"Failed to load input: {str(e)}",
            "source": f"hf_{input_type}_model",
        }

    # Run the model
    try:
        pipe = _get_pipeline(input_type)
        results = pipe(image)

        # Results are a list like:
        # [{"label": "Fake", "score": 0.97}, {"label": "Real", "score": 0.03}]
        result_map = {r["label"].lower(): r["score"] for r in results}

        fake_score = result_map.get("fake", result_map.get("deepfake", 0.0))
        real_score = result_map.get("real", 1.0 - fake_score)

        is_deepfake = fake_score > 0.5
        label = "fake" if is_deepfake else "real"

        return {
            "score": round(fake_score, 4),
            "is_deepfake": is_deepfake,
            "label": label,
            "details": (
                f"Input type: {input_type}. "
                f"Fake confidence: {fake_score:.2%}, Real confidence: {real_score:.2%}."
            ),
            "source": f"hf_{input_type}_model",
        }

    except Exception as e:
        return {
            "score": None,
            "is_deepfake": None,
            "label": "error",
            "details": f"Model inference failed: {str(e)}",
            "source": f"hf_{input_type}_model",
        }