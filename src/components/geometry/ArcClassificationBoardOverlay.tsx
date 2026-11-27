/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React from 'react';
import { FourCirclesCalculations, HoveredObject, Point2D } from '../../types/geometry.ts';
import { toScreen } from '../../geometry/transforms.ts';
import {
  ArcDiscretizationResult,
  ArcSampleTriangle,
} from '../../math/experiments/arcBasedClassification.ts';

interface ArcClassificationBoardOverlayProps {
  calc: FourCirclesCalculations;
  origin: Point2D;
  scale: number;
  phiDeg: number;
  discretization: ArcDiscretizationResult;
  isDraggingTangent: boolean;
  onPointerDownTangent: (e: React.PointerEvent) => void;
  onSelectSample: (sample: ArcSampleTriangle) => void;
  onHoverObject?: (obj: HoveredObject | null) => void;
}

export const ArcClassificationBoardOverlay: React.FC<ArcClassificationBoardOverlayProps> = ({
  calc,
  origin,
  scale,
  phiDeg,
  discretization,
  isDraggingTangent,
  onPointerDownTangent,
  onSelectSample,
  onHoverObject,
}) => {
  const r = calc.incircle.radius;
  const pxR = r * scale;

  // Center I = (r, r), top extreme N = (r, 2r), right extreme E = (2r, r)
  const pO = toScreen({ x: 0, y: 0 }, origin, scale);
  const pI = toScreen(calc.incircle.center, origin, scale);
  const pN = toScreen({ x: r, y: 2 * r }, origin, scale);
  const pE = toScreen({ x: 2 * r, y: r }, origin, scale);
  const pTc = toScreen(calc.incircle.tangencyAB, origin, scale);

  // Fixed perpendicular leg rays extending beyond current A and B
  const maxRayY = Math.max(calc.triangle.a + 2.2, 2 * r + 3.2);
  const maxRayX = Math.max(calc.triangle.b + 2.2, 2 * r + 3.2);
  const pRayY = toScreen({ x: 0, y: maxRayY }, origin, scale);
  const pRayX = toScreen({ x: maxRayX, y: 0 }, origin, scale);

  // Angle sector arc around center I from N (12 o'clock) to T_AB
  const angleArcPxR = Math.min(pxR * 0.48, Math.max(18, pxR * 0.42));
  const phiRad = (phiDeg * Math.PI) / 180;
  const sectorStart = { x: pI.x, y: pI.y - angleArcPxR };
  const sectorEnd = {
    x: pI.x + angleArcPxR * Math.sin(phiRad),
    y: pI.y - angleArcPxR * Math.cos(phiRad),
  };

  // Visual stride if sample count is very large (e.g. step = 0.1 deg -> 899 points)
  const samples = discretization.samples;
  const maxRenderedDots = 120;
  const stride = samples.length > maxRenderedDots ? Math.ceil(samples.length / maxRenderedDots) : 1;
  const visibleSamples =
    stride === 1 ? samples : samples.filter((_, idx) => idx % stride === 0 || idx === samples.length - 1);

  const currentArcLen = r * phiRad;
  const midPhiRad = phiRad / 2;
  const arcLabelPt = {
    x: pI.x + (pxR + 18) * Math.sin(midPhiRad),
    y: pI.y - (pxR + 18) * Math.cos(midPhiRad),
  };

  return (
    <g className="arc-classification-overlay">
      {/* 1. Fixed Orthogonal Tangent Leg Guides (+y and +x) */}
      <line
        x1={pO.x}
        y1={pO.y}
        x2={pRayY.x}
        y2={pRayY.y}
        stroke="#1d4ed8"
        strokeWidth="1.5"
        strokeDasharray="6 4"
        opacity="0.55"
      />
      <line
        x1={pO.x}
        y1={pO.y}
        x2={pRayX.x}
        y2={pRayX.y}
        stroke="#047857"
        strokeWidth="1.5"
        strokeDasharray="6 4"
        opacity="0.55"
      />

      {/* 2. Available Quarter-Circle Tangency Arc [N -> E], angle = 90 deg, length = pi*r/2 */}
      {pxR > 2 && (
        <path
          d={`M ${pN.x} ${pN.y} A ${pxR} ${pxR} 0 0 1 ${pE.x} ${pE.y}`}
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="6"
          strokeLinecap="round"
        />
      )}

      {/* 3. Active Swept Arc L(phi) from N to T_AB */}
      {pxR > 2 && (
        <path
          d={`M ${pN.x} ${pN.y} A ${pxR} ${pxR} 0 0 1 ${pTc.x} ${pTc.y}`}
          fill="none"
          stroke="#d97706"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
      )}

      {/* 4. Sector wedge for angle phi */}
      {pxR > 24 && (
        <>
          <path
            d={`M ${pI.x} ${pI.y} L ${sectorStart.x} ${sectorStart.y} A ${angleArcPxR} ${angleArcPxR} 0 0 1 ${sectorEnd.x} ${sectorEnd.y} Z`}
            fill="#f59e0b"
            fillOpacity="0.16"
          />
          <path
            d={`M ${sectorStart.x} ${sectorStart.y} A ${angleArcPxR} ${angleArcPxR} 0 0 1 ${sectorEnd.x} ${sectorEnd.y}`}
            fill="none"
            stroke="#b45309"
            strokeWidth="1.5"
          />
        </>
      )}

      {/* 5. Reference radius I -> N and live tangency radius I -> T_AB */}
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

      {/* 6. Excluded Degenerate Endpoints N (0 deg) and E (90 deg) */}
      <g>
        <circle
          cx={pN.x}
          cy={pN.y}
          r="4.5"
          fill="#ffffff"
          stroke="#64748b"
          strokeWidth="1.8"
        />
        <circle
          cx={pE.x}
          cy={pE.y}
          r="4.5"
          fill="#ffffff"
          stroke="#64748b"
          strokeWidth="1.8"
        />
        <text
          x={pN.x}
          y={pN.y - 10}
          textAnchor="middle"
          stroke="#f8fafc"
          strokeWidth="3"
          style={{ paintOrder: 'stroke' }}
          className="text-[10px] font-mono fill-slate-500 select-none pointer-events-none"
        >
          φ=0° (вырожд.)
        </text>
        <text
          x={pE.x + 10}
          y={pE.y + 3}
          textAnchor="start"
          stroke="#f8fafc"
          strokeWidth="3"
          style={{ paintOrder: 'stroke' }}
          className="text-[10px] font-mono fill-slate-500 select-none pointer-events-none"
        >
          φ=90° (вырожд.)
        </text>
      </g>

      {/* 7. Discrete Sample Points Along the Available Quarter-Circle Arc */}
      {visibleSamples.map((sample) => {
        const pt = toScreen(sample.tangencyAB, origin, scale);
        const isCurrent = Math.abs(sample.phiDeg - phiDeg) < 0.08;
        return (
          <circle
            key={`${discretization.mode}-${sample.index}`}
            cx={pt.x}
            cy={pt.y}
            r={isCurrent ? 4.5 : stride > 1 ? 2 : 3}
            fill={isCurrent ? '#b45309' : sample.isUniqueShape ? '#0284c7' : '#94a3b8'}
            stroke="#ffffff"
            strokeWidth={isCurrent ? 1.5 : 0.8}
            className="cursor-pointer transition-transform"
            onPointerDown={(e) => {
              e.stopPropagation();
              onSelectSample(sample);
            }}
            onPointerEnter={() =>
              onHoverObject?.({
                id: `arc-sample-${sample.index}`,
                title: `#${sample.index} (φ=${sample.phiDeg.toFixed(2)}°, θ=${sample.thetaCotHalfDeg.toFixed(2)}°)`,
                details: `L=${sample.arcLengthFromN.toFixed(4)}, t=${sample.t.toFixed(4)}, (a=${sample.triangle.a.toFixed(2)}, b=${sample.triangle.b.toFixed(2)}, c=${sample.triangle.c.toFixed(2)})`,
                category: 'vertex',
              })
            }
            onPointerLeave={() => onHoverObject?.(null)}
          />
        );
      })}

      {/* 8. Arc Coordinate Readout Tag */}
      {pxR > 28 && (
        <text
          x={arcLabelPt.x}
          y={arcLabelPt.y}
          textAnchor="start"
          stroke="#f8fafc"
          strokeWidth="3.5"
          style={{ paintOrder: 'stroke' }}
          className="text-[11px] font-mono font-bold fill-amber-800 select-none pointer-events-none"
        >
          φ={phiDeg.toFixed(1)}° · L={currentArcLen.toFixed(3)}
        </text>
      )}

      {/* 9. Draggable Tangency Point Handle T_AB on K_i */}
      <g
        className="cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDownTangent}
        onPointerEnter={() =>
          onHoverObject?.({
            id: 'tangent-handle-TAB',
            title: 'Точка касания гипотенузы T_AB',
            details: `Перетащите вдоль дуги: φ=${phiDeg.toFixed(2)}°, θ=2φ=${(2 * phiDeg).toFixed(2)}°, L=${currentArcLen.toFixed(4)}`,
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
