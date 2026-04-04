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

export default function Controls({
  mapSize,
  mapType,
  onMapSizeChange,
  onMapTypeChange,
  onGenerate,
  onShuffleProbabilities,
  onShuffleHarbors,
}: ControlsProps) {
  const sizeOptions = [
    { value: MapSize.STANDARD, label: 'Standard', desc: '3-4 players' },
    { value: MapSize.LARGE, label: 'Large', desc: '5 players' },
    { value: MapSize.XLARGE, label: 'X-Large', desc: '6 players' },
  ];

  const typeOptions = [
    { value: MapType.FAIR, label: 'Fair', desc: 'Balanced distribution' },
    { value: MapType.TRADITIONAL, label: 'Traditional', desc: 'Rulebook spiral' },
    { value: MapType.RANDOM, label: 'Random', desc: 'Pure random' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Board Size */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <span className="text-sm font-semibold text-stone-600 uppercase tracking-wide w-24 shrink-0">
          Board Size
        </span>
        <div className="flex gap-1 bg-stone-200/60 rounded-lg p-1">
          {sizeOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => onMapSizeChange(opt.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                mapSize === opt.value
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'
              }`}
            >
              {opt.label}
              <span className="hidden sm:inline text-xs ml-1 opacity-60">({opt.desc})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Distribution Type */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <span className="text-sm font-semibold text-stone-600 uppercase tracking-wide w-24 shrink-0">
          Distribution
        </span>
        <div className="flex gap-1 bg-stone-200/60 rounded-lg p-1">
          {typeOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => onMapTypeChange(opt.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                mapType === opt.value
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'
              }`}
            >
              {opt.label}
              <span className="hidden sm:inline text-xs ml-1 opacity-60">({opt.desc})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 justify-center pt-2">
        <button
          onClick={onGenerate}
          className="px-5 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
        >
          Generate Map
        </button>
        <button
          onClick={onShuffleProbabilities}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium text-sm shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          Shuffle Numbers
        </button>
        <button
          onClick={onShuffleHarbors}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium text-sm shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          Shuffle Harbors
        </button>
      </div>
    </div>
  );
}
