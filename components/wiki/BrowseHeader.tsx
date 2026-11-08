export function BrowseHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="mb-6 text-center">
      <h1 className="wiki-page-title">{title}</h1>
      <p className="mt-3 text-[15px] text-rulebook-muted">{description}</p>
    </header>
  );
}
