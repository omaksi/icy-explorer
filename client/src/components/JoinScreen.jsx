import { useState } from 'react';

export default function JoinScreen({ onJoin, isConnected }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length >= 2 && trimmed.length <= 20) {
      onJoin(trimmed);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-cyan-300 mb-2 text-center">Icy Explorer</h1>
        <p className="text-gray-400 text-sm mb-6 text-center">Multiplayer Mode</p>

        {!isConnected && (
          <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded text-yellow-300 text-sm">
            Connecting to server...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="block text-cyan-200 mb-2 text-sm font-medium">
            Your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            maxLength={20}
            disabled={!isConnected}
            className="w-full px-4 py-3 rounded bg-gray-700 text-white placeholder-gray-500
                     focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
            autoFocus
          />
          <p className="text-gray-500 text-xs mt-2">2-20 characters, alphanumeric only</p>

          <button
            type="submit"
            disabled={!isConnected || name.trim().length < 2}
            className="w-full mt-6 px-4 py-3 bg-cyan-600 rounded hover:bg-cyan-700
                     disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium
                     transition-colors duration-200"
          >
            {isConnected ? 'Join Game' : 'Connecting...'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-700 text-gray-400 text-xs">
          <p>Controls:</p>
          <ul className="mt-2 space-y-1">
            <li><span className="text-cyan-400">WASD/Arrows</span> - Move</li>
            <li><span className="text-cyan-400">Space</span> - Interact</li>
            <li><span className="text-cyan-400">E</span> - Inventory</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
