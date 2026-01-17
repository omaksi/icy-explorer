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
  explored,
  otherPlayers = {},
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
  const exploredRef = useRef(explored);
  const otherPlayersRef = useRef(otherPlayers);

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
  useEffect(() => { exploredRef.current = explored; }, [explored]);
  useEffect(() => { otherPlayersRef.current = otherPlayers; }, [otherPlayers]);

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
      const explored = exploredRef.current;
      const otherPlayers = otherPlayersRef.current;

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

      // Clear canvas with fog color (unexplored areas)
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, vw, vh);

      // Calculate visible tile range
      const startTileX = Math.max(0, Math.floor(cameraX / TILE_SIZE));
      const startTileY = Math.max(0, Math.floor(cameraY / TILE_SIZE));
      const endTileX = Math.min(currentWidth, Math.ceil((cameraX + vw) / TILE_SIZE) + 1);
      const endTileY = Math.min(currentHeight, Math.ceil((cameraY + vh) / TILE_SIZE) + 1);

      // Draw tiles with fog of war (only explored tiles are visible)
      for (let y = startTileY; y < endTileY; y++) {
        for (let x = startTileX; x < endTileX; x++) {
          const isExplored = explored && explored[y] && explored[y][x];
          if (!isExplored) continue;

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

      // Draw treasures (only if in explored area)
      const currentTreasures = inCave ? caveTreasures : treasures;
      currentTreasures.forEach(treasure => {
        const treasureTileX = Math.floor(treasure.x / TILE_SIZE);
        const treasureTileY = Math.floor(treasure.y / TILE_SIZE);
        const isExplored = explored && explored[treasureTileY] && explored[treasureTileY][treasureTileX];
        if (isExplored) {
          drawTreasure(ctx, treasure, cameraX, cameraY, nearbyTreasure, frameCount, vw, vh);
        }
      });

      // Draw player
      drawPlayer(ctx, player, keys, vw, vh);

      // Draw other players (only if not in cave, or in same cave)
      Object.values(otherPlayers).forEach(otherPlayer => {
        // Skip players in caves (multiplayer caves are per-player)
        if (otherPlayer.inCave) return;

        const screenX = otherPlayer.x - cameraX + vw / 2;
        const screenY = otherPlayer.y - cameraY + vh / 2;

        // Only draw if on screen
        if (screenX > -32 && screenX < vw + 32 && screenY > -32 && screenY < vh + 32) {
          // Draw player with different color (create player object for drawPlayer)
          const playerObj = {
            x: otherPlayer.x,
            y: otherPlayer.y,
            direction: otherPlayer.direction,
            frame: otherPlayer.frame,
          };

          // Save context state
          ctx.save();

          // Translate to other player position
          ctx.translate(screenX, screenY);

          // Draw other player (simplified, using same drawPlayer but with color tint)
          ctx.globalAlpha = 0.9;
          drawPlayer(ctx, playerObj, {}, 0, 0); // Pass 0,0 since we translated
          ctx.globalAlpha = 1.0;

          // Draw name above player
          ctx.fillStyle = 'white';
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 3;
          ctx.font = 'bold 14px Arial';
          ctx.textAlign = 'center';
          ctx.strokeText(otherPlayer.name, 0, -35);
          ctx.fillText(otherPlayer.name, 0, -35);

          ctx.restore();
        }
      });

      // Draw minimap
      if (inCave) {
        drawCaveMinimap(ctx, caveMap, player, vw, explored);
      } else {
        drawMinimap(ctx, world, player, vw, explored);
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animationId);
  }, [canvasRef]); // Only depends on canvasRef which is stable
};
