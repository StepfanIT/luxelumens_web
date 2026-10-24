/**
 * Architectural section through the eave: roof, soffit, wall, the profile
 * under the soffit, the cable and the controller. Colours come from CSS
 * variables set by the Craft section; the light fades in with `--night`.
 */
export default function EaveDrawing() {
  return (
    <svg viewBox="0 0 720 540" className="eave" aria-hidden="true">
      <defs>
        <pattern id="eave-hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="9" className="e-hatch" />
        </pattern>
        <radialGradient id="eave-cone" cx="594" cy="346" r="330" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffd59a" stopOpacity="0.85" />
          <stop offset="0.35" stopColor="#ffb860" stopOpacity="0.32" />
          <stop offset="1" stopColor="#ffb860" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="eave-wash" x1="0" y1="330" x2="0" y2="540" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffcf8a" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ffb860" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="eave-led" cx="594" cy="343" r="34" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff4dc" />
          <stop offset="0.25" stopColor="#ffcf86" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffb860" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g className="eave-night">
        {[
          [470, 60],
          [560, 34],
          [640, 96],
          [690, 40],
          [520, 128],
          [610, 160],
          [700, 150],
          [430, 22],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1.3" fill="#f4efe7" />
        ))}
      </g>

      <g className="eave-night eave-light">
        <path d="M586 346 L604 346 L560 540 L232 540 L232 360 Z" fill="url(#eave-cone)" />
        <rect x="226" y="330" width="8" height="210" fill="url(#eave-wash)" />
        <ellipse cx="560" cy="332" rx="90" ry="6" fill="#ffcf8a" opacity="0.35" />
      </g>

      {/* Roof covering and rafter */}
      <path d="M0 96 L664 266 L664 288 L0 118 Z" className="e-roof" />
      <path d="M0 122 L640 286 L640 304 L0 140 Z" className="e-soffit" />

      {/* Wall with insulation */}
      <rect x="150" y="196" width="80" height="344" className="e-wall" />
      <rect x="160" y="210" width="36" height="330" fill="url(#eave-hatch)" />
      <line x1="196" y1="210" x2="196" y2="540" className="e-line" strokeWidth="0.8" strokeDasharray="2 4" />

      {/* Lookouts and the soffit board */}
      {[300, 400, 500].map((x) => (
        <line key={x} x1={x} y1={324} x2={x} y2={140 + x * 0.25625} className="e-line" strokeWidth="1" opacity="0.55" />
      ))}
      <rect x="230" y="324" width="410" height="8" className="e-soffit" />

      {/* Fascia and gutter */}
      <rect x="640" y="272" width="16" height="64" className="e-soffit" />
      <path d="M656 286 L708 286 Q708 322 682 322 Q659 322 656 300 Z" className="e-wall" />

      {/* Cable to the controller */}
      <path d="M576 330 V316 H244 V452 H124" className="e-line eave-cable" strokeWidth="1.4" strokeDasharray="5 5" />

      {/* The profile under the soffit, in the soffit's own colour */}
      <rect x="566" y="332" width="56" height="14" rx="2" className="e-soffit" strokeWidth="1" />
      <rect x="582" y="340" width="24" height="5" rx="1.5" className="e-soffit" strokeWidth="0.8" />
      <circle cx="594" cy="343" r="34" fill="url(#eave-led)" className="eave-night" />

      {/* Controller indoors */}
      <rect x="56" y="428" width="68" height="48" rx="8" className="e-wall" />
      <path d="M78 448 a12 12 0 0 1 24 0 M83 452 a7 7 0 0 1 14 0" className="e-line" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="90" cy="458" r="2" className="e-dot" />
      <circle cx="113" cy="438" r="2.6" fill="#7cf29a" className="eave-night" />

      {/* Numbered callouts, explained in the legend */}
      {[
        [632, 372, 1],
        [560, 392, 2],
        [404, 300, 3],
        [90, 404, 4],
      ].map(([x, y, n]) => (
        <g key={n} className="e-callout">
          <circle cx={x} cy={y} r="13" />
          <text x={x} y={y + 4.2} textAnchor="middle" fontSize="12" fontWeight="600">
            {n}
          </text>
        </g>
      ))}
      <path d="M624 362 L612 348 M566 380 L586 350" className="e-leader" />
    </svg>
  );
}
