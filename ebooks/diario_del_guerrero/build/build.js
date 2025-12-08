const fs = require('fs');
const path = require('path');
const Epub = require('epub-gen');
const marked = require('marked');

// Configuration
const BOOK_DIR = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.join(BOOK_DIR, 'diario_del_guerrero_completo.epub');

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

// 1. Find all month directories
const entries = fs.readdirSync(BOOK_DIR, { withFileTypes: true });
const monthDirs = entries
    .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('mes_'))
    .map(dirent => dirent.name)
    .sort(); // Ensures mes_01 comes before mes_12

console.log('Found month directories: ' + monthDirs.join(', '));

// 2. Process each month
monthDirs.forEach(dirName => {
    const dirPath = path.join(BOOK_DIR, dirName);

    // A. Look for Intro
    // Intro file pattern: intro_mes_XX.md
    const files = fs.readdirSync(dirPath);
    const introFile = files.find(f => f.startsWith('intro_mes_') && f.endsWith('.md'));

    if (introFile) {
        const introPath = path.join(dirPath, introFile);
        const introText = fs.readFileSync(introPath, 'utf8');

        // Fix relative image paths for EPUB (same as for day files)
        const fixedIntroText = introText.replace(/\.\.\/images\//g, path.join(BOOK_DIR, 'images') + '/');

        // Special handling for Intro Title to include Month Name if needed, 
        // but usually the file title is good enough: "Enero: Disciplina..."
        content.push({
            title: getTitle(fixedIntroText),
            data: getBody(fixedIntroText)
        });
    }

    // B. Look for Days and Summaries
    // Day file pattern: DD_monthname.md (e.g., 01_enero.md)
    // Summary file pattern: DD_resumen_semana_XX.md (e.g., 07_resumen_semana_01.md)
    // We filter for files that start with a number
    const dayFiles = files
        .filter(f => /^\d{2}_.*\.md$/.test(f))
        .sort(); // 01 comes before 02, so 07_resumen comes after 06_enero

    dayFiles.forEach(dayFile => {
        const dayPath = path.join(dirPath, dayFile);
        const dayText = fs.readFileSync(dayPath, 'utf8');

        // Fix relative image paths for EPUB
        // Markdown has: ![Alt](../images/file.png)
        // We need absolute paths for epub-gen or correct relative base
        // Simple fix: Replace ../images/ with full path to images
        const fixedText = dayText.replace(/\.\.\/images\//g, path.join(BOOK_DIR, 'images') + '/');

        content.push({
            title: getTitle(fixedText),
            data: getBody(fixedText)
        });
    });
});

// 3. Add Art Gallery Annex
const galleryPath = path.join(BOOK_DIR, 'anexo_galeria.md');
if (fs.existsSync(galleryPath)) {
    const galleryText = fs.readFileSync(galleryPath, 'utf8');
    // Fix relative image paths
    const fixedGalleryText = galleryText.replace(/\.\.\/images\//g, path.join(BOOK_DIR, 'images') + '/');

    content.push({
        title: "Galería de Arte",
        data: marked.parse(getBody(fixedGalleryText)) // Use marked.parse directly here as we do for others later, but wait, the loop below processes 'content'. 
        // Actually, the loop below processes 'content' which contains {title, data}. 
        // 'data' in the loop is expected to be markdown string, which is then parsed.
        // So here we should push the raw markdown string (fixedGalleryText) minus title if we want consistent behavior, 
        // OR we can just push the text.
        // Let's look at how others are pushed: data: getBody(fixedText).
        // And then: const processedContent = content.map(...) -> marked.parse(section.data).
        // So here we should just push the markdown string.
    });
    // Correcting the push above to match the pattern:
    content.pop(); // Remove the wrong one
    content.push({
        title: "Galería de Arte",
        data: getBody(fixedGalleryText)
    });
}

// Convert MD to HTML using marked
const processedContent = content.map(section => ({
    title: section.title,
    data: marked.parse(section.data)
}));

const option = {
    title: "Diario del Guerrero",
    author: "M.A. Ballesteros",
    output: OUTPUT_PATH,
    content: processedContent,
    css: "body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; } h1 { color: #333; } blockquote { font-style: italic; color: #555; border-left: 2px solid #333; padding-left: 10px; }",
    cover: path.join(BOOK_DIR, 'images', 'cover.png')
};

console.log('Generating EPUB with ' + content.length + ' chapters...');

new Epub(option, OUTPUT_PATH).promise.then(() => {
    console.log("Ebook Generated Successfully!");
    console.log("Path:", OUTPUT_PATH);
}, err => {
    console.error("Failed to generate Ebook:", err);
});
