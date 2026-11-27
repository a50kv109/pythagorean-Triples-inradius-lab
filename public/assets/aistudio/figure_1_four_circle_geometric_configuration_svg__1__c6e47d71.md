// ... existing code ...
  <!-- Axes -->
  <line x1="-240" y1="0" x2="375" y2="0" stroke="#6b7280" stroke-width="1.5"/>
  <line x1="0" y1="-360" x2="0" y2="160" stroke="#6b7280" stroke-width="1.5"/>
  <text x="360" y="-7" font-size="13" fill="#374151" font-weight="bold">+X</text>
  <text x="7" y="-345" font-size="13" fill="#374151" font-weight="bold">+Y</text>

  <!-- Square Q_a (a=4 -> 180px) and Circle K_a (center (-90,-90), R=90) -->
  <rect x="-180" y="-180" width="180" height="180" fill="#3b82f6" fill-opacity="0.08" stroke="#2563eb" stroke-width="2"/>
  <circle cx="-90" cy="-90" r="90" fill="#3b82f6" fill-opacity="0.16" stroke="#1d4ed8" stroke-width="2"/>
  <line x1="-90" y1="-90" x2="-90" y2="0" stroke="#1d4ed8" stroke-width="1.2" stroke-dasharray="4,3"/>
  <circle cx="-90" cy="-90" r="3.5" fill="#1d4ed8"/>
  <text x="-172" y="-160" font-size="13" fill="#1d4ed8" font-weight="bold">Q_a</text>
  <text x="-102" y="-100" font-size="13" fill="#1e3a8a" font-weight="bold">K_a</text>
  <text x="-84" y="-85" font-size="12" fill="#1e3a8a">O_a (-2.0, 2.0)</text>

  <!-- Square Q_b (b=3 -> 135px) and Circle K_b (center (67.5, 67.5), R=67.5) -->
  <rect x="0" y="0" width="135" height="135" fill="#10b981" fill-opacity="0.08" stroke="#059669" stroke-width="2"/>
  <circle cx="67.5" cy="67.5" r="67.5" fill="#10b981" fill-opacity="0.16" stroke="#047857" stroke-width="2"/>
  <line x1="67.5" y1="67.5" x2="135" y2="67.5" stroke="#047857" stroke-width="1.2" stroke-dasharray="4,3"/>
  <circle cx="67.5" cy="67.5" r="3.5" fill="#047857"/>
  <text x="110" y="128" font-size="13" fill="#047857" font-weight="bold">Q_b</text>
  <text x="56" y="57" font-size="13" fill="#064e3b" font-weight="bold">K_b</text>
  <text x="38" y="83" font-size="12" fill="#064e3b">O_b (1.5, -1.5)</text>

  <!-- Square Q_c (vertices (0,-180), (135,0), (315,-135), (180,-315)) and Circle K_c (center (157.5, -157.5), R=112.5) -->
  <polygon points="0,-180 135,0 315,-135 180,-315" fill="#ef4444" fill-opacity="0.08" stroke="#dc2626" stroke-width="2"/>
  <circle cx="157.5" cy="-157.5" r="112.5" fill="#ef4444" fill-opacity="0.15" stroke="#b91c1c" stroke-width="2"/>
  <line x1="157.5" y1="-157.5" x2="225" y2="-67.5" stroke="#b91c1c" stroke-width="1.2" stroke-dasharray="4,3"/>
  <circle cx="157.5" cy="-157.5" r="3.5" fill="#b91c1c"/>
  <text x="182" y="-292" font-size="13" fill="#b91c1c" font-weight="bold">Q_c</text>
  <text x="148" y="-170" font-size="14" fill="#7f1d1d" font-weight="bold">K_c</text>
  <text x="164" y="-151" font-size="12" fill="#7f1d1d">O_c (3.5, 3.5)</text>

  <!-- Right Triangle OAB -->
  <polygon points="0,0 0,-180 135,0" fill="#6366f1" fill-opacity="0.06" stroke="#1e1b4b" stroke-width="2.5"/>
  <polyline points="0,-14 14,-14 14,0" fill="none" stroke="#1e1b4b" stroke-width="1.5"/>

  <!-- Incircle K_i (center (45, -45), r=45) -->
  <circle cx="45" cy="-45" r="45" fill="#d97706" fill-opacity="0.24" stroke="#b45309" stroke-width="2"/>
  <line x1="0" y1="-45" x2="45" y2="-45" stroke="#b45309" stroke-width="1.2" stroke-dasharray="3,2"/>
  <circle cx="45" cy="-45" r="3.5" fill="#b45309"/>
  <text x="38" y="-55" font-size="13" fill="#78350f" font-weight="bold">K_i</text>
  <text x="28" y="-29" font-size="11.5" fill="#78350f">I (1,1), r=1.00</text>

  <!-- Side Labels & Vertices -->
  <text x="-58" y="-86" font-size="13" fill="#1d4ed8" font-weight="bold">a = 4.00</text>
  <text x="45" y="18" font-size="13" fill="#047857" font-weight="bold">b = 3.00</text>
  <text x="74" y="-94" font-size="13" fill="#b91c1c" font-weight="bold">c = 5.00</text>

  <circle cx="0" cy="0" r="4" fill="#111827"/>
  <text x="-48" y="17" font-size="12.5" fill="#111827" font-weight="bold">O (0, 0)</text>
  <circle cx="0" cy="-180" r="4" fill="#111827"/>
  <text x="8" y="-186" font-size="12.5" fill="#111827" font-weight="bold">A (0.0, 4.0)</text>
  <circle cx="135" cy="0" r="4" fill="#111827"/>
  <text x="142" y="-6" font-size="12.5" fill="#111827" font-weight="bold">B (3.0, 0.0)</text>
</svg>