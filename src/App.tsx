import { useState, useCallback, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
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

const AboutSection = lazy(() => import('./components/AboutSection'));

// ── Helpers ───────────────────────────────────────────────

function buildConfig(mapSize: MapSize, mapType: MapType): GeneratorConfig {
  const boardConfig = getBoardConfig(mapSize);
  return {
    mapSize,
    mapType,
    landGrid: boardConfig.landGrid,
    landGridOrder: boardConfig.landGridOrder,
    waterGrid: boardConfig.waterGrid,
    availableResources: boardConfig.availableResources,
    availableProbabilities:
      mapType === MapType.TRADITIONAL
        ? boardConfig.availableOrderedProbabilities
        : boardConfig.availableProbabilities,
    availableHarbors: boardConfig.availableHarbors,
    orderedHarbors: boardConfig.orderedHarbors,
  };
}

function haptic() {
  try {
    navigator?.vibrate?.(12);
  } catch {
    // Not supported
  }
}

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return [dark, setDark] as const;
}

// ── App ───────────────────────────────────────────────────

function App() {
  const [mapSize, setMapSize] = useState<MapSize>(MapSize.STANDARD);
  const [mapType, setMapType] = useState<MapType>(MapType.FAIR);
  // Generate initial board synchronously to avoid flash of empty state
  const initialBoard = useMemo(() => {
    const config = buildConfig(MapSize.STANDARD, MapType.FAIR);
    return generateBoard(config);
  }, []);
  const [board, setBoard] = useState<BoardState>(initialBoard);
  const [animKey, setAnimKey] = useState(0);
  const [showAbout, setShowAbout] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [dark, setDark] = useDarkMode();

  // Screen reader live region
  const announceRef = useRef<HTMLDivElement>(null);
  const announce = (msg: string) => {
    if (announceRef.current) {
      announceRef.current.textContent = msg;
    }
  };

  const generate = useCallback(() => {
    const config = buildConfig(mapSize, mapType);
    const newBoard = generateBoard(config);
    setBoard(newBoard);
    setAnimKey((k) => k + 1);
    haptic();
    announce('New board generated');
  }, [mapSize, mapType]);

  // Regenerate when size/type changes (skip initial mount since useMemo handles it)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapSize, mapType]);

  const handleShuffleProbabilities = useCallback(() => {
    const config = buildConfig(mapSize, mapType);
    setBoard((prev) => shuffleProbs(prev, config));
    setAnimKey((k) => k + 1);
    haptic();
    announce('Numbers reshuffled');
  }, [mapSize, mapType]);

  const handleShuffleHarbors = useCallback(() => {
    const config = buildConfig(mapSize, mapType);
    setBoard((prev) => shuffleHarbs(prev, config));
    setAnimKey((k) => k + 1);
    haptic();
    announce('Harbors reshuffled');
  }, [mapSize, mapType]);

  const handleShare = useCallback(async () => {
    const resourceCounts: Record<string, number> = {};
    for (const r of board.resourceMap) {
      resourceCounts[r] = (resourceCounts[r] || 0) + 1;
    }
    const text = [
      `EvenBetterSettlers — ${mapSize} board (${mapType} distribution)`,
      `Resources: ${Object.entries(resourceCounts).map(([r, c]) => `${r} x${c}`).join(', ')}`,
      `https://evenbettersettlers.com`,
    ].join('\n');

    try {
      if (navigator.share) {
        await navigator.share({ title: 'EvenBetterSettlers Board', text });
      } else {
        await navigator.clipboard.writeText(text);
        announce('Board details copied to clipboard');
      }
    } catch {
      // User cancelled share
    }
  }, [board, mapSize, mapType]);

  const dismissTooltip = () => setShowTooltip(false);

  return (
    <div
      className="min-h-screen min-h-dvh flex flex-col relative"
      style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      {/* Screen reader live region */}
      <div ref={announceRef} aria-live="polite" aria-atomic="true" className="sr-only" />

      {/* Header */}
      <header
        className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: '1px solid var(--color-border-light)' }}
      >
        <div className="flex items-center gap-2.5">
          {/* Logo hexagon */}
          <svg width="28" height="28" viewBox="0 0 100 100" aria-hidden="true">
            <polygon
              points="50,3 93,27 93,73 50,97 7,73 7,27"
              fill="var(--color-brand)"
            />
            <text
              x="50"
              y="56"
              textAnchor="middle"
              fontSize="30"
              fontWeight="700"
              fill="#f5f0e8"
              fontFamily="system-ui, sans-serif"
            >
              ES
            </text>
          </svg>
          <div>
            <h1
              className="text-base font-bold leading-tight"
              style={{ color: 'var(--color-text)' }}
            >
              EvenBetterSettlers
            </h1>
            <p className="text-[11px] leading-tight" style={{ color: 'var(--color-text-muted)' }}>
              Fair boards. Better games.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Share button */}
          <button
            onClick={handleShare}
            aria-label="Share board"
            className="touch-target p-2 rounded-lg transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
              <polyline points="16,6 12,2 8,6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={() => setDark(!dark)}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="touch-target p-2 rounded-lg transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {dark ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>

          {/* Info button */}
          <button
            onClick={() => setShowAbout(!showAbout)}
            aria-label={showAbout ? 'Hide algorithm info' : 'How the algorithm works'}
            aria-expanded={showAbout}
            className="touch-target p-2 rounded-lg transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </button>
        </div>
      </header>

      {/* About section (lazy loaded) */}
      {showAbout && (
        <Suspense fallback={null}>
          <AboutSection onClose={() => setShowAbout(false)} />
        </Suspense>
      )}

      {/* Board area */}
      <main
        className="flex-1 flex items-center justify-center px-2 py-2 relative"
        onClick={dismissTooltip}
      >
        <div className="w-full max-w-xl board-enter" key={animKey}>
          <HexBoard board={board} className="w-full" animationKey={animKey} />
        </div>

        {/* Onboarding tooltip */}
        {showTooltip && (
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl text-xs font-medium max-w-[280px] text-center animate-pulse"
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              color: 'var(--color-text-secondary)',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--color-border-light)',
            }}
            role="status"
            onClick={dismissTooltip}
          >
            Tap <strong>Generate</strong> for a new balanced board, or use the toggles to change size and distribution.
          </div>
        )}
      </main>

      {/* Bottom controls */}
      <nav aria-label="Board controls" className="sticky bottom-0 z-10">
        <Controls
          mapSize={mapSize}
          mapType={mapType}
          onMapSizeChange={(s) => { setMapSize(s); dismissTooltip(); }}
          onMapTypeChange={(t) => { setMapType(t); dismissTooltip(); }}
          onGenerate={() => { generate(); dismissTooltip(); }}
          onShuffleProbabilities={() => { handleShuffleProbabilities(); dismissTooltip(); }}
          onShuffleHarbors={() => { handleShuffleHarbors(); dismissTooltip(); }}
        />
      </nav>

      {/* Footer */}
      <footer
        className="text-center px-4 py-3 text-[10px] leading-relaxed"
        style={{ color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border-light)' }}
      >
        <p>&copy; 2009&ndash;2026 EvenBetterSettlers. Not affiliated with Catan Studio or Klaus Teuber.</p>
        <p>Originally created in 2009. Rebuilt for the modern web.</p>
      </footer>
    </div>
  );
}

export default App;
