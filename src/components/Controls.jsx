import { memo } from 'react';

function Controls({ keys }) {
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

// Custom comparison - only re-render if the actual key states changed
export default memo(Controls, (prevProps, nextProps) => {
  return (
    prevProps.keys.ArrowUp === nextProps.keys.ArrowUp &&
    prevProps.keys.ArrowDown === nextProps.keys.ArrowDown &&
    prevProps.keys.ArrowLeft === nextProps.keys.ArrowLeft &&
    prevProps.keys.ArrowRight === nextProps.keys.ArrowRight
  );
});
