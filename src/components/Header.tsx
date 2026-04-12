import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="border-b border-[var(--card-border)] sticky top-0 z-50 bg-[var(--background)]/80 backdrop-blur-md">
      <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight hover:opacity-80 transition-opacity">
          My CS Academia
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
            Posts
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
