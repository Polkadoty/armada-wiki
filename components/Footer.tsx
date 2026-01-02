import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="border-t bg-card/50 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Armada Wiki</h3>
            <p className="text-xs text-muted-foreground">
              A community-driven reference for Star Wars: Armada and Armada Legacy.
            </p>
          </div>

          {/* Browse */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Browse</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/ships" className="text-muted-foreground hover:text-foreground transition-colors">
                  Ships
                </Link>
              </li>
              <li>
                <Link href="/squadrons" className="text-muted-foreground hover:text-foreground transition-colors">
                  Squadrons
                </Link>
              </li>
              <li>
                <Link href="/upgrades" className="text-muted-foreground hover:text-foreground transition-colors">
                  Upgrades
                </Link>
              </li>
              <li>
                <Link href="/objectives" className="text-muted-foreground hover:text-foreground transition-colors">
                  Objectives
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Resources</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/guide" className="text-muted-foreground hover:text-foreground transition-colors">
                  Getting Started
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-muted-foreground hover:text-foreground transition-colors">
                  Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Tools</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/compare" className="text-muted-foreground hover:text-foreground transition-colors">
                  Compare Cards
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="text-muted-foreground hover:text-foreground transition-colors">
                  Favorites
                </Link>
              </li>
              <li>
                <a
                  href="https://star-forge.tools"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Fleet Builder
                </a>
              </li>
              <li>
                <a
                  href="https://t5.tools"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  T5 Tools
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>
            Data provided by{" "}
            <a
              href="https://api.swarmada.wiki"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors underline"
            >
              Swarmada API
            </a>
          </p>
          <p>
            Star Wars: Armada is a trademark of Fantasy Flight Games. This site is not affiliated with FFG.
          </p>
        </div>
      </div>
    </footer>
  );
}
