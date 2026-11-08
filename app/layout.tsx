import type { Metadata } from "next";
import { SearchProvider } from "@/components/site/SearchProvider";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteTopBar } from "@/components/site/SiteTopBar";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Armada Wiki", template: "%s | Armada Wiki" },
  description: "Card reference and rulings for Star Wars: Armada. Ships, squadrons, upgrades and objectives from the core game, the Armada Community errata and Nexus.",
  openGraph: { siteName: "Armada Wiki", type: "website" },
  twitter: { card: "summary_large_image" },
};

// Every page is a rulebook page: parchment sheets over the rulebook background, in the
// light palette.
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="force-light">
      <body className="min-h-screen bg-[#444] bg-[url(/images/rulebook-background.webp)] bg-cover bg-fixed bg-top font-body text-rulebook-ink antialiased">
        <SearchProvider>
          <div data-rulebook className="flex min-h-screen flex-col">
            <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-rulebook-sheet focus:px-3 focus:py-2">
              Skip to content
            </a>
            <SiteTopBar />
            <div id="content" className="flex-1">{children}</div>
            <SiteFooter />
          </div>
        </SearchProvider>
      </body>
    </html>
  );
}
