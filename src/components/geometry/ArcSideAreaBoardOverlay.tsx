/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React from 'react';
import { FourCirclesCalculations, HoveredObject, Point2D } from '../../types/geometry.ts';
import { toScreen } from '../../geometry/transforms.ts';
import { computeArcSideAreaPoint } from '../../math/experiments/arcSideAreaCorrespondence.ts';

interface ArcSideAreaBoardOverlayProps {
  calc: FourCirclesCalculations;
  origin: Point2D;
  scale: number;
  alphaDeg: number;
  isDraggingTangent: boolean;
  onPointerDownTangent: (e: React.PointerEvent) => void;
  onHoverObject?: (obj: HoveredObject | null) => void;
}

export const ArcSideAreaBoardOverlay: React.FC<ArcSideAreaBoardOverlayProps> = ({
  calc,
  origin,
  scale,
  alphaDeg,
  isDraggingTangent,
  onPointerDownTangent,
  onHoverObject,
}) => {
  const r = calc.incircle.radius;
  const pxR = r * scale;
  const pt = computeArcSideAreaPoint(r, alphaDeg);

  const pO = toScreen(calc.triangle.O, origin, scale);
  const pA = toScreen(calc.triangle.A, origin, scale);
  const pB = toScreen(calc.triangle.B, origin, scale);
  const pI = toScreen(calc.incircle.center, origin, scale);

  const pTOA = toScreen(calc.incircle.tangencyOA, origin, scale);
  const pTOB = toScreen(calc.incircle.tangencyOB, origin, scale);
  const pTAB = toScreen(calc.incircle.tangencyAB, origin, scale);

  // Centroids of the three subtriangles IOA, IOB, IAB for clean non-overlapping area badges
  const cIOA = { x: (pI.x + pO.x + pA.x) / 3, y: (pI.y + pO.y + pA.y) / 3 };
  const cIOB = { x: (pI.x + pO.x + pB.x) / 3, y: (pI.y + pO.y + pB.y) / 3 };
  const cIAB = { x: (pI.x + pA.x + pB.x) / 3, y: (pI.y + pA.y + pB.y) / 3 };

  // Perpendicularity square size
  const sq = Math.min(10, Math.max(5, pxR * 0.13));
  const hypDx = pA.x - pB.x;
  const hypDy = pA.y - pB.y;
  const hypLen = Math.hypot(hypDx, hypDy) || 1;
  const uTanAB = { x: hypDx / hypLen, y: hypDy / hypLen };
  const radDx = pI.x - pTAB.x;
  const radDy = pI.y - pTAB.y;
  const radLen = Math.hypot(radDx, radDy) || 1;
  const uRadAB = { x: radDx / radLen, y: radDy / radLen };

  return (
    <g className="arc-side-area-overlay">
      {/* 1. Three Subtriangle Area Partitions (ΔIOB = S_a opp A, ΔIOA = S_b opp B, ΔIAB = S_c opp C) */}
      <polygon
        points={`${pI.x},${pI.y} ${pO.x},${pO.y} ${pB.x},${pB.y}`}
        fill="#2563eb"
        fillOpacity="0.11"
        className="cursor-pointer"
        onPointerEnter={() =>
          onHoverObject?.({
            id: 'exp06-area-a',
            title: 'Малый треугольник ΔIOB (S_a = ½ar, против ∠A)',
            details: `a=|OB|=${pt.a.toFixed(4)}, S_a=${pt.areaA.toFixed(4)}, доля=${(pt.areaShareA * 100).toFixed(2)}%`,
            category: 'polygon',
          })
        }
        onPointerLeave={() => onHoverObject?.(null)}
      />
      <polygon
        points={`${pI.x},${pI.y} ${pO.x},${pO.y} ${pA.x},${pA.y}`}
        fill="#059669"
        fillOpacity="0.11"
        className="cursor-pointer"
        onPointerEnter={() =>
          onHoverObject?.({
            id: 'exp06-area-b',
            title: 'Малый треугольник ΔIOA (S_b = ½br, против ∠B)',
            details: `b=|OA|=${pt.b.toFixed(4)}, S_b=${pt.areaB.toFixed(4)}, доля=${(pt.areaShareB * 100).toFixed(2)}%`,
            category: 'polygon',
          })
        }
        onPointerLeave={() => onHoverObject?.(null)}
      />
      <polygon
        points={`${pI.x},${pI.y} ${pA.x},${pA.y} ${pB.x},${pB.y}`}
        fill="#f59e0b"
        fillOpacity="0.14"
        className="cursor-pointer"
        onPointerEnter={() =>
          onHoverObject?.({
            id: 'exp06-area-c',
            title: 'Малый треугольник ΔIAB (S_c = ½cr, против ∠C)',
            details: `c=|AB|=${pt.c.toFixed(4)}, S_c=${pt.areaC.toFixed(4)}, доля=${(pt.areaShareC * 100).toFixed(2)}%`,
            category: 'polygon',
          })
        }
        onPointerLeave={() => onHoverObject?.(null)}
      />

      {/* 2. Corner Square O - T_OB - I - T_OA of area r^2 (= S_a + S_b - S_c) */}
      <rect
        x={pTOA.x}
        y={pTOA.y}
        width={pxR}
        height={pxR}
        fill="none"
        stroke="#7c3aed"
        strokeWidth="1.2"
        strokeDasharray="3 2"
        opacity="0.7"
      />

      {/* 3. Three Distinct Colored Arcs on Incircle K_i */}
      {pxR > 2 && (
        <>
          <path
            d={`M ${pTOA.x} ${pTOA.y} A ${pxR} ${pxR} 0 0 1 ${pTAB.x} ${pTAB.y}`}
            fill="none"
            stroke="#2563eb"
            strokeWidth="4.8"
          />
          <path
            d={`M ${pTAB.x} ${pTAB.y} A ${pxR} ${pxR} 0 0 1 ${pTOB.x} ${pTOB.y}`}
            fill="none"
            stroke="#059669"
            strokeWidth="4.8"
          />
          <path
            d={`M ${pTOB.x} ${pTOB.y} A ${pxR} ${pxR} 0 0 1 ${pTOA.x} ${pTOA.y}`}
            fill="none"
            stroke="#d97706"
            strokeWidth="4.8"
          />
        </>
      )}

      {/* 4. Vertex Segments I->A, I->B, I->O (Dashed bisectors partitioning area) */}
      <g stroke="#334155" strokeWidth="1.6" strokeDasharray="5 4" opacity="0.85">
        <line x1={pI.x} y1={pI.y} x2={pA.x} y2={pA.y} />
        <line x1={pI.x} y1={pI.y} x2={pB.x} y2={pB.y} />
        <line x1={pI.x} y1={pI.y} x2={pO.x} y2={pO.y} />
      </g>

      {/* 5. Tangency Radii I->T_OA, I->T_OB, I->T_AB (Solid perpendicular altitudes) */}
      <g stroke="#0f172a" strokeWidth="1.8">
        <line x1={pI.x} y1={pI.y} x2={pTOA.x} y2={pTOA.y} />
        <line x1={pI.x} y1={pI.y} x2={pTOB.x} y2={pTOB.y} />
        <line x1={pI.x} y1={pI.y} x2={pTAB.x} y2={pTAB.y} />
      </g>

      {/* 6. Right-angle markers at tangency points */}
      {pxR > 22 && (
        <g fill="none" stroke="#475569" strokeWidth="1.1">
          <path d={`M ${pTOA.x} ${pTOA.y - sq} L ${pTOA.x + sq} ${pTOA.y - sq} L ${pTOA.x + sq} ${pTOA.y}`} />
          <path d={`M ${pTOB.x + sq} ${pTOB.y} L ${pTOB.x + sq} ${pTOB.y - sq} L ${pTOB.x} ${pTOB.y - sq}`} />
          <path
            d={`M ${(pTAB.x + uTanAB.x * sq).toFixed(1)} ${(pTAB.y + uTanAB.y * sq).toFixed(1)} L ${(pTAB.x + uTanAB.x * sq + uRadAB.x * sq).toFixed(1)} ${(pTAB.y + uTanAB.y * sq + uRadAB.y * sq).toFixed(1)} L ${(pTAB.x + uRadAB.x * sq).toFixed(1)} ${(pTAB.y + uRadAB.y * sq).toFixed(1)}`}
          />
        </g>
      )}

      {/* 7. Subtriangle Area Labels */}
      {hypLen > 80 && (
        <g className="pointer-events-none select-none font-mono font-bold text-[10px]">
          <text
            x={cIOB.x}
            y={cIOB.y}
            textAnchor="middle"
            stroke="#ffffff"
            strokeWidth="3"
            style={{ paintOrder: 'stroke' }}
            className="fill-blue-800"
          >
            S_a={pt.areaA.toFixed(2)} ({(pt.areaShareA * 100).toFixed(1)}%)
          </text>
          <text
            x={cIOA.x}
            y={cIOA.y}
            textAnchor="middle"
            stroke="#ffffff"
            strokeWidth="3"
            style={{ paintOrder: 'stroke' }}
            className="fill-emerald-800"
          >
            S_b={pt.areaB.toFixed(2)} ({(pt.areaShareB * 100).toFixed(1)}%)
          </text>
          <text
            x={cIAB.x}
            y={cIAB.y}
            textAnchor="middle"
            stroke="#ffffff"
            strokeWidth="3"
            style={{ paintOrder: 'stroke' }}
            className="fill-amber-900"
          >
            S_c={pt.areaC.toFixed(2)} ({(pt.areaShareC * 100).toFixed(1)}%)
          </text>
        </g>
      )}

      {/* 8. Tangency Points & Draggable T_AB */}
      <circle cx={pTOA.x} cy={pTOA.y} r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
      <circle cx={pTOB.x} cy={pTOB.y} r="4" fill="#059669" stroke="#ffffff" strokeWidth="1.5" />

      <g
        className="cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDownTangent}
        onPointerEnter={() =>
          onHoverObject?.({
            id: 'exp06-t-ab',
            title: 'Точка касания T_AB (перетащите по дуге)',
            details: `φ_A=${pt.phiADeg.toFixed(1)}°, φ_B=${pt.phiBDeg.toFixed(1)}°, r²/S=${(pt.rSquaredOverS * 100).toFixed(2)}%`,
            category: 'vertex',
          })
        }
        onPointerLeave={() => onHoverObject?.(null)}
      >
        <circle
          cx={pTAB.x}
          cy={pTAB.y}
          r={isDraggingTangent ? 13 : 10}
          fill="#0f172a"
          fillOpacity="0.14"
        />
        <circle cx={pTAB.x} cy={pTAB.y} r="5" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
      </g>

      {/* Incenter I */}
      <circle cx={pI.x} cy={pI.y} r="4.5" fill="#0f172a" stroke="#ffffff" strokeWidth="1.8" />
      {pxR > 16 && (
        <text
          x={pI.x - 10}
          y={pI.y - 8}
          stroke="#ffffff"
          strokeWidth="3"
          style={{ paintOrder: 'stroke' }}
          className="text-[11px] font-bold fill-slate-900 select-none pointer-events-none"
        >
          I
        </text>
      )}
    </g>
  );
};
