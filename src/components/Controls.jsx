import { memo } from 'react';

function Controls({ keys, onKeyPress, onKeyRelease, onSpace, onInventory }) {
  const handleTouchStart = (e, key) => {
    e.preventDefault();
    onKeyPress?.(key);
  };

  const handleTouchEnd = (e, key) => {
    e.preventDefault();
    onKeyRelease?.(key);
  };

  const handleMouseDown = (e, key) => {
    e.preventDefault();
    onKeyPress?.(key);
  };

  const handleMouseUp = (e, key) => {
    e.preventDefault();
    onKeyRelease?.(key);
  };

  const handleMouseLeave = (_e, key) => {
    onKeyRelease?.(key);
  };

  const handleActionClick = (e, action) => {
    e.preventDefault();
    action?.();
  };

  const ButtonControl = ({ direction, symbol, isPressed }) => (
    <button
      onTouchStart={(e) => handleTouchStart(e, direction)}
      onTouchEnd={(e) => handleTouchEnd(e, direction)}
      onMouseDown={(e) => handleMouseDown(e, direction)}
      onMouseUp={(e) => handleMouseUp(e, direction)}
      onMouseLeave={(e) => handleMouseLeave(e, direction)}
      className={`w-12 h-12 rounded border-2 flex items-center justify-center text-2xl select-none touch-none active:scale-95 transition-transform
        ${isPressed ? 'bg-cyan-600 border-cyan-400' : 'bg-gray-700 border-gray-500'}`}
    >
      {symbol}
    </button>
  );

  const ActionButton = ({ onClick, label, colorClass = 'bg-gray-700 border-gray-500 active:bg-gray-600' }) => (
    <button
      onTouchStart={(e) => handleActionClick(e, onClick)}
      onClick={(e) => handleActionClick(e, onClick)}
      className={`px-4 h-12 rounded border-2 flex items-center justify-center text-sm font-bold select-none touch-none active:scale-95 transition-transform ${colorClass}`}
    >
      {label}
    </button>
  );

  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2">
      <div className="flex gap-2">
        <div className="flex flex-col items-center">
          <ButtonControl direction="ArrowUp" symbol="↑" isPressed={keys.ArrowUp} />
          <div className="flex gap-2 mt-1">
            <ButtonControl direction="ArrowLeft" symbol="←" isPressed={keys.ArrowLeft} />
            <ButtonControl direction="ArrowDown" symbol="↓" isPressed={keys.ArrowDown} />
            <ButtonControl direction="ArrowRight" symbol="→" isPressed={keys.ArrowRight} />
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <ActionButton
          onClick={onSpace}
          label="SPACE"
          colorClass="bg-green-700 border-green-500 active:bg-green-600 text-white"
        />
        <ActionButton
          onClick={onInventory}
          label="E"
          colorClass="bg-purple-700 border-purple-500 active:bg-purple-600 text-white"
        />
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
