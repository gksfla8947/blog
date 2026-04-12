export default function Footer() {
  return (
    <footer className="border-t border-[var(--card-border)] mt-auto">
      <div className="max-w-3xl mx-auto px-6 py-8 text-center text-sm text-[var(--muted)]">
        <p>&copy; {new Date().getFullYear()} My CS Academia. All rights reserved.</p>
      </div>
    </footer>
  );
}
