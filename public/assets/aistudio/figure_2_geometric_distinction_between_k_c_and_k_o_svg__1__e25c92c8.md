// ... existing code ...
  <!-- Axes -->
  <line x1="-100" y1="0" x2="375" y2="0" stroke="#6b7280" stroke-width="1.5"/>
  <line x1="0" y1="-360" x2="0" y2="50" stroke="#6b7280" stroke-width="1.5"/>
  <text x="360" y="-7" font-size="13" fill="#374151" font-weight="bold">+X</text>
  <text x="7" y="-345" font-size="13" fill="#374151" font-weight="bold">+Y</text>

  <!-- Exterior Square Q_c -->
  <polygon points="0,-180 135,0 315,-135 180,-315" fill="none" stroke="#fca5a5" stroke-width="1.5"/>

  <!-- Circle K_c (center O_c = (3.5, 3.5) -> (157.5, -157.5), R_c = 2.5 -> 112.5 px) -->
  <circle cx="157.5" cy="-157.5" r="112.5" fill="#ef4444" fill-opacity="0.14" stroke="#dc2626" stroke-width="2.5"/>
  <text x="232" y="-238" font-size="14" fill="#b91c1c" font-weight="bold">K_c (R_c = 2.50)</text>

  <!-- Thales Circumcircle K_o (center O_o = (1.5, 2.0) -> (67.5, -90), R_o = 2.5 -> 112.5 px) -->
  <circle cx="67.5" cy="-90" r="112.5" fill="#7c3aed" fill-opacity="0.06" stroke="#7c3aed" stroke-width="2.5" stroke-dasharray="7,4"/>
  <text x="-102" y="-178" font-size="14" fill="#6d28d9" font-weight="bold">K_o (R_o = 2.50)</text>

  <!-- Right Triangle OAB -->
  <polygon points="0,0 0,-180 135,0" fill="none" stroke="#111827" stroke-width="2.5"/>
  <polyline points="0,-14 14,-14 14,0" fill="none" stroke="#111827" stroke-width="1.5"/>

  <!-- Center Separation Vector O_o -> O_c -->
  <line x1="67.5" y1="-90" x2="157.5" y2="-157.5" stroke="#111827" stroke-width="2" stroke-dasharray="3,3"/>
  <rect x="120" y="-114" width="144" height="20" rx="3" fill="#ffffff" fill-opacity="0.92"/>
  <text x="124" y="-100" font-size="12" fill="#111827" font-weight="bold">||O_c - O_o|| = c/2 = 2.50</text>

  <!-- Centers O_o and O_c -->
  <circle cx="67.5" cy="-90" r="4.5" fill="#7c3aed"/>
  <text x="6" y="-72" font-size="12.5" fill="#6d28d9" font-weight="bold">O_o (1.50, 2.00)</text>

  <circle cx="157.5" cy="-157.5" r="4.5" fill="#dc2626"/>
  <text x="166" y="-154" font-size="12.5" fill="#b91c1c" font-weight="bold">O_c (3.50, 3.50)</text>

  <!-- Vertices -->
  <circle cx="0" cy="0" r="4" fill="#111827"/>
  <text x="-48" y="17" font-size="12.5" fill="#111827" font-weight="bold">O (0, 0)</text>
  <circle cx="0" cy="-180" r="4" fill="#111827"/>
  <text x="8" y="-186" font-size="12.5" fill="#111827" font-weight="bold">A (0.0, 4.0)</text>
  <circle cx="135" cy="0" r="4" fill="#111827"/>
  <text x="142" y="15" font-size="12.5" fill="#111827" font-weight="bold">B (3.0, 0.0)</text>
</svg>