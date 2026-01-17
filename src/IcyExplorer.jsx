import { useState, useEffect, useCallback, useRef } from 'react';
import { TILE_SIZE, VIEWPORT_WIDTH, VIEWPORT_HEIGHT, WORLD_WIDTH, WORLD_HEIGHT } from './constants';
import { TILES } from './world/tiles';
import { generateWorld, generateTreasures } from './world/generation';
import { generateCave, CAVE_WIDTH, CAVE_HEIGHT } from './world/caveGeneration';
import { drawTile, drawFrozenLakeCracks } from './rendering/tiles';
import { drawCaveTile } from './rendering/caveTiles';
import { drawPlayer } from './rendering/player';
import { drawTreasure } from './rendering/treasure';
import { drawMinimap, drawCaveMinimap } from './rendering/minimap';
import { useKeyboard } from './hooks/useKeyboard';
import { useGameLoop } from './hooks/useGameLoop';
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
    keys, world, treasures, inCave, caveMap
  );

  // Handle spacebar for treasures, cave entry, and cave exit
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault();

        // Handle treasure interaction (overworld only)
        if (!inCave && nearbyTreasure !== null) {
          setTreasures(prev => prev.map(t => {
            if (t.id === nearbyTreasure) {
              if (!t.opened) {
                setShowWordPopup({ word: t.word, id: t.id });
                return { ...t, opened: true };
              } else if (!t.collected) {
                setCollectedWords(words => [...words, t.word]);
                setShowWordPopup(null);
                return { ...t, collected: true };
              }
            }
            return t;
          }));
          return;
        }

        // Handle cave entry
        if (!inCave && nearbyCave !== null) {
          // Save current position
          setOverworldPosition({ x: player.x, y: player.y });

          // Generate cave based on entrance coordinates as seed
          const seed = nearbyCave.y * WORLD_WIDTH + nearbyCave.x;
          const newCave = generateCave(seed);
          setCaveMap(newCave);

          // Move player to cave entrance area
          setPlayerPosition(4 * TILE_SIZE, 4 * TILE_SIZE);
          setInCave(true);
          return;
        }

        // Handle cave exit
        if (inCave && nearbyExit) {
          // Return to overworld
          if (overworldPosition) {
            setPlayerPosition(overworldPosition.x, overworldPosition.y);
          }
          setInCave(false);
          setCaveMap(null);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nearbyTreasure, nearbyCave, nearbyExit, inCave, player, setPlayerPosition, overworldPosition]);

  // Get current map dimensions
  const currentWidth = inCave ? CAVE_WIDTH : WORLD_WIDTH;
  const currentHeight = inCave ? CAVE_HEIGHT : WORLD_HEIGHT;
  const currentWorld = inCave ? caveMap : world;

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentWorld) return;

    const ctx = canvas.getContext('2d');

    // Calculate camera position (centered on player)
    const cameraX = player.x - VIEWPORT_WIDTH / 2;
    const cameraY = player.y - VIEWPORT_HEIGHT / 2;

    // Clear canvas with appropriate background
    ctx.fillStyle = inCave ? '#1f2937' : '#e8f4f8';
    ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    // Calculate visible tile range
    const startTileX = Math.max(0, Math.floor(cameraX / TILE_SIZE));
    const startTileY = Math.max(0, Math.floor(cameraY / TILE_SIZE));
    const endTileX = Math.min(currentWidth, Math.ceil((cameraX + VIEWPORT_WIDTH) / TILE_SIZE) + 1);
    const endTileY = Math.min(currentHeight, Math.ceil((cameraY + VIEWPORT_HEIGHT) / TILE_SIZE) + 1);

    // Draw tiles
    for (let y = startTileY; y < endTileY; y++) {
      for (let x = startTileX; x < endTileX; x++) {
        const tile = currentWorld[y][x];
        const screenX = x * TILE_SIZE - cameraX;
        const screenY = y * TILE_SIZE - cameraY;

        if (inCave) {
          drawCaveTile(ctx, tile, screenX, screenY, x, y);
        } else {
          drawTile(ctx, tile, screenX, screenY);
          if (tile === TILES.FROZEN_LAKE) {
            drawFrozenLakeCracks(ctx, screenX, screenY, x, y);
          }
        }
      }
    }

    // Draw treasures (overworld only)
    if (!inCave) {
      treasures.forEach(treasure => {
        drawTreasure(ctx, treasure, cameraX, cameraY, nearbyTreasure, frameCount);
      });
    }

    // Draw player
    drawPlayer(ctx, player, keys);

    // Draw minimap
    if (inCave) {
      drawCaveMinimap(ctx, caveMap, player);
    } else {
      drawMinimap(ctx, world, player, treasures);
    }

  }, [player, currentWorld, frameCount, keys, treasures, nearbyTreasure, inCave, caveMap, currentWidth, currentHeight]);

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
        {!inCave && nearbyTreasure !== null && !showWordPopup && !showInventory && <TreasureHint />}
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
