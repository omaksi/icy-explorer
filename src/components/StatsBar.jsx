import { VYBRANE_SLOVA } from '../data/words';

export default function StatsBar({ collectedWords }) {
  const totalWords = VYBRANE_SLOVA.length;
  const collectedCount = collectedWords.length;

  return (
    <div className="absolute top-2 left-2 bg-gray-800/90 rounded-lg px-4 py-3
                    text-amber-300 text-sm border-2 border-amber-500/50 shadow-lg
                    max-h-[80vh] overflow-y-auto backdrop-blur-sm">
      <div className="font-bold text-lg mb-2 text-amber-400 border-b border-amber-500/30 pb-2">
        Slovník: {collectedCount}/{totalWords}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {VYBRANE_SLOVA.map((word) => {
          const isCollected = collectedWords.includes(word);
          return (
            <div
              key={word}
              className={`px-2 py-1 rounded ${
                isCollected
                  ? 'bg-green-600/40 text-green-200 border border-green-400/50'
                  : 'bg-gray-700/40 text-gray-400 border border-gray-600/30'
              }`}
            >
              {isCollected ? '✓' : '○'} {word}
            </div>
          );
        })}
      </div>
    </div>
  );
}
