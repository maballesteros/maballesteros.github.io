# Ebook Library: Agent Instructions

> **Context**: This directory contains a collection of markdown-based ebooks. As an Agent, your job is to maintain, edit, and build these books using the established **Standard Build System**.

## 1. Directory Structure

*   **/scripts**: Contains the shared logic for building EPUBs and PDFs. **Do not modify these unless you are refactoring the global build engine.**
*   **/[project_name]**: Each folder represents a distinct ebook project (e.g., `aura_story`, `poder_etico`).

## 2. Project Anatomy

Every ebook project MUST follow this structure to work with the build scripts and maintain maintainability:

```
ebooks/project_name/
├── build.json          # CRITICAL: The build configuration file.
├── ebook_specs.md      # CRITICAL: Quality standards and style guide.
├── guion.md            # STORYLINE: The master plot/outline of the book.
├── index.json          # STRUCTURE: The Table of Contents mapping.
├── images/             # Local assets (cover.png, icons, diagrams).
├── parte_01/           # Content folder (Parts/Chapters).
│   ├── intro.md        # Introduction for this part.
│   ├── 01_chapter.md   # Detailed content.
│   └── ...
├── parte_02/
└── ...
```

### Required Metadata Files

1.  **`build.json`**: The engine config.
2.  **`ebook_specs.md`**: Defines the "Gold Standard" for content. Agents must read this before writing anything. Includes word counts, tone, and prohibited words.
3.  **`guion.md`**: The narrative backbone. Describes what happens in each chapter at a high level.
4.  **`index.json`**: A JSON mapping of `chapter_title` -> `filename`. Used by some legacy scripts or for validation.

### The `build.json` Configuration
This file drives the generation process. It usually looks like this:

```json
{
    "title": "Book Title",
    "author": "Author Name",
    "epubFilename": "book_complete.epub",
    "pdfFilename": "book_print.pdf",
    "parts": [ "parte_01", "parte_02", ... ],  // Order matters!
    "iconMap": [ ... ] // Optional: For injecting decorative icons in PDF
}
```

## 3. How to Build (The Standard workflow)

From the root of the repository (or `ebooks/` parent), you can run the generic scripts pointing to the project folder.

### 📘 Generating an EPUB
```bash
node ebooks/scripts/build_epub.js ebooks/[project_name]
```
*   **Input**: Reads `[project_name]/build.json`.
*   **Output**: Generates the `.epub` file defined in `epubFilename` inside the project folder.

### 📄 Generating a PDF
```bash
node ebooks/scripts/build_pdf.js ebooks/[project_name]
```
*   **Input**: Reads `[project_name]/build.json`.
*   **Description**: Uses Puppeteer to render a print-ready A5 PDF.
*   **Output**: Generates the `.pdf` file defined in `pdfFilename` inside the project folder.

## 4. Notable conventions

*   **Images**: In markdown, refer to images using relatively standard paths: `![Alt](../images/filename.png)`. The build scripts automatically resolve these to absolute paths during generation.
*   **CSS**: Styling is defined inside `build.json` properties (`epubCss` and `pdfCss`). Edit the JSON to change the look of the book, not the scripts.
*   **Blockquotes & Icons**: The PDF engine supports injecting icons into specific blockquotes (e.g., "Truths", "Rules", "Challenges") using the `iconMap` in `build.json`.

## 5. Agent Protocol
1.  **Edit Content**: Modify the `.md` files in the `parte_XX` folders.
2.  **Verify Structure**: Ensure `build.json` lists any new parts/folders.
3.  **Build**: Run the generic scripts.
4.  **Verify Output**: Check that the output files (EPUB/PDF) are created/updated in the project folder.
