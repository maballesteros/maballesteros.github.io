import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import type { Parent, Root, Text } from 'mdast';

export interface RemarkWorkLink {
  name: string;
  href: string;
}

export interface RemarkWorkLinksOptions {
  entries: RemarkWorkLink[];
}

const WORD_CHAR_REGEX = /\p{L}|\p{N}/u;

const isWordChar = (char: string | undefined): boolean => {
  if (!char) return false;
  return WORD_CHAR_REGEX.test(char);
};

const isValidBoundary = (value: string, start: number, end: number): boolean => {
  const before = start === 0 ? undefined : value[start - 1];
  const after = end >= value.length ? undefined : value[end];
  return !isWordChar(before) && !isWordChar(after);
};

const findMatches = (value: string, entries: RemarkWorkLink[]) => {
  type Match = { start: number; end: number; entry: RemarkWorkLink };
  const matches: Match[] = [];

  entries.forEach((entry) => {
    let searchStart = 0;
    while (searchStart < value.length) {
      const index = value.indexOf(entry.name, searchStart);
      if (index === -1) break;
      const end = index + entry.name.length;
      if (isValidBoundary(value, index, end)) {
        matches.push({ start: index, end, entry });
      }
      searchStart = index + entry.name.length;
    }
  });

  matches.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return b.entry.name.length - a.entry.name.length;
  });

  const filtered: Match[] = [];
  let lastEnd = -1;

  matches.forEach((match) => {
    if (match.start < lastEnd) return;
    filtered.push(match);
    lastEnd = match.end;
  });

  return filtered;
};

const shouldSkipParent = (parent: Parent | null | undefined) => {
  if (!parent) return true;
  const skipTypes = new Set<Parent['type']>(['link', 'linkReference', 'definition', 'inlineCode', 'code']);
  return skipTypes.has(parent.type);
};

export const remarkWorkLinks: Plugin<[RemarkWorkLinksOptions?], Root> = (options) => {
  const entries = options?.entries ?? [];
  if (entries.length === 0) {
    return () => {};
  }

  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      if (shouldSkipParent(parent)) return;
      if (typeof index !== 'number' || !parent) return;

      const textNode = node as Text;
      const value = textNode.value;
      if (!value) return;

      const matches = findMatches(value, entries);
      if (matches.length === 0) return;

      const newNodes: Parent['children'] = [];
      let cursor = 0;

      matches.forEach((match) => {
        if (match.start > cursor) {
          newNodes.push({
            type: 'text',
            value: value.slice(cursor, match.start)
          });
        }
        newNodes.push({
          type: 'link',
          title: null,
          url: match.entry.href,
          children: [
            {
              type: 'text',
              value: match.entry.name
            }
          ]
        });
        cursor = match.end;
      });

      if (cursor < value.length) {
        newNodes.push({
          type: 'text',
          value: value.slice(cursor)
        });
      }

      parent.children.splice(index, 1, ...newNodes);
    });
  };
};
