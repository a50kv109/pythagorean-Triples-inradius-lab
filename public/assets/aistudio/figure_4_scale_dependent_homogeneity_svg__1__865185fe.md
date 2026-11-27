// ... existing code ...
  <!-- Y labels -->
  <text x="66" y="309" font-size="12" text-anchor="end" fill="#374151">0</text>
  <text x="66" y="267.5" font-size="12" text-anchor="end" fill="#374151">1</text>
  <text x="66" y="225.9" font-size="12" text-anchor="end" fill="#374151">2</text>
  <text x="66" y="184.4" font-size="12" text-anchor="end" fill="#374151">3</text>
  <text x="66" y="142.8" font-size="12" text-anchor="end" fill="#374151">4</text>
  <text x="66" y="101.3" font-size="12" text-anchor="end" fill="#374151">5</text>
  <text x="66" y="59.8" font-size="12" text-anchor="end" fill="#374151">6</text>
  <text x="24" y="170" font-size="13.5" text-anchor="middle" fill="#111827" font-weight="bold" transform="rotate(-90 24 170)">Relative Scaling Multiplier</text>

  <!-- X labels -->
  <text x="75" y="324" font-size="12" text-anchor="middle" fill="#374151">0.0</text>
  <text x="171" y="324" font-size="12" text-anchor="middle" fill="#374151">0.5</text>
  <text x="267" y="324" font-size="12" text-anchor="middle" fill="#111827" font-weight="bold">1.0</text>
  <text x="363" y="324" font-size="12" text-anchor="middle" fill="#374151">1.5</text>
  <text x="459" y="324" font-size="12" text-anchor="middle" fill="#374151">2.0</text>
  <text x="555" y="324" font-size="12" text-anchor="middle" fill="#374151">2.5</text>
  <text x="315" y="352" font-size="13.5" text-anchor="middle" fill="#111827" font-weight="bold">Proportional Scale Parameter λ</text>

  <!-- Degree-1 Linear Growth: y = 305 - 41.538 * lambda -->
  <line x1="75" y1="305" x2="555" y2="201.2" stroke="#2563eb" stroke-width="2.6"/>

  <!-- Degree-2 Quadratic Growth: y = 305 - 41.538 * lambda^2 -->
  <polyline fill="none" stroke="#dc2626" stroke-width="2.6" stroke-dasharray="6,4" points="
    75.0,305.0 113.4,303.3 151.8,298.4 190.2,290.0 228.6,278.4 267.0,263.5 305.4,245.2 343.8,223.6 382.2,198.6 420.6,170.4 459.0,138.8 497.4,104.0 535.8,65.8 555.0,45.4
  "/>

  <!-- Reference Point lambda = 1 -->
  <circle cx="267" cy="263.5" r="4.8" fill="#111827"/>
  <text x="276" y="279" font-size="12" fill="#111827" font-weight="bold">Reference (λ = 1.0)</text>

  <!-- Legend -->
  <rect x="90" y="48" width="295" height="66" rx="4" fill="#ffffff" fill-opacity="0.94" stroke="#d1d5db"/>
  <line x1="102" y1="68" x2="132" y2="68" stroke="#2563eb" stroke-width="2.6"/>
  <text x="140" y="72" font-size="12" fill="#111827">Degree 1 (∝ λ¹): Radii R_x, Diameters D_x, √K_x</text>
  <line x1="102" y1="94" x2="132" y2="94" stroke="#dc2626" stroke-width="2.6" stroke-dasharray="6,4"/>
  <text x="140" y="98" font-size="12" fill="#111827">Degree 2 (∝ λ²): Circle Areas K_x, Square Areas Q_x</text>
</svg>