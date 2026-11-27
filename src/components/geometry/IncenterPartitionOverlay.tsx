/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React from 'react';
import { HoveredObject, Point2D } from '../../types/geometry.ts';
import { IncenterPartitionModel, SubTrianglePartition } from '../../math/IncenterPartition.ts';
import { toScreen } from '../../geometry/transforms.ts';
import { Translations, TRANSLATIONS } from '../../i18n/translations.ts';

interface IncenterPartitionOverlayProps {
  partition: IncenterPartitionModel;
  origin: Point2D;
  scale: number;
  showSegments?: boolean;
  showFills?: boolean;
  showRadii?: boolean;
  showAllRadii?: boolean;
  showLabels?: boolean;
  showValues?: boolean;
  proofStep?: number; // 0 = geometric mode; 1..7 = proof mode steps
  onHoverObject?: (obj: HoveredObject | null) => void;
  t?: Translations;
}

export const IncenterPartitionOverlay: React.FC<IncenterPartitionOverlayProps> = ({
  partition,
  origin,
  scale,
  showSegments = true,
  showFills = true,
  showRadii = true,
  showAllRadii = true,
  showLabels = true,
  showValues = true,
  proofStep = 0,
  onHoverObject,
  t = TRANSLATIONS.ru,
}) => {
  const { vertexA, vertexB, vertexC, incenter, inradius, subTriangles } = partition;

  // Convert points to screen space
  const pA = toScreen(vertexA, origin, scale);
  const pB = toScreen(vertexB, origin, scale);
  const pC = toScreen(vertexC, origin, scale);
  const pI = toScreen(incenter, origin, scale);

  // In proof mode, visibility is determined by progressive step
  // Step 1: Base triangle only
  // Step 2: Incenter and Ki
  // Step 3: IA, IB, IC segments
  // Step 4: SA, SB, SC region fills
  // Step 5: Common height r (perpendiculars + right-angle markers)
  // Step 6: Formulas & values
  // Step 7: Final identity S = pr
  const isProofMode = proofStep > 0;

  const effectiveShowIncenter = !isProofMode || proofStep >= 2;
  const effectiveShowSegments = isProofMode ? proofStep >= 3 : showSegments;
  const effectiveShowFills = isProofMode ? proofStep >= 4 : showFills;
  const effectiveShowRadii = isProofMode ? proofStep >= 5 : showRadii;
  const effectiveShowLabels = isProofMode ? proofStep >= 4 : showLabels;
  const effectiveShowValues = isProofMode ? proofStep >= 6 : showValues;

  // Visual palettes for the 3 sub-triangles
  const styles: Record<
    'SA' | 'SB' | 'SC',
    {
      fill: string;
      fillOpacity: string;
      stroke: string;
      badgeBg: string;
      badgeBorder: string;
      badgeText: string;
    }
  > = {
    SA: {
      fill: '#10b981', // Emerald
      fillOpacity: '0.24',
      stroke: '#059669',
      badgeBg: '#ecfdf5',
      badgeBorder: '#059669',
      badgeText: '#065f46',
    },
    SB: {
      fill: '#f59e0b', // Amber
      fillOpacity: '0.24',
      stroke: '#d97706',
      badgeBg: '#fffbeb',
      badgeBorder: '#d97706',
      badgeText: '#92400e',
    },
    SC: {
      fill: '#6366f1', // Indigo
      fillOpacity: '0.24',
      stroke: '#4f46e5',
      badgeBg: '#eef2ff',
      badgeBorder: '#4f46e5',
      badgeText: '#3730a3',
    },
  };

  const renderSubTriangleFill = (sub: SubTrianglePartition) => {
    const p0 = toScreen(sub.vertices[0], origin, scale);
    const p1 = toScreen(sub.vertices[1], origin, scale);
    const p2 = toScreen(sub.vertices[2], origin, scale);
    const style = styles[sub.id];

    return (
      <polygon
        key={`fill-${sub.id}`}
        points={`${p0.x},${p0.y} ${p1.x},${p1.y} ${p2.x},${p2.y}`}
        fill={style.fill}
        fillOpacity={style.fillOpacity}
        stroke={style.stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
        className="cursor-pointer transition-all hover:fill-opacity-35"
        onPointerEnter={() =>
          onHoverObject?.({
            id: `subtriangle-${sub.id}`,
            title: `Область ${sub.label} (${sub.name})`,
            details: `Основание ${sub.baseSideName}=${sub.baseSideLength.toFixed(2)}, Высота r=${sub.height.toFixed(3)}, Площадь ${sub.label}=${sub.area.toFixed(3)} (${(sub.share * 100).toFixed(1)}% от S)`,
            category: 'polygon',
          })
        }
        onPointerLeave={() => onHoverObject?.(null)}
      />
    );
  };

  const renderPerpendicular = (sub: SubTrianglePartition, isSingle = false) => {
    const footScreen = toScreen(sub.tangencyPoint, origin, scale);
    const markerScreen = sub.rightAngleMarker.map((p) => toScreen(p, origin, scale));
    const markerPointsStr = markerScreen.map((p) => `${p.x},${p.y}`).join(' ');

    const midScreenX = (pI.x + footScreen.x) / 2;
    const midScreenY = (pI.y + footScreen.y) / 2;

    return (
      <g key={`perp-${sub.id}`} className="incenter-perpendicular-group">
        {/* Perpendicular radius line */}
        <line
          x1={pI.x}
          y1={pI.y}
          x2={footScreen.x}
          y2={footScreen.y}
          stroke="#e11d48"
          strokeWidth="2"
          strokeDasharray="4 2"
          className="cursor-pointer"
          onPointerEnter={() =>
            onHoverObject?.({
              id: `radius-perp-${sub.id}`,
              title: `Высота r к стороне ${sub.baseSideName}`,
              details: `Перпендикуляр из I к стороне ${sub.baseSideName}: длина r = ${inradius.toFixed(3)}`,
              category: 'segment',
            })
          }
          onPointerLeave={() => onHoverObject?.(null)}
        />

        {/* Right-angle square marker */}
        <polygon
          points={markerPointsStr}
          fill="#ffe4e6"
          fillOpacity="0.75"
          stroke="#be123c"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Foot point dot */}
        <circle cx={footScreen.x} cy={footScreen.y} r="3" fill="#be123c" />

        {/* Label r near the perpendicular midpoint */}
        <text
          x={midScreenX + (sub.id === 'SA' ? 7 : sub.id === 'SB' ? -12 : 8)}
          y={midScreenY + (sub.id === 'SA' ? -4 : sub.id === 'SB' ? -6 : -6)}
          fontSize="11"
          fontWeight="bold"
          fill="#be123c"
          className="select-none pointer-events-none font-mono"
        >
          r
        </text>
      </g>
    );
  };

  const renderBadge = (sub: SubTrianglePartition) => {
    const pCentroid = toScreen(sub.centroid, origin, scale);
    const style = styles[sub.id];
    const badgeW = effectiveShowValues ? 88 : 46;
    const badgeH = effectiveShowValues ? 34 : 22;

    return (
      <g
        key={`badge-${sub.id}`}
        transform={`translate(${pCentroid.x - badgeW / 2}, ${pCentroid.y - badgeH / 2})`}
        className="cursor-pointer select-none"
        onPointerEnter={() =>
          onHoverObject?.({
            id: `subtriangle-badge-${sub.id}`,
            title: `Область ${sub.label}`,
            details: `Площадь ${sub.label} = ${sub.area.toFixed(3)} = ${sub.baseSideName}·r / 2`,
            category: 'polygon',
          })
        }
        onPointerLeave={() => onHoverObject?.(null)}
      >
        {/* Badge background with subtle shadow */}
        <rect
          x="0"
          y="0"
          width={badgeW}
          height={badgeH}
          rx="5"
          ry="5"
          fill={style.badgeBg}
          stroke={style.badgeBorder}
          strokeWidth="1.5"
          filter="drop-shadow(0 1px 2px rgba(0,0,0,0.06))"
        />

        {/* Badge Title (e.g. S_A) */}
        <text
          x={badgeW / 2}
          y={effectiveShowValues ? 13 : 15}
          textAnchor="middle"
          fontSize={effectiveShowValues ? '11' : '12'}
          fontWeight="700"
          fill={style.badgeText}
          fontFamily="ui-monospace, monospace"
        >
          {sub.label}
        </text>

        {/* Badge Numeric Value (e.g. 1.50 (25%)) */}
        {effectiveShowValues && (
          <text
            x={badgeW / 2}
            y="26"
            textAnchor="middle"
            fontSize="9.5"
            fontWeight="600"
            fill="#334155"
            fontFamily="ui-monospace, monospace"
          >
            {sub.area.toFixed(2)}{' '}
            <tspan fill="#64748b">({(sub.share * 100).toFixed(0)}%)</tspan>
          </text>
        )}
      </g>
    );
  };

  return (
    <g className="incenter-triangle-partition-layer" pointerEvents="auto">
      {/* 1. Sub-triangle fills (SA, SB, SC) */}
      {effectiveShowFills && (
        <g className="partition-fills">
          {renderSubTriangleFill(subTriangles.SA)}
          {renderSubTriangleFill(subTriangles.SB)}
          {renderSubTriangleFill(subTriangles.SC)}
        </g>
      )}

      {/* 2. Three segments from incenter I to vertices (IA, IB, IC) */}
      {effectiveShowSegments && (
        <g className="incenter-segments">
          {/* Segment IA (to vertex A) */}
          <line
            x1={pI.x}
            y1={pI.y}
            x2={pA.x}
            y2={pA.y}
            stroke="#2563eb"
            strokeWidth="2.2"
            strokeDasharray="5 3"
            strokeLinecap="round"
            className="cursor-pointer hover:stroke-blue-700"
            onPointerEnter={() =>
              onHoverObject?.({
                id: 'seg-IA',
                title: 'Отрезок IA',
                details: `Отрезок от инцентра I до вершины A: длина = ${Math.hypot(vertexA.x - incenter.x, vertexA.y - incenter.y).toFixed(3)}`,
                category: 'segment',
              })
            }
            onPointerLeave={() => onHoverObject?.(null)}
          />

          {/* Segment IB (to vertex B) */}
          <line
            x1={pI.x}
            y1={pI.y}
            x2={pB.x}
            y2={pB.y}
            stroke="#059669"
            strokeWidth="2.2"
            strokeDasharray="5 3"
            strokeLinecap="round"
            className="cursor-pointer hover:stroke-emerald-700"
            onPointerEnter={() =>
              onHoverObject?.({
                id: 'seg-IB',
                title: 'Отрезок IB',
                details: `Отрезок от инцентра I до вершины B: длина = ${Math.hypot(vertexB.x - incenter.x, vertexB.y - incenter.y).toFixed(3)}`,
                category: 'segment',
              })
            }
            onPointerLeave={() => onHoverObject?.(null)}
          />

          {/* Segment IC (to right-angle vertex C) */}
          <line
            x1={pI.x}
            y1={pI.y}
            x2={pC.x}
            y2={pC.y}
            stroke="#7c3aed"
            strokeWidth="2.2"
            strokeDasharray="5 3"
            strokeLinecap="round"
            className="cursor-pointer hover:stroke-violet-700"
            onPointerEnter={() =>
              onHoverObject?.({
                id: 'seg-IC',
                title: 'Отрезок IC (биссектриса прямого угла)',
                details: `Отрезок от инцентра I до прямого угла C: длина = r√2 = ${(inradius * Math.SQRT2).toFixed(3)}`,
                category: 'segment',
              })
            }
            onPointerLeave={() => onHoverObject?.(null)}
          />
        </g>
      )}

      {/* 3. Perpendicular heights (radii r) with right-angle markers */}
      {effectiveShowRadii && (
        <g className="incenter-radii-perpendiculars">
          {renderPerpendicular(subTriangles.SA)}
          {showAllRadii && renderPerpendicular(subTriangles.SB)}
          {showAllRadii && renderPerpendicular(subTriangles.SC)}
        </g>
      )}

      {/* 4. Labels and area values */}
      {effectiveShowLabels && (
        <g className="partition-labels">
          {renderBadge(subTriangles.SA)}
          {renderBadge(subTriangles.SB)}
          {renderBadge(subTriangles.SC)}
        </g>
      )}

      {/* 5. Incenter point I with halo and caption */}
      {effectiveShowIncenter && (
        <g
          className="incenter-node cursor-pointer"
          onPointerEnter={() =>
            onHoverObject?.({
              id: 'incenter-I',
              title: 'Инцентр I (центр вписанной окружности)',
              details: `I = (${incenter.x.toFixed(3)}, ${incenter.y.toFixed(3)}), радиус r = ${inradius.toFixed(3)}, равноудалён от всех сторон на r`,
              category: 'vertex',
            })
          }
          onPointerLeave={() => onHoverObject?.(null)}
        >
          {/* Pulsing subtle halo */}
          <circle cx={pI.x} cy={pI.y} r="10" fill="#f43f5e" fillOpacity="0.18" />

          {/* Center node */}
          <circle cx={pI.x} cy={pI.y} r="5" fill="#e11d48" stroke="#ffffff" strokeWidth="2" />

          {/* Caption */}
          <text
            x={pI.x + 9}
            y={pI.y - 8}
            fontSize="12"
            fontWeight="bold"
            fill="#be123c"
            className="select-none pointer-events-none drop-shadow-xs"
            fontFamily="ui-monospace, monospace"
          >
            I (Инцентр)
          </text>
        </g>
      )}
    </g>
  );
};
