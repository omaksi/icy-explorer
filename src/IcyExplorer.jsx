import { useState, useEffect, useCallback, useRef } from 'react';
import { VIEWPORT_WIDTH, VIEWPORT_HEIGHT } from './constants';
import { generateWorld, generateTreasures } from './world/generation';
import { useKeyboard } from './hooks/useKeyboard';
import { useGameLoop } from './hooks/useGameLoop';
import { useInteraction } from './hooks/useInteraction';
import { useRenderer } from './hooks/useRenderer';
import Inventory from './components/Inventory';
import WordPopup from './components/WordPopup';
import TreasureHint from './components/TreasureHint';
import CaveHint from './components/CaveHint';
import StatsBar from './components/StatsBar';
import Controls from './components/Controls';

export default function IcyExplorer() {
  const canvasRef = useRef(null);
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
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <h1 className="text-2xl font-bold text-cyan-300 mb-4">
        {inCave ? 'Jaskyňa' : 'Icy Explorer'}
      </h1>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={VIEWPORT_WIDTH}
          height={VIEWPORT_HEIGHT}
          className={`border-4 rounded-lg shadow-lg ${
            inCave
              ? 'border-purple-600 shadow-purple-500/20'
              : 'border-cyan-600 shadow-cyan-500/20'
          }`}
          tabIndex={0}
        />

        {showWordPopup && <WordPopup word={showWordPopup.word} />}
        {showInventory && <Inventory collectedWords={collectedWords} />}
        {nearbyTreasure !== null && !showWordPopup && !showInventory && <TreasureHint />}
        {!inCave && nearbyCave !== null && nearbyTreasure === null && !showInventory && <CaveHint />}
        {inCave && nearbyExit && !showInventory && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2
                          bg-gray-800/90 border-2 border-green-500 rounded-lg px-4 py-2
                          text-green-300 text-sm animate-bounce">
            Stlač MEDZERNÍK pre výstup z jaskyne
          </div>
        )}
        <StatsBar count={collectedWords.length} />
      </div>
      <div className="mt-4 text-cyan-200 text-center">
        <p className="mb-2">
          <span className="font-bold">WASD/Šípky</span> - pohyb |
          <span className="font-bold"> MEDZERNÍK</span> - interakcia |
          <span className="font-bold"> E</span> - inventár
        </p>
        <p className="text-sm text-cyan-400">
          {inCave
            ? 'Preskúmaj jaskyňu a nájdi východ'
            : 'Nájdi truhlice a zozbieraj vybrané slová po B a M'}
        </p>
      </div>
      <Controls keys={keys} />
    </div>
  );
}
