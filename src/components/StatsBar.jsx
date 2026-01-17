export default function StatsBar({ count }) {
  return (
    <div className="absolute top-2 left-2 bg-gray-800/80 rounded px-3 py-1
                    text-amber-300 text-sm border border-amber-500/50">
      📦 {count} slov
    </div>
  );
}
