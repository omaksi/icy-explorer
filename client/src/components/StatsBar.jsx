import { VYBRANE_SLOVA } from '../data/words';

export default function StatsBar({ collectedWords }) {
  const totalWords = VYBRANE_SLOVA.length;
  const collectedCount = collectedWords.length;

  return (
    <div className="absolute top-2 left-2 right-2 bg-gray-800/80 rounded px-3 py-2
                    text-amber-300 text-xs border border-amber-500/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-bold text-amber-400 whitespace-nowrap">
          {collectedCount}/{totalWords}
        </span>
        <div className="flex-1 flex flex-wrap gap-1">
          {VYBRANE_SLOVA.map((word) => {
            const isCollected = collectedWords.includes(word);
            return (
              <span
                key={word}
                className={`px-1.5 py-0.5 rounded text-xs ${
                  isCollected
                    ? 'bg-green-600/50 text-green-200'
                    : 'bg-gray-700/50 text-gray-500'
                }`}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
