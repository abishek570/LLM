// DOM Elements
const urlInput = document.getElementById('urlInput');
const scrapeBtn = document.getElementById('scrapeBtn');
const clearBtn = document.getElementById('clearBtn');
const resultSection = document.getElementById('resultSection');
const errorSection = document.getElementById('errorSection');
const loadingSection = document.getElementById('loadingSection');
const summaryContent = document.getElementById('summaryContent');
const sourceUrl = document.getElementById('sourceUrl');
const copyBtn = document.getElementById('copyBtn');
const closeErrorBtn = document.getElementById('closeErrorBtn');
const errorText = document.getElementById('errorText');
const btnText = scrapeBtn.querySelector('.btn-text');
const btnSpinner = scrapeBtn.querySelector('.btn-spinner');

// Event Listeners
scrapeBtn.addEventListener('click', handleScrape);
clearBtn.addEventListener('click', handleClear);
urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleScrape();
    }
});
copyBtn.addEventListener('click', handleCopy);
closeErrorBtn.addEventListener('click', hideError);

/**
 * Handle the scrape button click
 */
async function handleScrape() {
    const url = urlInput.value.trim();

    // Validation
    if (!url) {
        showError('Please enter a valid URL');
        return;
    }

    // Hide previous results
    hideResult();
    hideError();
    showLoading();

    // Disable button
    scrapeBtn.disabled = true;
    btnText.textContent = 'Processing...';
    btnSpinner.classList.remove('hidden');

    try {
        const response = await fetch('/api/summarize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to process the URL');
        }

        // Initialize display
        showResult();
        summaryContent.innerHTML = ''; // Clear previous content
        sourceUrl.textContent = url;
        hideLoading();

        // Scroll to result
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Handle streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullSummary = '';

        while (true) {
            const { done, value } = await reader.read();

            if (done) {
                break;
            }

            // Decode chunk
            const chunk = decoder.decode(value, { stream: true });

            // Handle error in stream
            if (chunk.startsWith('Error:')) {
                throw new Error(chunk.substring(6).trim());
            }

            fullSummary += chunk;

            // Updates per chunk
            // Note: Optimizing this to not re-render heavy changes would be better in prod,
            // but for this scale, re-rendering is acceptable.
            summaryContent.innerHTML = markdownToHtml(fullSummary);
        }

        // Display results


    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'An error occurred while processing the URL');
        hideLoading();
    } finally {
        // Re-enable button
        scrapeBtn.disabled = false;
        btnText.textContent = 'Scrape & Summarize';
        btnSpinner.classList.add('hidden');
    }
}

/**
 * Handle the clear button click
 */
function handleClear() {
    // Clear input
    urlInput.value = '';

    // Hide all sections
    hideResult();
    hideError();
    hideLoading();

    // Reset button state
    scrapeBtn.disabled = false;
    btnText.textContent = 'Scrape & Summarize';
    btnSpinner.classList.add('hidden');

    // Focus on input
    urlInput.focus();
}

/**
 * Display the summary result
 */
function displayResult(summary, url) {
    // Convert markdown to HTML
    const htmlContent = markdownToHtml(summary);

    summaryContent.innerHTML = htmlContent;
    sourceUrl.textContent = url;

    showResult();

    // Scroll to result
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Convert markdown to HTML
 */
function markdownToHtml(markdown) {
    let html = markdown;

    // Headers
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');

    // Code
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');

    // Lists - Unordered
    html = html.replace(/^\* (.*?)$/gm, '<li>$1</li>');
    html = html.replace(/^\- (.*?)$/gm, '<li>$1</li>');
    html = html.replace(/^\+ (.*?)$/gm, '<li>$1</li>');

    // Wrap consecutive list items
    html = html.replace(/(<li>.*?<\/li>\n?)+/g, (match) => {
        return '<ul>' + match.replace(/\n/g, '') + '</ul>';
    });

    // Numbered lists
    html = html.replace(/^\d+\. (.*?)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*?<\/li>\n?)+/g, (match) => {
        return '<ol>' + match.replace(/\n/g, '') + '</ol>';
    });

    // Paragraphs - add <p> tags for text not in other tags
    const lines = html.split('\n');
    html = lines.map(line => {
        line = line.trim();
        if (line &&
            !line.match(/^<[huo]/) &&
            !line.match(/<\/[huo]>$/) &&
            !line.match(/^<li>/) &&
            line !== '') {
            return '<p>' + line + '</p>';
        }
        return line;
    }).join('\n');

    return html;
}

/**
 * Copy summary to clipboard
 */
async function handleCopy() {
    try {
        const text = summaryContent.innerText;
        await navigator.clipboard.writeText(text);

        // Provide feedback
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✓ Copied!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
        showError('Failed to copy to clipboard');
    }
}

/**
 * Show/Hide Functions
 */
function showResult() {
    resultSection.classList.remove('hidden');
}

function hideResult() {
    resultSection.classList.add('hidden');
}

function showLoading() {
    loadingSection.classList.remove('hidden');
}

function hideLoading() {
    loadingSection.classList.add('hidden');
}

function showError(message) {
    errorText.textContent = message;
    errorSection.classList.remove('hidden');
}

function hideError() {
    errorSection.classList.add('hidden');
}

/**
 * Initialize
 */
function init() {
    // Check backend health
    fetch('/api/health')
        .then(response => response.json())
        .then(data => {
            console.log('Backend is ready:', data);
        })
        .catch(error => {
            console.error('Backend connection error:', error);
            showError('Backend is not responding. Make sure the Flask server is running.');
        });

    // Focus on input
    urlInput.focus();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
