/**
 * Board generation algorithm faithfully ported from the original ActionScript source.
 * (MainTimeline.as, ~2195 lines)
 *
 * Three generation modes: Fair, Traditional, Random
 * The Fair mode is the "Better Settlers" algorithm with balanced constraints.
 */

import {
  Resource,
  MapType,
  MapSize,
  PROBABILITY_MAPPING,
  DEFAULT_AVAILABLE_RESOURCES,
  DEFAULT_AVAILABLE_PROBABILITIES,
  DEFAULT_AVAILABLE_HARBORS,
  type Point,
  type HarborEntry,
  type OrderedHarborTemplate,
} from './constants';

// ─── Utility functions ────────────────────────────────────────────

function nextInt(n: number): number {
  return Math.floor(Math.random() * n);
}

function pointsEqual(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

function getNumberOf(item: Resource, arr: Resource[]): number {
  return arr.filter(x => x === item).length;
}

function sumProbability(arr: number[]): number {
  return arr.reduce((sum, n) => sum + PROBABILITY_MAPPING[n], 0);
}

/**
 * Exact port of AS3 isBalanced:
 * The AS3 code iterates through each element, checks if its probability
 * exceeds the sum of all OTHER elements' probabilities. Uses shift/unshift
 * to rotate through the array.
 */
function isBalancedExact(probsInput: number[]): boolean {
  const arr = [...probsInput];
  let len = arr.length;
  if (len < 3) return true;

  for (let i = 0; i < probsInput.length; i++) {
    const val = arr.shift()!;
    if (PROBABILITY_MAPPING[val] > sumProbability(arr)) {
      return false;
    }
    arr.unshift(val);
    // In AS3, this loop decrements _loc2_ each iteration and shifts/unshifts
    // The key check: for each position, is that element's probability > sum of rest?
  }
  return true;
}

/**
 * Exact port of AS3 noDuplicates.
 * Special case: if total resource tiles > 30, always returns true.
 */
function noDuplicates(arr: number[], totalResourceTiles: number): boolean {
  const copy = [...arr];
  let duplicates = 0;
  const len = copy.length;

  for (let i = 0; i < len; i++) {
    const val = copy.pop()!;
    if (copy.indexOf(val) !== -1) {
      duplicates++;
    }
    copy.unshift(val);
  }

  if (totalResourceTiles > 30) {
    return true;
  }
  return duplicates === 0;
}

// ─── Hex neighbor functions ───────────────────────────────────────

/** Get the 6 neighbors of a hex in offset coordinates (matches AS3 exactly) */
function getHexNeighbors(x: number, y: number): Point[] {
  return [
    { x: x - 1, y: y - 1 },
    { x: x + 1, y: y - 1 },
    { x: x + 2, y: y },
    { x: x + 1, y: y + 1 },
    { x: x - 1, y: y + 1 },
    { x: x - 2, y: y },
  ];
}

function pointsAreTouching(a: Point, b: Point): boolean {
  return (
    (a.x + 2 === b.x && a.y === b.y) ||
    (a.x + 1 === b.x && a.y + 1 === b.y) ||
    (a.x - 1 === b.x && a.y + 1 === b.y) ||
    (a.x - 2 === b.x && a.y === b.y) ||
    (a.x - 1 === b.x && a.y - 1 === b.y) ||
    (a.x + 1 === b.x && a.y - 1 === b.y)
  );
}

/** Get all land neighbor indices for each hex in the land grid */
function getAllLandNeighbors(landGrid: Point[]): number[][] {
  const result: number[][] = [];
  for (let i = 0; i < landGrid.length; i++) {
    const pt = landGrid[i];
    const neighbors = getHexNeighbors(pt.x, pt.y);
    const indices: number[] = [];
    for (const neighbor of neighbors) {
      for (let j = 0; j < landGrid.length; j++) {
        if (pointsEqual(landGrid[j], neighbor)) {
          indices.push(j);
        }
      }
    }
    result.push(indices.sort((a, b) => a - b));
  }
  return result;
}

/** Get land neighbor indices for each water hex */
function getAllWaterNeighbors(waterGrid: Point[], landGrid: Point[]): number[][] {
  const result: number[][] = [];
  for (let i = 0; i < waterGrid.length; i++) {
    const pt = waterGrid[i];
    const neighbors = getHexNeighbors(pt.x, pt.y);
    const indices: number[] = [];
    for (const neighbor of neighbors) {
      for (let j = 0; j < landGrid.length; j++) {
        if (pointsEqual(landGrid[j], neighbor)) {
          indices.push(j);
        }
      }
    }
    result.push(indices.sort((a, b) => a - b));
  }
  return result;
}

/** Get every pair from an array */
function getEveryPair(arr: number[]): Point[] {
  const result: Point[] = [];
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      result.push({ x: arr[i], y: arr[j] });
    }
  }
  return result;
}

function arrayContainsTriplet(arr: number[][], triplet: number[]): boolean {
  const sorted = [...triplet].sort((a, b) => a - b);
  for (const item of arr) {
    const itemSorted = [...item].sort((a, b) => a - b);
    if (itemSorted[0] === sorted[0] && itemSorted[1] === sorted[1] && itemSorted[2] === sorted[2]) {
      return true;
    }
  }
  return false;
}

/** Get all 3-hex intersections (vertices where 3 hexes meet) */
function getIntersections(landGrid: Point[], landNeighbors: number[][]): number[][] {
  const result: number[][] = [];
  for (let i = 0; i < landNeighbors.length; i++) {
    const pairs = getEveryPair(landNeighbors[i]);
    for (const pair of pairs) {
      const ptA = landGrid[pair.x];
      const ptB = landGrid[pair.y];
      const triplet = [i, pair.x, pair.y];
      if (pointsAreTouching(ptA, ptB) && !arrayContainsTriplet(result, triplet)) {
        result.push(triplet);
      }
    }
  }
  return result;
}

/** Build index: for each hex, which intersections does it belong to? */
function getIntersectionIndexes(intersections: number[][]): number[][] {
  const result: number[][] = [];
  for (let i = 0; i < intersections.length; i++) {
    for (const hexIdx of intersections[i]) {
      if (!result[hexIdx]) {
        result[hexIdx] = [];
      }
      result[hexIdx].push(i);
    }
  }
  return result;
}

/** Get harbor line possibilities for each water hex */
function getHarborLinePossibilities(waterGrid: Point[], landGrid: Point[]): number[][] {
  const result: number[][] = [];
  for (let i = 0; i < waterGrid.length; i++) {
    const pt = waterGrid[i];
    const neighbors = getHexNeighbors(pt.x, pt.y);
    const touchesLand: Record<number, boolean> = {};

    for (let n = 0; n < neighbors.length; n++) {
      for (let l = 0; l < landGrid.length; l++) {
        if (pointsEqual(landGrid[l], neighbors[n])) {
          touchesLand[n] = true;
          touchesLand[(n + 1) % 6] = true;
        }
      }
    }

    const lines: number[] = [];
    for (let v = 0; v < 6; v++) {
      if (touchesLand[v]) {
        lines.push(v);
      }
    }
    result.push(lines);
  }
  return result;
}

/** Find an adjacent harbor line direction */
function nextGoodHarborLine(lines: number[], idx: number): number {
  for (let i = 0; i < lines.length; i++) {
    if (1 === Math.abs(lines[idx] - lines[i]) || 5 === Math.abs(lines[idx] - lines[i])) {
      return lines[i];
    }
  }
  return -1;
}

// ─── Board state ──────────────────────────────────────────────────

export interface BoardState {
  landGrid: Point[];
  waterGrid: Point[];
  resourceMap: Resource[];
  probabilityMap: number[];
  harborMap: HarborEntry[];
}

export interface GeneratorConfig {
  mapSize: MapSize;
  mapType: MapType;
  landGrid: Point[];
  landGridOrder: number[];
  waterGrid: Point[];
  availableResources: Resource[];
  availableProbabilities: number[];
  availableHarbors: Resource[];
  orderedHarbors: OrderedHarborTemplate[];
}

// ─── Precomputed data ─────────────────────────────────────────────

export interface PrecomputedData {
  landNeighbors: number[][];
  waterNeighbors: number[][];
  landIntersections: number[][];
  landIntersectionIndexes: number[][];
  harborLines: number[][];
  totalResourceTiles: number;
}

export function precompute(config: GeneratorConfig): PrecomputedData {
  const landNeighbors = getAllLandNeighbors(config.landGrid);
  const waterNeighbors = getAllWaterNeighbors(config.waterGrid, config.landGrid);
  const landIntersections = getIntersections(config.landGrid, landNeighbors);
  const landIntersectionIndexes = getIntersectionIndexes(landIntersections);
  const harborLines = getHarborLinePossibilities(config.waterGrid, config.landGrid);

  const resourceCounts = [Resource.SHEEP, Resource.WOOD, Resource.CLAY, Resource.ROCK, Resource.WHEAT];
  const totalResourceTiles = resourceCounts.reduce(
    (sum, r) => sum + getNumberOf(r, config.availableResources), 0
  );

  return {
    landNeighbors,
    waterNeighbors,
    landIntersections,
    landIntersectionIndexes,
    harborLines,
    totalResourceTiles,
  };
}

// ─── Resource initialization helpers ──────────────────────────────

function initAvailResourcesNoDesert(available: Resource[]): Resource[] {
  return available.filter(r => r !== Resource.DESERT);
}

function initProbabilities(available: number[]): number[] {
  return [...available];
}

function initProbabilitiesNoZeros(available: number[]): number[] {
  return available.filter(n => n !== 0);
}

function initHarbors(available: Resource[]): Resource[] {
  return [...available];
}

function initResourceMap(availableResources: Resource[]): Map<Resource, number[]> {
  const map = new Map<Resource, number[]>();
  for (const r of availableResources) {
    if (!map.has(r)) {
      map.set(r, []);
    }
  }
  return map;
}

// ─── FAIR Distribution — getOrderedResources ─────────────────────

function getOrderedResources(
  probabilities: number[],
  config: GeneratorConfig,
  precomp: PrecomputedData,
): Resource[] {
  const { availableResources, mapSize } = config;
  const { landNeighbors } = precomp;

  let resourceTracker = initResourceMap(availableResources);
  let result: Resource[] = [];
  let rejected: Resource[] = [];
  let pool = initAvailResourcesNoDesert(availableResources);
  let hadSuccess = false;

  while (rejected.length !== 0 || pool.length !== 0) {
    if (hadSuccess && rejected.length !== 0) {
      pool = pool.concat(rejected);
      rejected = [];
      hadSuccess = false;
    }

    if (pool.length === 0) {
      // Restart
      resourceTracker = initResourceMap(availableResources);
      result = [];
      rejected = [];
      pool = initAvailResourcesNoDesert(availableResources);
      hadSuccess = false;
    } else {
      const idx = result.length;
      const prob = probabilities[idx];

      if (prob === 0) {
        // Desert slot
        result.push(Resource.DESERT);
        hadSuccess = true;
      } else {
        // Pick random resource from pool
        const randIdx = nextInt(pool.length);
        const temp: Resource[] = [];
        for (let i = 0; i < randIdx; i++) {
          temp.push(pool.pop()!);
        }
        const resource = pool.pop()!;
        while (temp.length > 0) {
          pool.push(temp.pop()!);
        }

        // Relaxed constraints for small custom maps
        if (mapSize === MapSize.CUSTOM && probabilities.length < 10) {
          result.push(resource);
          resourceTracker.get(resource)!.push(prob);
          hadSuccess = true;
        } else {
          let valid = true;

          // Check no same-resource adjacency
          for (const neighborIdx of landNeighbors[idx] || []) {
            if (neighborIdx < result.length) {
              if (result[neighborIdx] === resource) {
                valid = false;
                break;
              }
            }
          }

          // Check no duplicate probability on same resource
          if (resourceTracker.get(resource)!.indexOf(prob) >= 0) {
            valid = false;
          }

          // Check probability balance when resource group is complete
          const count = getNumberOf(resource, availableResources);
          const currentProbs = [...resourceTracker.get(resource)!, prob];
          if (count === currentProbs.length) {
            const totalProb = sumProbability(currentProbs);
            if (totalProb < 3 * count || totalProb > 4 * count) {
              valid = false;
            }
            if (!isBalancedExact(currentProbs)) {
              valid = false;
            }
          }

          if (valid) {
            result.push(resource);
            resourceTracker.get(resource)!.push(prob);
            hadSuccess = true;
          } else {
            rejected.push(resource);
          }
        }
      }
    }
  }

  // Fill remaining with desert
  while (result.length < probabilities.length) {
    result.push(Resource.DESERT);
  }

  return result;
}

// ─── FAIR Distribution — getOrderedProbabilities ─────────────────

function getOrderedProbabilities(
  config: GeneratorConfig,
  precomp: PrecomputedData,
): number[] {
  const { availableProbabilities } = config;
  const { landIntersections, landIntersectionIndexes, totalResourceTiles } = precomp;

  let result: number[] = [];
  let rejected: number[] = [];
  let pool = initProbabilities(availableProbabilities);
  let hadSuccess = false;

  while (rejected.length !== 0 || pool.length !== 0) {
    if (hadSuccess && rejected.length !== 0) {
      pool = pool.concat(rejected);
      rejected = [];
      hadSuccess = false;
    }

    if (pool.length === 0) {
      // Restart
      result = [];
      rejected = [];
      pool = initProbabilities(availableProbabilities);
      hadSuccess = false;
    } else {
      // Pick random from pool (using rotate method from AS3)
      const randIdx = nextInt(pool.length);
      for (let i = 0; i < randIdx; i++) {
        pool.push(pool.shift()!);
      }
      const prob = pool.pop()!;

      let valid = true;

      // Check intersection constraints
      for (const intersectionIdx of (landIntersectionIndexes[result.length] || [])) {
        const intersection = landIntersections[intersectionIdx];
        const intersectionProbs: number[] = [prob];

        for (const hexIdx of intersection) {
          if (hexIdx < result.length) {
            intersectionProbs.push(result[hexIdx]);
          }
        }

        if (!noDuplicates(intersectionProbs, totalResourceTiles)) {
          valid = false;
        } else if (intersectionProbs.length === 3) {
          if (intersectionProbs.indexOf(0) !== -1) {
            const sp = sumProbability(intersectionProbs);
            if (sp < 4 || sp > 8) {
              valid = false;
            }
          } else {
            const sp = sumProbability(intersectionProbs);
            if (sp < 5 || sp > 11) {
              valid = false;
            }
          }
        }
      }

      if (valid) {
        result.push(prob);
        hadSuccess = true;
      } else {
        rejected.push(prob);
      }
    }
  }

  return result;
}

// ─── FAIR Distribution — getOrderedProbabilitiesWithResources ────

function getOrderedProbabilitiesWithResources(
  resources: Resource[],
  config: GeneratorConfig,
  precomp: PrecomputedData,
): number[] {
  const { availableResources, availableProbabilities, mapSize } = config;
  const { landIntersections, landIntersectionIndexes, totalResourceTiles } = precomp;

  let resourceTracker = initResourceMap(availableResources);
  let result: number[] = [];
  let rejected: number[] = [];
  let pool = initProbabilitiesNoZeros(availableProbabilities);
  let hadSuccess = false;

  while (rejected.length !== 0 || pool.length !== 0) {
    if (hadSuccess && rejected.length !== 0) {
      pool = pool.concat(rejected);
      rejected = [];
      hadSuccess = false;
    }

    if (pool.length === 0) {
      // Restart
      resourceTracker = initResourceMap(availableResources);
      result = [];
      rejected = [];
      pool = initProbabilitiesNoZeros(availableProbabilities);
      hadSuccess = false;
    } else {
      const idx = result.length;
      const resource = resources[idx];

      if (resource === Resource.DESERT) {
        result.push(0);
        hadSuccess = true;
      } else {
        // Pick random from pool
        const randIdx = nextInt(pool.length);
        for (let i = 0; i < randIdx; i++) {
          pool.push(pool.shift()!);
        }
        const prob = pool.pop()!;

        // Relaxed constraints for small custom maps
        if (mapSize === MapSize.CUSTOM && resources.length < 10) {
          result.push(prob);
          resourceTracker.get(resource)!.push(prob);
          hadSuccess = true;
        } else {
          let valid = true;

          // Check intersection constraints
          for (const intersectionIdx of (landIntersectionIndexes[result.length] || [])) {
            const intersection = landIntersections[intersectionIdx];
            const intersectionProbs: number[] = [prob];

            for (const hexIdx of intersection) {
              if (hexIdx < result.length) {
                intersectionProbs.push(result[hexIdx]);
              }
            }

            if (!noDuplicates(intersectionProbs, totalResourceTiles)) {
              valid = false;
            } else if (intersectionProbs.length === 3) {
              if (intersectionProbs.indexOf(0) !== -1) {
                const sp = sumProbability(intersectionProbs);
                if (sp < 4 || sp > 8) {
                  valid = false;
                }
              } else {
                const sp = sumProbability(intersectionProbs);
                if (sp < 5 || sp > 11) {
                  valid = false;
                }
              }
            }
          }

          // Check no duplicate probability on same resource
          if (resourceTracker.get(resource)!.indexOf(prob) >= 0) {
            valid = false;
          }

          // Check resource group balance when complete
          const count = getNumberOf(resource, availableResources);
          const currentProbs = [...resourceTracker.get(resource)!, prob];
          if (count === currentProbs.length) {
            const totalProb = sumProbability(currentProbs);
            if (totalProb < 3 * count || totalProb > 4 * count) {
              valid = false;
            }
            if (!isBalancedExact(currentProbs)) {
              valid = false;
            }
          }

          if (valid) {
            result.push(prob);
            resourceTracker.get(resource)!.push(prob);
            hadSuccess = true;
          } else {
            rejected.push(prob);
          }
        }
      }
    }
  }

  // Fill remaining with 0 (desert probability)
  while (result.length < resources.length) {
    result.push(0);
  }

  return result;
}

// ─── TRADITIONAL Distribution ─────────────────────────────────────

function getNormalProbabilities(
  config: GeneratorConfig,
): number[] {
  const { availableProbabilities, landGrid, landGridOrder } = config;

  // Filter out zeros and add extras if needed
  const pool = availableProbabilities.filter(n => n !== 0);

  // Insert zeros at random positions until pool matches land grid size
  while (pool.length < landGrid.length) {
    const pos = nextInt(pool.length);
    const temp: number[] = [];
    for (let i = 0; i < pos; i++) {
      temp.push(pool.pop()!);
    }
    pool.push(0);
    while (temp.length > 0) {
      pool.push(temp.pop()!);
    }
  }

  // Place in spiral order
  const result: number[] = new Array(landGrid.length);
  for (const orderIdx of landGridOrder) {
    result[orderIdx] = pool.shift()!;
  }

  return result;
}

function getRandomResources(
  probabilities: number[],
  config: GeneratorConfig,
): Resource[] {
  const { availableResources } = config;
  const pool = initAvailResourcesNoDesert(availableResources);
  const result: Resource[] = [];

  while (pool.length !== 0) {
    if (probabilities[result.length] === 0) {
      result.push(Resource.DESERT);
    } else {
      const randIdx = nextInt(pool.length);
      const temp: Resource[] = [];
      for (let i = 0; i < randIdx; i++) {
        temp.push(pool.pop()!);
      }
      result.push(pool.pop()!);
      while (temp.length > 0) {
        pool.push(temp.pop()!);
      }
    }
  }

  // Fill remaining with desert
  while (result.length < probabilities.length) {
    result.push(Resource.DESERT);
  }

  return result;
}

// ─── Random Distribution ──────────────────────────────────────────

function getRandomProbabilities(config: GeneratorConfig): number[] {
  const pool = initProbabilities(config.availableProbabilities);
  const result: number[] = [];

  while (pool.length !== 0) {
    const randIdx = nextInt(pool.length);
    const temp: number[] = [];
    for (let i = 0; i < randIdx; i++) {
      temp.push(pool.pop()!);
    }
    result.push(pool.pop()!);
    while (temp.length > 0) {
      pool.push(temp.pop()!);
    }
  }

  return result;
}

// ─── Harbor generation ────────────────────────────────────────────

function getNormalHarbors(
  config: GeneratorConfig,
  _precomp: PrecomputedData,
): HarborEntry[] {
  const { orderedHarbors, waterGrid, availableHarbors } = config;

  const pool = initHarbors(availableHarbors);
  const result: HarborEntry[] = [];

  for (let i = 0; i < orderedHarbors.length; i++) {
    const template = orderedHarbors[i];
    if (template === -1) {
      result.push([Resource.WATER]);
    } else {
      const dir1 = template[0];
      const dir2 = template[1];
      const randIdx = nextInt(pool.length);
      for (let j = 0; j < randIdx; j++) {
        pool.push(pool.shift()!);
      }
      const harborType = pool.pop()!;
      result.push([harborType, dir1, dir2]);
    }
  }

  // Fill remaining water hexes
  while (result.length < waterGrid.length) {
    result.push([Resource.WATER]);
  }

  return result;
}

function getOrderedHarbors(
  resources: Resource[],
  probabilities: number[],
  config: GeneratorConfig,
  precomp: PrecomputedData,
): HarborEntry[] {
  const { waterGrid, availableHarbors } = config;
  const { waterNeighbors, harborLines } = precomp;

  let result: HarborEntry[] = [];
  let pool: Resource[] = [];
  let valid = false;

  while (!valid) {
    pool = initHarbors(availableHarbors);
    result = [];

    // Randomly start with harbor or water first
    if (nextInt(2) !== 0) {
      // Harbor first, then water
      while (pool.length !== 0 && result.length < waterGrid.length) {
        const randIdx = nextInt(pool.length);
        for (let i = 0; i < randIdx; i++) {
          pool.push(pool.shift()!);
        }
        if (result.length < waterGrid.length) {
          result.push([pool.pop()!]);
        }
        if (result.length < waterGrid.length) {
          result.push([Resource.WATER]);
        }
      }
    } else {
      // Water first, then harbor
      while (pool.length !== 0 && result.length < waterGrid.length) {
        const randIdx = nextInt(pool.length);
        for (let i = 0; i < randIdx; i++) {
          pool.push(pool.shift()!);
        }
        if (result.length < waterGrid.length) {
          result.push([Resource.WATER]);
        }
        if (result.length < waterGrid.length) {
          result.push([pool.pop()!]);
        }
      }
    }

    // Fill remaining with water
    while (result.length < waterGrid.length) {
      result.push([Resource.WATER]);
    }

    // Validate: no matching harbor next to high-probability resource
    valid = true;
    for (let i = 0; i < result.length; i++) {
      if (result[i][0] !== Resource.DESERT && result[i][0] !== Resource.WATER) {
        const neighbors = waterNeighbors[i];
        for (const landIdx of neighbors) {
          const landResource = resources[landIdx];
          const landProb = probabilities[landIdx];
          if (landResource === result[i][0] && landProb >= 5 && landProb <= 9) {
            valid = false;
            break;
          }
        }
      }
      if (!valid) break;
    }
  }

  // Assign harbor line directions
  for (let i = 0; i < result.length; i++) {
    const lines = harborLines[i];
    if (lines.length > 0) {
      const lineIdx = nextInt(lines.length);
      result[i] = [result[i][0], lines[lineIdx], nextGoodHarborLine(lines, lineIdx)];
    } else {
      result[i] = [result[i][0], 0, 1];
    }
  }

  return result;
}

function getRandomHarbors(
  config: GeneratorConfig,
  precomp: PrecomputedData,
): HarborEntry[] {
  const { waterGrid, availableHarbors } = config;
  const { harborLines } = precomp;

  const pool = initHarbors(availableHarbors);
  const result: HarborEntry[] = [];

  // Initialize all as water
  for (let i = 0; i < waterGrid.length; i++) {
    result.push([Resource.WATER]);
  }

  // Place harbors at random positions
  while (pool.length !== 0) {
    let pos = nextInt(waterGrid.length);
    while (result[pos][0] !== Resource.WATER) {
      pos = nextInt(waterGrid.length);
    }
    const lines = harborLines[pos];
    const lineIdx = lines.length > 0 ? nextInt(lines.length) : 0;
    const harborType = pool.pop()!;
    result[pos] = [
      harborType,
      lines.length > 0 ? lines[lineIdx] : 0,
      lines.length > 0 ? nextGoodHarborLine(lines, lineIdx) : 1,
    ];
  }

  return result;
}

// ─── Main generation functions ────────────────────────────────────

export function generateBoard(config: GeneratorConfig): BoardState {
  const precomp = precompute(config);

  let probabilityMap: number[];
  let resourceMap: Resource[];
  let harborMap: HarborEntry[];

  switch (config.mapType) {
    case MapType.FAIR: {
      // Fair mode: generate probabilities first, then resources considering probs
      probabilityMap = getOrderedProbabilities(config, precomp);
      resourceMap = getOrderedResources(probabilityMap, config, precomp);
      harborMap = getOrderedHarbors(resourceMap, probabilityMap, config, precomp);
      break;
    }
    case MapType.TRADITIONAL: {
      probabilityMap = getNormalProbabilities(config);
      resourceMap = getRandomResources(probabilityMap, config);
      harborMap = getNormalHarbors(config, precomp);
      break;
    }
    case MapType.RANDOM: {
      probabilityMap = getRandomProbabilities(config);
      resourceMap = getRandomResources(probabilityMap, config);
      harborMap = getRandomHarbors(config, precomp);
      break;
    }
  }

  return {
    landGrid: config.landGrid,
    waterGrid: config.waterGrid,
    resourceMap,
    probabilityMap,
    harborMap,
  };
}

export function shuffleProbabilities(
  currentBoard: BoardState,
  config: GeneratorConfig,
): BoardState {
  const precomp = precompute(config);

  let probabilityMap: number[];

  switch (config.mapType) {
    case MapType.FAIR:
      probabilityMap = getOrderedProbabilitiesWithResources(
        currentBoard.resourceMap, config, precomp
      );
      break;
    case MapType.TRADITIONAL:
      probabilityMap = currentBoard.probabilityMap;
      break;
    case MapType.RANDOM:
      probabilityMap = getRandomProbabilities(config);
      break;
  }

  return {
    ...currentBoard,
    probabilityMap,
  };
}

export function shuffleHarbors(
  currentBoard: BoardState,
  config: GeneratorConfig,
): BoardState {
  const precomp = precompute(config);

  let harborMap: HarborEntry[];

  switch (config.mapType) {
    case MapType.FAIR:
      harborMap = getOrderedHarbors(
        currentBoard.resourceMap, currentBoard.probabilityMap, config, precomp
      );
      break;
    case MapType.TRADITIONAL:
      harborMap = getNormalHarbors(config, precomp);
      break;
    case MapType.RANDOM:
      harborMap = getRandomHarbors(config, precomp);
      break;
  }

  return {
    ...currentBoard,
    harborMap,
  };
}

/** Generate a custom board from user-defined land/water grids */
export function generateCustomBoard(
  landGrid: Point[],
  waterGrid: Point[],
  mapType: MapType,
): BoardState {
  const numLand = landGrid.length;
  const numWater = waterGrid.length;

  const availableProbabilities: number[] = [];
  const availableResources: Resource[] = [];
  const availableHarbors: Resource[] = [];

  for (let i = 0; i < numLand; i++) {
    availableProbabilities.push(DEFAULT_AVAILABLE_PROBABILITIES[i]);
    availableResources.push(DEFAULT_AVAILABLE_RESOURCES[i]);
  }

  for (let i = 0; i < numWater; i += 2) {
    availableHarbors.push(DEFAULT_AVAILABLE_HARBORS[i]);
  }

  // Generate simple spiral order (just sequential for custom)
  const landGridOrder: number[] = [];
  for (let i = 0; i < numLand; i++) {
    landGridOrder.push(i);
  }

  const config: GeneratorConfig = {
    mapSize: MapSize.CUSTOM,
    mapType: mapType === MapType.TRADITIONAL ? MapType.FAIR : mapType,
    landGrid,
    landGridOrder,
    waterGrid,
    availableResources,
    availableProbabilities,
    availableHarbors,
    orderedHarbors: [],
  };

  return generateBoard(config);
}
