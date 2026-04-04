import { useMemo } from 'react';
import {
  Resource,
  PROBABILITY_MAPPING,
  RESOURCE_COLORS,
  HARBOR_LABELS,
  RESOURCE_ICONS,
  type HarborEntry,
} from '../lib/constants';
import type { BoardState } from '../lib/board-generator';

// Hex geometry constants
const HEX_SIZE = 40; // radius (flat-top)
const HEX_HEIGHT = Math.sqrt(3) * HEX_SIZE;

interface HexBoardProps {
  board: BoardState;
  className?: string;
}

/** Convert grid coordinates to pixel position */
function gridToPixel(gridX: number, gridY: number): { px: number; py: number } {
  // The original AS3 uses: x = xd * gridX + STARTING_X, y = ydt * gridY + STARTING_Y
  // where xd=40, ydt = yd1+yd2 = 27+42 = 69
  // For SVG, we use our own scaling but maintain the relative positions
  const px = HEX_SIZE * gridX;
  const py = (HEX_HEIGHT * 0.75 + 6) * gridY; // ~69 in original proportions
  return { px, py };
}

/** Generate flat-top hexagon points */
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

/** Get the vertex position of a hex (0-5, starting from right, going clockwise) */
function hexVertex(cx: number, cy: number, size: number, vertex: number): { x: number; y: number } {
  const angle = (Math.PI / 180) * (60 * vertex);
  return {
    x: cx + size * Math.cos(angle),
    y: cy + size * Math.sin(angle),
  };
}

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
  const color = RESOURCE_COLORS[resource];
  const isHighProb = probability === 6 || probability === 8;
  const textColor = isHighProb ? '#cc0000' : '#1a1a1a';
  const dots = probability !== null ? PROBABILITY_MAPPING[probability] : 0;

  // Resource label mapping
  const resourceLabel: Record<string, string> = {
    [Resource.SHEEP]: '🐑',
    [Resource.WHEAT]: '🌾',
    [Resource.WOOD]: '🌲',
    [Resource.ROCK]: '⛰️',
    [Resource.CLAY]: '🧱',
    [Resource.DESERT]: '🏜️',
  };

  return (
    <g>
      {/* Hex shape */}
      <polygon
        points={hexPoints(cx, cy, HEX_SIZE - 1)}
        fill={color}
        stroke="#ffffff"
        strokeWidth="2"
      />

      {/* Resource icon */}
      <text
        x={cx}
        y={cy - (probability !== null ? 8 : 2)}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="16"
        className="select-none"
      >
        {resourceLabel[resource] || ''}
      </text>

      {/* Number token */}
      {probability !== null && probability !== 0 && (
        <>
          {/* Token background circle */}
          <circle cx={cx} cy={cy + 8} r={14} fill="#f5f0e0" stroke="#c4b99a" strokeWidth="1.5" />
          <text
            x={cx}
            y={cy + 9}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="16"
            fontWeight="bold"
            fontFamily="'Courier New', monospace"
            fill={textColor}
            className="select-none"
          >
            {probability}
          </text>

          {/* Probability dots */}
          {dots > 0 && (
            <g>
              {Array.from({ length: dots }, (_, i) => {
                const totalWidth = (dots - 1) * 6;
                const startX = cx - totalWidth / 2;
                return (
                  <circle
                    key={i}
                    cx={startX + i * 6}
                    cy={cy + 23}
                    r={2}
                    fill={textColor}
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

function WaterHex({
  cx,
  cy,
  harbor,
}: {
  cx: number;
  cy: number;
  harbor: HarborEntry;
}) {
  const isHarbor = harbor[0] !== Resource.WATER;
  const harborResource = harbor[0];
  const harborColor = isHarbor ? RESOURCE_COLORS[harborResource] : RESOURCE_COLORS[Resource.WATER];

  // Harbor line directions (0-5 vertices)
  const harborArr = harbor as [Resource, ...number[]];
  const dir1 = harborArr.length > 1 ? (harborArr[1] as number) : -1;
  const dir2 = harborArr.length > 2 ? (harborArr[2] as number) : -1;

  return (
    <g>
      {/* Water hex shape */}
      <polygon
        points={hexPoints(cx, cy, HEX_SIZE - 1)}
        fill={RESOURCE_COLORS[Resource.WATER]}
        stroke="#ffffff"
        strokeWidth="2"
        opacity="0.6"
      />

      {/* Harbor indicator */}
      {isHarbor && (
        <>
          {/* Harbor direction lines */}
          {[dir1, dir2].map((dir, i) => {
            if (dir < 0) return null;
            const vertex = hexVertex(cx, cy, HEX_SIZE - 4, dir);
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={vertex.x}
                y2={vertex.y}
                stroke={harborResource === Resource.DESERT ? '#ffffff' : harborColor}
                strokeWidth="3"
                strokeLinecap="round"
              />
            );
          })}

          {/* Harbor circle */}
          <circle
            cx={cx}
            cy={cy}
            r={14}
            fill={harborResource === Resource.DESERT ? '#ffffff' : harborColor}
            stroke="#ffffff"
            strokeWidth="1.5"
          />

          {/* Harbor label */}
          <text
            x={cx}
            y={cy - 1}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="10"
            fontWeight="bold"
            fill={harborResource === Resource.DESERT ? '#333' : '#fff'}
            className="select-none"
          >
            {HARBOR_LABELS[harborResource] || '?'}
          </text>

          {/* Resource icon for specific harbors */}
          {harborResource !== Resource.DESERT && (
            <text
              x={cx}
              y={cy + 10}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="8"
              className="select-none"
            >
              {RESOURCE_ICONS[harborResource] || ''}
            </text>
          )}
        </>
      )}
    </g>
  );
}

export default function HexBoard({ board, className }: HexBoardProps) {
  // Calculate pixel positions for all hexes
  const { landPixels, waterPixels, viewBox } = useMemo(() => {
    const landPixels: { px: number; py: number; idx: number }[] = [];
    const waterPixels: { px: number; py: number; idx: number }[] = [];

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (let i = 0; i < board.landGrid.length; i++) {
      const { px, py } = gridToPixel(board.landGrid[i].x, board.landGrid[i].y);
      landPixels.push({ px, py, idx: i });
      minX = Math.min(minX, px - HEX_SIZE);
      minY = Math.min(minY, py - HEX_HEIGHT / 2);
      maxX = Math.max(maxX, px + HEX_SIZE);
      maxY = Math.max(maxY, py + HEX_HEIGHT / 2);
    }

    for (let i = 0; i < board.waterGrid.length; i++) {
      const { px, py } = gridToPixel(board.waterGrid[i].x, board.waterGrid[i].y);
      waterPixels.push({ px, py, idx: i });
      minX = Math.min(minX, px - HEX_SIZE);
      minY = Math.min(minY, py - HEX_HEIGHT / 2);
      maxX = Math.max(maxX, px + HEX_SIZE);
      maxY = Math.max(maxY, py + HEX_HEIGHT / 2);
    }

    const padding = 10;
    const viewBox = `${minX - padding} ${minY - padding} ${maxX - minX + padding * 2} ${maxY - minY + padding * 2}`;

    return { landPixels, waterPixels, viewBox };
  }, [board.landGrid, board.waterGrid]);

  return (
    <svg
      viewBox={viewBox}
      className={className}
      style={{ width: '100%', height: 'auto', maxHeight: '70vh' }}
    >
      {/* Water hexes (background) */}
      {waterPixels.map(({ px, py, idx }) => (
        <WaterHex
          key={`water-${idx}`}
          cx={px}
          cy={py}
          harbor={board.harborMap[idx] || [Resource.WATER]}
        />
      ))}

      {/* Land hexes (foreground) */}
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
