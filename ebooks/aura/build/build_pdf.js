const fs = require('fs');
const path = require('path');
const marked = require('marked');
const puppeteer = require('puppeteer');

// Configuration
const BOOK_DIR = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.join(BOOK_DIR, 'aura_impreso.pdf');

// Helper to get title from markdown content
function getTitle(text) {
    const lines = text.split('\n');
    if (lines.length > 0 && lines[0].startsWith('#')) {
        return lines[0].replace(/^#\s*/, '').trim();
    }
    const cleanLines = lines.filter(l => l.trim().length > 0);
    return cleanLines.length > 0 ? cleanLines[0].substring(0, 50) : 'Sin Título';
}

// Helper to get body content (stripping title, as we might handle it via CSS/HTML structure)
// Actually for PDF, keep the title in the HTML but maybe styled differently.
// Let's keep it simple: render generic Markdown.
// Helper to get body content logic
function getHtmlContent(text) {
    const renderer = new marked.Renderer();

    // Custom image renderer to fix paths and EMBED as Base64
    renderer.image = function (href, title, text) {
        let absolutePath = href;
        if (href.startsWith('../images/')) {
            const imageName = path.basename(href);
            absolutePath = path.join(BOOK_DIR, 'images', imageName);
        }

        // Check if file exists to avoid crashes
        if (fs.existsSync(absolutePath)) {
            const items = fs.readFileSync(absolutePath);
            const base64 = items.toString('base64');
            const mimeType = absolutePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
            const src = `data:${mimeType};base64,${base64}`;
            // Reduced margin and max-height for intro images
            return `<img src="${src}" alt="${text}" style="width:100%; max-height: 8cm; object-fit: cover; display:block; margin: 1rem auto 1.5rem auto; border-radius: 2px;" />`;
        } else {
            console.warn(`Warning: Image not found at ${absolutePath}`);
            return `<img src="" alt="Image Not Found: ${text}" />`;
        }
    };

    return marked.parse(text, { renderer: renderer });
}

// Helper to extract clean title
function getMetadata(text, filename) {
    const lines = text.split('\n');
    let title = filename.replace('.md', ''); // specific fallback
    for (const line of lines) {
        if (line.startsWith('# ')) {
            title = line.replace('# ', '').trim();
            break;
        }
    }
    return { title };
}

let tocEntries = [];

// Helper to processing files
function processFile(filePath) {
    if (!fs.existsSync(filePath)) return '';
    const fileText = fs.readFileSync(filePath, 'utf8');
    const { title } = getMetadata(fileText, path.basename(filePath));
    const id = 'chapter-' + tocEntries.length;

    // Check if it's an "Intro" or actual Chapter for styling nuances if needed
    // But for TOC, we just list them.
    tocEntries.push({ title, id, level: filePath.includes('intro') ? 1 : 2 });

    const html = getHtmlContent(fileText);
    // Add ID to section for linking
    return `<section id="${id}" class="chapter ${filePath.includes('intro') ? 'intro-section' : ''}">${html}</section>`;
}

// ... (processDirectory remains similar but uses the updated processFile) ...

// Helper to process directory
function processDirectory(dirName) {
    const dirPath = path.join(BOOK_DIR, dirName);
    if (!fs.existsSync(dirPath)) return '';

    const files = fs.readdirSync(dirPath)
        .filter(f => f.endsWith('.md'))
        .sort();

    // Extract intro.md
    const introIndex = files.indexOf('intro.md');
    if (introIndex > -1) {
        files.splice(introIndex, 1);
        files.unshift('intro.md');
    }

    let dirHtml = '';
    files.forEach(file => {
        dirHtml += processFile(path.join(dirPath, file));
    });
    return dirHtml;
}

function generateTocHtml() {
    let html = `
    <section class="toc-page" style="page-break-after: always;">
        <h1 style="margin-top: 0; text-align: center;">Índice</h1>
        <ul style="list-style: none; padding: 0;">
    `;
    tocEntries.forEach(entry => {
        // Simple indentation or styling distinctions
        const style = entry.level === 1 ? 'font-weight: bold; margin-top: 1em; margin-bottom: 0.5em;' : 'margin-left: 1.5em; margin-bottom: 0.25em;';
        html += `<li style="${style}"><a href="#${entry.id}" style="text-decoration: none; color: #000; display: flex; justify-content: space-between;"><span>${entry.title}</span></a></li>`;
    });
    html += `
        </ul>
    </section>
    `;
    return html;
}

// ...

async function generatePdf() {
    console.log("Gathering content...");
    let fullHtml = '';

    // 1. Cover Page
    const coverPath = path.join(BOOK_DIR, 'images', 'cover.png');
    let coverImgTag = '';
    if (fs.existsSync(coverPath)) {
        const coverData = fs.readFileSync(coverPath);
        const coverBase64 = coverData.toString('base64');
        coverImgTag = `<img src="data:image/png;base64,${coverBase64}" style="width: 100%; height: 100%; object-fit: cover;" />`;
    } else {
        console.warn("Warning: Cover image not found.");
    }

    fullHtml += `
    <div class="cover-page">
        ${coverImgTag}
    </div>
    `;

    // 2. Parts (Populates tocEntries via processDirectory)
    const parts = ['parte_01', 'parte_02', 'parte_03', 'parte_04', 'parte_05', 'parte_06'];
    let contentHtml = '';
    parts.forEach(part => {
        contentHtml += processDirectory(part);
    });

    // 3. TOC (Generated after content logic populates entries)
    const tocHtml = generateTocHtml();

    fullHtml += tocHtml;
    fullHtml += contentHtml;

    // ...

    // Valid styling for A5 Print
    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&family=Montserrat:wght@400;700&display=swap');

            /* Default page margins for text content */
            @page {
                size: A5;
                margin: 20mm 15mm;
            }
            
            /* Cover Page: Zero margins using :first pseudo-class */
            @page :first {
                margin: 0mm;
            }

            body {
                font-family: 'Merriweather', serif;
                font-size: 9pt; /* Reduced by 1pt */
                line-height: 1.5;
                color: #222;
                text-align: justify;
                -webkit-font-smoothing: antialiased;
                margin: 0;
                padding: 0;
            }

            .cover-page {
                /* Explicitly larger than A5 to ensure bleed if there's minor offsetting, 
                   but strictly sizing to A5 usually works with margin:0 */
                width: 148mm;
                height: 210mm;
                position: relative;
                margin: 0;
                padding: 0;
                page-break-after: always;
                overflow: hidden;
                display: block;
            }

            .chapter {
                /* Removed padding, relying on @page margins */
                page-break-after: always;
                width: 100%;
                display: block;
            }

            /* Headers */
            h1, h2, h3 {
                font-family: 'Montserrat', sans-serif;
                color: #000;
                page-break-after: avoid;
            }

            h1 {
                font-size: 16pt;
                text-transform: uppercase;
                letter-spacing: 1px;
                text-align: center;
                margin-top: 2rem;
                margin-bottom: 2rem;
                page-break-before: always;
            }

            /* Don't break before first H1 after cover (Introduction/Part 1) */
            
            h2 {
                font-size: 13pt;
                margin-top: 1.5rem;
                border-bottom: 1px solid #ddd;
                padding-bottom: 0.2rem;
            }

            p {
                margin-bottom: 0.8em;
                orphans: 3;
                widows: 3;
            }


            blockquote {
                font-style: italic;
                margin: 1.5em 1em;
                padding: 1em 1.5em; /* More padding */
                background-color: #f4ecf7; /* Very light purple */
                border-left: 5px solid #9b59b6; /* Amethyst purple */
                border-radius: 4px; 
                color: #4a235a; /* Dark text for contrast */
                box-shadow: 2px 2px 5px rgba(0,0,0,0.05);
            }

            img {
                max-width: 100%;
                height: auto;
                display: block;
                margin: 2rem auto;
            }

            /* Intro Images specific styling */
            /* Assuming they are the first image in a section or marked specifically? 
               Markdown images don't have classes. But they are usually at the top of intros. */
            
            ul, ol {
                margin-left: 1.5em;
                margin-bottom: 1em;
            }
        </style>
    </head>
    <body>
        ${fullHtml}
    </body>
    </html>
    `;

    // Debug: Write HTML to file to check image paths
    const debugPath = path.join(BOOK_DIR, 'debug_preview.html');
    fs.writeFileSync(debugPath, htmlTemplate);
    console.log("Debug HTML written to: " + debugPath);

    console.log("Launching Puppeteer...");
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files', '--enable-local-file-access']
    });
    const page = await browser.newPage();

    // Set content
    await page.setContent(htmlTemplate, { waitUntil: 'networkidle0' });

    console.log("Printing PDF...");
    await page.pdf({
        path: OUTPUT_PATH,
        format: 'A5',
        printBackground: true,
        preferCSSPageSize: true
    });

    await browser.close();
    console.log("PDF Generated Successfully at: " + OUTPUT_PATH);
}

generatePdf().catch(console.error);
