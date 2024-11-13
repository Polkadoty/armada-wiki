import { serialize } from 'next-mdx-remote/serialize';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import matter from 'gray-matter';
import fs from 'fs/promises';
import path from 'path';

export async function getMarkdownContent(filepath: string) {
  const fullPath = path.join(process.cwd(), 'content', filepath);
  const fileContents = await fs.readFile(fullPath, 'utf8');
  
  const { data, content } = matter(fileContents);
  
  const mdxSource = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [[remarkGfm]],
      rehypePlugins: [[rehypeHighlight], [rehypeSlug]],
    },
  });

  return {
    frontmatter: data,
    content: mdxSource,
  };
} 