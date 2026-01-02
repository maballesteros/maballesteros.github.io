const fs = require('fs');
const path = require('path');
const Epub = require('epub-gen');
const marked = require('marked');

// Configuration
const BOOK_DIR = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.join(BOOK_DIR, 'ethical_power_complete.epub');

const content = [];

// Helper to get title from markdown content
function getTitle(text) {
    const lines = text.split('\n');
    if (lines.length > 0 && lines[0].startsWith('#')) {
        return lines[0].replace(/^#\s*/, '').trim();
    }
    return 'Untitled';
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
    // We removed images from the text as per instructions, but just in case.
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
    // Lexicographical sort (1_1, 1_2...) matches our naming convention

    // Extract intro.md if present
    const introIndex = files.indexOf('intro.md');
    if (introIndex > -1) {
        files.splice(introIndex, 1);
        files.unshift('intro.md');
    }

    files.forEach(file => {
        processFile(path.join(dirPath, file));
    });
}

// 1. Author's Note and Introduction
processFile(path.join(BOOK_DIR, 'nota_autor.md'));
processFile(path.join(BOOK_DIR, 'intro.md'));

// 2. Parts (1 to 5)
const parts = ['part_01', 'part_02', 'part_03', 'part_04', 'part_05'];
parts.forEach(part => {
    processDirectory(part);
});

// 3. Games
processDirectory('games');

// 4. Conclusion
processFile(path.join(BOOK_DIR, 'cierre.md'));


// Convert MD to HTML using marked
const processedContent = content.map(section => ({
    title: section.title,
    data: marked.parse(section.data)
}));

const option = {
    title: "Ethical Power: The Social Game Rules No One Tells You About",
    author: "M.A. Ballesteros",
    output: OUTPUT_PATH,
    content: processedContent,
    css: "body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; } h1 { color: #2c3e50; text-align: center; margin-bottom: 1em; } h2 { color: #34495e; margin-top: 2em; border-bottom: 2px solid #ecf0f1; padding-bottom: 0.5em; } blockquote { font-style: italic; color: #555; border-left: 4px solid #f1c40f; padding-left: 15px; background: #f9f9f9; padding: 10px; margin: 1.5em 0; } img { max-width: 100%; display: block; margin: 2em auto; } aside { background: #f0f4f8; padding: 15px; border-radius: 5px; margin: 1.5em 0; }",
    cover: path.join(BOOK_DIR, 'images', 'cover.png')
};

console.log('Generating EPUB with ' + content.length + ' chapters...');

new Epub(option, OUTPUT_PATH).promise.then(() => {
    console.log("Ebook Generated Successfully!");
    console.log("Path:", OUTPUT_PATH);
}, err => {
    console.error("Failed to generate Ebook:", err);
});
