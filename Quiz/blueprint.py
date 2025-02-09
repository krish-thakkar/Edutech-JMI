from flask import Flask, request, jsonify
import os
import base64
from groq import Groq
import warnings
from flask_cors import CORS

# Disable warnings
warnings.filterwarnings('ignore')

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Set up the upload folder
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Groq API Key
GROQ_API_KEY = "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"
client = Groq(api_key=GROQ_API_KEY)

# Model names
llama_model = "llama-3.1-70b-versatile"
llava_model = "llama-3.2-11b-vision-preview"

# Helper function to encode image to base64
def encode(img_path):
    with open(img_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Route to upload image and start conversation
@app.route('/api/upload', methods=['POST'])
def upload():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
        
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if file:
        # Save the uploaded image in the uploads folder
        img_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(img_path)
        
        # Encode image for use with Groq
        result = encode(img_path)

        # Initial prompt from the user
        prompt = request.form.get('prompt')
        if not prompt:
            return jsonify({'error': 'No prompt provided'}), 400

        # Start conversation with the model
        try:
            response = text(client, llava_model, result, prompt)
            return jsonify({
                'response': response,
                'img_path': img_path,
                'prompt': prompt
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 500

def text(client, model, result, prompt):
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpg;base64,{result}",
                        },
                    },
                ],
            },
        ],
        model=model
    )
    return chat_completion.choices[0].message.content

# Route to handle further conversation
@app.route('/api/conversation', methods=['POST'])
def conversation():
    user_prompt = request.form.get('prompt')
    if not user_prompt:
        return jsonify({'error': 'No prompt provided'}), 400
        
    img_path = request.form.get('img_path')
    if not img_path:
        return jsonify({'error': 'No image path provided'}), 400
    
    try:
        result = encode(img_path)
        response = text(client, llava_model, result, user_prompt)
        return jsonify({'response': response})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5200)