<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 400" width="680" height="400" font-family="Arial, Helvetica, sans-serif">
  <rect x="0" y="0" width="680" height="400" fill="#ffffff"/>
  <!-- Plot Box: x in [75, 635] (width 560: log10(t) from -1 to +1, 280 px per decade, center at x=355), y in [42, 322] (height 280: ratio 0 to 1) -->
  <g stroke="#e5e7eb" stroke-width="1">
    <line x1="75" y1="42" x2="635" y2="42"/>
    <line x1="75" y1="112" x2="635" y2="112"/>
    <line x1="75" y1="182" x2="635" y2="182"/>
    <line x1="75" y1="252" x2="635" y2="252"/>
    <line x1="75" y1="322" x2="635" y2="322"/>
    <line x1="75" y1="42" x2="75" y2="322"/>
    <line x1="159.3" y1="42" x2="159.3" y2="322"/>
    <line x1="270.7" y1="42" x2="270.7" y2="322"/>
    <line x1="355" y1="42" x2="355" y2="322"/>
    <line x1="439.3" y1="42" x2="439.3" y2="322"/>
    <line x1="550.7" y1="42" x2="550.7" y2="322"/>
    <line x1="635" y1="42" x2="635" y2="322"/>
  </g>
  <!-- Axes -->
  <line x1="75" y1="322" x2="635" y2="322" stroke="#374151" stroke-width="1.6"/>
  <line x1="75" y1="42" x2="75" y2="322" stroke="#374151" stroke-width="1.6"/>

  <!-- Y labels -->
  <text x="66" y="46" font-size="12" text-anchor="end" fill="#374151">1.00</text>
  <text x="66" y="116" font-size="12" text-anchor="end" fill="#374151">0.75</text>
  <text x="66" y="186" font-size="12" text-anchor="end" fill="#374151">0.50</text>
  <text x="66" y="256" font-size="12" text-anchor="end" fill="#374151">0.25</text>
  <text x="66" y="326" font-size="12" text-anchor="end" fill="#374151">0.00</text>
  <text x="22" y="182" font-size="13.5" text-anchor="middle" fill="#111827" font-weight="bold" transform="rotate(-90 22 182)">Normalized Area Ratio K_x / K_c</text>

  <!-- X major tick marks & well-separated labels (t = 0.1, 0.2, 0.5, 1, 2, 5, 10) -->
  <g stroke="#374151" stroke-width="1.4">
    <line x1="75" y1="322" x2="75" y2="328"/>
    <line x1="159.3" y1="322" x2="159.3" y2="328"/>
    <line x1="270.7" y1="322" x2="270.7" y2="328"/>
    <line x1="355" y1="322" x2="355" y2="328"/>
    <line x1="439.3" y1="322" x2="439.3" y2="328"/>
    <line x1="550.7" y1="322" x2="550.7" y2="328"/>
    <line x1="635" y1="322" x2="635" y2="328"/>
  </g>
  <text x="75" y="344" font-size="12" text-anchor="middle" fill="#374151">0.1</text>
  <text x="159.3" y="344" font-size="12" text-anchor="middle" fill="#374151">0.2</text>
  <text x="270.7" y="344" font-size="12" text-anchor="middle" fill="#374151">0.5</text>
  <text x="355" y="344" font-size="12" text-anchor="middle" fill="#111827" font-weight="bold">1</text>
  <text x="439.3" y="344" font-size="12" text-anchor="middle" fill="#374151">2</text>
  <text x="550.7" y="344" font-size="12" text-anchor="middle" fill="#374151">5</text>
  <text x="635" y="344" font-size="12" text-anchor="middle" fill="#374151">10</text>
  <text x="355" y="374" font-size="13.5" text-anchor="middle" fill="#111827" font-weight="bold">Shape Parameter t = b / a (logarithmic scale)</text>

  <!-- Symmetry line t = 1 -->
  <line x1="355" y1="42" x2="355" y2="322" stroke="#6b7280" stroke-width="1.5" stroke-dasharray="5,4"/>
  <text x="363" y="59" font-size="12" fill="#374151" font-weight="bold">Symmetry (t = 1)</text>

  <!-- K_c/K_c = K_o/K_c = 1.00 -->
  <line x1="75" y1="42" x2="635" y2="42" stroke="#9333ea" stroke-width="2.4" stroke-dasharray="6,4"/>

  <!-- Exact K_a/K_c curve: y = 322 - 280 / (1 + 10^(2u)), x = 355 + 280*u -->
  <polyline fill="none" stroke="#2563eb" stroke-width="2.6" points="
    75.0,44.8 103.0,46.4 131.0,49.0 159.3,52.8 187.0,58.6 215.0,67.3 243.0,80.2 270.7,98.0 299.0,121.9 327.0,150.5 355.0,182.0 383.0,213.5 411.0,242.1 439.3,266.0 467.0,283.8 495.0,296.7 523.0,305.4 550.7,311.2 579.0,315.0 607.0,317.6 635.0,319.2
  "/>

  <!-- Exact K_b/K_c curve: y = 322 - 280 * (10^(2u) / (1 + 10^(2u))) -->
  <polyline fill="none" stroke="#059669" stroke-width="2.6" points="
    75.0,319.2 103.0,317.6 131.0,315.0 159.3,311.2 187.0,305.4 215.0,296.7 243.0,283.8 270.7,266.0 299.0,242.1 327.0,213.5 355.0,182.0 383.0,150.5 411.0,121.9 439.3,98.0 467.0,80.2 495.0,67.3 523.0,58.6 550.7,52.8 579.0,49.0 607.0,46.4 635.0,44.8
  "/>

  <!-- Exact K_i/K_c curve: y = 322 - 280 * ((1 + t - sqrt(1+t^2))^2 / (1+t^2)) -->
  <polyline fill="none" stroke="#d97706" stroke-width="2.6" points="
    75.0,319.5 103.0,318.1 131.0,315.8 159.3,312.4 187.0,307.3 215.0,300.4 243.0,291.8 270.7,282.8 299.0,275.4 327.0,271.4 355.0,274.0 383.0,271.4 411.0,275.4 439.3,282.8 467.0,291.8 495.0,300.4 523.0,307.3 550.7,312.4 579.0,315.8 607.0,318.1 635.0,319.5
  "/>

  <!-- Legend -->
  <rect x="462" y="138" width="160" height="98" rx="4" fill="#ffffff" fill-opacity="0.94" stroke="#d1d5db"/>
  <line x1="473" y1="156" x2="497" y2="156" stroke="#2563eb" stroke-width="2.6"/>
  <text x="505" y="160" font-size="12" fill="#111827">K_a / K_c</text>
  <line x1="473" y1="178" x2="497" y2="178" stroke="#059669" stroke-width="2.6"/>
  <text x="505" y="182" font-size="12" fill="#111827">K_b / K_c</text>
  <line x1="473" y1="200" x2="497" y2="200" stroke="#9333ea" stroke-width="2.4" stroke-dasharray="5,3"/>
  <text x="505" y="204" font-size="12" fill="#111827">K_c / K_c = K_o / K_c</text>
  <line x1="473" y1="222" x2="497" y2="222" stroke="#d97706" stroke-width="2.6"/>
  <text x="505" y="226" font-size="12" fill="#111827">K_i / K_c</text>
</svg>