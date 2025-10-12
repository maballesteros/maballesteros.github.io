import { useMemo } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import type { PluggableList } from 'unified';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { useWorkNameIndex } from '@/hooks/useWorkNameIndex';
import { remarkWorkLinks, type RemarkWorkLinksOptions } from '@/lib/remarkWorkLinks';

interface MarkdownContentProps {
  content?: string;
  enableWorkLinks?: boolean;
}

const LinkRenderer = (props: ComponentPropsWithoutRef<'a'>) => {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
  const basePrefix = basePath ? `${basePath}/` : '/';
  const internalHashPrefix = `${basePrefix}#/`;
  const isInternalPlainHash = props.href?.startsWith('#/') ?? false;
  const isInternalBaseHash = props.href?.startsWith(internalHashPrefix) ?? false;
  const isInternalHref =
    (props.href?.startsWith('/') ?? false) || isInternalPlainHash || isInternalBaseHash;
  const rel = isInternalHref ? props.rel : props.rel ?? 'noreferrer';
  const target = isInternalHref ? props.target : props.target ?? '_blank';

  return (
    <a
      {...props}
      className="text-sky-300 underline decoration-dotted underline-offset-4 hover:text-sky-200"
      target={target}
      rel={rel}
    />
  );
};

const defaultComponents = {
  a: LinkRenderer
};

export function MarkdownContent({ content, enableWorkLinks = false }: MarkdownContentProps) {
  const { entries } = useWorkNameIndex();

  const workLinkOptions = useMemo<RemarkWorkLinksOptions | null>(() => {
    if (!enableWorkLinks) return null;
    if (entries.length === 0) return null;
    const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
    const basePrefix = basePath ? `${basePath}/` : '/';
    const prefix = `${basePrefix}#/catalog`;
    return {
      entries: entries.map(({ name, work }) => ({
        name,
        href: `${prefix}?workId=${encodeURIComponent(work.id)}`
      }))
    };
  }, [enableWorkLinks, entries]);

  const remarkPlugins = useMemo<PluggableList>(() => {
    const plugins: PluggableList = [remarkGfm];
    if (workLinkOptions) {
      plugins.push([remarkWorkLinks, workLinkOptions]);
    }
    return plugins;
  }, [workLinkOptions]);

  if (!content) return null;
  return (
    <div className="prose prose-invert max-w-none prose-headings:font-display prose-p:leading-relaxed prose-strong:text-white prose-a:text-sky-300">
      <ReactMarkdown remarkPlugins={remarkPlugins} components={defaultComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
