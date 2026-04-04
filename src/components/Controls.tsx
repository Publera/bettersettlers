import { MapSize, MapType } from '../lib/constants';

interface ControlsProps {
  mapSize: MapSize;
  mapType: MapType;
  onMapSizeChange: (size: MapSize) => void;
  onMapTypeChange: (type: MapType) => void;
  onGenerate: () => void;
  onShuffleProbabilities: () => void;
  onShuffleHarbors: () => void;
}

const sizeOptions = [
  { value: MapSize.STANDARD, label: 'Standard', short: '3–4P' },
  { value: MapSize.LARGE, label: 'Large', short: '5P' },
  { value: MapSize.XLARGE, label: 'X-Large', short: '6P' },
] as const;

const typeOptions = [
  { value: MapType.FAIR, label: 'Fair' },
  { value: MapType.TRADITIONAL, label: 'Traditional' },
  { value: MapType.RANDOM, label: 'Random' },
] as const;

function TogglePill<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: readonly { value: T; label: string; short?: string }[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex rounded-lg p-0.5"
      style={{ backgroundColor: 'var(--color-toggle-bg)' }}
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className="touch-target relative px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 select-none"
            style={{
              backgroundColor: active ? 'var(--color-toggle-active)' : 'transparent',
              color: active ? 'var(--color-toggle-text-active)' : 'var(--color-toggle-text)',
              boxShadow: active ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <span className="sm:hidden">{opt.short || opt.label}</span>
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function Controls({
  mapSize,
  mapType,
  onMapSizeChange,
  onMapTypeChange,
  onGenerate,
  onShuffleProbabilities,
  onShuffleHarbors,
}: ControlsProps) {
  return (
    <div
      className="w-full pb-safe"
      style={{
        backgroundColor: 'var(--color-bg-controls)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--color-border-light)',
      }}
    >
      <div className="max-w-2xl mx-auto px-3 py-3 flex flex-col gap-2.5">
        {/* Toggle row */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <TogglePill
            options={sizeOptions}
            value={mapSize}
            onChange={onMapSizeChange}
            ariaLabel="Board size"
          />
          <TogglePill
            options={typeOptions}
            value={mapType}
            onChange={onMapTypeChange}
            ariaLabel="Distribution type"
          />
        </div>

        {/* Action row */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={onGenerate}
            aria-label="Generate new board"
            className="touch-target flex-1 max-w-[200px] px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 active:scale-95"
            style={{
              backgroundColor: 'var(--color-brand)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            Generate
          </button>

          <button
            onClick={onShuffleProbabilities}
            aria-label="Shuffle number tokens"
            className="touch-target px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-95"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-secondary)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <span className="sm:hidden" aria-hidden="true">#</span>
            <span className="hidden sm:inline">Numbers</span>
          </button>

          <button
            onClick={onShuffleHarbors}
            aria-label="Shuffle harbors"
            className="touch-target px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-95"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-secondary)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <span className="sm:hidden" aria-hidden="true">&#x2693;</span>
            <span className="hidden sm:inline">Harbors</span>
          </button>
        </div>
      </div>
    </div>
  );
}
