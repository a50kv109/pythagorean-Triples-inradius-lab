/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React from 'react';
import { FourCirclesCalculations, HoveredObject, Point2D } from '../../types/geometry.ts';
import { toScreen } from '../../geometry/transforms.ts';
import { computeIncircleArcDistribution } from '../../math/experiments/incircleArcDistribution.ts';

interface IncircleArcDistributionOverlayProps {
  calc: FourCirclesCalculations;
  origin: Point2D;
  scale: number;
  alphaDeg: number;
  isDraggingTangent: boolean;
  onPointerDownTangent: (e: React.PointerEvent) => void;
  onHoverObject?: (obj: HoveredObject | null) => void;
}

const DEG2RAD = Math.PI / 180;

export const IncircleArcDistributionOverlay: React.FC<IncircleArcDistributionOverlayProps> = ({
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
  const dist = computeIncircleArcDistribution(r, alphaDeg);

  const pO = toScreen(calc.triangle.O, origin, scale);
  const pA = toScreen(calc.triangle.A, origin, scale);
  const pB = toScreen(calc.triangle.B, origin, scale);
  const pI = toScreen(calc.incircle.center, origin, scale);

  const pTOA = toScreen(calc.incircle.tangencyOA, origin, scale);
  const pTOB = toScreen(calc.incircle.tangencyOB, origin, scale);
  const pTAB = toScreen(calc.incircle.tangencyAB, origin, scale);

  // Sector wedge helper in SVG screen coordinates (clockwise: sweep = 1)
  const sectorRadius = Math.max(14, pxR * 0.42);
  const ptAtMathDeg = (deg: number, radiusPx: number): Point2D => {
    const rad = deg * DEG2RAD;
    return {
      x: pI.x + radiusPx * Math.cos(rad),
      y: pI.y - radiusPx * Math.sin(rad),
    };
  };

  // Math angles of the three tangency radii around I=(r, r):
  // T_OA: 180 deg, T_AB: 90 - alphaDeg, T_OB: -90 deg (270 deg)
  const degOA = 180;
  const degAB = 90 - dist.alphaDeg;
  const degOB = -90;

  const sOA = ptAtMathDeg(degOA, sectorRadius);
  const sAB = ptAtMathDeg(degAB, sectorRadius);
  const sOB = ptAtMathDeg(degOB, sectorRadius);

  // Midpoint angles for central angle labels and arc length badges
  const midDegA = 135 - dist.alphaDeg / 2;
  const midDegB = -dist.alphaDeg / 2;
  const midDegC = 225;

  const phiLabelPosA = ptAtMathDeg(midDegA, Math.max(24, pxR * 0.56));
  const phiLabelPosB = ptAtMathDeg(midDegB, Math.max(24, pxR * 0.56));
  const phiLabelPosC = ptAtMathDeg(midDegC, Math.max(24, pxR * 0.56));

  const arcLabelPosA = ptAtMathDeg(midDegA, pxR + 18);
  const arcLabelPosB = ptAtMathDeg(midDegB, pxR + 18);
  const arcLabelPosC = ptAtMathDeg(midDegC, pxR + 20);

  // Perpendicular right-angle markers at T_OA, T_OB, T_AB (size in px)
  const sq = Math.min(11, Math.max(6, pxR * 0.14));
  // At T_AB: unit radial direction (toward I) in screen coords, and tangent unit direction (toward A) in screen coords
  const hypDx = pA.x - pB.x;
  const hypDy = pA.y - pB.y;
  const hypLen = Math.hypot(hypDx, hypDy) || 1;
  const uTanAB = { x: hypDx / hypLen, y: hypDy / hypLen };
  const radDx = pI.x - pTAB.x;
  const radDy = pI.y - pTAB.y;
  const radLen = Math.hypot(radDx, radDy) || 1;
  const uRadAB = { x: radDx / radLen, y: radDy / radLen };

  const perpABPath = `M ${(pTAB.x + uTanAB.x * sq).toFixed(1)} ${(pTAB.y + uTanAB.y * sq).toFixed(1)} L ${(pTAB.x + uTanAB.x * sq + uRadAB.x * sq).toFixed(1)} ${(pTAB.y + uTanAB.y * sq + uRadAB.y * sq).toFixed(1)} L ${(pTAB.x + uRadAB.x * sq).toFixed(1)} ${(pTAB.y + uRadAB.y * sq).toFixed(1)}`;

  // Acute angle arc markers at A and B
  const uHypAtoB = { x: -uTanAB.x, y: -uTanAB.y };
  const angleArcR_A = Math.min(30, Math.max(12, hypLen * 0.18));
  const aArcStart = { x: pA.x, y: pA.y + angleArcR_A };
  const aArcEnd = {
    x: pA.x + angleArcR_A * uHypAtoB.x,
    y: pA.y + angleArcR_A * uHypAtoB.y,
  };
  const bArcStart = { x: pB.x - angleArcR_A, y: pB.y };
  const bArcEnd = {
    x: pB.x - angleArcR_A * uHypAtoB.x,
    y: pB.y - angleArcR_A * uHypAtoB.y,
  };

  return (
    <g className="incircle-arc-distribution-overlay">
      {/* 1. Central Angle Sectors around Incenter I */}
      {pxR > 18 && (
        <>
          <path
            d={`M ${pI.x} ${pI.y} L ${sOA.x} ${sOA.y} A ${sectorRadius} ${sectorRadius} 0 0 1 ${sAB.x} ${sAB.y} Z`}
            fill="#2563eb"
            fillOpacity="0.14"
          />
          <path
            d={`M ${pI.x} ${pI.y} L ${sAB.x} ${sAB.y} A ${sectorRadius} ${sectorRadius} 0 0 1 ${sOB.x} ${sOB.y} Z`}
            fill="#059669"
            fillOpacity="0.14"
          />
          <path
            d={`M ${pI.x} ${pI.y} L ${sOB.x} ${sOB.y} A ${sectorRadius} ${sectorRadius} 0 0 1 ${sOA.x} ${sOA.y} Z`}
            fill="#d97706"
            fillOpacity="0.14"
          />
        </>
      )}

      {/* 2. Three Visually Distinct Colored Arcs on Incircle K_i */}
      {pxR > 2 && (
        <>
          {/* Arc A: T_OA -> T_AB (opposite angle A) */}
          <path
            d={`M ${pTOA.x} ${pTOA.y} A ${pxR} ${pxR} 0 0 1 ${pTAB.x} ${pTAB.y}`}
            fill="none"
            stroke="#2563eb"
            strokeWidth="5.5"
            strokeLinecap="butt"
            className="cursor-pointer"
            onPointerEnter={() =>
              onHoverObject?.({
                id: 'exp05-arc-A',
                title: 'Дуга при вершине A (T_OA — T_AB)',
                details: `φ_A = ${dist.phiADeg.toFixed(1)}°, L_A = ${dist.lengthA.toFixed(4)}, доля = ${(dist.shareA * 100).toFixed(1)}%`,
                category: 'circle',
              })
            }
            onPointerLeave={() => onHoverObject?.(null)}
          />
          {/* Arc B: T_AB -> T_OB (opposite angle B) */}
          <path
            d={`M ${pTAB.x} ${pTAB.y} A ${pxR} ${pxR} 0 0 1 ${pTOB.x} ${pTOB.y}`}
            fill="none"
            stroke="#059669"
            strokeWidth="5.5"
            strokeLinecap="butt"
            className="cursor-pointer"
            onPointerEnter={() =>
              onHoverObject?.({
                id: 'exp05-arc-B',
                title: 'Дуга при вершине B (T_AB — T_OB)',
                details: `φ_B = ${dist.phiBDeg.toFixed(1)}°, L_B = ${dist.lengthB.toFixed(4)}, доля = ${(dist.shareB * 100).toFixed(1)}%`,
                category: 'circle',
              })
            }
            onPointerLeave={() => onHoverObject?.(null)}
          />
          {/* Arc C: T_OB -> T_OA (opposite right angle C = 90 deg) */}
          <path
            d={`M ${pTOB.x} ${pTOB.y} A ${pxR} ${pxR} 0 0 1 ${pTOA.x} ${pTOA.y}`}
            fill="none"
            stroke="#d97706"
            strokeWidth="5.5"
            strokeLinecap="butt"
            className="cursor-pointer"
            onPointerEnter={() =>
              onHoverObject?.({
                id: 'exp05-arc-C',
                title: 'Дуга при прямом угле C (T_OB — T_OA)',
                details: `φ_C = 90.0° (const), L_C = ${dist.lengthC.toFixed(4)}, доля = 25.0%`,
                category: 'circle',
              })
            }
            onPointerLeave={() => onHoverObject?.(null)}
          />
        </>
      )}

      {/* 3. Three Radii from Incenter I to Tangency Points T_OA, T_OB, T_AB */}
      <line x1={pI.x} y1={pI.y} x2={pTOA.x} y2={pTOA.y} stroke="#0f172a" strokeWidth="1.8" />
      <line x1={pI.x} y1={pI.y} x2={pTOB.x} y2={pTOB.y} stroke="#0f172a" strokeWidth="1.8" />
      <line x1={pI.x} y1={pI.y} x2={pTAB.x} y2={pTAB.y} stroke="#0f172a" strokeWidth="1.8" />

      {/* 4. Perpendicularity Markers at Tangency Points */}
      {pxR > 24 && (
        <g fill="none" stroke="#475569" strokeWidth="1.2">
          {/* At T_OA (tangent OA is vertical, radius goes right) */}
          <path d={`M ${pTOA.x} ${pTOA.y - sq} L ${pTOA.x + sq} ${pTOA.y - sq} L ${pTOA.x + sq} ${pTOA.y}`} />
          {/* At T_OB (tangent OB is horizontal, radius goes up) */}
          <path d={`M ${pTOB.x + sq} ${pTOB.y} L ${pTOB.x + sq} ${pTOB.y - sq} L ${pTOB.x} ${pTOB.y - sq}`} />
          {/* At T_AB */}
          <path d={perpABPath} />
          {/* Right angle marker at O */}
          <path d={`M ${pO.x} ${pO.y - sq} L ${pO.x + sq} ${pO.y - sq} L ${pO.x + sq} ${pO.y}`} stroke="#d97706" />
        </g>
      )}

      {/* 5. Vertex Angle Arcs & Labels (A, B, C) */}
      {hypLen > 32 && (
        <g className="pointer-events-none select-none">
          <path
            d={`M ${pA.x} ${pA.y} L ${aArcStart.x} ${aArcStart.y} A ${angleArcR_A} ${angleArcR_A} 0 0 0 ${aArcEnd.x} ${aArcEnd.y} Z`}
            fill="#2563eb"
            fillOpacity="0.16"
          />
          <text
            x={pA.x + 12}
            y={pA.y - 10}
            stroke="#f8fafc"
            strokeWidth="3.5"
            style={{ paintOrder: 'stroke' }}
            className="text-[11px] font-mono font-bold fill-blue-700"
          >
            ∠A={dist.angleADeg.toFixed(1)}°
          </text>

          <path
            d={`M ${pB.x} ${pB.y} L ${bArcStart.x} ${bArcStart.y} A ${angleArcR_A} ${angleArcR_A} 0 0 1 ${bArcEnd.x} ${bArcEnd.y} Z`}
            fill="#059669"
            fillOpacity="0.16"
          />
          <text
            x={pB.x + 10}
            y={pB.y + 16}
            stroke="#f8fafc"
            strokeWidth="3.5"
            style={{ paintOrder: 'stroke' }}
            className="text-[11px] font-mono font-bold fill-emerald-700"
          >
            ∠B={dist.angleBDeg.toFixed(1)}°
          </text>
        </g>
      )}

      {/* 6. Central Angle Labels inside Circle & Arc Length Labels outside Circle */}
      {pxR > 38 && (
        <g className="pointer-events-none select-none font-mono font-bold">
          <text
            x={phiLabelPosA.x}
            y={phiLabelPosA.y}
            textAnchor="middle"
            dominantBaseline="central"
            stroke="#ffffff"
            strokeWidth="3"
            style={{ paintOrder: 'stroke' }}
            className="text-[10.5px] fill-blue-800"
          >
            φ_A={dist.phiADeg.toFixed(1)}°
          </text>
          <text
            x={phiLabelPosB.x}
            y={phiLabelPosB.y}
            textAnchor="middle"
            dominantBaseline="central"
            stroke="#ffffff"
            strokeWidth="3"
            style={{ paintOrder: 'stroke' }}
            className="text-[10.5px] fill-emerald-800"
          >
            φ_B={dist.phiBDeg.toFixed(1)}°
          </text>
          <text
            x={phiLabelPosC.x}
            y={phiLabelPosC.y}
            textAnchor="middle"
            dominantBaseline="central"
            stroke="#ffffff"
            strokeWidth="3"
            style={{ paintOrder: 'stroke' }}
            className="text-[10.5px] fill-amber-800"
          >
            φ_C=90°
          </text>

          {/* Arc length labels along outer perimeter */}
          <text
            x={arcLabelPosA.x}
            y={arcLabelPosA.y}
            textAnchor="end"
            stroke="#f8fafc"
            strokeWidth="3.5"
            style={{ paintOrder: 'stroke' }}
            className="text-[10px] fill-blue-700"
          >
            L_A={dist.lengthA.toFixed(2)}
          </text>
          <text
            x={arcLabelPosB.x}
            y={arcLabelPosB.y}
            textAnchor="start"
            stroke="#f8fafc"
            strokeWidth="3.5"
            style={{ paintOrder: 'stroke' }}
            className="text-[10px] fill-emerald-700"
          >
            L_B={dist.lengthB.toFixed(2)}
          </text>
          <text
            x={arcLabelPosC.x}
            y={arcLabelPosC.y + 8}
            textAnchor="end"
            stroke="#f8fafc"
            strokeWidth="3.5"
            style={{ paintOrder: 'stroke' }}
            className="text-[10px] fill-amber-800"
          >
            L_C={dist.lengthC.toFixed(2)}
          </text>
        </g>
      )}

      {/* 7. Three Tangency Points (T_OA, T_OB fixed on axes + draggable T_AB on hypotenuse) */}
      <circle
        cx={pTOA.x}
        cy={pTOA.y}
        r="4.2"
        fill="#2563eb"
        stroke="#ffffff"
        strokeWidth="1.5"
        className="cursor-pointer"
        onPointerEnter={() =>
          onHoverObject?.({
            id: 'exp05-t-oa',
            title: 'Точка касания T_OA',
            details: `(0, ${r.toFixed(3)}), I·T_OA ⊥ OA`,
            category: 'vertex',
          })
        }
        onPointerLeave={() => onHoverObject?.(null)}
      />
      <circle
        cx={pTOB.x}
        cy={pTOB.y}
        r="4.2"
        fill="#059669"
        stroke="#ffffff"
        strokeWidth="1.5"
        className="cursor-pointer"
        onPointerEnter={() =>
          onHoverObject?.({
            id: 'exp05-t-ob',
            title: 'Точка касания T_OB',
            details: `(${r.toFixed(3)}, 0), I·T_OB ⊥ OB`,
            category: 'vertex',
          })
        }
        onPointerLeave={() => onHoverObject?.(null)}
      />

      {/* Draggable T_AB handle */}
      <g
        className="cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDownTangent}
        onPointerEnter={() =>
          onHoverObject?.({
            id: 'exp05-t-ab',
            title: 'Точка касания T_AB (перетащите по дуге)',
            details: `α=${dist.alphaDeg.toFixed(1)}°, φ_A=${dist.phiADeg.toFixed(1)}°, φ_B=${dist.phiBDeg.toFixed(1)}°, φ_C=90°`,
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
        <circle
          cx={pTAB.x}
          cy={pTAB.y}
          r="5.2"
          fill="#0f172a"
          stroke="#ffffff"
          strokeWidth="2"
        />
      </g>

      {/* Incenter I */}
      <circle
        cx={pI.x}
        cy={pI.y}
        r="4.5"
        fill="#0f172a"
        stroke="#ffffff"
        strokeWidth="1.8"
      />
      {pxR > 16 && (
        <text
          x={pI.x + 8}
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
