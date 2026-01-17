import { useEffect } from 'react';
import { TILE_SIZE, VIEWPORT_WIDTH, VIEWPORT_HEIGHT, WORLD_WIDTH, WORLD_HEIGHT } from '../constants';
import { TILES } from '../world/tiles';
import { CAVE_WIDTH, CAVE_HEIGHT } from '../world/caveGeneration';
import { drawTile, drawFrozenLakeCracks } from '../rendering/tiles';
import { drawCaveTile } from '../rendering/caveTiles';
import { drawPlayer } from '../rendering/player';
import { drawTreasure } from '../rendering/treasure';
import { drawMinimap, drawCaveMinimap } from '../rendering/minimap';

export const useRenderer = ({
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
}) => {
  // Get current map dimensions
  const currentWidth = inCave ? CAVE_WIDTH : WORLD_WIDTH;
  const currentHeight = inCave ? CAVE_HEIGHT : WORLD_HEIGHT;
  const currentWorld = inCave ? caveMap : world;

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

    // Draw treasures
    const currentTreasures = inCave ? caveTreasures : treasures;
    currentTreasures.forEach(treasure => {
      drawTreasure(ctx, treasure, cameraX, cameraY, nearbyTreasure, frameCount);
    });

    // Draw player
    drawPlayer(ctx, player, keys);

    // Draw minimap
    if (inCave) {
      drawCaveMinimap(ctx, caveMap, player, caveTreasures);
    } else {
      drawMinimap(ctx, world, player, treasures);
    }

  }, [canvasRef, player, currentWorld, frameCount, keys, treasures, caveTreasures, nearbyTreasure, inCave, caveMap, world, currentWidth, currentHeight]);
};
