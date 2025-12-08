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
const modelName = args.model || 'models/gemini-3-pro-image-preview'; // Default to user provided model

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
    process.exit(1);
}

async function generateImage() {
    try {
        console.log(`Generating image with model: ${modelName}`);
        console.log(`Prompt: ${prompt}`);

        // Initialize Gemini API
        // Note: As of now, the Node.js SDK might not have a direct helper for Imagen, 
        // so we might need to use fetch if the SDK doesn't support it yet. 
        // However, for "gemini image nano banana" (whatever that is) or standard Imagen, 
        // let's try the standard REST approach if SDK fails, but let's assume SDK or standard fetch.

        // Since the @google/generative-ai SDK is primarily for text/multimodal generation (Gemini),
        // and Imagen is often a separate endpoint or requires specific handling, 
        // I will implement a direct REST call to the Gemini API for image generation 
        // to be safe and flexible with model names.

        const apiKey = process.env.GEMINI_API_KEY;
        const finalModelName = modelName.startsWith('models/') ? modelName : `models/${modelName}`;

        // Use generateContent for Gemini models
        const url = `https://generativelanguage.googleapis.com/v1beta/${finalModelName}:generateContent?key=${apiKey}`;

        const aspectRatio = args.aspectRatio || '9:16'; // Default to vertical for mobile/ebook
        const finalPrompt = `${prompt}\n\nAspect Ratio: ${aspectRatio}`;

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

        // Parse Gemini response for image
        // Expecting: candidates[0].content.parts[].inlineData
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
            throw new Error('Invalid response format: No candidates found.');
        }

        const parts = data.candidates[0].content.parts;
        const imagePart = parts.find(p => p.inlineData && p.inlineData.mimeType.startsWith('image/'));

        if (!imagePart) {
            // Check if the model refused or generated text instead
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
