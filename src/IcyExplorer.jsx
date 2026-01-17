import { useState, useEffect, useCallback, useRef } from 'react';
import { TILE_SIZE, VIEWPORT_WIDTH, VIEWPORT_HEIGHT, WORLD_WIDTH, WORLD_HEIGHT } from './constants';
import { TILES } from './world/tiles';
import { generateWorld, generateTreasures } from './world/generation';
import { drawTile, drawFrozenLakeCracks } from './rendering/tiles';
import { drawPlayer } from './rendering/player';
import { drawTreasure } from './rendering/treasure';
import { drawMinimap } from './rendering/minimap';
import { useKeyboard } from './hooks/useKeyboard';
import { useGameLoop } from './hooks/useGameLoop';
import Inventory from './components/Inventory';
import WordPopup from './components/WordPopup';
import TreasureHint from './components/TreasureHint';
import StatsBar from './components/StatsBar';
import Controls from './components/Controls';

export default function IcyExplorer() {
  const canvasRef = useRef(null);
  const [world] = useState(() => generateWorld());
  const [treasures, setTreasures] = useState(() => []);
  const [collectedWords, setCollectedWords] = useState([]);
  const [showInventory, setShowInventory] = useState(false);
  const [showWordPopup, setShowWordPopup] = useState(null);

  // Initialize treasures after world is created
  useEffect(() => {
    setTreasures(generateTreasures(world));
  }, [world]);

  const handleSpace = useCallback(() => {
    if (nearbyTreasure !== null) {
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
    }
  }, []);

  const handleInventory = useCallback(() => {
    setShowInventory(prev => !prev);
  }, []);

  const keys = useKeyboard(handleSpace, handleInventory);
  const { player, frameCount, nearbyTreasure } = useGameLoop(keys, world, treasures);

  // Update handleSpace to use current nearbyTreasure
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === ' ' || e.key === 'Space') && nearbyTreasure !== null) {
        e.preventDefault();
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nearbyTreasure]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Calculate camera position (centered on player)
    const cameraX = player.x - VIEWPORT_WIDTH / 2;
    const cameraY = player.y - VIEWPORT_HEIGHT / 2;

    // Clear canvas
    ctx.fillStyle = '#e8f4f8';
    ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    // Calculate visible tile range
    const startTileX = Math.max(0, Math.floor(cameraX / TILE_SIZE));
    const startTileY = Math.max(0, Math.floor(cameraY / TILE_SIZE));
    const endTileX = Math.min(WORLD_WIDTH, Math.ceil((cameraX + VIEWPORT_WIDTH) / TILE_SIZE) + 1);
    const endTileY = Math.min(WORLD_HEIGHT, Math.ceil((cameraY + VIEWPORT_HEIGHT) / TILE_SIZE) + 1);

    // Draw tiles
    for (let y = startTileY; y < endTileY; y++) {
      for (let x = startTileX; x < endTileX; x++) {
        const tile = world[y][x];
        const screenX = x * TILE_SIZE - cameraX;
        const screenY = y * TILE_SIZE - cameraY;

        drawTile(ctx, tile, screenX, screenY);

        if (tile === TILES.FROZEN_LAKE) {
          drawFrozenLakeCracks(ctx, screenX, screenY, x, y);
        }
      }
    }

    // Draw treasures
    treasures.forEach(treasure => {
      drawTreasure(ctx, treasure, cameraX, cameraY, nearbyTreasure, frameCount);
    });

    // Draw player
    drawPlayer(ctx, player, keys);

    // Draw minimap
    drawMinimap(ctx, world, player, treasures);

  }, [player, world, frameCount, keys, treasures, nearbyTreasure]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <h1 className="text-2xl font-bold text-cyan-300 mb-4">Icy Explorer</h1>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={VIEWPORT_WIDTH}
          height={VIEWPORT_HEIGHT}
          className="border-4 border-cyan-600 rounded-lg shadow-lg shadow-cyan-500/20"
          tabIndex={0}
        />

        {showWordPopup && <WordPopup word={showWordPopup.word} />}
        {showInventory && <Inventory collectedWords={collectedWords} />}
        {nearbyTreasure !== null && !showWordPopup && !showInventory && <TreasureHint />}
        <StatsBar count={collectedWords.length} />
      </div>
      <div className="mt-4 text-cyan-200 text-center">
        <p className="mb-2">
          <span className="font-bold">WASD/Šípky</span> - pohyb |
          <span className="font-bold"> MEDZERNÍK</span> - otvoriť truhlicu |
          <span className="font-bold"> E</span> - inventár
        </p>
        <p className="text-sm text-cyan-400">Nájdi truhlice a zozbieraj vybrané slová po B a M</p>
      </div>
      <Controls keys={keys} />
    </div>
  );
}
