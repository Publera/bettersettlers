import { useState, useCallback, useEffect } from 'react';
import { MapSize, MapType, getBoardConfig } from './lib/constants';
import {
  generateBoard,
  shuffleProbabilities as shuffleProbs,
  shuffleHarbors as shuffleHarbs,
  type BoardState,
  type GeneratorConfig,
} from './lib/board-generator';
import HexBoard from './components/HexBoard';
import Controls from './components/Controls';

function buildConfig(mapSize: MapSize, mapType: MapType): GeneratorConfig {
  const boardConfig = getBoardConfig(mapSize);
  return {
    mapSize,
    mapType,
    landGrid: boardConfig.landGrid,
    landGridOrder: boardConfig.landGridOrder,
    waterGrid: boardConfig.waterGrid,
    availableResources: boardConfig.availableResources,
    availableProbabilities: mapType === MapType.TRADITIONAL
      ? boardConfig.availableOrderedProbabilities
      : boardConfig.availableProbabilities,
    availableHarbors: boardConfig.availableHarbors,
    orderedHarbors: boardConfig.orderedHarbors,
  };
}

function App() {
  const [mapSize, setMapSize] = useState<MapSize>(MapSize.STANDARD);
  const [mapType, setMapType] = useState<MapType>(MapType.FAIR);
  const [board, setBoard] = useState<BoardState | null>(null);
  const [showAbout, setShowAbout] = useState(false);

  const generate = useCallback(() => {
    const config = buildConfig(mapSize, mapType);
    const newBoard = generateBoard(config);
    setBoard(newBoard);
  }, [mapSize, mapType]);

  // Generate on first load and when size/type changes
  useEffect(() => {
    generate();
  }, [generate]);

  const handleShuffleProbabilities = useCallback(() => {
    if (!board) return;
    const config = buildConfig(mapSize, mapType);
    setBoard(shuffleProbs(board, config));
  }, [board, mapSize, mapType]);

  const handleShuffleHarbors = useCallback(() => {
    if (!board) return;
    const config = buildConfig(mapSize, mapType);
    setBoard(shuffleHarbs(board, config));
  }, [board, mapSize, mapType]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-green-800 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">BetterSettlers</h1>
            <p className="text-green-200 text-sm">Balanced Catan Board Generator</p>
          </div>
          <button
            onClick={() => setShowAbout(!showAbout)}
            className="text-sm text-green-200 hover:text-white transition-colors underline underline-offset-2"
          >
            {showAbout ? 'Hide Info' : 'How It Works'}
          </button>
        </div>
      </header>

      {/* About section */}
      {showAbout && (
        <div className="bg-green-50 border-b border-green-200">
          <div className="max-w-3xl mx-auto px-4 py-6 text-sm text-stone-700 space-y-3">
            <h2 className="text-lg font-semibold text-green-900">How It Works</h2>
            <p>
              BetterSettlers generates balanced Catan boards so that no player has an
              unfair advantage based on initial placement. The <strong>Fair Distribution</strong> algorithm
              ensures:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>No same-resource adjacency</strong> — identical resources never neighbor each other</li>
              <li><strong>No duplicate numbers on same resource</strong> — each resource type gets unique probability numbers</li>
              <li><strong>Balanced probability spread</strong> — each resource group's total dots fall within a fair range</li>
              <li><strong>Intersection balance</strong> — at every vertex where 3 hexes meet, probability is bounded and numbers are distinct</li>
              <li><strong>Harbor fairness</strong> — 2:1 harbors won't be placed next to high-probability matching resources</li>
            </ul>
            <p>
              <strong>Traditional Distribution</strong> follows the official Catan rulebook spiral placement method.
              <strong> Random Distribution</strong> is a pure random shuffle with no constraints.
            </p>
            <p className="text-stone-500 italic">
              Originally built as a Flash app in 2009. Rebuilt in 2026 with React + TypeScript.
            </p>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center px-4 py-6 gap-6">
        {/* Controls */}
        <Controls
          mapSize={mapSize}
          mapType={mapType}
          onMapSizeChange={setMapSize}
          onMapTypeChange={setMapType}
          onGenerate={generate}
          onShuffleProbabilities={handleShuffleProbabilities}
          onShuffleHarbors={handleShuffleHarbors}
        />

        {/* Board */}
        {board && (
          <div className="w-full max-w-2xl">
            <HexBoard board={board} className="w-full" />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stone-200/60 text-stone-500 text-center py-4 text-xs">
        <p>
          BetterSettlers &mdash; Fair Catan board generation since 2009.
          Algorithm faithfully ported from the original Flash application.
        </p>
      </footer>
    </div>
  );
}

export default App;
