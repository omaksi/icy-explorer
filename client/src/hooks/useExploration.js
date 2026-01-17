import { useState, useEffect, useRef, useCallback } from 'react';
import { TILE_SIZE, WORLD_WIDTH, WORLD_HEIGHT, VISION_RADIUS } from '../constants';
import { CAVE_WIDTH, CAVE_HEIGHT } from '../world/caveGeneration';

export const useExploration = (player, inCave) => {
  // Separate explored maps for overworld and caves
  const [overworldExplored, setOverworldExplored] = useState(() =>
    createEmptyExploredMap(WORLD_WIDTH, WORLD_HEIGHT)
  );
  const [caveExplored, setCaveExplored] = useState(() =>
    createEmptyExploredMap(CAVE_WIDTH, CAVE_HEIGHT)
  );

  const playerRef = useRef(player);
  const inCaveRef = useRef(inCave);

  useEffect(() => { playerRef.current = player; }, [player]);
  useEffect(() => { inCaveRef.current = inCave; }, [inCave]);

  // Reset cave exploration when entering a new cave
  const resetCaveExploration = useCallback(() => {
    setCaveExplored(createEmptyExploredMap(CAVE_WIDTH, CAVE_HEIGHT));
  }, []);

  // Update explored tiles based on player position
  useEffect(() => {
    const playerTileX = Math.floor(player.x / TILE_SIZE);
    const playerTileY = Math.floor(player.y / TILE_SIZE);

    if (inCave) {
      setCaveExplored(prev => updateExploredMap(prev, playerTileX, playerTileY, CAVE_WIDTH, CAVE_HEIGHT));
    } else {
      setOverworldExplored(prev => updateExploredMap(prev, playerTileX, playerTileY, WORLD_WIDTH, WORLD_HEIGHT));
    }
  }, [player.x, player.y, inCave]);

  const explored = inCave ? caveExplored : overworldExplored;

  return { explored, resetCaveExploration };
};

function createEmptyExploredMap(width, height) {
  return Array(height).fill(null).map(() => Array(width).fill(false));
}

function updateExploredMap(prev, playerTileX, playerTileY, width, height) {
  let hasChanges = false;

  // Check if any tiles in vision range are unexplored
  for (let dy = -VISION_RADIUS; dy <= VISION_RADIUS; dy++) {
    for (let dx = -VISION_RADIUS; dx <= VISION_RADIUS; dx++) {
      const tileX = playerTileX + dx;
      const tileY = playerTileY + dy;

      if (tileX >= 0 && tileX < width && tileY >= 0 && tileY < height) {
        // Use circular vision (distance check)
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= VISION_RADIUS && !prev[tileY][tileX]) {
          hasChanges = true;
          break;
        }
      }
    }
    if (hasChanges) break;
  }

  if (!hasChanges) return prev;

  // Create new map with updated explored tiles
  const newMap = prev.map(row => [...row]);

  for (let dy = -VISION_RADIUS; dy <= VISION_RADIUS; dy++) {
    for (let dx = -VISION_RADIUS; dx <= VISION_RADIUS; dx++) {
      const tileX = playerTileX + dx;
      const tileY = playerTileY + dy;

      if (tileX >= 0 && tileX < width && tileY >= 0 && tileY < height) {
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= VISION_RADIUS) {
          newMap[tileY][tileX] = true;
        }
      }
    }
  }

  return newMap;
}

// Helper to check if a tile is currently visible (within vision range)
export function isTileVisible(tileX, tileY, playerX, playerY) {
  const playerTileX = Math.floor(playerX / TILE_SIZE);
  const playerTileY = Math.floor(playerY / TILE_SIZE);
  const dx = tileX - playerTileX;
  const dy = tileY - playerTileY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance <= VISION_RADIUS;
}
