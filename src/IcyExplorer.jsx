import { useState, useEffect, useCallback, useRef } from 'react';
import { generateWorld, generateTreasures } from './world/generation';
import { useKeyboard } from './hooks/useKeyboard';
import { useGameLoop } from './hooks/useGameLoop';
import { useInteraction } from './hooks/useInteraction';
import { useRenderer } from './hooks/useRenderer';
import { useWindowSize } from './hooks/useWindowSize';
import { useExploration } from './hooks/useExploration';
import Inventory from './components/Inventory';
import WordPopup from './components/WordPopup';
import TreasureHint from './components/TreasureHint';
import CaveHint from './components/CaveHint';
import StatsBar from './components/StatsBar';
import Controls from './components/Controls';

export default function IcyExplorer() {
  const canvasRef = useRef(null);
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const [world] = useState(() => generateWorld());
  const [treasures, setTreasures] = useState(() => []);
  const [collectedWords, setCollectedWords] = useState([]);
  const [showInventory, setShowInventory] = useState(false);
  const [showWordPopup, setShowWordPopup] = useState(null);

  // Cave state
  const [inCave, setInCave] = useState(false);
  const [caveMap, setCaveMap] = useState(null);
  const [caveTreasures, setCaveTreasures] = useState([]);
  const [overworldPosition, setOverworldPosition] = useState(null);

  // Initialize treasures after world is created
  useEffect(() => {
    setTreasures(generateTreasures(world));
  }, [world]);

  const handleInventory = useCallback(() => {
    setShowInventory(prev => !prev);
  }, []);

  const keys = useKeyboard(null, handleInventory);
  const { player, frameCount, nearbyTreasure, nearbyCave, nearbyExit, setPlayerPosition } = useGameLoop(
    keys, world, treasures, inCave, caveMap, caveTreasures
  );
  const { explored, resetCaveExploration } = useExploration(player, inCave);

  // Handle spacebar for treasures, cave entry, and cave exit
  useInteraction({
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
  });

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

        {showWordPopup && <WordPopup word={showWordPopup.word} />}
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
        <StatsBar count={collectedWords.length} />

        {/* Instructions overlay */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-cyan-200 text-center bg-gray-900/70 px-4 py-2 rounded-lg">
          <p className="text-sm">
            <span className="font-bold">WASD/Šípky</span> - pohyb |
            <span className="font-bold"> MEDZERNÍK</span> - interakcia |
            <span className="font-bold"> E</span> - inventár
          </p>
        </div>

        <Controls keys={keys} />
      </div>
    </div>
  );
}
