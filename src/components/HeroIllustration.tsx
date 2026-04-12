export default function HeroIllustration() {
  return (
    <div className="relative w-full max-w-sm sm:max-w-md aspect-square select-none" aria-hidden="true">
      <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#66bb6a" />
            <stop offset="100%" stopColor="#f1c40f" />
          </linearGradient>
          <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f1c40f" />
            <stop offset="100%" stopColor="#e74c3c" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background burst / action lines */}
        <g opacity="0.2">
          <line x1="295" y1="200" x2="395" y2="200" stroke="#66bb6a" strokeWidth="2.5" />
          <line x1="282" y1="153" x2="347" y2="119" stroke="#f1c40f" strokeWidth="1.5" />
          <line x1="248" y1="117" x2="278" y2="65" stroke="#f1c40f" strokeWidth="1" />
          <line x1="200" y1="105" x2="200" y2="5" stroke="#66bb6a" strokeWidth="2.5" />
          <line x1="152" y1="117" x2="122" y2="65" stroke="#e74c3c" strokeWidth="1" />
          <line x1="118" y1="153" x2="53" y2="119" stroke="#f1c40f" strokeWidth="1.5" />
          <line x1="105" y1="200" x2="5" y2="200" stroke="#66bb6a" strokeWidth="2.5" />
          <line x1="118" y1="247" x2="53" y2="281" stroke="#e74c3c" strokeWidth="1.5" />
          <line x1="152" y1="283" x2="122" y2="335" stroke="#f1c40f" strokeWidth="1" />
          <line x1="200" y1="295" x2="200" y2="395" stroke="#66bb6a" strokeWidth="2.5" />
          <line x1="248" y1="283" x2="278" y2="335" stroke="#e74c3c" strokeWidth="1" />
          <line x1="282" y1="247" x2="347" y2="281" stroke="#f1c40f" strokeWidth="1.5" />
          <line x1="267" y1="133" x2="312" y2="88" stroke="#66bb6a" strokeWidth="2" />
          <line x1="133" y1="133" x2="88" y2="88" stroke="#e74c3c" strokeWidth="2" />
          <line x1="133" y1="267" x2="88" y2="312" stroke="#66bb6a" strokeWidth="2" />
          <line x1="267" y1="267" x2="312" y2="312" stroke="#f1c40f" strokeWidth="2" />
        </g>

        {/* Outer orbit ring */}
        <circle cx="200" cy="200" r="145" fill="none" stroke="#66bb6a" strokeWidth="1" strokeDasharray="4 8" opacity="0.2" />

        {/* Orbiting elements */}
        <g className="animate-[spin_30s_linear_infinite]" style={{ transformOrigin: "200px 200px" }}>
          <circle cx="200" cy="55" r="8" fill="#f1c40f" opacity="0.8" />
          <circle cx="345" cy="200" r="5" fill="#e74c3c" opacity="0.6" />
          <circle cx="200" cy="345" r="6" fill="#66bb6a" opacity="0.7" />
          <circle cx="55" cy="200" r="4" fill="#f1c40f" opacity="0.5" />
        </g>

        {/* Central shield — glow behind */}
        <circle cx="200" cy="195" r="94" fill="#66bb6a" opacity="0.08" filter="url(#glow)" />

        {/* Central shield — layered */}
        <circle cx="200" cy="195" r="92" fill="rgba(255,255,255,0.3)" stroke="url(#shield-grad)" strokeWidth="3" />
        <circle cx="200" cy="195" r="80" fill="none" stroke="url(#ring-grad)" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5" />
        <circle cx="200" cy="195" r="68" fill="none" stroke="#66bb6a" strokeWidth="0.5" opacity="0.3" />

        {/* Inner emblem — code bracket with glow */}
        <text x="200" y="210" textAnchor="middle" fontSize="50" fontFamily="var(--font-mono), monospace" fontWeight="800" fill="url(#shield-grad)" filter="url(#glow)">
          {"</>"}
        </text>

        {/* DEVS VLTRA banner — ribbon style */}
        <path d="M110,290 L120,285 L280,285 L290,290 L280,295 L120,295 Z" fill="#1e6e3e" />
        <path d="M105,290 L115,283 L118,290 L115,297 Z" fill="#1e6e3e" opacity="0.7" />
        <path d="M295,290 L285,283 L282,290 L285,297 Z" fill="#1e6e3e" opacity="0.7" />
        <text x="200" y="294" textAnchor="middle" fontSize="13" fontWeight="800" fontFamily="var(--font-sans), sans-serif" fill="#f1c40f" letterSpacing="4">
          DEVS VLTRA
        </text>

        {/* Floating terminal windows */}
        <g opacity="0.75" transform="translate(40, 55)">
          <rect width="72" height="52" rx="6" fill="rgba(0,0,0,0.5)" stroke="#66bb6a" strokeWidth="0.8" />
          <rect y="0" width="72" height="13" rx="6" fill="rgba(102,187,106,0.2)" />
          <circle cx="9" cy="6.5" r="2" fill="#e74c3c" />
          <circle cx="16" cy="6.5" r="2" fill="#f1c40f" />
          <circle cx="23" cy="6.5" r="2" fill="#66bb6a" />
          <text x="8" y="28" fontSize="7" fontFamily="var(--font-mono), monospace" fill="#66bb6a" opacity="0.9">
            $ npm run
          </text>
          <text x="8" y="39" fontSize="7" fontFamily="var(--font-mono), monospace" fill="#f1c40f" opacity="0.8">
            dev ✓
          </text>
        </g>

        {/* Floating code block */}
        <g opacity="0.65" transform="translate(290, 85)">
          <rect width="78" height="58" rx="6" fill="rgba(0,0,0,0.5)" stroke="#f1c40f" strokeWidth="0.8" />
          <rect y="0" width="78" height="13" rx="6" fill="rgba(241,196,15,0.15)" />
          <circle cx="9" cy="6.5" r="2" fill="#e74c3c" />
          <circle cx="16" cy="6.5" r="2" fill="#f1c40f" />
          <circle cx="23" cy="6.5" r="2" fill="#66bb6a" />
          <text x="8" y="27" fontSize="6.5" fontFamily="var(--font-mono), monospace" fill="#66bb6a" opacity="0.9">
            {"const hero"}
          </text>
          <text x="8" y="37" fontSize="6.5" fontFamily="var(--font-mono), monospace" fill="#f1c40f" opacity="0.8">
            {"  = await"}
          </text>
          <text x="8" y="47" fontSize="6.5" fontFamily="var(--font-mono), monospace" fill="#e74c3c" opacity="0.8">
            {"  grow();"}
          </text>
        </g>

        {/* Git branch visualization */}
        <g opacity="0.5" transform="translate(305, 295)">
          <circle cx="10" cy="10" r="5" fill="#66bb6a" />
          <circle cx="30" cy="10" r="5" fill="#f1c40f" />
          <circle cx="50" cy="10" r="5" fill="#66bb6a" />
          <circle cx="40" cy="30" r="5" fill="#e74c3c" />
          <line x1="15" y1="10" x2="25" y2="10" stroke="#66bb6a" strokeWidth="1.5" />
          <line x1="35" y1="10" x2="45" y2="10" stroke="#66bb6a" strokeWidth="1.5" />
          <line x1="32" y1="14" x2="38" y2="26" stroke="#e74c3c" strokeWidth="1.5" />
        </g>

        {/* Stars — colorful */}
        <polygon points="330,55 335,68 349,68 337,76 341,89 330,81 319,89 323,76 311,68 325,68" fill="#f1c40f" opacity="0.9" />
        <polygon points="75,130 78,138 87,138 80,143 82,151 75,146 68,151 70,143 63,138 72,138" fill="#e74c3c" opacity="0.6" />
        <polygon points="60,275 62,281 69,281 64,285 65,291 60,287 55,291 56,285 51,281 58,281" fill="#f1c40f" opacity="0.5" />
        <polygon points="355,215 357,220 362,220 358,223 359,228 355,225 351,228 352,223 348,220 353,220" fill="#66bb6a" opacity="0.45" />

        {/* Speed lines — impact effect */}
        <g opacity="0.2" strokeLinecap="round">
          <line x1="95" y1="140" x2="55" y2="110" stroke="#f1c40f" strokeWidth="2" />
          <line x1="88" y1="155" x2="45" y2="140" stroke="#f1c40f" strokeWidth="1.5" />
          <line x1="85" y1="170" x2="40" y2="168" stroke="#66bb6a" strokeWidth="1" />
          <line x1="305" y1="140" x2="345" y2="110" stroke="#e74c3c" strokeWidth="2" />
          <line x1="312" y1="155" x2="355" y2="140" stroke="#f1c40f" strokeWidth="1.5" />
          <line x1="315" y1="170" x2="360" y2="168" stroke="#66bb6a" strokeWidth="1" />
        </g>

        {/* Scattered particles */}
        <circle cx="140" cy="48" r="3" fill="#f1c40f" opacity="0.5" />
        <circle cx="270" cy="42" r="2" fill="#e74c3c" opacity="0.4" />
        <circle cx="45" cy="315" r="3" fill="#66bb6a" opacity="0.4" />
        <circle cx="370" cy="165" r="2.5" fill="#f1c40f" opacity="0.35" />
        <circle cx="160" cy="348" r="2" fill="#e74c3c" opacity="0.3" />
        <circle cx="250" cy="352" r="2.5" fill="#66bb6a" opacity="0.3" />
      </svg>
    </div>
  );
}
