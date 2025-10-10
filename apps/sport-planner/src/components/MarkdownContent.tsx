import type { ComponentPropsWithoutRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
  content?: string;
}

const components = {
  a: (props: ComponentPropsWithoutRef<'a'>) => (
    <a
      {...props}
      className="text-sky-300 underline decoration-dotted underline-offset-4 hover:text-sky-200"
      target="_blank"
      rel="noreferrer"
    />
  )
};

export function MarkdownContent({ content }: MarkdownContentProps) {
  if (!content) return null;
  return (
    <div className="prose prose-invert max-w-none prose-headings:font-display prose-p:leading-relaxed prose-strong:text-white prose-a:text-sky-300">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
