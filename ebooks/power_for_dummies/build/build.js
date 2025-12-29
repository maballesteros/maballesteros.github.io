const fs = require('fs');
const path = require('path');
const Epub = require('epub-gen');
const marked = require('marked');

// Configuration
const BOOK_DIR = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.join(BOOK_DIR, 'power_for_dummies_completo.epub');

const content = [];

// Helper to get title from markdown content
function getTitle(text) {
    const lines = text.split('\n');
    if (lines.length > 0 && lines[0].startsWith('#')) {
        return lines[0].replace(/^#\s*/, '').trim();
    }
    return 'Sin Título';
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
        .sort(); // Lexicographical sort (01, 02...)

    // Special handling for Day 06-b to ensure it comes after Day 06
    // Default sort handles alphanumeric: dia_06.md, dia_06_b.md, dia_07.md -> Correct order!

    files.forEach(file => {
        processFile(path.join(dirPath, file));
    });
}

// 1. Introduction
processFile(path.join(BOOK_DIR, 'intro.md'));

// 2. Weeks
const weeks = ['semana_01', 'semana_02', 'semana_03', 'semana_04', 'semana_05_final'];
weeks.forEach(week => {
    processDirectory(week);
});

// 3. Games
processDirectory('juegos');


// Convert MD to HTML using marked
const processedContent = content.map(section => ({
    title: section.title,
    data: marked.parse(section.data)
}));

const option = {
    title: "Power for Dummies",
    author: "M.A. Ballesteros",
    output: OUTPUT_PATH,
    content: processedContent,
    css: "body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; } h1 { color: #333; } blockquote { font-style: italic; color: #555; border-left: 2px solid #333; padding-left: 10px; } img { max-width: 100%; }",
    cover: path.join(BOOK_DIR, 'images', 'cover.png')
};

console.log('Generating EPUB with ' + content.length + ' chapters...');

new Epub(option, OUTPUT_PATH).promise.then(() => {
    console.log("Ebook Generated Successfully!");
    console.log("Path:", OUTPUT_PATH);
}, err => {
    console.error("Failed to generate Ebook:", err);
});
