/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React from 'react';
import {
  ActiveModuleId,
  BoardLayerFilter,
  FourCirclesCalculations,
  HoveredObject,
  Point2D,
} from '../../types/geometry.ts';
import { toScreen } from '../../geometry/transforms.ts';
import { Translations, TRANSLATIONS } from '../../i18n/translations.ts';

interface FourCirclesViewProps {
  calc: FourCirclesCalculations;
  origin: Point2D;
  scale: number;
  activeModule: ActiveModuleId;
  layerFilter: BoardLayerFilter;
  showLabels?: boolean;
  showCenters?: boolean;
  showRadii?: boolean;
  showCircumcircle?: boolean;
  onHoverObject?: (obj: HoveredObject | null) => void;
  t?: Translations;
}

export const FourCirclesView: React.FC<FourCirclesViewProps> = ({
  calc,
  origin,
  scale,
  activeModule,
  layerFilter,
  showLabels = true,
  showCenters = true,
  showRadii = true,
  showCircumcircle = true,
  onHoverObject,
  t = TRANSLATIONS.ru,
}) => {
  const {
    squareA,
    squareB,
    squareC,
    circleA,
    circleB,
    circleC,
    incircle,
    circumcircle,
    triangle,
  } = calc;

  // Screen coordinates of squares
  const pO = toScreen(squareA.O, origin, scale);
  const pA = toScreen(squareA.legVertex, origin, scale);
  const pCa = toScreen(squareA.outerVertex, origin, scale);
  const pDa = toScreen(squareA.baseVertex, origin, scale);

  const pB = toScreen(squareB.legVertex, origin, scale);
  const pCb = toScreen(squareB.outerVertex, origin, scale);
  const pDb = toScreen(squareB.baseVertex, origin, scale);

  const pBc = toScreen(squareC.Bc, origin, scale);
  const pAc = toScreen(squareC.Ac, origin, scale);

  // Screen coordinates of 5 circle centers & radii in pixels
  const pOa = toScreen(circleA.center, origin, scale);
  const pOb = toScreen(circleB.center, origin, scale);
  const pOc = toScreen(circleC.center, origin, scale);
  const pI = toScreen(incircle.center, origin, scale);
  const pOo = toScreen(circumcircle.center, origin, scale);

  const pxRa = circleA.radius * scale;
  const pxRb = circleB.radius * scale;
  const pxRc = circleC.radius * scale;
  const pxRi = incircle.radius * scale;
  const pxRo = circumcircle.radius * scale;

  // Screen coordinates of tangency points
  const pTa = toScreen(incircle.tangencyOA, origin, scale);
  const pTb = toScreen(incircle.tangencyOB, origin, scale);
  const pTc = toScreen(incircle.tangencyAB, origin, scale);

  // Layer visibility logic (preserves existing 4 filters + 3 new 5-circle filters)
  const showSquares =
    layerFilter === 'all' || layerFilter === 'squares' || layerFilter === 'square_circles';
  const showSquareCircles =
    layerFilter === 'all' ||
    layerFilter === 'square_circles' ||
    layerFilter === 'four_circles_only' ||
    layerFilter === 'five_circles';
  const showIncircle =
    layerFilter === 'all' ||
    layerFilter === 'triangle_incircle' ||
    layerFilter === 'four_circles_only' ||
    layerFilter === 'five_circles' ||
    layerFilter === 'incenter_partition';
  const showThales =
    layerFilter === 'thales_only' ||
    (showCircumcircle && (layerFilter === 'all' || layerFilter === 'five_circles'));

  // Module emphasis opacities
  const exteriorOpacity =
    activeModule === 'incircle_focus' || activeModule === 'thales_circumcircle' ? 0.26 : 1;
  const incircleFocusGlow = activeModule === 'incircle_focus';
  const thalesFocusGlow =
    activeModule === 'thales_circumcircle' || layerFilter === 'thales_only';

  // Radial anchor on top arc of K_o between vertex A and O_c: math direction (a - b, a + b) / (sqrt(2) * c)
  const thalesAnchorMath: Point2D = {
    x: circumcircle.center.x + (triangle.a - triangle.b) / (2 * Math.SQRT2),
    y: circumcircle.center.y + (triangle.a + triangle.b) / (2 * Math.SQRT2),
  };
  const pThalesArc = toScreen(thalesAnchorMath, origin, scale);
  const arcVecLen = Math.hypot(pThalesArc.x - pOo.x, pThalesArc.y - pOo.y) || 1;
  const arcUnitX = (pThalesArc.x - pOo.x) / arcVecLen;
  const arcUnitY = (pThalesArc.y - pOo.y) / arcVecLen;

  // Inward normal from midpoint O_o of AB toward triangle interior (opposite to c label)
  const inNx = -triangle.a / triangle.c;
  const inNy = triangle.b / triangle.c;

  return (
    <g className="four-circles-view-group">
      {/* ================================================================= */}
      {/* 1. Three Exterior Squares Qa, Qb, Qc                              */}
      {/* ================================================================= */}
      {showSquares && (
        <g style={{ opacity: exteriorOpacity }} className="transition-opacity duration-150">
          {/* Square Qa on vertical leg OA */}
          <polygon
            points={`${pO.x},${pO.y} ${pA.x},${pA.y} ${pCa.x},${pCa.y} ${pDa.x},${pDa.y}`}
            fill="#2563eb"
            fillOpacity="0.05"
            stroke="#3b82f6"
            strokeWidth="1.6"
            strokeLinejoin="round"
            className="cursor-pointer"
            onPointerEnter={() =>
              onHoverObject?.({
                id: 'square-Qa',
                title: t.hover.squareQaTitle,
                details: `${t.hover.sideLabel} a = ${squareA.side.toFixed(2)}, ${t.hover.areaLabel} a² = ${squareA.area.toFixed(2)}`,
                category: 'polygon',
              })
            }
            onPointerLeave={() => onHoverObject?.(null)}
          />

          {/* Square Qb on horizontal leg OB */}
          <polygon
            points={`${pO.x},${pO.y} ${pB.x},${pB.y} ${pCb.x},${pCb.y} ${pDb.x},${pDb.y}`}
            fill="#059669"
            fillOpacity="0.05"
            stroke="#10b981"
            strokeWidth="1.6"
            strokeLinejoin="round"
            className="cursor-pointer"
            onPointerEnter={() =>
              onHoverObject?.({
                id: 'square-Qb',
                title: t.hover.squareQbTitle,
                details: `${t.hover.sideLabel} b = ${squareB.side.toFixed(2)}, ${t.hover.areaLabel} b² = ${squareB.area.toFixed(2)}`,
                category: 'polygon',
              })
            }
            onPointerLeave={() => onHoverObject?.(null)}
          />

          {/* Square Qc on hypotenuse AB */}
          <polygon
            points={`${pA.x},${pA.y} ${pB.x},${pB.y} ${pBc.x},${pBc.y} ${pAc.x},${pAc.y}`}
            fill="#e11d48"
            fillOpacity="0.05"
            stroke="#f43f5e"
            strokeWidth="1.8"
            strokeLinejoin="round"
            className="cursor-pointer"
            onPointerEnter={() =>
              onHoverObject?.({
                id: 'square-Qc',
                title: t.hover.squareQcTitle,
                details: `${t.hover.sideLabel} c = ${squareC.side.toFixed(3)}, ${t.hover.areaLabel} c² = ${squareC.area.toFixed(2)}`,
                category: 'polygon',
              })
            }
            onPointerLeave={() => onHoverObject?.(null)}
          />

          {/* Square corner labels */}
          {showLabels && (
            <>
              <text
                x={pxRa >= 24 ? pCa.x + 6 : pCa.x - 4}
                y={pxRa >= 24 ? pCa.y + 14 : pCa.y - 5}
                textAnchor={pxRa >= 24 ? 'start' : 'end'}
                stroke="#f8fafc"
                strokeWidth="2.8"
                style={{ paintOrder: 'stroke' }}
                className="text-[10px] font-mono font-semibold fill-blue-700/85 select-none pointer-events-none"
              >
                Q_a
              </text>
              <text
                x={pxRb >= 28 ? pCb.x - 6 : pCb.x + 5}
                y={pxRb >= 28 ? pCb.y - 6 : pCb.y - 4}
                textAnchor={pxRb >= 28 ? 'end' : 'start'}
                stroke="#f8fafc"
                strokeWidth="2.8"
                style={{ paintOrder: 'stroke' }}
                className="text-[10px] font-mono font-semibold fill-emerald-700/85 select-none pointer-events-none"
              >
                Q_b
              </text>
              <text
                x={pAc.x + 6}
                y={pAc.y + 16}
                stroke="#f8fafc"
                strokeWidth="2.8"
                style={{ paintOrder: 'stroke' }}
                className="text-[10px] font-mono font-semibold fill-rose-700/85 select-none pointer-events-none"
              >
                Q_c
              </text>
            </>
          )}
        </g>
      )}

      {/* ================================================================= */}
      {/* 2. Three Circles Ka, Kb, Kc Inscribed in the Squares              */}
      {/* ================================================================= */}
      {showSquareCircles && (
        <g style={{ opacity: exteriorOpacity }} className="transition-opacity duration-150">
          {/* Circle Ka (Blue) */}
          <circle
            cx={pOa.x}
            cy={pOa.y}
            r={pxRa}
            fill="#3b82f6"
            fillOpacity="0.16"
            stroke="#2563eb"
            strokeWidth="2.2"
            className="cursor-pointer"
            onPointerEnter={() =>
              onHoverObject?.({
                id: 'circle-Ka',
                title: t.hover.circleKaTitle,
                details: `d = a = ${circleA.diameter.toFixed(2)} · K_a = ${circleA.area.toFixed(3)} · √K_a = ${circleA.sqrtArea.toFixed(3)}`,
                category: 'circle',
              })
            }
            onPointerLeave={() => onHoverObject?.(null)}
          />

          {/* Circle Kb (Emerald) */}
          <circle
            cx={pOb.x}
            cy={pOb.y}
            r={pxRb}
            fill="#10b981"
            fillOpacity="0.16"
            stroke="#059669"
            strokeWidth="2.2"
            className="cursor-pointer"
            onPointerEnter={() =>
              onHoverObject?.({
                id: 'circle-Kb',
                title: t.hover.circleKbTitle,
                details: `d = b = ${circleB.diameter.toFixed(2)} · K_b = ${circleB.area.toFixed(3)} · √K_b = ${circleB.sqrtArea.toFixed(3)}`,
                category: 'circle',
              })
            }
            onPointerLeave={() => onHoverObject?.(null)}
          />

          {/* Circle Kc (Crimson / Rose) */}
          <circle
            cx={pOc.x}
            cy={pOc.y}
            r={pxRc}
            fill="#f43f5e"
            fillOpacity="0.14"
            stroke="#e11d48"
            strokeWidth="2.4"
            className="cursor-pointer"
            onPointerEnter={() =>
              onHoverObject?.({
                id: 'circle-Kc',
                title: t.hover.circleKcTitle,
                details: `d = c = ${circleC.diameter.toFixed(3)} · K_c = ${circleC.area.toFixed(3)} · √K_c = ${circleC.sqrtArea.toFixed(3)}`,
                category: 'circle',
              })
            }
            onPointerLeave={() => onHoverObject?.(null)}
          />

          {/* Radii Lines oriented away from side labels a, b, c */}
          {(showRadii || activeModule === 'identity_proof') && (
            <>
              <line
                x1={pOa.x}
                y1={pOa.y}
                x2={pOa.x}
                y2={pOa.y + pxRa}
                stroke="#1d4ed8"
                strokeWidth="1.4"
                strokeDasharray="3,2"
                className="pointer-events-none"
              />
              <line
                x1={pOb.x}
                y1={pOb.y}
                x2={pOb.x + pxRb}
                y2={pOb.y}
                stroke="#047857"
                strokeWidth="1.4"
                strokeDasharray="3,2"
                className="pointer-events-none"
              />
              <line
                x1={pOc.x}
                y1={pOc.y}
                x2={toScreen(circleC.tangencyPoints[1], origin, scale).x}
                y2={toScreen(circleC.tangencyPoints[1], origin, scale).y}
                stroke="#be123c"
                strokeWidth="1.4"
                strokeDasharray="3,2"
                className="pointer-events-none"
              />
            </>
          )}

          {/* Tangency Rings (hollow) vs Solid Circle Centers Oa, Ob, Oc */}
          {showCenters && (
            <>
              {[...circleA.tangencyPoints, ...circleB.tangencyPoints, ...circleC.tangencyPoints].map(
                (pt, idx) => {
                  const sPt = toScreen(pt, origin, scale);
                  const strokeColor = idx < 4 ? '#2563eb' : idx < 8 ? '#059669' : '#e11d48';
                  return (
                    <circle
                      key={`sq-tan-${idx}`}
                      cx={sPt.x}
                      cy={sPt.y}
                      r="2.4"
                      fill="#ffffff"
                      stroke={strokeColor}
                      strokeWidth="1.4"
                      className="pointer-events-none"
                    />
                  );
                }
              )}

              {/* Circle Centers Oa, Ob, Oc */}
              <circle cx={pOa.x} cy={pOa.y} r="3.8" fill="#1d4ed8" stroke="#fff" strokeWidth="1.3" className="pointer-events-none" />
              <circle cx={pOb.x} cy={pOb.y} r="3.8" fill="#047857" stroke="#fff" strokeWidth="1.3" className="pointer-events-none" />
              <circle cx={pOc.x} cy={pOc.y} r="3.8" fill="#be123c" stroke="#fff" strokeWidth="1.3" className="pointer-events-none" />
            </>
          )}

          {/* Labels for Ka, Kb, Kc & Centers Oa, Ob, Oc */}
          {showLabels && (
            <>
              {pxRa >= 24 ? (
                <g transform={`translate(${pOa.x}, ${pOa.y - (showCenters ? 13 : 0)})`} className="pointer-events-none select-none">
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    stroke="#f8fafc"
                    strokeWidth="3"
                    style={{ paintOrder: 'stroke' }}
                    className="text-xs font-mono font-bold fill-blue-900"
                  >
                    K_a
                  </text>
                  {activeModule === 'identity_proof' && pxRa > 36 && (
                    <text
                      y="28"
                      textAnchor="middle"
                      stroke="#f8fafc"
                      strokeWidth="2.8"
                      style={{ paintOrder: 'stroke' }}
                      className="text-[10px] font-mono font-semibold fill-blue-700"
                    >
                      √K_a={circleA.sqrtArea.toFixed(2)}
                    </text>
                  )}
                </g>
              ) : (
                <text
                  x={pOa.x}
                  y={pA.y - 7}
                  textAnchor="middle"
                  stroke="#f8fafc"
                  strokeWidth="3"
                  style={{ paintOrder: 'stroke' }}
                  className="text-xs font-mono font-bold fill-blue-900 select-none pointer-events-none"
                >
                  K_a
                </text>
              )}

              {pxRb >= 28 ? (
                <g transform={`translate(${pOb.x}, ${pOb.y - (showCenters ? 13 : 0)})`} className="pointer-events-none select-none">
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    stroke="#f8fafc"
                    strokeWidth="3"
                    style={{ paintOrder: 'stroke' }}
                    className="text-xs font-mono font-bold fill-emerald-900"
                  >
                    K_b
                  </text>
                  {activeModule === 'identity_proof' && pxRb > 36 && (
                    <text
                      y="28"
                      textAnchor="middle"
                      stroke="#f8fafc"
                      strokeWidth="2.8"
                      style={{ paintOrder: 'stroke' }}
                      className="text-[10px] font-mono font-semibold fill-emerald-700"
                    >
                      √K_b={circleB.sqrtArea.toFixed(2)}
                    </text>
                  )}
                </g>
              ) : (
                <text
                  x={pB.x + 8}
                  y={pOb.y + 4}
                  textAnchor="start"
                  stroke="#f8fafc"
                  strokeWidth="3"
                  style={{ paintOrder: 'stroke' }}
                  className="text-xs font-mono font-bold fill-emerald-900 select-none pointer-events-none"
                >
                  K_b
                </text>
              )}

              {pxRc > 22 && (
                <g transform={`translate(${pOc.x}, ${pOc.y - (showCenters ? 14 : 0)})`} className="pointer-events-none select-none">
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    stroke="#f8fafc"
                    strokeWidth="3"
                    style={{ paintOrder: 'stroke' }}
                    className="text-xs font-mono font-bold fill-rose-900"
                  >
                    K_c
                  </text>
                  {activeModule === 'identity_proof' && pxRc > 38 && (
                    <text
                      y="29"
                      textAnchor="middle"
                      stroke="#f8fafc"
                      strokeWidth="2.8"
                      style={{ paintOrder: 'stroke' }}
                      className="text-[10px] font-mono font-semibold fill-rose-700"
                    >
                      √K_c={circleC.sqrtArea.toFixed(2)}
                    </text>
                  )}
                </g>
              )}

              {showCenters && (
                <>
                  {pxRa >= 30 && (
                    <text
                      x={pOa.x + 8}
                      y={pOa.y + 4}
                      stroke="#f8fafc"
                      strokeWidth="2.5"
                      style={{ paintOrder: 'stroke' }}
                      className="text-[10px] font-mono font-semibold fill-blue-800 select-none pointer-events-none"
                    >
                      O_a
                    </text>
                  )}
                  {pxRb >= 32 && (
                    <text
                      x={pOb.x}
                      y={pOb.y + 14}
                      textAnchor="middle"
                      stroke="#f8fafc"
                      strokeWidth="2.5"
                      style={{ paintOrder: 'stroke' }}
                      className="text-[10px] font-mono font-semibold fill-emerald-800 select-none pointer-events-none"
                    >
                      O_b
                    </text>
                  )}
                  {pxRc >= 30 && (
                    <text
                      x={pOc.x}
                      y={pOc.y + 14}
                      textAnchor="middle"
                      stroke="#f8fafc"
                      strokeWidth="2.5"
                      style={{ paintOrder: 'stroke' }}
                      className="text-[10px] font-mono font-semibold fill-rose-800 select-none pointer-events-none"
                    >
                      O_c
                    </text>
                  )}
                </>
              )}
            </>
          )}
        </g>
      )}

      {/* ================================================================= */}
      {/* 3. Fourth Circle Ki: Standard Incircle Strictly Inside Triangle   */}
      {/* ================================================================= */}
      {showIncircle && (
        <g
          className="incircle-Ki-group transition-opacity duration-150"
          style={{
            opacity:
              activeModule === 'thales_circumcircle' && layerFilter !== 'five_circles'
                ? 0.35
                : 1,
          }}
        >
          <circle
            cx={pI.x}
            cy={pI.y}
            r={pxRi}
            fill="#f59e0b"
            fillOpacity={incircleFocusGlow ? '0.32' : '0.24'}
            stroke="#b45309"
            strokeWidth={incircleFocusGlow ? '2.8' : '2.3'}
            className="cursor-pointer"
            onPointerEnter={() =>
              onHoverObject?.({
                id: 'circle-Ki',
                title: t.hover.circleKiTitle,
                details: `r = (a+b-c)/2 = ${incircle.radius.toFixed(3)} · K_i = ${incircle.area.toFixed(3)} · √K_i = ${incircle.sqrtArea.toFixed(3)}`,
                category: 'circle',
              })
            }
            onPointerLeave={() => onHoverObject?.(null)}
          />

          {/* Incircle radii to the 3 tangency points */}
          {(showRadii || incircleFocusGlow || activeModule === 'identity_proof') && (
            <>
              <line
                x1={pI.x}
                y1={pI.y}
                x2={pTa.x}
                y2={pTa.y}
                stroke="#92400e"
                strokeWidth="1.4"
                strokeDasharray="3,2"
                className="pointer-events-none"
              />
              <line
                x1={pI.x}
                y1={pI.y}
                x2={pTb.x}
                y2={pTb.y}
                stroke="#92400e"
                strokeWidth="1.4"
                strokeDasharray="3,2"
                className="pointer-events-none"
              />
              <line
                x1={pI.x}
                y1={pI.y}
                x2={pTc.x}
                y2={pTc.y}
                stroke="#92400e"
                strokeWidth="1.6"
                className="pointer-events-none"
              />
            </>
          )}

          {/* Tangency points on OA, OB, AB (hollow rings) & solid Incenter I */}
          {(showCenters || incircleFocusGlow) && (
            <>
              <circle
                cx={pTa.x}
                cy={pTa.y}
                r="2.8"
                fill="#ffffff"
                stroke="#b45309"
                strokeWidth="1.6"
                className="cursor-pointer"
                onPointerEnter={() =>
                  onHoverObject?.({
                    id: 'tan-OA',
                    title: t.hover.tanOATitle,
                    details: `T_a = (0, ${incircle.radius.toFixed(3)})`,
                    category: 'vertex',
                  })
                }
                onPointerLeave={() => onHoverObject?.(null)}
              />
              <circle
                cx={pTb.x}
                cy={pTb.y}
                r="2.8"
                fill="#ffffff"
                stroke="#b45309"
                strokeWidth="1.6"
                className="cursor-pointer"
                onPointerEnter={() =>
                  onHoverObject?.({
                    id: 'tan-OB',
                    title: t.hover.tanOBTitle,
                    details: `T_b = (${incircle.radius.toFixed(3)}, 0)`,
                    category: 'vertex',
                  })
                }
                onPointerLeave={() => onHoverObject?.(null)}
              />
              <circle
                cx={pTc.x}
                cy={pTc.y}
                r="3"
                fill="#ffffff"
                stroke="#b45309"
                strokeWidth="1.7"
                className="cursor-pointer"
                onPointerEnter={() =>
                  onHoverObject?.({
                    id: 'tan-AB',
                    title: t.hover.tanABTitle,
                    details: `T_c = (${incircle.tangencyAB.x.toFixed(3)}, ${incircle.tangencyAB.y.toFixed(3)})`,
                    category: 'vertex',
                  })
                }
                onPointerLeave={() => onHoverObject?.(null)}
              />

              {/* Incenter I = (r, r) */}
              <circle
                cx={pI.x}
                cy={pI.y}
                r="3.8"
                fill="#92400e"
                stroke="#ffffff"
                strokeWidth="1.4"
                className="cursor-pointer"
                onPointerEnter={() =>
                  onHoverObject?.({
                    id: 'incenter-I',
                    title: t.hover.incenterTitle,
                    details: `I = (${incircle.center.x.toFixed(3)}, ${incircle.center.y.toFixed(3)}), r = ${incircle.radius.toFixed(3)}`,
                    category: 'vertex',
                  })
                }
                onPointerLeave={() => onHoverObject?.(null)}
              />
            </>
          )}

          {/* Labels for Ki, I, and radius r positioned cleanly inside or around Ki */}
          {showLabels && (
            <>
              <text
                x={pI.x}
                y={pxRi >= 20 ? pI.y - Math.max(10, pxRi * 0.44) : pI.y - pxRi - 9}
                textAnchor="middle"
                stroke="#f8fafc"
                strokeWidth="3"
                style={{ paintOrder: 'stroke' }}
                className="text-xs font-mono font-bold fill-amber-950 select-none pointer-events-none"
              >
                K_i
              </text>
              {(showRadii || incircleFocusGlow) && (
                <text
                  x={pxRi >= 20 ? pI.x : pI.x + pxRi + 7}
                  y={pxRi >= 20 ? pI.y + Math.max(13, pxRi * 0.48) : pI.y + 4}
                  textAnchor={pxRi >= 20 ? 'middle' : 'start'}
                  stroke="#f8fafc"
                  strokeWidth="3"
                  style={{ paintOrder: 'stroke' }}
                  className="text-[10px] font-mono font-bold fill-amber-900 select-none pointer-events-none"
                >
                  r={incircle.radius.toFixed(2)}
                </text>
              )}
              {showCenters && pxRi >= 22 && (
                <text
                  x={pI.x - 7}
                  y={pI.y + 3}
                  textAnchor="end"
                  stroke="#f8fafc"
                  strokeWidth="2.5"
                  style={{ paintOrder: 'stroke' }}
                  className="text-[10px] font-mono font-semibold fill-amber-900 select-none pointer-events-none"
                >
                  I
                </text>
              )}
              {incircleFocusGlow && pxRi > 16 && (
                <>
                  <text
                    x={pTa.x - 16}
                    y={pTa.y + 3}
                    stroke="#f8fafc"
                    strokeWidth="2.5"
                    style={{ paintOrder: 'stroke' }}
                    className="text-[10px] font-mono fill-amber-900 select-none pointer-events-none"
                  >
                    T_a
                  </text>
                  <text
                    x={pTb.x - 4}
                    y={pTb.y + 12}
                    stroke="#f8fafc"
                    strokeWidth="2.5"
                    style={{ paintOrder: 'stroke' }}
                    className="text-[10px] font-mono fill-amber-900 select-none pointer-events-none"
                  >
                    T_b
                  </text>
                  <text
                    x={pTc.x + 6}
                    y={pTc.y - 4}
                    stroke="#f8fafc"
                    strokeWidth="2.5"
                    style={{ paintOrder: 'stroke' }}
                    className="text-[10px] font-mono fill-amber-900 select-none pointer-events-none"
                  >
                    T_c
                  </text>
                </>
              )}
            </>
          )}
        </g>
      )}

      {/* ================================================================= */}
      {/* 4. Fifth Circle Ko: Thales Circumcircle Around Right Triangle OAB */}
      {/* ================================================================= */}
      {showThales && (
        <g className="thales-circumcircle-Ko-group">
          {/* Subtle area tint (pointer-events-none so inner circles remain inspectable) */}
          <circle
            cx={pOo.x}
            cy={pOo.y}
            r={pxRo}
            fill="#7c3aed"
            fillOpacity={thalesFocusGlow ? '0.09' : '0.04'}
            stroke="#7c3aed"
            strokeWidth={thalesFocusGlow ? '2.6' : '2.1'}
            strokeDasharray={thalesFocusGlow ? '7,4' : '6,3'}
            className="pointer-events-none"
          />

          {/* Interactive perimeter hit-ring for K_o hover inspection */}
          <circle
            cx={pOo.x}
            cy={pOo.y}
            r={pxRo}
            fill="none"
            stroke="transparent"
            strokeWidth="11"
            pointerEvents="stroke"
            className="cursor-pointer"
            onPointerEnter={() =>
              onHoverObject?.({
                id: 'circle-Ko',
                title: t.hover.circleKoTitle,
                details: `D_o = c = ${circumcircle.diameter.toFixed(3)} · R_o = ${circumcircle.radius.toFixed(3)} · K_o = ${circumcircle.area.toFixed(3)} · L_o = ${circumcircle.circumference.toFixed(3)}`,
                category: 'circle',
              })
            }
            onPointerLeave={() => onHoverObject?.(null)}
          />

          {/* Diameter AB highlight & equal-radius segments to vertices A, B, O when focused */}
          {thalesFocusGlow && (
            <>
              <line
                x1={pA.x}
                y1={pA.y}
                x2={pB.x}
                y2={pB.y}
                stroke="#6d28d9"
                strokeWidth="2.8"
                strokeOpacity="0.65"
                className="cursor-pointer"
                onPointerEnter={() =>
                  onHoverObject?.({
                    id: 'thales-diameter-AB',
                    title: t.hover.thalesDiameterTitle,
                    details: `D_o = |AB| = c = ${circumcircle.diameter.toFixed(3)} · O_o = (${circumcircle.center.x.toFixed(2)}, ${circumcircle.center.y.toFixed(2)})`,
                    category: 'segment',
                  })
                }
                onPointerLeave={() => onHoverObject?.(null)}
              />
              {/* Median / circumradius from O_o to right-angle vertex O */}
              <line
                x1={pOo.x}
                y1={pOo.y}
                x2={pO.x}
                y2={pO.y}
                stroke="#7c3aed"
                strokeWidth="1.5"
                strokeDasharray="4,3"
                strokeOpacity="0.85"
                className="pointer-events-none"
              />
              {/* Vertex coincidence rings on O, A, B */}
              {[pO, pA, pB].map((vPt, idx) => (
                <circle
                  key={`ko-vertex-ring-${idx}`}
                  cx={vPt.x}
                  cy={vPt.y}
                  r="7"
                  fill="none"
                  stroke="#7c3aed"
                  strokeWidth="1.6"
                  strokeOpacity="0.85"
                  className="pointer-events-none"
                />
              ))}
            </>
          )}

          {/* Circumradius segment R_o toward clear top-arc point P_thalesArc */}
          {(showRadii || thalesFocusGlow) && (
            <>
              <line
                x1={pOo.x}
                y1={pOo.y}
                x2={pThalesArc.x}
                y2={pThalesArc.y}
                stroke="#6d28d9"
                strokeWidth="1.6"
                strokeDasharray="4,3"
                className="pointer-events-none"
              />
              <line
                x1={pOo.x}
                y1={pOo.y}
                x2={pThalesArc.x}
                y2={pThalesArc.y}
                stroke="transparent"
                strokeWidth="9"
                className="cursor-pointer"
                onPointerEnter={() =>
                  onHoverObject?.({
                    id: 'radius-Ro',
                    title: t.hover.thalesRadiusTitle,
                    details: `R_o = c/2 = ${circumcircle.radius.toFixed(3)}`,
                    category: 'segment',
                  })
                }
                onPointerLeave={() => onHoverObject?.(null)}
              />
            </>
          )}

          {/* Circumcenter O_o = (A + B) / 2 */}
          {showCenters && (
            <circle
              cx={pOo.x}
              cy={pOo.y}
              r="4.2"
              fill="#6d28d9"
              stroke="#ffffff"
              strokeWidth="1.5"
              className="cursor-pointer"
              onPointerEnter={() =>
                onHoverObject?.({
                  id: 'circumcenter-Oo',
                  title: t.hover.circumcenterTitle,
                  details: `O_o = (${circumcircle.center.x.toFixed(3)}, ${circumcircle.center.y.toFixed(3)}) · |O_o-O_c| = ${circumcircle.centerDistanceToKc.toFixed(3)}`,
                  category: 'vertex',
                })
              }
              onPointerLeave={() => onHoverObject?.(null)}
            />
          )}

          {/* Labels for K_o, O_o, R_o positioned strictly clear of c, Q_c, K_c, K_a, K_b, K_i */}
          {showLabels && (
            <>
              <text
                x={pThalesArc.x + arcUnitX * 14}
                y={pThalesArc.y + arcUnitY * 14}
                textAnchor="middle"
                dominantBaseline="middle"
                stroke="#f8fafc"
                strokeWidth="3.2"
                style={{ paintOrder: 'stroke' }}
                className="text-xs font-mono font-bold fill-violet-800 select-none pointer-events-none"
              >
                {thalesFocusGlow
                  ? `K_o (D_o = c = ${circumcircle.diameter.toFixed(2)})`
                  : 'K_o'}
              </text>

              {(showRadii || thalesFocusGlow) && pxRo >= 32 && (
                <text
                  x={pOo.x + (pThalesArc.x - pOo.x) * 0.56 + 10}
                  y={pOo.y + (pThalesArc.y - pOo.y) * 0.56}
                  textAnchor="start"
                  dominantBaseline="middle"
                  stroke="#f8fafc"
                  strokeWidth="3"
                  style={{ paintOrder: 'stroke' }}
                  className="text-[10px] font-mono font-bold fill-violet-800 select-none pointer-events-none"
                >
                  R_o={circumcircle.radius.toFixed(2)}
                </text>
              )}

              {showCenters && (
                <text
                  x={pOo.x + inNx * 13}
                  y={pOo.y + inNy * 13}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  stroke="#f8fafc"
                  strokeWidth="2.8"
                  style={{ paintOrder: 'stroke' }}
                  className="text-[10px] font-mono font-bold fill-violet-900 select-none pointer-events-none"
                >
                  O_o
                </text>
              )}
            </>
          )}
        </g>
      )}

      {/* Subtle bounding hint for leg ratio in extreme cases */}
      {triangle.a > 0 && triangle.b > 0 && false && <g />}
    </g>
  );
};
