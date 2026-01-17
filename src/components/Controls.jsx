export default function Controls({ keys }) {
  return (
    <div className="absolute bottom-4 right-4 flex gap-2">
      <div className="flex flex-col items-center">
        <div
          className={`w-12 h-12 rounded border-2 flex items-center justify-center text-2xl
            ${keys.ArrowUp ? 'bg-cyan-600 border-cyan-400' : 'bg-gray-700 border-gray-500'}`}
        >
          ↑
        </div>
        <div className="flex gap-2 mt-1">
          <div
            className={`w-12 h-12 rounded border-2 flex items-center justify-center text-2xl
              ${keys.ArrowLeft ? 'bg-cyan-600 border-cyan-400' : 'bg-gray-700 border-gray-500'}`}
          >
            ←
          </div>
          <div
            className={`w-12 h-12 rounded border-2 flex items-center justify-center text-2xl
              ${keys.ArrowDown ? 'bg-cyan-600 border-cyan-400' : 'bg-gray-700 border-gray-500'}`}
          >
            ↓
          </div>
          <div
            className={`w-12 h-12 rounded border-2 flex items-center justify-center text-2xl
              ${keys.ArrowRight ? 'bg-cyan-600 border-cyan-400' : 'bg-gray-700 border-gray-500'}`}
          >
            →
          </div>
        </div>
      </div>
    </div>
  );
}
