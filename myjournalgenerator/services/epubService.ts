
import JSZip from 'jszip';
import { StoredJournal, JournalEntry, PersonalizationOptions, EntryContentType } from '../types';
import { escapeXml, convertMarkdownToHtml } from '../utils/textUtils'; // Import utilities

// Helper function to get a user-friendly display name for the content type (similar to JournalEntryView)
const getEpubEntryContentTypeDisplayName = (contentType: EntryContentType | undefined): string => {
  if (!contentType) return "Contenido Principal";
  switch (contentType) {
    case EntryContentType.CONCISE_COMMENTARY:
      return "Comentario Conciso";
    case EntryContentType.INSPIRATIONAL_NARRATIVE:
      return "Narrativa Inspiradora";
    case EntryContentType.HISTORICAL_ANECDOTE:
      return "Anécdota Histórica";
    case EntryContentType.PHILOSOPHICAL_EXPLORATION:
      return "Exploración Filosófica";
    default:
      // Fallback for any unexpected types or if it's somehow undefined
      const knownTypes: Record<string, string> = {
        "Comentario Conciso": "Comentario Conciso",
        "Narrativa Inspiradora (Fábula, Cuento)": "Narrativa Inspiradora",
        "Anécdota Histórica Relevante": "Anécdota Histórica",
        "Exploración Filosófica Profunda": "Exploración Filosófica",
      };
      return knownTypes[contentType as string] || "Contenido Principal";
  }
};


interface EpubFile {
  name: string;
  content: string | ArrayBuffer; 
  options?: JSZip.JSZipFileOptions;
}

interface ImageManifestItem {
    id: string;
    href: string; // Path relative to OEBPS (e.g., "images/cover.jpg")
    mediaType: string;
    localPath: string; // Full path within the zip for adding to JSZip (e.g., "OEBPS/images/cover.jpg")
    data?: ArrayBuffer; // Image data as ArrayBuffer
}

interface EntryXhtmlFile {
    id: string; // For OPF manifest and spine
    href: string; // Relative path from OEBPS for OPF (e.g., "text/entry_1.xhtml")
    title: string; // For NCX/NAV
    filePath: string; // Full path within the zip for adding to JSZip (e.g., "OEBPS/text/entry_1.xhtml")
}


async function processBase64Image(dataUrl: string | undefined, name: string): Promise<{ data?: ArrayBuffer, mediaType: string }> {
  if (!dataUrl) {
    return { data: undefined, mediaType: 'application/octet-stream' };
  }
  const match = dataUrl.match(/^data:(image\/.*?);base64,(.*)$/);
  if (!match) {
    console.warn(`Invalid data URL for image ${name}`);
    return { data: undefined, mediaType: 'application/octet-stream' };
  }
  const mediaType = match[1];
  const base64Data = match[2];
  try {
    const byteString = atob(base64Data);
    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return { data: ia.buffer, mediaType };
  } catch (e) {
    console.error(`Error processing base64 image ${name}:`, e);
    return { data: undefined, mediaType };
  }
}

const generateContainerXml = (): string => `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;

const generateStyleCss = (): string => `body { font-family: sans-serif; line-height: 1.6; margin: 1em; }
h1, h2, h3, h4 { margin-top: 1.5em; margin-bottom: 0.5em; line-height: 1.2; color: #333; }
h1 { font-size: 2em; text-align: center; }
h2 { font-size: 1.75em; border-bottom: 1px solid #eee; padding-bottom: 0.3em;}
h3 { font-size: 1.5em; }
h4 { font-size: 1.2em; color: #555;}
p { margin-bottom: 1em; }
ul { margin-bottom: 1em; padding-left: 1.5em; }
li { margin-bottom: 0.3em; }
strong { font-weight: bold; }
em { font-style: italic; }
blockquote { margin: 1em 2em; padding: 0.5em 1em; border-left: 3px solid #ccc; font-style: italic; color: #555; }
blockquote footer { font-size: 0.9em; color: #777; text-align: right; }
.cover-image-container { text-align: center; margin-top: 2em; margin-bottom: 2em; }
.cover-image { max-width: 80%; height: auto; max-height: 70vh; border: 1px solid #ddd; }
.entry-illustration-container { text-align: center; margin: 1.5em 0; }
.entry-illustration { max-width: 100%; height: auto; max-height: 50vh; border: 1px solid #ddd;}
.notes-section { margin-top: 1.5em; padding: 1em; background-color: #f9f9f9; border: 1px solid #eee; border-radius: 4px; }
.notes-title { font-weight: bold; margin-bottom: 0.5em; }
.challenge-completed { color: green; font-weight: bold; }
nav ol { list-style-type: none; padding-left: 0; }
nav li { margin-bottom: 0.5em; }
nav a { text-decoration: none; color: #0066cc; }
nav a:hover { text-decoration: underline; }
.app-info { font-size: 0.8em; color: #777; text-align: center; margin-top: 3em; }
`;

const generateTitlePageXhtml = (journal: StoredJournal, coverImageOpfHref?: string): string => `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="es">
<head>
  <title>${escapeXml(journal.journalIndex.title)}</title>
  <link rel="stylesheet" type="text/css" href="../css/style.css"/>
</head>
<body>
  <h1>${escapeXml(journal.journalIndex.title)}</h1>
  ${coverImageOpfHref ? `<div class="cover-image-container"><img src="../${escapeXml(coverImageOpfHref)}" alt="Cover Image" class="cover-image"/></div>` : ''}
  <p class="app-info">Generado con AI Personalized Journal</p>
</body>
</html>`;

const generateEntryXhtml = (entry: JournalEntry, personalizationOptions: PersonalizationOptions): string => {
  const illustrationOpfHref = (entry as any).epubIllustrationPath; // This path is like "images/illustration_xyz.jpg"
  const illustrationHtml = entry.illustrationUrl && illustrationOpfHref
    ? `<div class="entry-illustration-container">
         <img src="../${escapeXml(illustrationOpfHref)}" alt="Ilustración para ${escapeXml(entry.subChapterTitle)}" class="entry-illustration"/>
         ${personalizationOptions.generateIllustrations ? '<p><em>Ilustración generada por IA</em></p>' : ''}
       </div>`
    : '';

  const mainContentTitle = getEpubEntryContentTypeDisplayName(entry.entryContentType);
  const mainContentHtml = entry.mainContent ? convertMarkdownToHtml(entry.mainContent) : '<p><em>Contenido principal no disponible.</em></p>';


  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="es">
<head>
  <title>${escapeXml(entry.subChapterTitle)}</title>
  <link rel="stylesheet" type="text/css" href="../css/style.css"/>
</head>
<body>
  <h2>${escapeXml(entry.subChapterTitle)}</h2>
  <p><em>Tema: ${escapeXml(entry.themeTitle)}</em></p>
  
  ${illustrationHtml}

  <h4>Chispa</h4>
  <blockquote>
    <p>"${escapeXml(entry.spark.quote)}"</p>
    ${entry.spark.author ? `<footer>- ${escapeXml(entry.spark.author)}</footer>` : ''}
  </blockquote>

  <h4>${escapeXml(mainContentTitle)}</h4>
  ${mainContentHtml}

  <h4>Pregunta de Diario</h4>
  <p>${escapeXml(entry.journalQuestion)}</p>

  <h4>Mini-Reto</h4>
  <p>${escapeXml(entry.miniChallenge)}</p>
  ${entry.challengeCompleted ? '<p class="challenge-completed">Reto Completado</p>' : ''}

  ${entry.notes ? `
  <div class="notes-section">
    <h4 class="notes-title">Mis Notas</h4>
    <div>${convertMarkdownToHtml(entry.notes)}</div>
  </div>` : ''}
</body>
</html>`;
};

const generateNavXhtml = (journal: StoredJournal, entryFiles: EntryXhtmlFile[]): string => {
  const tocEntries = entryFiles.map(entry => 
    `<li><a href="${escapeXml(entry.href)}">${escapeXml(entry.title)}</a></li>`
  ).join('\n    ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="es">
<head>
  <title>Table of Contents</title>
  <link rel="stylesheet" type="text/css" href="css/style.css"/>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h2>Índice</h2>
    <ol>
      <li><a href="text/title_page.xhtml">${escapeXml(journal.journalIndex.title)}</a></li>
      ${tocEntries}
    </ol>
  </nav>
</body>
</html>`;
};

const generateContentOpf = (
  journal: StoredJournal,
  imageItems: ImageManifestItem[],
  entryFiles: EntryXhtmlFile[],
  coverImageManifestId?: string
): string => {
  const manifestItems = [
    { id: 'nav', href: 'nav.xhtml', mediaType: 'application/xhtml+xml', properties: 'nav' },
    { id: 'css', href: 'css/style.css', mediaType: 'text/css' },
    { id: 'title-page', href: 'text/title_page.xhtml', mediaType: 'application/xhtml+xml' },
    ...imageItems.map(img => ({ id: img.id, href: img.href, mediaType: img.mediaType })),
    ...entryFiles.map(entry => ({ id: entry.id, href: entry.href, mediaType: 'application/xhtml+xml' })),
  ];

  const spineItems = [
    { idref: 'title-page' },
    ...entryFiles.map(entry => ({ idref: entry.id })),
  ];
  
  const epubUuid = crypto.randomUUID();

  return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="BookId">urn:uuid:${epubUuid}</dc:identifier>
    <dc:title>${escapeXml(journal.journalIndex.title)}</dc:title>
    <dc:language>es</dc:language>
    <dc:creator id="creator">AI Personalized Journal</dc:creator>
    <meta property="dcterms:modified">${new Date().toISOString().split('.')[0] + 'Z'}</meta>
    ${coverImageManifestId ? `<meta name="cover" content="${coverImageManifestId}"/>` : ''}
  </metadata>
  <manifest>
    ${manifestItems.map(item => 
      `<item id="${item.id}" href="${item.href}" media-type="${item.mediaType}" ${item.properties ? `properties="${item.properties}"` : ''}/>`
    ).join('\n    ')}
  </manifest>
  <spine>
    ${spineItems.map(item => `<itemref idref="${item.idref}"/>`).join('\n    ')}
  </spine>
</package>`;
};


export const epubService = {
  async generateEpub(journal: StoredJournal, allEntries: JournalEntry[]): Promise<Blob> {
    const zip = new JSZip();
    const files: EpubFile[] = [];

    const oebpsDir = 'OEBPS';
    const imagesDirRelative = 'images'; 
    const textDirRelative = 'text';   
    const cssDirRelative = 'css';     

    files.push({ name: 'mimetype', content: 'application/epub+zip', options: { compression: 'STORE' } });
    files.push({ name: 'META-INF/container.xml', content: generateContainerXml() });
    
    const styleCssPath = `${oebpsDir}/${cssDirRelative}/style.css`;
    files.push({ name: styleCssPath, content: generateStyleCss() });
    
    const imageManifestItems: ImageManifestItem[] = [];
    let imageCounter = 0;
    let coverImageManifestId: string | undefined;
    let coverImageOpfHref: string | undefined; 

    if (journal.coverImageUrl) {
        const { data, mediaType } = await processBase64Image(journal.coverImageUrl, 'cover');
        if (data) {
            imageCounter++;
            coverImageManifestId = `cover-img`;
            const extension = mediaType.split('/')[1] || 'jpg';
            coverImageOpfHref = `${imagesDirRelative}/cover.${extension}`;
            const localPathForZip = `${oebpsDir}/${coverImageOpfHref}`;
            imageManifestItems.push({ id: coverImageManifestId, href: coverImageOpfHref, mediaType, localPath: localPathForZip, data });
            files.push({ name: localPathForZip, content: data });
        }
    }

    const entryXhtmlFiles: EntryXhtmlFile[] = [];
    let entryFileCounter = 0;

    // Ensure all entries are properly structured, especially for older data or fallbacks
    const processedEntries = allEntries.map(entry => {
        const defaultContentType = journal.personalizationOptions.defaultEntryContentType || EntryContentType.CONCISE_COMMENTARY;
        let migratedEntry = { ...entry };
        if (migratedEntry.commentary && !migratedEntry.mainContent) {
          migratedEntry.mainContent = migratedEntry.commentary;
          migratedEntry.commentary = undefined; 
        }
        if (!migratedEntry.entryContentType) {
          migratedEntry.entryContentType = defaultContentType;
        }
        return migratedEntry;
    });


    for (const entry of processedEntries) {
        if (entry.illustrationUrl && journal.personalizationOptions.generateIllustrations) {
            const { data, mediaType } = await processBase64Image(entry.illustrationUrl, `illustration_${entry.id}`);
            if (data) {
                imageCounter++;
                const illustId = `illust-${entry.id.replace(/[^a-zA-Z0-9]/g, '_')}`;
                const extension = mediaType.split('/')[1] || 'jpg';
                const illustOpfHref = `${imagesDirRelative}/illustration_${entry.id.replace(/[^a-zA-Z0-9]/g, '_')}.${extension}`;
                (entry as any).epubIllustrationPath = illustOpfHref; 
                const localPathForZip = `${oebpsDir}/${illustOpfHref}`;
                imageManifestItems.push({ id: illustId, href: illustOpfHref, mediaType, localPath: localPathForZip, data });
                files.push({ name: localPathForZip, content: data });
            }
        }
        
        entryFileCounter++;
        const entryFileName = `entry_${entryFileCounter}.xhtml`;
        const entryOpfHref = `${textDirRelative}/${entryFileName}`; 
        const entryFullZipPath = `${oebpsDir}/${entryOpfHref}`;
        entryXhtmlFiles.push({ id: `entry-${entry.id.replace(/[^a-zA-Z0-9]/g, '_')}`, href: entryOpfHref, title: entry.subChapterTitle, filePath: entryFullZipPath });
        files.push({ name: entryFullZipPath, content: generateEntryXhtml(entry, journal.personalizationOptions) });
    }
    
    const titlePageFileName = "title_page.xhtml";
    const titlePageOpfHref = `${textDirRelative}/${titlePageFileName}`; 
    const titlePageFullZipPath = `${oebpsDir}/${titlePageOpfHref}`;
    files.push({ name: titlePageFullZipPath, content: generateTitlePageXhtml(journal, coverImageOpfHref) });

    const navFileName = "nav.xhtml";
    const navFullZipPath = `${oebpsDir}/${navFileName}`; 
    files.push({ name: navFullZipPath, content: generateNavXhtml(journal, entryXhtmlFiles) });

    const contentOpfPath = `${oebpsDir}/content.opf`;
    files.push({ name: contentOpfPath, content: generateContentOpf(journal, imageManifestItems, entryXhtmlFiles, coverImageManifestId) });

    for (const file of files) {
        zip.file(file.name, file.content, file.options);
    }
    
    return zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' });
  }
};