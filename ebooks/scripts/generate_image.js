const fs = require('fs');
const path = require('path');
const minimist = require('minimist');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Parse arguments
const args = minimist(process.argv.slice(2));

let prompt = args.prompt;
const promptFile = args.promptFile;
const outputPath = args.output;
const modelName = args.model || 'models/gemini-pro-image'; // Updated default if needed, kept generic

if (promptFile) {
    try {
        prompt = fs.readFileSync(promptFile, 'utf8');
    } catch (err) {
        console.error(`Error reading prompt file: ${err.message}`);
        process.exit(1);
    }
}

if (!prompt || !outputPath) {
    console.error('Usage: node generate_image.js --prompt "Your prompt" [--promptFile "path/to/prompt.txt"] --output "path/to/image.png" [--model "model-name"]');
    process.exit(1);
}

if (!process.env.GEMINI_API_KEY) {
    console.error('Error: GEMINI_API_KEY environment variable is not set.');
    console.error('Please create a .env file in the current directory with GEMINI_API_KEY=...');
    process.exit(1);
}

async function generateImage() {
    try {
        console.log(`Generating image...`);
        console.log(`Model: ${modelName}`);
        console.log(`Prompt Preview: ${prompt.substring(0, 100)}...`);

        // Direct REST call implementation for flexibility and to match original script logic
        const apiKey = process.env.GEMINI_API_KEY;
        // Ensure model name has proper prefix if missing (though usually passed fully)
        // models/imagen-3.0-generate-001 is a common valid one now, or gemini-pro-vision, etc.
        // We stick to the logic: let user pass model, or default.

        // Note: As of 2024/2025, the API endpoint for image generation might vary.
        // We will stick to the v1beta generateContent with image generation tools or specific endpoint.
        // The original script used a specific URL pattern. We will maintain it but allow overriding via environment if needed.

        // Use the original script's URL logic:
        const finalModelName = modelName.startsWith('models/') ? modelName : `models/${modelName}`;
        const url = `https://generativelanguage.googleapis.com/v1beta/${finalModelName}:generateContent?key=${apiKey}`;

        // Standard aspect ratio for ebooks
        const aspectRatio = args.aspectRatio || '9:16';
        const finalPrompt = `${prompt} \n\nStyle: Modern Manga, High Contrast, Dynamic Composition.\nAspect Ratio: ${aspectRatio}`;

        const requestBody = {
            contents: [{
                parts: [{
                    text: finalPrompt
                }]
            }]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();

        // Robust parsing
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
            // Sometimes safety ratings block it
            if (data.promptFeedback) {
                console.error("Prompt Feedback:", JSON.stringify(data.promptFeedback, null, 2));
            }
            throw new Error('Invalid response format: No candidates found.');
        }

        const parts = data.candidates[0].content.parts;
        const imagePart = parts.find(p => p.inlineData && p.inlineData.mimeType.startsWith('image/'));

        if (!imagePart) {
            const textPart = parts.find(p => p.text);
            if (textPart) {
                throw new Error(`Model generated text instead of image: ${textPart.text}`);
            }
            throw new Error('No image data found in response.');
        }

        const base64Image = imagePart.inlineData.data;
        const buffer = Buffer.from(base64Image, 'base64');

        // Ensure directory exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(outputPath, buffer);
        console.log(`Image saved successfully to: ${outputPath}`);

    } catch (error) {
        console.error('Failed to generate image:', error.message);
        process.exit(1);
    }
}

generateImage();
