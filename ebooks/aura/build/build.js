const fs = require('fs');
const path = require('path');
const Epub = require('epub-gen');
const marked = require('marked');

// Configuration
const BOOK_DIR = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.join(BOOK_DIR, 'aura_completo.epub');

const content = [];

// Helper to get title from markdown content
function getTitle(text) {
    const lines = text.split('\n');
    if (lines.length > 0 && lines[0].startsWith('#')) {
        return lines[0].replace(/^#\s*/, '').trim();
    }
    const cleanLines = lines.filter(l => l.trim().length > 0);
    return cleanLines.length > 0 ? cleanLines[0].substring(0, 50) : 'Sin Título';
}

// Helper to get body content (stripping title)
function getBody(text) {
    const lines = text.split('\n');
    // If first line is title, remove it
    if (lines.length > 0 && lines[0].startsWith('#')) {
        return lines.slice(1).join('\n');
    }
    return text;
}

// Helper to process a file and push to content list
function processFile(filePath) {
    if (!fs.existsSync(filePath)) return;

    const fileText = fs.readFileSync(filePath, 'utf8');

    // Fix relative image paths for EPUB
    // Markdown has: ![Alt](../images/file.png)
    // We need absolute paths for epub-gen
    const fixedText = fileText.replace(/\.\.\/images\//g, path.join(BOOK_DIR, 'images') + '/');

    content.push({
        title: getTitle(fixedText),
        data: getBody(fixedText)
    });
}

// Helper to process a directory of files (sorted)
function processDirectory(dirName) {
    const dirPath = path.join(BOOK_DIR, dirName);
    if (!fs.existsSync(dirPath)) return;

    const files = fs.readdirSync(dirPath)
        .filter(f => f.endsWith('.md'))
        .sort(); // Lexicographical sort works for 01, 02, etc.

    // Extract intro.md if present and put it first
    const introIndex = files.indexOf('intro.md');
    if (introIndex > -1) {
        files.splice(introIndex, 1);
        files.unshift('intro.md');
    }

    files.forEach(file => {
        processFile(path.join(dirPath, file));
    });
}

// Order of content
const parts = ['parte_01', 'parte_02', 'parte_03', 'parte_04', 'parte_05', 'parte_06'];
parts.forEach(part => {
    processDirectory(part);
});

// Convert MD to HTML using marked
const processedContent = content.map(section => ({
    title: section.title,
    data: marked.parse(section.data)
}));

const option = {
    title: "Aura: Cómo ganar respeto sin hacer ruido",
    author: "M.A. Ballesteros",
    output: OUTPUT_PATH,
    content: processedContent,
    css: `
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #111; }
        h1 { color: #000; text-align: center; margin-bottom: 1em; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
        h2 { color: #000; margin-top: 2em; border-bottom: 2px solid #000; padding-bottom: 0.5em; font-weight: 600; }
        p { margin-bottom: 1.2rem; }
        blockquote { 
            font-style: normal; 
            border-left: 4px solid #00ced1; /* Electric Cyan-ish */
            padding-left: 15px; 
            background: #f0faff; 
            padding: 15px; 
            margin: 1.5em 0; 
            font-weight: 500;
        } 
        /* Specific styling for the Intro Images if needed */
        img { max-width: 100%; display: block; margin: 2rem auto; border-radius: 4px; }
        strong { color: #000; font-weight: 700; }
    `,
    cover: path.join(BOOK_DIR, 'images', 'cover.png')
};

console.log('Generating AURA EPUB with ' + content.length + ' chapters...');

new Epub(option, OUTPUT_PATH).promise.then(() => {
    console.log("Ebook Generated Successfully!");
    console.log("Path:", OUTPUT_PATH);
}, err => {
    console.error("Failed to generate Ebook:", err);
});
