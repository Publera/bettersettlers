import { useMemo } from 'react';
import {
  Resource,
  PROBABILITY_MAPPING,
  HARBOR_LABELS,
  type HarborEntry,
} from '../lib/constants';
import type { BoardState } from '../lib/board-generator';

// ── Hex geometry ──────────────────────────────────────────
// Flat-top regular hexagons that tessellate with zero gaps.
// HEX_SIZE = distance from center to any vertex.
const HEX_SIZE = 40;
const HEX_W = HEX_SIZE * 2;            // full width  (vertex to vertex)
const HEX_H = Math.sqrt(3) * HEX_SIZE; // full height (flat edge to flat edge)

interface HexBoardProps {
  board: BoardState;
  className?: string;
  animationKey?: number;
}

// ── Colorblind-friendly resource palette ──────────────────
// Designed with distinct hue, saturation, AND value to remain
// distinguishable under all three major color-vision deficiencies.
const RESOURCE_FILL: Record<string, string> = {
  [Resource.SHEEP]: '#6abf69',
  [Resource.WHEAT]: '#f2cf5b',
  [Resource.WOOD]: '#2b7a3a',
  [Resource.ROCK]: '#8e99a4',
  [Resource.CLAY]: '#c06e3a',
  [Resource.DESERT]: '#e8dcc0',
};

// Resource SVG icon paths (small, crisp inline symbols — no emoji)
const RESOURCE_ICON: Record<string, { path: string; viewBox: string; fill: string }> = {
  [Resource.SHEEP]: {
    // Fluffy cloud shape representing wool
    path: 'M12 8c-1.5 0-2.7.8-3.2 2H8c-2.2 0-4 1.8-4 4s1.8 4 4 4h8c2.2 0 4-1.8 4-4 0-1.9-1.3-3.4-3-3.9-.5-1.2-1.7-2.1-3-2.1z',
    viewBox: '0 0 24 24',
    fill: '#fff',
  },
  [Resource.WHEAT]: {
    // Wheat stalk
    path: 'M12 2L9 7l3 1 3-1-3-5zm0 6L9 13l3 1 3-1-3-5zm0 6l-2 4h4l-2-4z',
    viewBox: '0 0 24 24',
    fill: '#8B6914',
  },
  [Resource.WOOD]: {
    // Tree / pine
    path: 'M12 2L5 12h3l-2 5h4v5h4v-5h4l-2-5h3L12 2z',
    viewBox: '0 0 24 24',
    fill: '#c8e6c9',
  },
  [Resource.ROCK]: {
    // Mountain peaks
    path: 'M3 20h18L15 7l-3 5-3-3-6 11z',
    viewBox: '0 0 24 24',
    fill: '#455a64',
  },
  [Resource.CLAY]: {
    // Brick shape
    path: 'M3 6h8v4H3zm10 0h8v4h-8zM3 12h5v4H3zm7 0h4v4h-4zm6 0h5v4h-5z',
    viewBox: '0 0 24 24',
    fill: '#fff3e0',
  },
  [Resource.DESERT]: {
    // Cactus
    path: 'M11 4v5H9v4h2v9h2v-9h2V9h-2V4h-2z',
    viewBox: '0 0 24 24',
    fill: '#a1887f',
  },
};

// Short text labels for accessibility (shown alongside icon)
const RESOURCE_LABEL: Record<string, string> = {
  [Resource.SHEEP]: 'Wool',
  [Resource.WHEAT]: 'Grain',
  [Resource.WOOD]: 'Wood',
  [Resource.ROCK]: 'Ore',
  [Resource.CLAY]: 'Brick',
  [Resource.DESERT]: 'Desert',
};

// Harbor resource indicator colors
const HARBOR_DOT_COLOR: Record<string, string> = {
  [Resource.SHEEP]: '#6abf69',
  [Resource.WHEAT]: '#f2cf5b',
  [Resource.WOOD]: '#2b7a3a',
  [Resource.ROCK]: '#8e99a4',
  [Resource.CLAY]: '#c06e3a',
  [Resource.DESERT]: '#e8dcc0',
};

// ── Geometry helpers ──────────────────────────────────────

// Convert the game's offset-grid coordinates to pixel positions.
// The grid uses even-q offset layout:
//   • columns step by x (2 = one hex apart)
//   • odd rows are shifted right by 1 unit in x
// For flat-top hexes the repeat distances are:
//   horiz: 1.5 × size   (3/4 of HEX_W)
//   vert:  √3 × size     (HEX_H)
// Each grid-x step of 1 equals half a hex column, so multiply by 0.75×size.
// Each grid-y step of 1 equals one full hex row, so multiply by HEX_H.
function gridToPixel(gridX: number, gridY: number): { px: number; py: number } {
  const px = gridX * (HEX_SIZE * 0.75);       // 0.75 * size per grid unit
  const py = gridY * (HEX_H * 0.5);           // half-height per grid unit
  return { px, py };
}

function hexPoints(cx: number, cy: number, size: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i);
    const x = cx + size * Math.cos(angle);
    const y = cy + size * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return points.join(' ');
}

function hexVertex(cx: number, cy: number, size: number, vertex: number): { x: number; y: number } {
  const angle = (Math.PI / 180) * (60 * vertex);
  return {
    x: cx + size * Math.cos(angle),
    y: cy + size * Math.sin(angle),
  };
}

// ── ResourceHex component ─────────────────────────────────

function ResourceHex({
  cx,
  cy,
  resource,
  probability,
}: {
  cx: number;
  cy: number;
  resource: Resource;
  probability: number | null;
}) {
  const fill = RESOURCE_FILL[resource] || '#d4c5a9';
  const isHighProb = probability === 6 || probability === 8;
  const numberColor = isHighProb ? '#cc2200' : '#2a2520';
  const dots = probability !== null ? PROBABILITY_MAPPING[probability] : 0;
  const icon = RESOURCE_ICON[resource];
  const label = RESOURCE_LABEL[resource] || '';
  const isDark = resource === Resource.WOOD;

  return (
    <g role="img" aria-label={`${label}${probability ? ` with number ${probability}` : ''}`}>
      {/* Hex background */}
      <polygon
        points={hexPoints(cx, cy, HEX_SIZE)}
        fill={fill}
        stroke="var(--color-bg, #f5f0e8)"
        strokeWidth="2"
      />

      {/* Subtle inner edge highlight */}
      <polygon
        points={hexPoints(cx, cy, HEX_SIZE - 2.5)}
        fill="none"
        stroke={isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.25)'}
        strokeWidth="0.75"
      />

      {/* Resource icon */}
      {icon && (
        <svg
          x={cx - 7}
          y={cy - (probability !== null ? 15 : 7)}
          width="14"
          height="14"
          viewBox={icon.viewBox}
        >
          <path d={icon.path} fill={icon.fill} opacity="0.85" />
        </svg>
      )}

      {/* Tiny resource label for accessibility */}
      <text
        x={cx}
        y={cy - (probability !== null ? 22 : 14)}
        textAnchor="middle"
        dominantBaseline="auto"
        fontSize="5.5"
        fontWeight="600"
        fill={isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.45)'}
        className="select-none"
        aria-hidden="true"
      >
        {label.toUpperCase()}
      </text>

      {/* Number token */}
      {probability !== null && probability !== 0 && (
        <>
          <circle
            cx={cx}
            cy={cy + 6}
            r={13}
            fill="#f8f4ea"
            stroke="#c8c0ac"
            strokeWidth="1.2"
          />
          <text
            x={cx}
            y={cy + 7}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={isHighProb ? '15' : '14'}
            fontWeight="bold"
            fontFamily="'Inter', system-ui, sans-serif"
            fill={numberColor}
            className="select-none"
          >
            {probability}
          </text>

          {/* Probability dots */}
          {dots > 0 && (
            <g>
              {Array.from({ length: dots }, (_, i) => {
                const totalWidth = (dots - 1) * 5;
                const startX = cx - totalWidth / 2;
                return (
                  <circle
                    key={i}
                    cx={startX + i * 5}
                    cy={cy + 19}
                    r={1.8}
                    fill={numberColor}
                  />
                );
              })}
            </g>
          )}
        </>
      )}
    </g>
  );
}

// ── WaterHex component ────────────────────────────────────

function WaterHex({
  cx,
  cy,
  harbor,
  waterGradientId,
}: {
  cx: number;
  cy: number;
  harbor: HarborEntry;
  waterGradientId: string;
}) {
  const isHarbor = harbor[0] !== Resource.WATER;
  const harborResource = harbor[0];
  const harborArr = harbor as [Resource, ...number[]];
  const dir1 = harborArr.length > 1 ? (harborArr[1] as number) : -1;
  const dir2 = harborArr.length > 2 ? (harborArr[2] as number) : -1;
  const harborLabel = isHarbor ? (HARBOR_LABELS[harborResource] || '?') : '';
  const is3to1 = harborResource === Resource.DESERT;

  return (
    <g role={isHarbor ? 'img' : undefined} aria-label={isHarbor ? `Harbor: ${harborLabel} trade${!is3to1 ? ` for ${RESOURCE_LABEL[harborResource] || 'any'}` : ''}` : undefined}>
      {/* Water hex */}
      <polygon
        points={hexPoints(cx, cy, HEX_SIZE)}
        fill={`url(#${waterGradientId})`}
        stroke="var(--color-bg, #f5f0e8)"
        strokeWidth="2"
        opacity="0.55"
      />

      {/* Subtle wave pattern */}
      <line
        x1={cx - 14}
        y1={cy - 2}
        x2={cx + 14}
        y2={cy - 2}
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1={cx - 10}
        y1={cy + 5}
        x2={cx + 10}
        y2={cy + 5}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="0.8"
        strokeLinecap="round"
      />

      {/* Harbor indicator */}
      {isHarbor && (
        <>
          {/* Direction lines (dock lines) */}
          {[dir1, dir2].map((dir, i) => {
            if (dir < 0) return null;
            const vertex = hexVertex(cx, cy, HEX_SIZE - 5, dir);
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={vertex.x}
                y2={vertex.y}
                stroke="#f8f4ea"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.8"
              />
            );
          })}

          {/* Harbor circle background */}
          <circle
            cx={cx}
            cy={cy}
            r={13}
            fill="#f8f4ea"
            stroke="#c8c0ac"
            strokeWidth="1.2"
          />

          {/* Trade ratio text */}
          <text
            x={cx}
            y={cy + (is3to1 ? 0.5 : -2.5)}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="10"
            fontWeight="700"
            fontFamily="'Inter', system-ui, sans-serif"
            fill="#2a2520"
            className="select-none"
          >
            {harborLabel}
          </text>

          {/* Resource color dot for 2:1 harbors */}
          {!is3to1 && (
            <circle
              cx={cx}
              cy={cy + 7}
              r={3.5}
              fill={HARBOR_DOT_COLOR[harborResource] || '#999'}
              stroke="#c8c0ac"
              strokeWidth="0.6"
            />
          )}
        </>
      )}
    </g>
  );
}

// ── Main board component ──────────────────────────────────

export default function HexBoard({ board, className, animationKey }: HexBoardProps) {
  const { landPixels, waterPixels, viewBox } = useMemo(() => {
    const landPixels: { px: number; py: number; idx: number }[] = [];
    const waterPixels: { px: number; py: number; idx: number }[] = [];

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (let i = 0; i < board.landGrid.length; i++) {
      const { px, py } = gridToPixel(board.landGrid[i].x, board.landGrid[i].y);
      landPixels.push({ px, py, idx: i });
      minX = Math.min(minX, px - HEX_SIZE);
      minY = Math.min(minY, py - HEX_H / 2);
      maxX = Math.max(maxX, px + HEX_SIZE);
      maxY = Math.max(maxY, py + HEX_H / 2);
    }

    for (let i = 0; i < board.waterGrid.length; i++) {
      const { px, py } = gridToPixel(board.waterGrid[i].x, board.waterGrid[i].y);
      waterPixels.push({ px, py, idx: i });
      minX = Math.min(minX, px - HEX_SIZE);
      minY = Math.min(minY, py - HEX_H / 2);
      maxX = Math.max(maxX, px + HEX_SIZE);
      maxY = Math.max(maxY, py + HEX_H / 2);
    }

    const padding = 12;
    const viewBox = `${minX - padding} ${minY - padding} ${maxX - minX + padding * 2} ${maxY - minY + padding * 2}`;

    return { landPixels, waterPixels, viewBox };
  }, [board.landGrid, board.waterGrid]);

  const waterGradientId = `water-grad-${animationKey || 0}`;

  return (
    <svg
      viewBox={viewBox}
      className={className}
      role="img"
      aria-label="Catan board layout with resources, numbers, and harbors"
      style={{
        width: '100%',
        height: 'auto',
        maxHeight: '72dvh',
        willChange: 'transform',
      }}
    >
      <defs>
        {/* Ocean gradient */}
        <radialGradient id={waterGradientId} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#5ba3e6" />
          <stop offset="60%" stopColor="#3b7fd4" />
          <stop offset="100%" stopColor="#2563a8" />
        </radialGradient>
      </defs>

      {/* Water hexes (background layer) */}
      {waterPixels.map(({ px, py, idx }) => (
        <WaterHex
          key={`water-${idx}`}
          cx={px}
          cy={py}
          harbor={board.harborMap[idx] || [Resource.WATER]}
          waterGradientId={waterGradientId}
        />
      ))}

      {/* Land hexes (foreground layer) */}
      {landPixels.map(({ px, py, idx }) => (
        <ResourceHex
          key={`land-${idx}`}
          cx={px}
          cy={py}
          resource={board.resourceMap[idx]}
          probability={
            board.resourceMap[idx] === Resource.DESERT
              ? null
              : board.probabilityMap[idx]
          }
        />
      ))}
    </svg>
  );
}
