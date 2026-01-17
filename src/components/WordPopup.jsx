export default function WordPopup({ word }) {
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                    bg-amber-900/95 border-4 border-amber-500 rounded-lg p-6 text-center
                    shadow-xl shadow-amber-500/30">
      <div className="text-amber-200 text-sm mb-2">Vybrané slovo:</div>
      <div className="text-4xl font-bold text-amber-100 mb-4">{word}</div>
      <div className="text-amber-300 text-sm animate-pulse">
        Stlač MEDZERNÍK pre zozbieranie
      </div>
    </div>
  );
}
