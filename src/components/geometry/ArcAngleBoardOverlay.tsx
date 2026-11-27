/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React from 'react';
import { FourCirclesCalculations, HoveredObject, Point2D } from '../../types/geometry.ts';
import { toScreen } from '../../geometry/transforms.ts';
import {
  ArcAngleZoneSpec,
  getInteriorAnglesDeg,
} from '../../math/experiments/arcAngleParametricAnalysis.ts';

interface ArcAngleBoardOverlayProps {
  calc: FourCirclesCalculations;
  origin: Point2D;
  scale: number;
  alphaDeg: number;
  selectedZone: ArcAngleZoneSpec | null;
  isDraggingTangent: boolean;
  onPointerDownTangent: (e: React.PointerEvent) => void;
  onSelectAlpha: (alphaDeg: number) => void;
  onHoverObject?: (obj: HoveredObject | null) => void;
}

const DEG2RAD = Math.PI / 180;

export const ArcAngleBoardOverlay: React.FC<ArcAngleBoardOverlayProps> = ({
  calc,
  origin,
  scale,
  alphaDeg,
  selectedZone,
  isDraggingTangent,
  onPointerDownTangent,
  onSelectAlpha,
  onHoverObject,
}) => {
  const r = calc.incircle.radius;
  const pxR = r * scale;
  const alphaRad = alphaDeg * DEG2RAD;
  const angleADeg = calc.triangle.alphaDeg;
  const angleBDeg = calc.triangle.betaDeg;

  const pO = toScreen({ x: 0, y: 0 }, origin, scale);
  const pA = toScreen(calc.triangle.A, origin, scale);
  const pB = toScreen(calc.triangle.B, origin, scale);
  const pI = toScreen(calc.incircle.center, origin, scale);
  const pN = toScreen({ x: r, y: 2 * r }, origin, scale);
  const pE = toScreen({ x: 2 * r, y: r }, origin, scale);
  const pTc = toScreen(calc.incircle.tangencyAB, origin, scale);

  // Fixed perpendicular leg rays extending beyond current A and B
  const maxRayY = Math.max(calc.triangle.a + 2.0, 2 * r + 3.0);
  const maxRayX = Math.max(calc.triangle.b + 2.0, 2 * r + 3.0);
  const pRayY = toScreen({ x: 0, y: maxRayY }, origin, scale);
  const pRayX = toScreen({ x: maxRayX, y: 0 }, origin, scale);

  // Helper to get screen point on incircle at central angle deg (0=N, 90=E)
  const ptOnIncircleAtDeg = (deg: number): Point2D => {
    const rad = deg * DEG2RAD;
    return toScreen(
      { x: r * (1 + Math.sin(rad)), y: r * (1 + Math.cos(rad)) },
      origin,
      scale
    );
  };

  // Central angle sector at I
  const centerSectorR = Math.min(pxR * 0.45, Math.max(16, pxR * 0.4));
  const centerSectorStart = { x: pI.x, y: pI.y - centerSectorR };
  const centerSectorEnd = {
    x: pI.x + centerSectorR * Math.sin(alphaRad),
    y: pI.y - centerSectorR * Math.cos(alphaRad),
  };

  // Acute angle arc at vertex A = (0, a): between leg AO (downward +90 deg SVG) and hypotenuse AB
  const hypDx = pB.x - pA.x;
  const hypDy = pB.y - pA.y;
  const hypPxLen = Math.hypot(hypDx, hypDy);
  const angleArcR_A = Math.min(34, Math.max(14, hypPxLen * 0.22));
  const uHypAB = hypPxLen > 1e-6 ? { x: hypDx / hypPxLen, y: hypDy / hypPxLen } : { x: 1, y: 0 };
  const aArcStart = { x: pA.x, y: pA.y + angleArcR_A }; // along AO (downward on screen)
  const aArcEnd = {
    x: pA.x + angleArcR_A * uHypAB.x,
    y: pA.y + angleArcR_A * uHypAB.y,
  };
  const midDirA = {
    x: uHypAB.x * 0.5,
    y: (1 + uHypAB.y) * 0.5,
  };
  const midDirANorm = Math.hypot(midDirA.x, midDirA.y) || 1;
  const labelPosA = {
    x: pA.x + (angleArcR_A + 16) * (midDirA.x / midDirANorm),
    y: pA.y + (angleArcR_A + 16) * (midDirA.y / midDirANorm),
  };

  // Acute angle arc at vertex B = (b, 0): between leg BO (leftward -x) and hypotenuse BA
  const angleArcR_B = Math.min(34, Math.max(14, hypPxLen * 0.22));
  const bArcStart = { x: pB.x - angleArcR_B, y: pB.y }; // along BO (leftward on screen)
  const bArcEnd = {
    x: pB.x - angleArcR_B * uHypAB.x,
    y: pB.y - angleArcR_B * uHypAB.y,
  };
  const midDirB = {
    x: (-1 - uHypAB.x) * 0.5,
    y: -uHypAB.y * 0.5,
  };
  const midDirBNorm = Math.hypot(midDirB.x, midDirB.y) || 1;
  const labelPosB = {
    x: pB.x + (angleArcR_B + 18) * (midDirB.x / midDirBNorm),
    y: pB.y + (angleArcR_B + 16) * (midDirB.y / midDirBNorm),
  };

  const fiveDegAngles = getInteriorAnglesDeg(5);
  const currentArcLen = r * alphaRad;

  const zoneStartPt = selectedZone ? ptOnIncircleAtDeg(selectedZone.alphaMinDeg) : null;
  const zoneEndPt = selectedZone ? ptOnIncircleAtDeg(selectedZone.alphaMaxDeg) : null;

  return (
    <g className="arc-angle-overlay">
      {/* 1. Fixed Orthogonal Tangent Leg Guides */}
      <line
        x1={pO.x}
        y1={pO.y}
        x2={pRayY.x}
        y2={pRayY.y}
        stroke="#2563eb"
        strokeWidth="1.5"
        strokeDasharray="6 4"
        opacity="0.5"
      />
      <line
        x1={pO.x}
        y1={pO.y}
        x2={pRayX.x}
        y2={pRayX.y}
        stroke="#059669"
        strokeWidth="1.5"
        strokeDasharray="6 4"
        opacity="0.5"
      />

      {/* 2. Admissible Quarter-Circle Arc [N -> E] */}
      {pxR > 2 && (
        <path
          d={`M ${pN.x} ${pN.y} A ${pxR} ${pxR} 0 0 1 ${pE.x} ${pE.y}`}
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="6"
          strokeLinecap="round"
        />
      )}

      {/* 3. Highlighted Research Zone Band (if selected) */}
      {pxR > 2 && selectedZone && zoneStartPt && zoneEndPt && (
        <>
          <path
            d={`M ${pI.x} ${pI.y} L ${zoneStartPt.x} ${zoneStartPt.y} A ${pxR} ${pxR} 0 0 1 ${zoneEndPt.x} ${zoneEndPt.y} Z`}
            fill="#0ea5e9"
            fillOpacity="0.12"
          />
          <path
            d={`M ${zoneStartPt.x} ${zoneStartPt.y} A ${pxR} ${pxR} 0 0 1 ${zoneEndPt.x} ${zoneEndPt.y}`}
            fill="none"
            stroke="#0284c7"
            strokeWidth="6.5"
            strokeLinecap="round"
          />
        </>
      )}

      {/* 4. Active Swept Arc L(alpha) from N to T_AB */}
      {pxR > 2 && (
        <path
          d={`M ${pN.x} ${pN.y} A ${pxR} ${pxR} 0 0 1 ${pTc.x} ${pTc.y}`}
          fill="none"
          stroke="#d97706"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      )}

      {/* 5. Central Angle Sector alpha around Center I */}
      {pxR > 22 && (
        <>
          <path
            d={`M ${pI.x} ${pI.y} L ${centerSectorStart.x} ${centerSectorStart.y} A ${centerSectorR} ${centerSectorR} 0 0 1 ${centerSectorEnd.x} ${centerSectorEnd.y} Z`}
            fill="#f59e0b"
            fillOpacity="0.16"
          />
          <path
            d={`M ${centerSectorStart.x} ${centerSectorStart.y} A ${centerSectorR} ${centerSectorR} 0 0 1 ${centerSectorEnd.x} ${centerSectorEnd.y}`}
            fill="none"
            stroke="#b45309"
            strokeWidth="1.4"
          />
        </>
      )}

      {/* 6. Reference I->N and live I->T_AB radii */}
      <line
        x1={pI.x}
        y1={pI.y}
        x2={pN.x}
        y2={pN.y}
        stroke="#94a3b8"
        strokeWidth="1.2"
        strokeDasharray="3 3"
      />
      <line
        x1={pI.x}
        y1={pI.y}
        x2={pTc.x}
        y2={pTc.y}
        stroke="#b45309"
        strokeWidth="1.8"
      />

      {/* 7. Angle Sector & Live Label at Vertex A (Angle A = 90 - alpha) */}
      {hypPxLen > 24 && (
        <g>
          <path
            d={`M ${pA.x} ${pA.y} L ${aArcStart.x} ${aArcStart.y} A ${angleArcR_A} ${angleArcR_A} 0 0 0 ${aArcEnd.x} ${aArcEnd.y} Z`}
            fill="#2563eb"
            fillOpacity="0.18"
          />
          <path
            d={`M ${aArcStart.x} ${aArcStart.y} A ${angleArcR_A} ${angleArcR_A} 0 0 0 ${aArcEnd.x} ${aArcEnd.y}`}
            fill="none"
            stroke="#1d4ed8"
            strokeWidth="1.6"
          />
          <text
            x={labelPosA.x}
            y={labelPosA.y}
            textAnchor="start"
            stroke="#f8fafc"
            strokeWidth="3.5"
            style={{ paintOrder: 'stroke' }}
            className="text-[11px] font-mono font-bold fill-blue-700 select-none pointer-events-none"
          >
            ∠A={angleADeg.toFixed(1)}°
          </text>
        </g>
      )}

      {/* 8. Angle Sector & Live Label at Vertex B (Angle B = alpha) */}
      {hypPxLen > 24 && (
        <g>
          <path
            d={`M ${pB.x} ${pB.y} L ${bArcStart.x} ${bArcStart.y} A ${angleArcR_B} ${angleArcR_B} 0 0 1 ${bArcEnd.x} ${bArcEnd.y} Z`}
            fill="#059669"
            fillOpacity="0.18"
          />
          <path
            d={`M ${bArcStart.x} ${bArcStart.y} A ${angleArcR_B} ${angleArcR_B} 0 0 1 ${bArcEnd.x} ${bArcEnd.y}`}
            fill="none"
            stroke="#047857"
            strokeWidth="1.6"
          />
          <text
            x={labelPosB.x}
            y={labelPosB.y}
            textAnchor="end"
            stroke="#f8fafc"
            strokeWidth="3.5"
            style={{ paintOrder: 'stroke' }}
            className="text-[11px] font-mono font-bold fill-emerald-700 select-none pointer-events-none"
          >
            ∠B={angleBDeg.toFixed(1)}°
          </text>
        </g>
      )}

      {/* 9. 5-degree Discrete Grid Points along the Arc */}
      {fiveDegAngles.map((deg) => {
        const pt = ptOnIncircleAtDeg(deg);
        const inZone =
          selectedZone !== null &&
          deg >= selectedZone.alphaMinDeg - 1e-6 &&
          deg <= selectedZone.alphaMaxDeg + 1e-6;
        const isCurrent = Math.abs(deg - alphaDeg) < 0.25;
        return (
          <circle
            key={deg}
            cx={pt.x}
            cy={pt.y}
            r={isCurrent ? 4.5 : inZone ? 3.4 : 2.4}
            fill={isCurrent ? '#b45309' : inZone ? '#0284c7' : '#64748b'}
            stroke="#ffffff"
            strokeWidth={isCurrent ? 1.4 : 0.8}
            className="cursor-pointer"
            onPointerDown={(e) => {
              e.stopPropagation();
              onSelectAlpha(deg);
            }}
            onPointerEnter={() =>
              onHoverObject?.({
                id: `exp04-pt-${deg}`,
                title: `α = ${deg}° (∠A = ${(90 - deg).toFixed(0)}°, ∠B = ${deg}°)`,
                details: `L = ${(r * deg * DEG2RAD).toFixed(4)}, b/a = ${(1 / Math.tan(deg * DEG2RAD)).toFixed(4)}`,
                category: 'vertex',
              })
            }
            onPointerLeave={() => onHoverObject?.(null)}
          />
        );
      })}

      {/* 10. Degenerate Endpoint Markers N (0 deg) and E (90 deg) */}
      <circle cx={pN.x} cy={pN.y} r="4" fill="#ffffff" stroke="#64748b" strokeWidth="1.6" />
      <circle cx={pE.x} cy={pE.y} r="4" fill="#ffffff" stroke="#64748b" strokeWidth="1.6" />

      {/* 11. Draggable Tangency Point Handle T_AB */}
      <g
        className="cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDownTangent}
        onPointerEnter={() =>
          onHoverObject?.({
            id: 'exp04-tangent-handle',
            title: 'Точка касания гипотенузы T_AB',
            details: `α=${alphaDeg.toFixed(1)}°, ∠A=${angleADeg.toFixed(1)}°, ∠B=${angleBDeg.toFixed(1)}°, L=${currentArcLen.toFixed(4)}`,
            category: 'vertex',
          })
        }
        onPointerLeave={() => onHoverObject?.(null)}
      >
        <circle
          cx={pTc.x}
          cy={pTc.y}
          r={isDraggingTangent ? 13 : 10}
          fill="#f59e0b"
          fillOpacity="0.22"
        />
        <circle
          cx={pTc.x}
          cy={pTc.y}
          r="5.5"
          fill="#d97706"
          stroke="#ffffff"
          strokeWidth="2"
        />
      </g>
    </g>
  );
};
