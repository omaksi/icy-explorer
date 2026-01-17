import { useState, useEffect, useCallback, useRef } from 'react';
import { generateWorld, generateTreasures } from './world/generation';
import { useKeyboard } from './hooks/useKeyboard';
import { useGameLoop } from './hooks/useGameLoop';
import { useInteraction } from './hooks/useInteraction';
import { useRenderer } from './hooks/useRenderer';
import { useWindowSize } from './hooks/useWindowSize';
import { useExploration } from './hooks/useExploration';
import { useMultiplayer } from './hooks/useMultiplayer';
import Inventory from './components/Inventory';
import WordPopup from './components/WordPopup';
import CollectionAnimation from './components/CollectionAnimation';
import TreasureHint from './components/TreasureHint';
import CaveHint from './components/CaveHint';
import StatsBar from './components/StatsBar';
import Controls from './components/Controls';
import JoinScreen from './components/JoinScreen';
import ConnectionStatus from './components/ConnectionStatus';

export default function IcyExplorer() {
  const canvasRef = useRef(null);
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const [world] = useState(() => generateWorld());
  const [treasures, setTreasures] = useState(() => []);
  const [collectedWords, setCollectedWords] = useState([]);
  const [showInventory, setShowInventory] = useState(false);
  const [showWordPopup, setShowWordPopup] = useState(null);
  const [showCollectionAnimation, setShowCollectionAnimation] = useState(null);

  // Multiplayer state
  const [hasJoined, setHasJoined] = useState(false);

  // Cave state
  const [inCave, setInCave] = useState(false);
  const [caveMap, setCaveMap] = useState(null);
  const [caveTreasures, setCaveTreasures] = useState([]);
  const [overworldPosition, setOverworldPosition] = useState(null);

  // Multiplayer connection
  const handleTreasureUpdate = useCallback((treasure) => {
    if (Array.isArray(treasure)) {
      // Initial treasures from server
      setTreasures(treasure);
    } else {
      // Single treasure update
      setTreasures(prev => prev.map(t =>
        t.id === treasure.id ? { ...t, ...treasure } : t
      ));
    }
  }, []);

  const {
    isConnected,
    playerId,
    playerName,
    otherPlayers,
    connect,
    sendJoin,
    sendMove,
    sendInteract,
  } = useMultiplayer(handleTreasureUpdate);

  // Connect to server on mount
  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';
    connect(wsUrl);
  }, [connect]);

  // Initialize treasures after world is created (fallback for single-player)
  useEffect(() => {
    if (!hasJoined) {
      setTreasures(generateTreasures(world));
    }
  }, [world, hasJoined]);

  const handleInventory = useCallback(() => {
    setShowInventory(prev => !prev);
  }, []);

  const handleJoin = useCallback((name) => {
    sendJoin(name);
    setHasJoined(true);
  }, [sendJoin]);

  const { keys, pressKey, releaseKey } = useKeyboard(null, handleInventory);
  const { player, frameCount, nearbyTreasure, nearbyCave, nearbyExit, setPlayerPosition } = useGameLoop(
    keys, world, treasures, inCave, caveMap, caveTreasures, showWordPopup, showInventory
  );
  const { explored, resetCaveExploration } = useExploration(player, inCave);

  // Send movement to server
  useEffect(() => {
    if (hasJoined && isConnected) {
      sendMove(keys);
    }
  }, [keys, hasJoined, isConnected, sendMove]);

  // Handle spacebar for treasures, cave entry, and cave exit
  const { handleInteraction } = useInteraction({
    nearbyTreasure,
    nearbyCave,
    nearbyExit,
    inCave,
    player,
    overworldPosition,
    setPlayerPosition,
    setOverworldPosition,
    setTreasures,
    setCaveTreasures,
    setShowWordPopup,
    setCollectedWords,
    setCaveMap,
    setInCave,
    resetCaveExploration,
    setShowCollectionAnimation,
  });

  // Render
  useRenderer({
    canvasRef,
    world,
    caveMap,
    inCave,
    player,
    keys,
    treasures,
    caveTreasures,
    nearbyTreasure,
    frameCount,
    viewportWidth: windowWidth,
    viewportHeight: windowHeight,
    explored,
    otherPlayers,
  });

  // Show join screen if not joined
  if (!hasJoined) {
    return <JoinScreen onJoin={handleJoin} isConnected={isConnected} />;
  }

  return (
    <div className="fixed inset-0 bg-gray-900 overflow-hidden">
      <div className="relative w-full h-full">
        <canvas
          ref={canvasRef}
          width={windowWidth}
          height={windowHeight}
          className="block"
          tabIndex={0}
        />

        {/* Title overlay */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <h1 className={`text-2xl font-bold px-4 py-2 rounded-lg bg-gray-900/70 ${
            inCave ? 'text-purple-300' : 'text-cyan-300'
          }`}>
            {inCave ? 'Jaskyňa' : 'Icy Explorer'}
          </h1>
        </div>

        {/* Connection status */}
        <ConnectionStatus isConnected={isConnected} playerName={playerName} />

        {showWordPopup && <WordPopup word={showWordPopup.word} />}
        {showCollectionAnimation && (
          <CollectionAnimation
            word={showCollectionAnimation.word}
            onComplete={() => setShowCollectionAnimation(null)}
          />
        )}
        {showInventory && <Inventory collectedWords={collectedWords} />}
        {nearbyTreasure !== null && !showWordPopup && !showInventory && <TreasureHint />}
        {!inCave && nearbyCave !== null && nearbyTreasure === null && !showInventory && <CaveHint />}
        {inCave && nearbyExit && !showInventory && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2
                          bg-gray-800/90 border-2 border-green-500 rounded-lg px-4 py-2
                          text-green-300 text-sm animate-bounce">
            Stlač MEDZERNÍK pre výstup z jaskyne
          </div>
        )}
        <StatsBar collectedWords={collectedWords} />

        {/* Instructions overlay */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-cyan-200 text-center bg-gray-900/70 px-4 py-2 rounded-lg">
          <p className="text-sm">
            <span className="font-bold">WASD/Šípky</span> - pohyb |
            <span className="font-bold"> MEDZERNÍK</span> - interakcia |
            <span className="font-bold"> E</span> - inventár
          </p>
        </div>

        <Controls
          keys={keys}
          onKeyPress={pressKey}
          onKeyRelease={releaseKey}
          onSpace={handleInteraction}
          onInventory={handleInventory}
        />
      </div>
    </div>
  );
}
