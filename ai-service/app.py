from flask import Flask, request, jsonify
import numpy as np
import cv2

app = Flask(__name__)

# Dummy model (we replace later with real model)
def detect_fake(image):
    # Simulated logic
    return {
        "result": "Fake",
        "confidence": 0.82
    }

@app.route('/detect', methods=['POST'])
def detect():
    file = request.files['file']
    
    file_bytes = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

    prediction = detect_fake(img)

    return jsonify(prediction)

if __name__ == '__main__':
  app.run(host="0.0.0.0", port=8000)