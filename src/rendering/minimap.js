import { TILE_SIZE, VIEWPORT_WIDTH, WORLD_WIDTH, WORLD_HEIGHT } from '../constants';
import { TILES } from '../world/tiles';

const MAP_SIZE = 120;

export const drawMinimap = (ctx, world, player, treasures) => {
  const mapX = VIEWPORT_WIDTH - MAP_SIZE - 10;
  const mapY = 10;

  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(mapX, mapY, MAP_SIZE, MAP_SIZE);

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
        mapX + x * mapScale * TILE_SIZE,
        mapY + y * mapScale * TILE_SIZE,
        4,
        4
      );
    }
  }

  // Draw treasures on minimap
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
