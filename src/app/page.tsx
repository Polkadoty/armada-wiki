import { ContentContainer } from '../components/ContentContainer';
import { getMarkdownContent } from '../lib/markdown';

export default async function Page() {
  const { content } = await getMarkdownContent('home.mdx');
  
  return (
    <ContentContainer markdown={content} />
  );
}
