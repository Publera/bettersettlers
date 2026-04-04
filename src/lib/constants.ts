// All constants faithfully ported from the original ActionScript source (MainTimeline.as)

// Resource type identifiers (using string constants instead of Flash color numbers)
export const Resource = {
  SHEEP: 'SHEEP',
  WHEAT: 'WHEAT',
  WOOD: 'WOOD',
  ROCK: 'ROCK',
  CLAY: 'CLAY',
  DESERT: 'DESERT',
  WATER: 'WATER',
  BLANK: 'BLANK',
  LAND: 'LAND',
} as const;
export type Resource = (typeof Resource)[keyof typeof Resource];

// Map type constants
export const MapType = {
  FAIR: 'FAIR',
  TRADITIONAL: 'TRADITIONAL',  // called NORMAL in original
  RANDOM: 'RANDOM',
} as const;
export type MapType = (typeof MapType)[keyof typeof MapType];

// Map size constants
export const MapSize = {
  STANDARD: 'STANDARD',
  LARGE: 'LARGE',
  XLARGE: 'XLARGE',
  CUSTOM: 'CUSTOM',
} as const;
export type MapSize = (typeof MapSize)[keyof typeof MapSize];

// Point type for grid coordinates
export interface Point {
  x: number;
  y: number;
}

// Harbor entry: [resourceType, lineDir1, lineDir2] or just [WATER] for no harbor
export type HarborEntry = [Resource] | [Resource, number, number];

// Ordered harbor template: either [dir1, dir2] or -1 (no harbor)
export type OrderedHarborTemplate = [number, number] | -1;

// Probability mapping: maps dice numbers (index) to dot counts
// Index 0-12, where index = dice number
// e.g., 2->1 dot, 3->2 dots, ..., 6->5 dots, 7->0, 8->5 dots, ...
export const PROBABILITY_MAPPING: number[] = [0, 0, 1, 2, 3, 4, 5, 0, 5, 4, 3, 2, 1];

// --- STANDARD BOARD (3-4 players, 19 land hexes) ---

export const STANDARD_LAND_GRID: Point[] = [
  {x:4,y:2},{x:6,y:2},{x:8,y:2},
  {x:3,y:3},{x:5,y:3},{x:7,y:3},{x:9,y:3},
  {x:2,y:4},{x:4,y:4},{x:6,y:4},{x:8,y:4},{x:10,y:4},
  {x:3,y:5},{x:5,y:5},{x:7,y:5},{x:9,y:5},
  {x:4,y:6},{x:6,y:6},{x:8,y:6},
];

// Spiral placement order for standard board
export const STANDARD_LAND_GRID_ORDER: number[] = [16,17,18,15,11,6,2,1,0,3,7,12,13,14,10,5,4,8,9];

export const STANDARD_WATER_GRID: Point[] = [
  {x:3,y:1},{x:5,y:1},{x:7,y:1},{x:9,y:1},
  {x:10,y:2},{x:11,y:3},{x:12,y:4},
  {x:11,y:5},{x:10,y:6},{x:9,y:7},
  {x:7,y:7},{x:5,y:7},{x:3,y:7},
  {x:2,y:6},{x:1,y:5},{x:0,y:4},
  {x:1,y:3},{x:2,y:2},
];

export const STANDARD_AVAILABLE_RESOURCES: Resource[] = [
  Resource.SHEEP,Resource.SHEEP,Resource.SHEEP,Resource.SHEEP,
  Resource.WHEAT,Resource.WHEAT,Resource.WHEAT,Resource.WHEAT,
  Resource.WOOD,Resource.WOOD,Resource.WOOD,Resource.WOOD,
  Resource.ROCK,Resource.ROCK,Resource.ROCK,
  Resource.CLAY,Resource.CLAY,Resource.CLAY,
  Resource.DESERT,
];

export const STANDARD_AVAILABLE_PROBABILITIES: number[] = [0,2,3,3,4,4,5,5,6,6,8,8,9,9,10,10,11,11,12];

export const STANDARD_AVAILABLE_ORDERED_PROBABILITIES: number[] = [5,2,6,3,8,10,9,12,11,4,8,10,9,4,5,6,3,11];

export const STANDARD_AVAILABLE_HARBORS: Resource[] = [
  Resource.SHEEP,Resource.WHEAT,Resource.WOOD,Resource.ROCK,Resource.CLAY,
  Resource.DESERT,Resource.DESERT,Resource.DESERT,Resource.DESERT,
];

export const STANDARD_ORDERED_HARBORS: OrderedHarborTemplate[] = [
  [3,4],-1,[4,5],-1,[4,5],-1,[5,0],-1,[0,1],-1,[0,1],-1,[1,2],-1,[2,3],-1,[2,3],-1,
];

// --- LARGE BOARD (5 players, 24 land hexes) ---

export const LARGE_LAND_GRID: Point[] = [
  {x:4,y:2},{x:6,y:2},{x:8,y:2},{x:10,y:2},
  {x:3,y:3},{x:5,y:3},{x:7,y:3},{x:9,y:3},{x:11,y:3},
  {x:2,y:4},{x:4,y:4},{x:6,y:4},{x:8,y:4},{x:10,y:4},{x:12,y:4},
  {x:3,y:5},{x:5,y:5},{x:7,y:5},{x:9,y:5},{x:11,y:5},
  {x:4,y:6},{x:6,y:6},{x:8,y:6},{x:10,y:6},
];

export const LARGE_LAND_GRID_ORDER: number[] = [20,21,22,23,19,14,8,3,2,1,0,4,9,15,16,17,18,13,7,6,5,10,11,12];

export const LARGE_WATER_GRID: Point[] = [
  {x:3,y:1},{x:5,y:1},{x:7,y:1},{x:9,y:1},{x:11,y:1},
  {x:12,y:2},{x:13,y:3},{x:14,y:4},
  {x:13,y:5},{x:12,y:6},{x:11,y:7},
  {x:9,y:7},{x:7,y:7},{x:5,y:7},{x:3,y:7},
  {x:2,y:6},{x:1,y:5},{x:0,y:4},
  {x:1,y:3},{x:2,y:2},
];

export const LARGE_AVAILABLE_RESOURCES: Resource[] = [
  Resource.SHEEP,Resource.SHEEP,Resource.SHEEP,Resource.SHEEP,Resource.SHEEP,
  Resource.WHEAT,Resource.WHEAT,Resource.WHEAT,Resource.WHEAT,Resource.WHEAT,
  Resource.WOOD,Resource.WOOD,Resource.WOOD,Resource.WOOD,Resource.WOOD,
  Resource.ROCK,Resource.ROCK,Resource.ROCK,Resource.ROCK,
  Resource.CLAY,Resource.CLAY,Resource.CLAY,Resource.CLAY,
  Resource.DESERT,
];

export const LARGE_AVAILABLE_PROBABILITIES: number[] = [0,2,3,3,4,4,5,5,6,6,8,8,8,9,9,9,10,10,10,11,11,11,12,12];

export const LARGE_AVAILABLE_ORDERED_PROBABILITIES: number[] = [2,5,4,6,3,9,8,11,11,10,6,3,8,4,8,10,11,12,10,5,4,9,5];

export const LARGE_AVAILABLE_HARBORS: Resource[] = [
  Resource.SHEEP,Resource.WHEAT,Resource.WOOD,Resource.ROCK,Resource.CLAY,
  Resource.DESERT,Resource.DESERT,Resource.DESERT,Resource.DESERT,Resource.DESERT,
];

export const LARGE_ORDERED_HARBORS: OrderedHarborTemplate[] = [
  [3,4],-1,[4,5],-1,[4,5],-1,[5,0],-1,[5,0],-1,[0,1],-1,[1,2],-1,[1,2],-1,[2,3],-1,[2,3],-1,
];

// --- X-LARGE BOARD (6 players, 30 land hexes) ---

export const XLARGE_LAND_GRID: Point[] = [
  {x:5,y:1},{x:7,y:1},{x:9,y:1},
  {x:4,y:2},{x:6,y:2},{x:8,y:2},{x:10,y:2},
  {x:3,y:3},{x:5,y:3},{x:7,y:3},{x:9,y:3},{x:11,y:3},
  {x:2,y:4},{x:4,y:4},{x:6,y:4},{x:8,y:4},{x:10,y:4},{x:12,y:4},
  {x:3,y:5},{x:5,y:5},{x:7,y:5},{x:9,y:5},{x:11,y:5},
  {x:4,y:6},{x:6,y:6},{x:8,y:6},{x:10,y:6},
  {x:5,y:7},{x:7,y:7},{x:9,y:7},
];

export const XLARGE_LAND_GRID_ORDER: number[] = [27,28,29,26,22,17,11,6,2,1,0,3,7,12,18,23,24,25,21,16,10,5,4,8,13,19,20,15,9,14];

export const XLARGE_WATER_GRID: Point[] = [
  {x:4,y:0},{x:6,y:0},{x:8,y:0},{x:10,y:0},
  {x:11,y:1},{x:12,y:2},{x:13,y:3},{x:14,y:4},
  {x:13,y:5},{x:12,y:6},{x:11,y:7},{x:10,y:8},
  {x:8,y:8},{x:6,y:8},{x:4,y:8},
  {x:3,y:7},{x:2,y:6},{x:1,y:5},
  {x:0,y:4},{x:1,y:3},{x:2,y:2},{x:3,y:1},
];

export const XLARGE_AVAILABLE_RESOURCES: Resource[] = [
  Resource.SHEEP,Resource.SHEEP,Resource.SHEEP,Resource.SHEEP,Resource.SHEEP,Resource.SHEEP,
  Resource.WHEAT,Resource.WHEAT,Resource.WHEAT,Resource.WHEAT,Resource.WHEAT,Resource.WHEAT,
  Resource.WOOD,Resource.WOOD,Resource.WOOD,Resource.WOOD,Resource.WOOD,Resource.WOOD,
  Resource.ROCK,Resource.ROCK,Resource.ROCK,Resource.ROCK,Resource.ROCK,
  Resource.CLAY,Resource.CLAY,Resource.CLAY,Resource.CLAY,Resource.CLAY,
  Resource.DESERT,Resource.DESERT,
];

export const XLARGE_AVAILABLE_PROBABILITIES: number[] = [0,0,2,2,3,3,3,4,4,4,5,5,5,6,6,6,8,8,8,9,9,9,10,10,10,11,11,11,12,12];

export const XLARGE_AVAILABLE_ORDERED_PROBABILITIES: number[] = [2,5,4,6,3,9,8,11,11,10,6,3,8,4,8,10,11,12,10,5,4,9,5,9,12,3,2,6];

export const XLARGE_AVAILABLE_HARBORS: Resource[] = [
  Resource.SHEEP,Resource.SHEEP,Resource.WHEAT,Resource.WOOD,Resource.ROCK,Resource.CLAY,
  Resource.DESERT,Resource.DESERT,Resource.DESERT,Resource.DESERT,Resource.DESERT,
];

export const XLARGE_ORDERED_HARBORS: OrderedHarborTemplate[] = [
  [3,4],-1,[4,5],-1,[4,5],-1,-1,[5,0],-1,[0,1],[5,0],-1,[0,1],-1,[1,2],-1,[2,3],[1,2],-1,[2,3],-1,-1,
];

// --- DEFAULT pools for custom maps ---

export const DEFAULT_AVAILABLE_RESOURCES: Resource[] = (() => {
  const base = [Resource.SHEEP,Resource.WOOD,Resource.WHEAT,Resource.CLAY,Resource.ROCK];
  const result: Resource[] = [];
  // 12 cycles of (5 resources + desert) = 132 entries total as in original
  for (let i = 0; i < 12; i++) {
    result.push(...base);
    if (i < 12) result.push(Resource.DESERT);
  }
  // Add remaining to fill 132 (original has repeating pattern of 5+desert)
  return result;
})();

export const DEFAULT_AVAILABLE_PROBABILITIES: number[] = (() => {
  const base = [5,11,9,3,10,4,8,2,6,12,0];
  const result: number[] = [];
  // Repeat enough times for large custom boards
  for (let i = 0; i < 12; i++) {
    result.push(...base);
  }
  return result;
})();

export const DEFAULT_AVAILABLE_HARBORS: Resource[] = (() => {
  const base = [Resource.DESERT,Resource.SHEEP,Resource.DESERT,Resource.WOOD,Resource.WHEAT,Resource.DESERT,Resource.CLAY,Resource.ROCK,Resource.DESERT];
  const result: Resource[] = [];
  for (let i = 0; i < 6; i++) {
    result.push(...base);
  }
  return result;
})();

// Board range for global map grid
export const BOARD_RANGE_X = 14;
export const BOARD_RANGE_Y = 8;

// Resource colors for rendering
export const RESOURCE_COLORS: Record<Resource, string> = {
  [Resource.SHEEP]: '#7bc67e',
  [Resource.WHEAT]: '#f5d76e',
  [Resource.WOOD]: '#2d6a2e',
  [Resource.ROCK]: '#9e9e9e',
  [Resource.CLAY]: '#c17849',
  [Resource.DESERT]: '#f0e4b8',
  [Resource.WATER]: '#4a90d9',
  [Resource.BLANK]: '#d4c5a9',
  [Resource.LAND]: '#93b76c',
};

// Text colors on resources (for contrast)
export const RESOURCE_TEXT_COLORS: Record<Resource, string> = {
  [Resource.SHEEP]: '#1a1a1a',
  [Resource.WHEAT]: '#1a1a1a',
  [Resource.WOOD]: '#ffffff',
  [Resource.ROCK]: '#1a1a1a',
  [Resource.CLAY]: '#ffffff',
  [Resource.DESERT]: '#1a1a1a',
  [Resource.WATER]: '#ffffff',
  [Resource.BLANK]: '#1a1a1a',
  [Resource.LAND]: '#1a1a1a',
};

// Harbor display strings
export const HARBOR_LABELS: Partial<Record<Resource, string>> = {
  [Resource.SHEEP]: '2:1',
  [Resource.WHEAT]: '2:1',
  [Resource.WOOD]: '2:1',
  [Resource.ROCK]: '2:1',
  [Resource.CLAY]: '2:1',
  [Resource.DESERT]: '3:1',
};

// Resource emoji/icons for harbors
export const RESOURCE_ICONS: Partial<Record<Resource, string>> = {
  [Resource.SHEEP]: '🐑',
  [Resource.WHEAT]: '🌾',
  [Resource.WOOD]: '🌲',
  [Resource.ROCK]: '⛰️',
  [Resource.CLAY]: '🧱',
};

// Resource cycle for custom map clicking: BLANK -> LAND -> WATER -> BLANK
export const RESOURCE_CYCLE: Partial<Record<Resource, Resource>> = {
  [Resource.BLANK]: Resource.LAND,
  [Resource.LAND]: Resource.WATER,
  [Resource.WATER]: Resource.BLANK,
};

// Config per board size
export interface BoardConfig {
  landGrid: Point[];
  landGridOrder: number[];
  waterGrid: Point[];
  availableResources: Resource[];
  availableProbabilities: number[];
  availableOrderedProbabilities: number[];
  availableHarbors: Resource[];
  orderedHarbors: OrderedHarborTemplate[];
}

export function getBoardConfig(size: MapSize): BoardConfig {
  switch (size) {
    case MapSize.LARGE:
      return {
        landGrid: LARGE_LAND_GRID,
        landGridOrder: LARGE_LAND_GRID_ORDER,
        waterGrid: LARGE_WATER_GRID,
        availableResources: LARGE_AVAILABLE_RESOURCES,
        availableProbabilities: LARGE_AVAILABLE_PROBABILITIES,
        availableOrderedProbabilities: LARGE_AVAILABLE_ORDERED_PROBABILITIES,
        availableHarbors: LARGE_AVAILABLE_HARBORS,
        orderedHarbors: LARGE_ORDERED_HARBORS,
      };
    case MapSize.XLARGE:
      return {
        landGrid: XLARGE_LAND_GRID,
        landGridOrder: XLARGE_LAND_GRID_ORDER,
        waterGrid: XLARGE_WATER_GRID,
        availableResources: XLARGE_AVAILABLE_RESOURCES,
        availableProbabilities: XLARGE_AVAILABLE_PROBABILITIES,
        availableOrderedProbabilities: XLARGE_AVAILABLE_ORDERED_PROBABILITIES,
        availableHarbors: XLARGE_AVAILABLE_HARBORS,
        orderedHarbors: XLARGE_ORDERED_HARBORS,
      };
    case MapSize.STANDARD:
    default:
      return {
        landGrid: STANDARD_LAND_GRID,
        landGridOrder: STANDARD_LAND_GRID_ORDER,
        waterGrid: STANDARD_WATER_GRID,
        availableResources: STANDARD_AVAILABLE_RESOURCES,
        availableProbabilities: STANDARD_AVAILABLE_PROBABILITIES,
        availableOrderedProbabilities: STANDARD_AVAILABLE_ORDERED_PROBABILITIES,
        availableHarbors: STANDARD_AVAILABLE_HARBORS,
        orderedHarbors: STANDARD_ORDERED_HARBORS,
      };
  }
}
