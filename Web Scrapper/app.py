from flask import Flask, render_template, request, jsonify, Response, stream_with_context
from scrapper import fetch_website_contents
from ollama import Client
from dotenv import load_dotenv
import os
import requests


# Load environment variables
load_dotenv()

app = Flask(__name__)


# Model to use for summarization
MODEL_NAME = "gpt-oss:120b"
API_KEY = os.environ.get("OLLAMA_API_KEY")

if not API_KEY:
    print("WARNING: OLLAMA_API_KEY environment variable not set.")

def get_ollama_client():
    """Get authenticated Ollama client"""
    if not API_KEY:
        raise ValueError("OLLAMA_API_KEY environment variable not set")
    
    return Client(
        host='https://ollama.com',
        headers={'Authorization': f'Bearer {API_KEY}'}
    )

## This is the Home Page of the app

@app.route('/')
def index():
    """Serve the main HTML page"""
    return render_template('index.html')

## This is where the magic happens -- Summarization of the website

@app.route('/api/summarize', methods=['POST'])
def summarize():
    """
    API endpoint to scrape a URL and summarize its content using Cloud Ollama
    Expects JSON with 'url' field
    """
    try:
        data = request.get_json()
        url = data.get('url', '').strip()
        
        if not url:
            return jsonify({'error': 'URL is required'}), 400
        
        # Add protocol if missing
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        # Fetch website contents with error handling
        try:
            website_content = fetch_website_contents(url)
        except requests.exceptions.ConnectionError:
            return jsonify({
                'error': 'Unable to connect to the website. Please check the URL and your internet connection.',
                'details': 'DNS lookup failed or connection refused.'
            }), 400
        except requests.exceptions.Timeout:
            return jsonify({
                'error': 'The request timed out. The website is taking too long to respond.',
                'details': 'Connection timed out.'
            }), 400
        except requests.exceptions.MissingSchema:
             return jsonify({
                'error': 'Invalid URL format. Please ensure the URL starts with http:// or https://',
                'details': 'Missing URL schema.'
            }), 400
        except requests.exceptions.HTTPError as e:
            return jsonify({
                'error': f'The website returned an error: {e.response.status_code}', 
                'details': str(e)
            }), 400
        except requests.exceptions.RequestException as e:
            return jsonify({
                'error': 'Failed to access the website.',
                'details': str(e)
            }), 400
        except Exception as e:
            return jsonify({
                'error': 'An unexpected error occurred.', 
                'details': str(e)
            }), 500
        
        if not website_content:
            return jsonify({'error': 'Could not fetch website content'}), 400
        
        # Summarize using Cloud Ollama with system and user prompts
        system_prompt = """You are an expert content summarizer. Your task is to create a detailed markdown summary of the webpage content.

Guidelines:
- Start with the website summary in 75 words - (Don't use the numeric terms "75 words" or "50 words" or "30 words" or "100 words" in the output)
- Make summary for each sub-headings about 30 words
- Focus strictly on the content.
- Do NOT use generic headers like "Executive Summary", "Introduction", or "Conclusion".
- The first line MUST be the title in this format: "Page Title - Brief Description" in h1 tag.
- Use professional markdown formatting (headers, lists, bold, italic).
- Organize information logically using ## for major sections and ### for subsections.
- Highlight important terms with **bold**.
- End with the conclusion in 50 words
"""

        user_prompt = f"""Please authorize a detailed markdown summary of the following webpage content:

{website_content}

Structure the output as requested:
1. Title line: [Page Title] - [Brief Description]
2. Detailed summary content breakdown.

Provide the summary below:"""
        
        def generate():
            try:
                client = get_ollama_client()
                
                # Using chat interface with streaming
                response_stream = client.chat(
                    model=MODEL_NAME,
                    messages=[
                        {'role': 'system', 'content': system_prompt},
                        {'role': 'user', 'content': user_prompt}
                    ],
                    stream=True,
                    options={
                        "num_predict": 3000
                    }
                )
                
                # Yield parts as they come
                for part in response_stream:
                    content = part.message.content
                    if content:
                        yield content
                        
            except Exception as e:
                yield f"Error: {str(e)}"

        return Response(stream_with_context(generate()), mimetype='text/plain')
    
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

## Health Check

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    api_status = "configured" if API_KEY else "missing_key"
    return jsonify({
        'status': 'ok',
        'model': MODEL_NAME,
        'backend': 'Cloud Ollama',
        'api_status': api_status
    }), 200

if __name__ == '__main__':
    print("\n" + "="*50)
    print("Web Scraper & Summarizer Starting (Cloud Mode)...")
    print("="*50)
    
    # Check API Key
    if API_KEY:
        print("✓ API Key found")
    else:
        print("✗ API Key NOT found")
        print("  Please set OLLAMA_API_KEY in .env file or environment variables")
    
    print("\n" + "="*50)
    print("Server starting at: http://localhost:5000")
    print("="*50 + "\n")
    
    app.run(debug=True, host='localhost', port=5000)
