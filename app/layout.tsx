import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Footer } from "@/components/Footer";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Armada Wiki", template: "%s | Armada Wiki" },
  description: "Card reference and rulings for Star Wars: Armada. Ships, squadrons, upgrades and objectives from the core game, the Armada Community errata and Nexus.",
  openGraph: { siteName: "Armada Wiki", type: "website" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased min-h-screen flex flex-col"
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
