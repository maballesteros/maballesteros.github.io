const fs = require('fs');
const path = require('path');
const marked = require('marked');
const puppeteer = require('puppeteer');

// 1. Parse Arguments
const targetDirRel = process.argv[2];
if (!targetDirRel) {
    console.error("Usage: node build_pdf.js <target_directory>");
    process.exit(1);
}

const TARGET_DIR = path.resolve(process.cwd(), targetDirRel);
const CONFIG_PATH = path.join(TARGET_DIR, 'build.json');

if (!fs.existsSync(CONFIG_PATH)) {
    console.error(`Error: Configuration file not found at ${CONFIG_PATH}`);
    process.exit(1);
}

const config = require(CONFIG_PATH);
const OUTPUT_PATH = path.join(TARGET_DIR, config.pdfFilename || 'book_print.pdf');

console.log(`Starting PDF build for: ${config.title}`);

// Helper to get title
function getTitle(text) {
    const lines = text.split('\n');
    if (lines.length > 0 && lines[0].startsWith('#')) {
        return lines[0].replace(/^#\s*/, '').trim();
    }
    const cleanLines = lines.filter(l => l.trim().length > 0);
    return cleanLines.length > 0 ? cleanLines[0].substring(0, 50) : 'Sin Título';
}

// Custom Markdown Renderer
function getHtmlContent(text) {
    const renderer = new marked.Renderer();

    renderer.image = function (href, title, text) {
        let absolutePath = href;
        if (href.startsWith('../images/')) {
            const imageName = path.basename(href);
            absolutePath = path.join(TARGET_DIR, 'images', imageName);
        }

        if (fs.existsSync(absolutePath)) {
            const items = fs.readFileSync(absolutePath);
            const base64 = items.toString('base64');
            const mimeType = absolutePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
            const src = `data:${mimeType};base64,${base64}`;
            return `<img src="${src}" alt="${text}" style="width:100%; max-height: 8cm; object-fit: cover; display:block; margin: 1rem auto 1.5rem auto; border-radius: 2px;" />`;
        } else {
            console.warn(`Warning: Image not found at ${absolutePath}`);
            return `<img src="" alt="Image Not Found: ${text}" />`;
        }
    };

    return marked.parse(text, { renderer: renderer });
}

function getMetadata(text, filename) {
    const lines = text.split('\n');
    let title = filename.replace('.md', '');
    for (const line of lines) {
        if (line.startsWith('# ')) {
            title = line.replace('# ', '').trim();
            break;
        }
    }
    return { title };
}

let tocEntries = [];

function processFile(filePath) {
    if (!fs.existsSync(filePath)) return '';
    const fileText = fs.readFileSync(filePath, 'utf8');
    const { title } = getMetadata(fileText, path.basename(filePath));
    const id = 'chapter-' + tocEntries.length;

    tocEntries.push({ title, id, level: filePath.includes('intro') ? 1 : 2 });

    const html = getHtmlContent(fileText);
    return `<section id="${id}" class="chapter ${filePath.includes('intro') ? 'intro-section' : ''}">${html}</section>`;
}

function processDirectory(partName) {
    const dirPath = path.join(TARGET_DIR, partName);
    if (!fs.existsSync(dirPath)) return '';

    const files = fs.readdirSync(dirPath)
        .filter(f => f.endsWith('.md'))
        .sort();

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
        const style = entry.level === 1 ? 'font-weight: bold; margin-top: 1em; margin-bottom: 0.5em;' : 'margin-left: 1.5em; margin-bottom: 0.25em;';
        html += `<li style="${style}"><a href="#${entry.id}" style="text-decoration: none; color: #000; display: flex; justify-content: space-between;"><span>${entry.title}</span></a></li>`;
    });
    html += `</ul></section>`;
    return html;
}

async function generatePdf() {
    let fullHtml = '';

    // 1. Cover
    const coverPath = path.join(TARGET_DIR, 'images', 'cover.png');
    let coverImgTag = '';
    if (fs.existsSync(coverPath)) {
        const coverData = fs.readFileSync(coverPath);
        const coverBase64 = coverData.toString('base64');
        coverImgTag = `<img src="data:image/png;base64,${coverBase64}" style="width: 100%; height: 100%; object-fit: cover;" />`;
    }
    fullHtml += `<div class="cover-page">${coverImgTag}</div>`;

    // 2. Content
    let contentHtml = '';
    if (config.parts && Array.isArray(config.parts)) {
        config.parts.forEach(part => {
            contentHtml += processDirectory(part);
        });
    }

    // 3. Inject Icons (Configurable via build.json)
    if (config.iconMap && Array.isArray(config.iconMap)) {
        config.iconMap.forEach(item => {
            const iconPath = path.join(TARGET_DIR, 'images', item.file);
            let src = '';
            if (fs.existsSync(iconPath)) {
                const data = fs.readFileSync(iconPath);
                src = `data:image/png;base64,${data.toString('base64')}`;
            }

            const regex = new RegExp(`(<blockquote>)(\\s*<p>\\s*<strong>)(${item.pattern}[:?]?\\s*)`, 'gi');
            const className = item.className || '';
            const classAttr = className ? ` class="${className}"` : '';

            contentHtml = contentHtml.replace(regex, `<blockquote${classAttr}>$2<img src="${src}" class="quote-icon" alt="${item.key}" /> $3`);
        });
    }

    // 4. Combine
    fullHtml += generateTocHtml();
    fullHtml += contentHtml;

    // 5. Template with Configurable CSS
    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <style>
            ${config.pdfCss || ''}
        </style>
    </head>
    <body>${fullHtml}</body>
    </html>`;

    // 6. Print
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files', '--enable-local-file-access']
    });
    const page = await browser.newPage();
    await page.setContent(htmlTemplate, { waitUntil: 'domcontentloaded', timeout: 60000 });
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
