# Web Scraper & Summarizer with Cloud AI

A modern web application that scrapes webpages and generates massive, detailed AI-powered summaries using Ollama's Cloud API (GPT-OSS:120B).

## Features

- 🌐 Clean, modern web UI for URL input
- 🤖 AI-powered summarization using Cloud Ollama (gpt-oss:120b)
- 📝 Comprehensive Markdown-formatted summaries (5000+ words target)
- ⚡ Cloud-based processing
- 📋 Copy-to-clipboard functionality
- 🎨 Responsive design (desktop & mobile)
- 🔒 Safe web scraping with proper headers

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Python 3.8+** - Download from [python.org](https://www.python.org/)
2. **Ollama API Key** - Get your API key

## Installation

### 1. Configure Environment

Create a `.env` file in the root directory and add your Ollama API key:

```bash
OLLAMA_API_KEY=your_api_key_here
```

### 2. Install Python Dependencies

```bash
pip install -r requirements.txt
```

## Project Structure

```
Web Scrapper/
├── app.py                 # Flask backend application
├── scrapper.py           # Web scraping functions
├── requirements.txt      # Python dependencies
├── .env                  # Environment variables (API Key)
├── templates/
│   └── index.html        # Main HTML page
└── static/
    ├── styles.css        # Styling
    └── script.js         # Frontend JavaScript
```

## Usage

### 1. Start the Flask Server

```bash
python app.py
```

The application will:
- Check for the API Key
- Start on `http://localhost:5000`

### 2. Open in Browser

Navigate to `http://localhost:5000` in your web browser.

### 3. Use the Application

1. Enter a URL in the input field (e.g., `https://example.com` or just `example.com`)
2. Click "Scrape & Summarize"
3. Wait for the AI to process and generate a detailed summary
4. View, copy, or interact with the markdown-formatted summary

## API Endpoints

### GET `/`
Serves the main HTML page.

**Response:** HTML page

### POST `/api/summarize`
Scrapes a URL and returns an AI-generated summary.

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "summary": "Markdown formatted summary...",
  "source_url": "https://example.com"
}
```

**Response (Error - 400/500):**
```json
{
  "error": "Error message"
}
```

### GET `/api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "model": "gpt-oss:120b",
  "backend": "Cloud Ollama",
  "api_status": "configured"
}
```

## How It Works

1. **Frontend (HTML/CSS/JS)**
   - User enters a URL
   - JavaScript sends request to backend API
   - Results are displayed with markdown rendering

2. **Backend (Flask/Python)**
   - Receives URL from frontend
   - Uses `scrapper.py` to fetch webpage content
   - Uses `ollama.Client` to connect to Cloud API
   - Sends content to `gpt-oss:120b` for deep summarization
   - Returns markdown-formatted summary to frontend

3. **Scraper (BeautifulSoup)**
   - Fetches webpage using requests library
   - Parses HTML with BeautifulSoup
   - Cleans content (removes scripts, styles, images)
   - Returns text (max 100,000 characters)

4. **AI Model (Cloud Ollama GPT-OSS:120B)**
   - Processes scraped content in the cloud
   - Generates extensive markdown summary
   - Requires valid API Key

## Configuration

### Model Selection
To use a different model, edit `app.py`:
```python
MODEL_NAME = "gpt-oss:120b"  # Change this to another model name
```

### Port Configuration
To change the port, edit the last line in `app.py`:
```python
app.run(debug=True, host='localhost', port=8000)  # Change 5000 to your port
```

## Troubleshooting

### API Key Errors
- Ensure `.env` file exists
- Ensure `OLLAMA_API_KEY` is set correctly
- Restart the server after changing `.env`

### Port Already in Use
Change the port in `app.py` or kill the process using port 5000:
```bash
# Windows PowerShell
Get-Process | Where-Object {$_.Name -like "*python*"} | Stop-Process
```

### Website Content Not Fetching
- Check your internet connection
- Some websites may block scrapers (robots.txt, IP blocking)
- Try a different URL to test

## Performance Notes

- First request takes longer as the AI model loads into memory
- Subsequent requests are faster
- Falcon:7B uses minimal resources (~8GB RAM)
- Processing time: 10-30 seconds depending on content length

## License

This project is open source and available for educational and personal use.

## Future Enhancements

- [ ] Support for PDF/Document uploads
- [ ] Multiple summarization styles (bullet points, executive summary, etc.)
- [ ] Summary length customization
- [ ] History/saved summaries
- [ ] Batch processing multiple URLs
- [ ] Export summaries (PDF, Word, etc.)
- [ ] Multi-language support

## Support

For issues or questions, please check:
1. Ollama is running properly
2. All dependencies are installed (`pip install -r requirements.txt`)
3. Flask server is started (`python app.py`)
4. Browser is accessing `http://localhost:5000`

## Thanks

- Thanks to **Ollama** for providing the API Key
- Thanks to **Flask** for providing the framework
- Thanks to **BeautifulSoup** for providing the scraper
- Thanks to **Python** for providing the language
