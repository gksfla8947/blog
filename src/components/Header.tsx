import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="border-b border-[var(--card-border)] sticky top-0 z-50 bg-[var(--background)]/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <img src="/profile.svg" alt="profile" className="w-8 h-8 rounded-lg object-cover" />
          <span className="text-lg font-bold tracking-tight">
            <span className="gradient-text">DEVS VLTRA</span>
          </span>
        </Link>
        <nav className="flex items-center gap-5">
          <Link href="/" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--accent)] transition-colors">
            Posts
          </Link>
          <div className="w-px h-4 bg-[var(--card-border)]" />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
