const fs = require('fs');
const path = require('path');
const Epub = require('epub-gen');
const marked = require('marked');

// 1. Parse Arguments
const targetDirRel = process.argv[2];
if (!targetDirRel) {
    console.error("Usage: node build_epub.js <target_directory>");
    process.exit(1);
}

const TARGET_DIR = path.resolve(process.cwd(), targetDirRel);
const CONFIG_PATH = path.join(TARGET_DIR, 'build.json');

if (!fs.existsSync(CONFIG_PATH)) {
    console.error(`Error: Configuration file not found at ${CONFIG_PATH}`);
    process.exit(1);
}

// 2. Load Configuration
const config = require(CONFIG_PATH);
const OUTPUT_PATH = path.join(TARGET_DIR, config.epubFilename || 'book.epub');

console.log(`Starting EPUB build for: ${config.title}`);
console.log(`Target Directory: ${TARGET_DIR}`);

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

// Helper to process a file
function processFile(filePath) {
    if (!fs.existsSync(filePath)) return;

    const fileText = fs.readFileSync(filePath, 'utf8');

    // Fix relative image paths for EPUB
    // Markdown has: ![Alt](../images/file.png)
    // We need absolute paths for epub-gen
    // We assume images are in TARGET_DIR/images
    const fixedText = fileText.replace(/\.\.\/images\//g, path.join(TARGET_DIR, 'images') + '/');

    content.push({
        title: getTitle(fixedText),
        data: getBody(fixedText)
    });
}

// Helper to process a directory
function processDirectory(partName) {
    const dirPath = path.join(TARGET_DIR, partName);
    if (!fs.existsSync(dirPath)) {
        console.warn(`Warning: Part directory not found: ${dirPath}`);
        return;
    }

    const files = fs.readdirSync(dirPath)
        .filter(f => f.endsWith('.md') && !f.startsWith('_'))
        .sort();

    // With 00_intro naming convention, default sort works correctly.


    files.forEach(file => {
        processFile(path.join(dirPath, file));
    });
}

// Helper to process a part (file or directory)
function processPart(partName) {
    const fullPath = path.join(TARGET_DIR, partName);

    if (!fs.existsSync(fullPath)) {
        console.warn(`Warning: Part not found: ${fullPath}`);
        return;
    }

    const stats = fs.statSync(fullPath);

    if (stats.isFile()) {
        processFile(fullPath);
    } else if (stats.isDirectory()) {
        processDirectory(partName);
    }
}

// 3. Process Content
// Config must have a "parts" array, e.g. ["intro.md", "parte_01"]
if (config.parts && Array.isArray(config.parts)) {
    config.parts.forEach(part => {
        processPart(part);
    });
} else {
    console.error("Error: 'parts' array missing in build.json");
    process.exit(1);
}

// 4. Convert MD to HTML
const processedContent = content.map(section => ({
    title: section.title,
    data: marked.parse(section.data)
}));

// 5. Build Options
const options = {
    title: config.title,
    author: config.author,
    output: OUTPUT_PATH,
    content: processedContent,
    css: config.epubCss || `body { font-family: sans-serif; }`, // Fallback CSS
    cover: path.join(TARGET_DIR, 'images', 'cover.png'),
    lang: config.lang || 'en'
};

// 6. Generate
new Epub(options, OUTPUT_PATH).promise.then(() => {
    console.log("EPUB Generated Successfully!");
    console.log("Path:", OUTPUT_PATH);
}, err => {
    console.error("Failed to generate EPUB:", err);
});
