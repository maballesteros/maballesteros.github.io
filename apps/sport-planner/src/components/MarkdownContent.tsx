import { useMemo } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import type { PluggableList } from 'unified';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import clsx from 'clsx';

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

type HastNode = {
  type?: string;
  value?: string;
  tagName?: string;
  children?: HastNode[];
};

function hastToText(node: HastNode | undefined): string {
  if (!node) return '';
  if (node.type === 'text' && typeof node.value === 'string') return node.value;
  if (Array.isArray(node.children)) return node.children.map(hastToText).join('');
  return '';
}

function parseObsidianCallout(node: HastNode | undefined): { type: string; title: string } | null {
  if (!node || node.type !== 'element' || node.tagName !== 'blockquote') return null;
  const firstChild = node.children?.[0];
  if (!firstChild || firstChild.type !== 'element' || firstChild.tagName !== 'p') return null;

  const raw = hastToText(firstChild).trim();
  const match = raw.match(/^\[!([^\]]+)\]([+-])?\s*(.*)$/i);
  if (!match) return null;

  const type = match[1].toLowerCase();
  const titleFromMarkdown = match[3]?.trim() ?? '';
  const title = titleFromMarkdown || type;
  return { type, title };
}

const CALLOUT_STYLES: Record<
  string,
  {
    icon: string;
    containerClassName: string;
    titleClassName: string;
  }
> = {
  danger: {
    icon: '⚡',
    containerClassName: 'border-rose-500/25 bg-rose-500/10',
    titleClassName: 'text-rose-200'
  },
  warning: {
    icon: '⚠',
    containerClassName: 'border-amber-500/25 bg-amber-500/10',
    titleClassName: 'text-amber-200'
  },
  info: {
    icon: 'ℹ',
    containerClassName: 'border-sky-500/25 bg-sky-500/10',
    titleClassName: 'text-sky-200'
  },
  note: {
    icon: '✎',
    containerClassName: 'border-indigo-500/25 bg-indigo-500/10',
    titleClassName: 'text-indigo-200'
  },
  tip: {
    icon: '★',
    containerClassName: 'border-emerald-500/25 bg-emerald-500/10',
    titleClassName: 'text-emerald-200'
  }
};

const BlockquoteRenderer = (props: ComponentPropsWithoutRef<'blockquote'> & { node?: unknown }) => {
  const callout = parseObsidianCallout(props.node as HastNode | undefined);
  if (!callout) {
    return <blockquote {...props} />;
  }

  const style = CALLOUT_STYLES[callout.type] ?? CALLOUT_STYLES.info;
  const childrenArray = Array.isArray(props.children) ? props.children : [props.children];
  const contentChildren = childrenArray.slice(1);

  return (
    <aside className={clsx('my-4 rounded-2xl border p-5', style.containerClassName)}>
      <div className={clsx('flex items-center gap-2 text-lg font-semibold', style.titleClassName)}>
        <span aria-hidden="true">{style.icon}</span>
        <span>{callout.title}</span>
      </div>
      <div className="mt-3">{contentChildren}</div>
    </aside>
  );
};

const defaultComponents = {
  a: LinkRenderer,
  blockquote: BlockquoteRenderer
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
