from flask import Flask, request, jsonify
import numpy as np
import cv2

app = Flask(__name__)

# Dummy model (we will replace later)
def detect_fake(image):
    # Fake logic (for now)
    return {
        "result": "Fake",
        "confidence": 0.78
    }

@app.route('/predict', methods=['POST'])
def predict():
    file = request.files['file']

    # Convert to image
    file_bytes = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

    output = detect_fake(img)

    return jsonify(output)

if __name__ == '__main__':
    app.run(port=5001)