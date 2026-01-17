export default function ConnectionStatus({ isConnected, playerName }) {
  return (
    <div className="absolute top-4 right-4 px-3 py-2 rounded bg-gray-800/90 border border-gray-700">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
        <span className={`text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      {playerName && (
        <div className="text-xs text-gray-400 mt-1">
          {playerName}
        </div>
      )}
    </div>
  );
}
