from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import os
import time
import logging
import google.generativeai as genai
from google.generativeai import types

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': 'AI Headshot Generator API',
        'status': 'online',
        'endpoints': ['/status', '/process']
    })

@app.route('/status', methods=['GET'])
def status():
    return jsonify({
        'status': 'running',
        'version': '1.0.0',
        'message': 'Python server is running and ready to process images'
    })

def generate_image(input_file_path, input_mime_type, user_prompt, style="professional"):
    try:
        # Initialize the client with API key
        client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
        
        # Use the gemini-2.0-flash-exp model for image generation
        model = "gemini-2.0-flash-exp"
        
        # Read the image data
        with open(input_file_path, "rb") as f:
            image_data = f.read()
        
        # Base prompt for all styles
        base_prompt = "Please enhance the background and adjust the overall lighting so it appears like natural, soft daylight in a premium studio setting. Do not alter my face, expression, pose, or clothing in any way."
        
        # Add style-specific instructions
        if style == "professional":
            style_prompt = f"{base_prompt} Create a clean, professional backdrop suitable for corporate headshots or LinkedIn profiles."
        elif style == "creative":
            style_prompt = f"{base_prompt} Add a slightly artistic touch with subtle creative lighting while maintaining professionalism."
        else:  # casual
            style_prompt = f"{base_prompt} Create a more relaxed, casual setting with warm, friendly lighting."
        
        # Prepare content with user image and prompt
        contents = [
            types.Content(
                role="user",
                parts=[
                    {
                        "inline_data": {
                            "data": base64.b64encode(image_data).decode("utf-8"),
                            "mime_type": input_mime_type
                        }
                    },
                    {"text": style_prompt},
                ],
            ),
            # Add the user's specific prompt
            types.Content(
                role="user",
                parts=[
                    {"text": f"{user_prompt}"},
                ],
            ),
        ]
        
        # Configure generation parameters
        generate_content_config = types.GenerateContentConfig(
            temperature=1.25,
            top_p=0.95,
            top_k=40,
            max_output_tokens=8192,
            response_modalities=[
                "image",
                "text",
            ],
            response_mime_type="text/plain",
        )
        
        # Generate content
        response = client.generate_content(
            model=model,
            contents=contents,
            generation_config=generate_content_config,
        )
        
        # Process and return the response
        return response
    except Exception as e:
        logger.error(f"Error generating image with Gemini: {str(e)}")
        raise e

@app.route('/process', methods=['POST'])
def process():
    try:
        data = request.json
        logger.info(f"Received request with {len(data.get('images', []))} images")
        logger.info(f"Style: {data.get('style')}")
        logger.info(f"Prompt: {data.get('prompt')}")
        
        # Check if GEMINI_API_KEY is set
        if not os.environ.get("GEMINI_API_KEY"):
            logger.warning("GEMINI_API_KEY not set, using mock images")
            # Simulate processing time
            time.sleep(2)
            
            # For now, return mock images
            style = data.get('style', 'professional')
            
            # Return different mock images based on style
            if style == 'professional':
                images = [
                    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80",
                    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80",
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80",
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=80"
                ]
            elif style == 'creative':
                images = [
                    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80",
                    "https://images.unsplash.com/photo-1573497019236-61e7a0081f95?w=800&q=80",
                    "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&q=80",
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80"
                ]
            else:  # casual
                images = [
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80"
                ]
            
            return jsonify({
                'images': images,
                'source': 'python-server-mock'
            })
        else:
            # TODO: Implement actual image processing with Gemini
            # This would involve saving the uploaded images, processing them with the generate_image function,
            # and returning the results
            
            # For now, return mock images
            logger.info("GEMINI_API_KEY is set, but implementation is not complete yet")
            return jsonify({
                'images': [
                    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80",
                    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80"
                ],
                'source': 'python-server-gemini-placeholder'
            })
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Get port from environment variable (Heroku sets this automatically)
    port = int(os.environ.get('PORT', 5000))
    # Bind to 0.0.0.0 to allow external access
    app.run(host='0.0.0.0', port=port, debug=False)
