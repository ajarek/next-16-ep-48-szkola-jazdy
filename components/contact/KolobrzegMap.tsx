export default function KolobrzegMap() {
  return (
    <svg
      viewBox="0 0 1100 460"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="contact-sea" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e7f6ff" />
          <stop offset="55%" stopColor="#c5e7f8" />
          <stop offset="100%" stopColor="#9fd4f2" />
        </linearGradient>
        <linearGradient id="contact-land" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#f7f6df" />
          <stop offset="45%" stopColor="#e7f2c8" />
          <stop offset="100%" stopColor="#d7e7b4" />
        </linearGradient>
        <pattern id="contact-waves" width="46" height="18" patternUnits="userSpaceOnUse">
          <path d="M0 10 Q 11 4 23 10 T 46 10" fill="none" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="1.4" />
        </pattern>
      </defs>

      <rect width="1100" height="460" fill="url(#contact-sea)" />
      <rect width="1100" height="460" fill="url(#contact-waves)" opacity="0.7" />

      <path
        d="M250 0 C 210 50 300 90 230 150 C 160 210 250 240 190 310 C 140 370 230 400 180 460 L 1100 460 L 1100 0 Z"
        fill="url(#contact-land)"
      />
      <path
        d="M250 0 C 210 50 300 90 230 150 C 160 210 250 240 190 310 C 140 370 230 400 180 460"
        fill="none"
        stroke="#f6e3b4"
        strokeWidth="22"
        strokeLinecap="round"
      />
      <path
        d="M250 0 C 210 50 300 90 230 150 C 160 210 250 240 190 310 C 140 370 230 400 180 460"
        fill="none"
        stroke="#7ec8ea"
        strokeWidth="3"
        opacity="0.7"
      />

      <ellipse cx="520" cy="150" rx="70" ry="36" fill="#b7d98a" opacity="0.55" />
      <ellipse cx="760" cy="250" rx="90" ry="42" fill="#c5e09a" opacity="0.45" />
      <ellipse cx="900" cy="120" rx="60" ry="28" fill="#d5c98a" opacity="0.35" />

      <g fill="#ffffff" fillOpacity="0.72" stroke="#d5e3bf" strokeWidth="1">
        <rect x="390" y="150" width="34" height="18" rx="3" />
        <rect x="430" y="146" width="28" height="22" rx="3" />
        <rect x="468" y="156" width="40" height="16" rx="3" />
        <rect x="400" y="176" width="26" height="16" rx="3" />
        <rect x="436" y="178" width="36" height="18" rx="3" />
        <rect x="560" y="190" width="30" height="16" rx="3" />
        <rect x="598" y="184" width="24" height="20" rx="3" />
        <rect x="640" y="300" width="32" height="14" rx="3" />
        <rect x="680" y="292" width="22" height="18" rx="3" />
      </g>

      <g fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.8">
        <path d="M300 120 H 620" />
        <path d="M360 200 H 700" />
        <path d="M480 80 V 340" />
        <path d="M620 140 V 400" />
      </g>

      <path d="M120 250 H 1060" fill="none" stroke="#f6d15c" strokeWidth="8" strokeLinecap="round" />
      <path d="M820 20 V 440" fill="none" stroke="#f0c94a" strokeWidth="7" strokeLinecap="round" />
      <path d="M300 250 C 420 180 560 330 760 250" fill="none" stroke="#f8dc7a" strokeWidth="4" opacity="0.9" />

      <g fontFamily="inherit">
        <text x="70" y="150" fill="#3d6f8f" fontSize="13" fontWeight="700" transform="rotate(-90 70 150)">
          Morze Bałtyckie
        </text>

        <text x="300" y="210" fill="#5d6b52" fontSize="11" fontWeight="700" letterSpacing="1.4">
          PLAŻA ZACHODNIA
        </text>
        <text x="500" y="128" fill="#5d6b52" fontSize="11" fontWeight="700" letterSpacing="1.2">
          CENTRUM MIASTA
        </text>
        <text x="560" y="168" fill="#6a7860" fontSize="11" fontWeight="700" letterSpacing="1.2">
          PLAŻA WSCHODNIA
        </text>
        <text x="470" y="250" fill="#243044" fontSize="22" fontWeight="800">
          Kołobrzeg
        </text>
        <text x="930" y="70" fill="#3c4a38" fontSize="16" fontWeight="700">
          Bagicz
        </text>
        <text x="700" y="78" fill="#5c5140" fontSize="12" fontWeight="700" letterSpacing="1.5">
          PODCZELE
        </text>
        <text x="860" y="210" fill="#3c4a38" fontSize="15" fontWeight="700">
          Kądzielno
        </text>
        <text x="900" y="300" fill="#3c4a38" fontSize="16" fontWeight="700">
          Przylaski
        </text>
        <text x="700" y="400" fill="#3c4a38" fontSize="14" fontWeight="700">
          Budzistowo
        </text>
        <text x="960" y="390" fill="#3c4a38" fontSize="13" fontWeight="600">
          Stramniczka
        </text>
      </g>

      <g transform="translate(790 150)">
        <rect width="38" height="22" rx="3" fill="#f6d15c" stroke="#243044" strokeWidth="1.4" />
        <text x="19" y="15" textAnchor="middle" fontSize="11" fontWeight="800" fill="#243044">
          165
        </text>
      </g>
      <g transform="translate(990 232)">
        <rect width="42" height="22" rx="3" fill="#3f8f4e" stroke="#16331c" strokeWidth="1.2" />
        <text x="21" y="15" textAnchor="middle" fontSize="11" fontWeight="800" fill="#ffffff">
          E28
        </text>
      </g>

      <g transform="translate(214 78)">
        <circle r="16" fill="#e85aa8" />
        <circle r="7" fill="#ffffff" />
        <text x="22" y="-6" fontSize="12" fontWeight="800" fill="#243044">
          Latarnia Morska
        </text>
        <text x="22" y="10" fontSize="12" fontWeight="700" fill="#e85aa8">
          Kołobrzeg
        </text>
      </g>

      <g transform="translate(640 92)">
        <path d="M0 0 C -8 10 -8 18 0 28 C 8 18 8 10 0 0 Z" fill="#ec4899" />
        <circle cy="12" r="4" fill="#ffffff" />
        <text x="16" y="8" fontSize="12" fontWeight="800" fill="#243044">
          Arka Medical SPA
        </text>
      </g>

      <g transform="translate(390 268)">
        <circle r="22" fill="#2563eb" opacity="0.18" />
        <circle r="14" fill="#1d4ed8" />
        <circle r="5" fill="#ffffff" />
        <path d="M0 12 V 26" stroke="#1d4ed8" strokeWidth="3" />
      </g>
    </svg>
  );
}
