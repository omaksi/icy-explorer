import { VYBRANE_SLOVA } from '../data/words';

export default function Inventory({ collectedWords }) {
  return (
    <div className="absolute inset-0 bg-gray-900/90 flex items-center justify-center">
      <div className="bg-gray-800 border-4 border-cyan-500 rounded-lg p-6 max-w-md w-full mx-4
                      shadow-xl shadow-cyan-500/20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-cyan-300">Zozbierané slová</h2>
          <span className="text-cyan-400 text-sm">
            {collectedWords.length} / {VYBRANE_SLOVA.length}
          </span>
        </div>

        <div className="mb-4">
          <h3 className="text-amber-400 font-semibold mb-2">Vybrané slová po B, M:</h3>
          {collectedWords.length === 0 ? (
            <p className="text-gray-400 italic">Zatiaľ žiadne slová...</p>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
              {collectedWords.map((word, i) => (
                <span
                  key={i}
                  className="bg-amber-900/50 border border-amber-500 text-amber-200
                             px-3 py-1 rounded-full text-sm"
                >
                  {word}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="text-center text-gray-400 text-sm">
          Stlač <span className="text-cyan-300 font-bold">E</span> pre zatvorenie
        </div>
      </div>
    </div>
  );
}
