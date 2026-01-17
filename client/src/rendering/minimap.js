import { TILE_SIZE, FALLBACK_VIEWPORT_WIDTH, WORLD_WIDTH, WORLD_HEIGHT } from '../constants';
import { TILES } from '../world/tiles';
import { CAVE_TILES } from '../world/caveTiles';
import { CAVE_WIDTH, CAVE_HEIGHT } from '../world/caveGeneration';

const MAP_SIZE = 120;

export const drawMinimap = (ctx, world, player, viewportWidth, explored) => {
  const vw = viewportWidth || FALLBACK_VIEWPORT_WIDTH;
  const mapX = vw - MAP_SIZE - 10;
  const mapY = 10;

  // Background (fog color)
  ctx.fillStyle = 'rgba(26, 26, 46, 0.8)';
  ctx.fillRect(mapX, mapY, MAP_SIZE, MAP_SIZE);

  const mapScale = MAP_SIZE / (WORLD_WIDTH * TILE_SIZE);

  // Draw mini-map tiles (only explored ones)
  for (let y = 0; y < WORLD_HEIGHT; y += 2) {
    for (let x = 0; x < WORLD_WIDTH; x += 2) {
      // Check if this area is explored
      const isExplored = explored && explored[y] && explored[y][x];
      if (!isExplored) continue;

      const tile = world[y][x];
      if (tile === TILES.FROZEN_LAKE) {
        ctx.fillStyle = '#7dd3fc';
      } else if (tile === TILES.TREE) {
        ctx.fillStyle = '#2d5a3d';
      } else if (tile === TILES.ROCK) {
        ctx.fillStyle = '#6b7280';
      } else if (tile === TILES.CAVE_ENTRANCE) {
        ctx.fillStyle = '#1f2937';
      } else if (tile === TILES.SNOW || tile === TILES.ICE || tile === TILES.DEEP_SNOW) {
        ctx.fillStyle = '#e8f4f8';
      } else {
        continue;
      }
      ctx.fillRect(
        mapX + x * mapScale * TILE_SIZE,
        mapY + y * mapScale * TILE_SIZE,
        3,
        3
      );
    }
  }

  // Player position on mini-map
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(
    mapX + player.x * mapScale,
    mapY + player.y * mapScale,
    3,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Map border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(mapX, mapY, MAP_SIZE, MAP_SIZE);
};

export const drawCaveMinimap = (ctx, caveMap, player, viewportWidth, explored) => {
  const vw = viewportWidth || FALLBACK_VIEWPORT_WIDTH;
  const mapX = vw - MAP_SIZE - 10;
  const mapY = 10;

  // Background (fog color)
  ctx.fillStyle = 'rgba(26, 26, 46, 0.8)';
  ctx.fillRect(mapX, mapY, MAP_SIZE, MAP_SIZE);

  const mapScale = MAP_SIZE / (CAVE_WIDTH * TILE_SIZE);

  // Draw cave mini-map tiles (only explored ones)
  for (let y = 0; y < CAVE_HEIGHT; y += 2) {
    for (let x = 0; x < CAVE_WIDTH; x += 2) {
      // Check if this area is explored
      const isExplored = explored && explored[y] && explored[y][x];
      if (!isExplored) continue;

      const tile = caveMap[y][x];
      if (tile === CAVE_TILES.WALL) {
        ctx.fillStyle = '#374151';
      } else if (tile === CAVE_TILES.ICE_SPIKE) {
        ctx.fillStyle = '#7dd3fc';
      } else if (tile === CAVE_TILES.CRYSTAL) {
        ctx.fillStyle = '#a855f7';
      } else if (tile === CAVE_TILES.ORE) {
        ctx.fillStyle = '#fbbf24';
      } else if (tile === CAVE_TILES.EXIT) {
        ctx.fillStyle = '#4ade80';
      } else if (tile === CAVE_TILES.FLOOR) {
        ctx.fillStyle = '#4b5563';
      } else {
        continue;
      }
      ctx.fillRect(
        mapX + x * mapScale * TILE_SIZE,
        mapY + y * mapScale * TILE_SIZE,
        3,
        3
      );
    }
  }

  // Player position on mini-map
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(
    mapX + player.x * mapScale,
    mapY + player.y * mapScale,
    3,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Map border (purple for cave)
  ctx.strokeStyle = '#a855f7';
  ctx.lineWidth = 2;
  ctx.strokeRect(mapX, mapY, MAP_SIZE, MAP_SIZE);
};
