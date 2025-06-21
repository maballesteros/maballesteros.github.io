// utils/textUtils.ts

// Helper to sanitize strings for XML/HTML content
export const escapeXml = (unsafe: string): string => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

export const convertMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return '';

  let htmlResult = '';
  const blocks = markdown.split(/\n\s*\n/); // Split by one or more empty lines to identify paragraphs or list blocks

  for (const block of blocks) {
    if (block.trim() === '') continue;

    // Apply inline styles (bold, italic) to the whole block first.
    // Note: This is a simplified approach. Complex nested markdown might require a more sophisticated parser.
    let processedBlock = escapeXml(block); // Escape initial content
    
    processedBlock = processedBlock.replace(/\*\*(.*?)\*\*|__(.*?)__/g, (match, p1, p2) => `<strong>${escapeXml(p1 || p2)}</strong>`);
    processedBlock = processedBlock.replace(/\*(.*?)\*|_(.*?)_/g, (match, p1, p2) => `<em>${escapeXml(p1 || p2)}</em>`);
    
    // Check if the block is entirely a list
    const lines = processedBlock.split('\n');
    const isListBlock = lines.every(line => line.match(/^(\s*)[*-]\s+/) || line.trim() === '');

    if (isListBlock) {
      htmlResult += '<ul>\n';
      for (const line of lines) {
        const itemMatch = line.match(/^(\s*)[*-]\s+(.*)/);
        if (itemMatch) {
          // Content of list item (itemMatch[2]) already has strong/em applied and is escaped
          htmlResult += `  <li>${itemMatch[2].trim()}</li>\n`;
        }
      }
      htmlResult += '</ul>\n';
    } else {
      // Treat as a paragraph block, convert single newlines within it to <br />
      htmlResult += `<p>${processedBlock.replace(/\n/g, '<br />')}</p>\n`;
    }
  }
  return htmlResult;
};
