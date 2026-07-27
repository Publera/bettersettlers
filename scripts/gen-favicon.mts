// Generates favicon.svg: a full Fair-mode standard board rendered by the real algorithm.
import { MapSize, MapType, getBoardConfig, Resource } from '../src/lib/constants';
import { generateBoard, type GeneratorConfig } from '../src/lib/board-generator';
import { writeFileSync } from 'fs';

const COLORS: Record<string, string> = {
  [Resource.SHEEP]: '#6abf69',
  [Resource.WHEAT]: '#f2cf5b',
  [Resource.WOOD]: '#2b7a3a',
  [Resource.ROCK]: '#8e99a4',
  [Resource.CLAY]: '#c06e3a',
  [Resource.DESERT]: '#e8dcc0',
};

const SIZE = 40;
const XS = (Math.sqrt(3) / 2) * SIZE;
const YS = 1.5 * SIZE;

function hexPoints(cx: number, cy: number, s: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    pts.push(`${(cx + s * Math.cos(a)).toFixed(2)},${(cy + s * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(' ');
}

const bc = getBoardConfig(MapSize.STANDARD);
const config: GeneratorConfig = {
  mapSize: MapSize.STANDARD,
  mapType: MapType.FAIR,
  landGrid: bc.landGrid,
  landGridOrder: bc.landGridOrder,
  waterGrid: bc.waterGrid,
  availableResources: bc.availableResources,
  availableProbabilities: bc.availableProbabilities,
  availableHarbors: bc.availableHarbors,
  orderedHarbors: bc.orderedHarbors,
};
const board = generateBoard(config);

let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
const hexes: { x: number; y: number; res: string }[] = [];
for (let i = 0; i < board.landGrid.length; i++) {
  const x = board.landGrid[i].x * XS;
  const y = board.landGrid[i].y * YS;
  hexes.push({ x, y, res: board.resourceMap[i] });
  minX = Math.min(minX, x - XS); maxX = Math.max(maxX, x + XS);
  minY = Math.min(minY, y - SIZE); maxY = Math.max(maxY, y + SIZE);
}
// square viewBox, centered
const w = maxX - minX, h = maxY - minY;
const side = Math.max(w, h) * 1.04;
const vbX = minX - (side - w) / 2;
const vbY = minY - (side - h) / 2;

let shapes = '';
for (const hx of hexes) {
  shapes += `<polygon points="${hexPoints(hx.x, hx.y, SIZE + 0.6)}" fill="${COLORS[hx.res]}" stroke="#fdfaf3" stroke-width="2.4" stroke-linejoin="round"/>`;
}
// number-token circles on non-desert tiles (no digits — reads as tokens at any size)
for (let i = 0; i < hexes.length; i++) {
  if (hexes[i].res !== Resource.DESERT) {
    shapes += `<circle cx="${hexes[i].x.toFixed(2)}" cy="${hexes[i].y.toFixed(2)}" r="${(SIZE * 0.34).toFixed(2)}" fill="#fdf6e3" stroke="rgba(0,0,0,0.12)" stroke-width="1.2"/>`;
  }
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbX.toFixed(2)} ${vbY.toFixed(2)} ${side.toFixed(2)} ${side.toFixed(2)}">${shapes}</svg>`;
writeFileSync('public/favicon.svg', svg);
console.log('favicon.svg written,', hexes.length, 'hexes, resources:', board.resourceMap.join(','));
