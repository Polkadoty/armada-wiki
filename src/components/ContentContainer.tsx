'use client';

import { MDXRemote } from 'next-mdx-remote';
import { useMDXComponents } from '@/components/mdx/MDXComponents';
import { cn } from "@/lib/utils";

interface ContentContainerProps {
  children?: React.ReactNode;
  markdown?: any;
  className?: string;
}

export function ContentContainer({ children, markdown, className }: ContentContainerProps) {
  const components = useMDXComponents();

  return (
    <div className="relative flex-1 overflow-auto">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className={cn(
          "rounded-lg border bg-background backdrop-blur-2xl bg-opacity-70 p-8 shadow-lg",
          "prose prose-slate dark:prose-invert max-w-none",
          "prose-headings:font-display",
          "prose-a:font-semibold dark:prose-a:text-sky-400",
          "prose-pre:bg-slate-900",
          className
        )}>
          {markdown ? (
            <MDXRemote {...markdown} components={components} />
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
} 