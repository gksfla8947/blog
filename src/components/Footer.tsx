export default function Footer() {
  return (
    <footer className="border-t border-[var(--card-border)] mt-auto bg-[var(--card)]">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold"
                   style={{ background: "linear-gradient(135deg, #1e6e3e, #d4a017)" }}>
                DV
              </div>
              <span className="font-bold text-sm gradient-text">DEVS VLTRA</span>
            </div>
            <p className="text-xs text-[var(--muted)]">Beyond the Limit</p>
          </div>
          <p className="text-xs text-[var(--muted)]">
            &copy; {new Date().getFullYear()} gksfla8947. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
