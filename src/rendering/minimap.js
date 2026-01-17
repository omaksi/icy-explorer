import { TILE_SIZE, FALLBACK_VIEWPORT_WIDTH, WORLD_WIDTH, WORLD_HEIGHT } from '../constants';
import { TILES } from '../world/tiles';
import { CAVE_TILES } from '../world/caveTiles';
import { CAVE_WIDTH, CAVE_HEIGHT } from '../world/caveGeneration';

const MAP_SIZE = 120;

// Cache for offscreen minimap rendering
let overworldMinimapCache = null;
let overworldMinimapWorld = null;
let caveMinimapCache = null;
let caveMinimapMap = null;

const createOverworldMinimapCache = (world) => {
  const canvas = document.createElement('canvas');
  canvas.width = MAP_SIZE;
  canvas.height = MAP_SIZE;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, MAP_SIZE, MAP_SIZE);

  const mapScale = MAP_SIZE / (WORLD_WIDTH * TILE_SIZE);

  // Draw mini-map tiles (simplified)
  for (let y = 0; y < WORLD_HEIGHT; y += 4) {
    for (let x = 0; x < WORLD_WIDTH; x += 4) {
      const tile = world[y][x];
      if (tile === TILES.FROZEN_LAKE) {
        ctx.fillStyle = '#7dd3fc';
      } else if (tile === TILES.TREE) {
        ctx.fillStyle = '#2d5a3d';
      } else if (tile === TILES.CAVE_ENTRANCE) {
        ctx.fillStyle = '#1f2937';
      } else {
        continue;
      }
      ctx.fillRect(
        x * mapScale * TILE_SIZE,
        y * mapScale * TILE_SIZE,
        4,
        4
      );
    }
  }

  return canvas;
};

const createCaveMinimapCache = (caveMap) => {
  const canvas = document.createElement('canvas');
  canvas.width = MAP_SIZE;
  canvas.height = MAP_SIZE;
  const ctx = canvas.getContext('2d');

  // Background (darker for cave)
  ctx.fillStyle = 'rgba(31, 41, 55, 0.8)';
  ctx.fillRect(0, 0, MAP_SIZE, MAP_SIZE);

  const mapScale = MAP_SIZE / (CAVE_WIDTH * TILE_SIZE);

  // Draw cave mini-map tiles
  for (let y = 0; y < CAVE_HEIGHT; y += 2) {
    for (let x = 0; x < CAVE_WIDTH; x += 2) {
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
      } else {
        continue;
      }
      ctx.fillRect(
        x * mapScale * TILE_SIZE,
        y * mapScale * TILE_SIZE,
        3,
        3
      );
    }
  }

  return canvas;
};

export const drawMinimap = (ctx, world, player, treasures, viewportWidth) => {
  const vw = viewportWidth || FALLBACK_VIEWPORT_WIDTH;
  const mapX = vw - MAP_SIZE - 10;
  const mapY = 10;

  // Cache the terrain layer if world changed
  if (world !== overworldMinimapWorld) {
    overworldMinimapCache = createOverworldMinimapCache(world);
    overworldMinimapWorld = world;
  }

  // Draw cached terrain
  ctx.drawImage(overworldMinimapCache, mapX, mapY);

  const mapScale = MAP_SIZE / (WORLD_WIDTH * TILE_SIZE);

  // Draw treasures on minimap (dynamic layer)
  treasures.forEach(treasure => {
    if (treasure.collected) return;
    ctx.fillStyle = treasure.opened ? '#fbbf24' : '#f59e0b';
    ctx.beginPath();
    ctx.arc(
      mapX + treasure.x * mapScale,
      mapY + treasure.y * mapScale,
      2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });

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

export const drawCaveMinimap = (ctx, caveMap, player, caveTreasures, viewportWidth) => {
  const vw = viewportWidth || FALLBACK_VIEWPORT_WIDTH;
  const mapX = vw - MAP_SIZE - 10;
  const mapY = 10;

  // Cache the terrain layer if caveMap changed
  if (caveMap !== caveMinimapMap) {
    caveMinimapCache = createCaveMinimapCache(caveMap);
    caveMinimapMap = caveMap;
  }

  // Draw cached terrain
  ctx.drawImage(caveMinimapCache, mapX, mapY);

  const mapScale = MAP_SIZE / (CAVE_WIDTH * TILE_SIZE);

  // Draw cave treasures on minimap (dynamic layer)
  caveTreasures.forEach(treasure => {
    if (treasure.collected) return;
    ctx.fillStyle = treasure.opened ? '#fbbf24' : '#f59e0b';
    ctx.beginPath();
    ctx.arc(
      mapX + treasure.x * mapScale,
      mapY + treasure.y * mapScale,
      2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });

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
