import { useEffect, useRef } from 'react';
import { TILE_SIZE, FALLBACK_VIEWPORT_WIDTH, FALLBACK_VIEWPORT_HEIGHT, WORLD_WIDTH, WORLD_HEIGHT } from '../constants';
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
  viewportWidth,
  viewportHeight,
}) => {
  // Use refs to avoid effect re-runs on every state change
  const worldRef = useRef(world);
  const caveMapRef = useRef(caveMap);
  const inCaveRef = useRef(inCave);
  const playerRef = useRef(player);
  const keysRef = useRef(keys);
  const treasuresRef = useRef(treasures);
  const caveTreasuresRef = useRef(caveTreasures);
  const nearbyTreasureRef = useRef(nearbyTreasure);
  const frameCountRef = useRef(frameCount);
  const viewportWidthRef = useRef(viewportWidth);
  const viewportHeightRef = useRef(viewportHeight);

  // Keep refs in sync
  useEffect(() => { worldRef.current = world; }, [world]);
  useEffect(() => { caveMapRef.current = caveMap; }, [caveMap]);
  useEffect(() => { inCaveRef.current = inCave; }, [inCave]);
  useEffect(() => { playerRef.current = player; }, [player]);
  useEffect(() => { keysRef.current = keys; }, [keys]);
  useEffect(() => { treasuresRef.current = treasures; }, [treasures]);
  useEffect(() => { caveTreasuresRef.current = caveTreasures; }, [caveTreasures]);
  useEffect(() => { nearbyTreasureRef.current = nearbyTreasure; }, [nearbyTreasure]);
  useEffect(() => { frameCountRef.current = frameCount; }, [frameCount]);
  useEffect(() => { viewportWidthRef.current = viewportWidth; }, [viewportWidth]);
  useEffect(() => { viewportHeightRef.current = viewportHeight; }, [viewportHeight]);

  // Single stable render loop using requestAnimationFrame
  useEffect(() => {
    let animationId;

    const render = () => {
      const canvas = canvasRef.current;
      const world = worldRef.current;
      const caveMap = caveMapRef.current;
      const inCave = inCaveRef.current;
      const player = playerRef.current;
      const keys = keysRef.current;
      const treasures = treasuresRef.current;
      const caveTreasures = caveTreasuresRef.current;
      const nearbyTreasure = nearbyTreasureRef.current;
      const frameCount = frameCountRef.current;
      const vw = viewportWidthRef.current || FALLBACK_VIEWPORT_WIDTH;
      const vh = viewportHeightRef.current || FALLBACK_VIEWPORT_HEIGHT;

      const currentWorld = inCave ? caveMap : world;
      if (!canvas || !currentWorld) {
        animationId = requestAnimationFrame(render);
        return;
      }

      const ctx = canvas.getContext('2d');
      const currentWidth = inCave ? CAVE_WIDTH : WORLD_WIDTH;
      const currentHeight = inCave ? CAVE_HEIGHT : WORLD_HEIGHT;

      // Calculate camera position (centered on player)
      const cameraX = player.x - vw / 2;
      const cameraY = player.y - vh / 2;

      // Clear canvas with appropriate background
      ctx.fillStyle = inCave ? '#1f2937' : '#e8f4f8';
      ctx.fillRect(0, 0, vw, vh);

      // Calculate visible tile range
      const startTileX = Math.max(0, Math.floor(cameraX / TILE_SIZE));
      const startTileY = Math.max(0, Math.floor(cameraY / TILE_SIZE));
      const endTileX = Math.min(currentWidth, Math.ceil((cameraX + vw) / TILE_SIZE) + 1);
      const endTileY = Math.min(currentHeight, Math.ceil((cameraY + vh) / TILE_SIZE) + 1);

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
      drawPlayer(ctx, player, keys, vw, vh);

      // Draw minimap
      if (inCave) {
        drawCaveMinimap(ctx, caveMap, player, caveTreasures, vw);
      } else {
        drawMinimap(ctx, world, player, treasures, vw);
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animationId);
  }, [canvasRef]); // Only depends on canvasRef which is stable
};
