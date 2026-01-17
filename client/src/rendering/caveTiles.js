import { CAVE_TILES, CAVE_TILE_COLORS } from '../world/caveTiles';
import { seededRandom } from '../utils/random';

export const drawCaveTile = (ctx, tile, screenX, screenY, x, y) => {
  // Draw base color
  ctx.fillStyle = CAVE_TILE_COLORS[tile];
  ctx.fillRect(screenX, screenY, 32, 32);

  switch (tile) {
    case CAVE_TILES.WALL:
      drawWall(ctx, screenX, screenY, x, y);
      break;
    case CAVE_TILES.ICE_SPIKE:
      drawIceSpike(ctx, screenX, screenY);
      break;
    case CAVE_TILES.ORE:
      drawOre(ctx, screenX, screenY, x, y);
      break;
    case CAVE_TILES.CRYSTAL:
      drawCrystal(ctx, screenX, screenY);
      break;
    case CAVE_TILES.EXIT:
      drawExit(ctx, screenX, screenY);
      break;
    case CAVE_TILES.CHEST:
      drawChest(ctx, screenX, screenY);
      break;
    case CAVE_TILES.FLOOR:
      drawFloorDetails(ctx, screenX, screenY, x, y);
      break;
  }
};

const drawWall = (ctx, screenX, screenY, x, y) => {
  // Rocky texture
  ctx.fillStyle = '#111827';
  const seed = x * 100 + y;
  for (let i = 0; i < 3; i++) {
    const rx = seededRandom(seed + i * 10) * 24 + 4;
    const ry = seededRandom(seed + i * 10 + 5) * 24 + 4;
    const rs = seededRandom(seed + i * 10 + 8) * 6 + 4;
    ctx.beginPath();
    ctx.arc(screenX + rx, screenY + ry, rs, 0, Math.PI * 2);
    ctx.fill();
  }
};

const drawIceSpike = (ctx, screenX, screenY) => {
  // Base darker
  ctx.fillStyle = '#0ea5e9';
  ctx.fillRect(screenX, screenY, 32, 32);

  // Main spike
  ctx.fillStyle = '#7dd3fc';
  ctx.beginPath();
  ctx.moveTo(screenX + 16, screenY + 2);
  ctx.lineTo(screenX + 24, screenY + 28);
  ctx.lineTo(screenX + 8, screenY + 28);
  ctx.closePath();
  ctx.fill();

  // Highlight
  ctx.fillStyle = '#e0f2fe';
  ctx.beginPath();
  ctx.moveTo(screenX + 16, screenY + 4);
  ctx.lineTo(screenX + 18, screenY + 16);
  ctx.lineTo(screenX + 12, screenY + 16);
  ctx.closePath();
  ctx.fill();

  // Small side spikes
  ctx.fillStyle = '#7dd3fc';
  ctx.beginPath();
  ctx.moveTo(screenX + 6, screenY + 10);
  ctx.lineTo(screenX + 10, screenY + 28);
  ctx.lineTo(screenX + 2, screenY + 28);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(screenX + 26, screenY + 12);
  ctx.lineTo(screenX + 30, screenY + 28);
  ctx.lineTo(screenX + 22, screenY + 28);
  ctx.closePath();
  ctx.fill();
};

const drawOre = (ctx, screenX, screenY, x, y) => {
  // Draw floor details first
  drawFloorDetails(ctx, screenX, screenY, x, y);

  // Small gold flecks scattered on the ground
  ctx.fillStyle = '#fbbf24';
  const seed = x * 100 + y + 3000;
  for (let i = 0; i < 4; i++) {
    const rx = seededRandom(seed + i * 7) * 24 + 4;
    const ry = seededRandom(seed + i * 7 + 3) * 24 + 4;
    ctx.beginPath();
    ctx.arc(screenX + rx, screenY + ry, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
};

const drawCrystal = (ctx, screenX, screenY) => {
  // Draw floor base
  ctx.fillStyle = '#374151';
  ctx.fillRect(screenX, screenY, 32, 32);

  // Subtle purple glow
  ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
  ctx.beginPath();
  ctx.arc(screenX + 16, screenY + 16, 12, 0, Math.PI * 2);
  ctx.fill();

  // Small purple crystal shards on the ground
  ctx.fillStyle = '#a855f7';
  ctx.beginPath();
  ctx.moveTo(screenX + 14, screenY + 14);
  ctx.lineTo(screenX + 16, screenY + 10);
  ctx.lineTo(screenX + 18, screenY + 14);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(screenX + 18, screenY + 18);
  ctx.lineTo(screenX + 21, screenY + 14);
  ctx.lineTo(screenX + 22, screenY + 18);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(screenX + 10, screenY + 18);
  ctx.lineTo(screenX + 11, screenY + 14);
  ctx.lineTo(screenX + 14, screenY + 18);
  ctx.closePath();
  ctx.fill();

  // Highlights
  ctx.fillStyle = '#c084fc';
  ctx.fillRect(screenX + 15, screenY + 11, 1, 2);
};

const drawExit = (ctx, screenX, screenY) => {
  // Glowing green base
  ctx.fillStyle = 'rgba(74, 222, 128, 0.3)';
  ctx.beginPath();
  ctx.arc(screenX + 16, screenY + 16, 14, 0, Math.PI * 2);
  ctx.fill();

  // Upward arrow
  ctx.fillStyle = '#4ade80';
  ctx.beginPath();
  ctx.moveTo(screenX + 16, screenY + 6);
  ctx.lineTo(screenX + 24, screenY + 18);
  ctx.lineTo(screenX + 19, screenY + 18);
  ctx.lineTo(screenX + 19, screenY + 26);
  ctx.lineTo(screenX + 13, screenY + 26);
  ctx.lineTo(screenX + 13, screenY + 18);
  ctx.lineTo(screenX + 8, screenY + 18);
  ctx.closePath();
  ctx.fill();

  // Arrow highlight
  ctx.fillStyle = '#86efac';
  ctx.beginPath();
  ctx.moveTo(screenX + 16, screenY + 8);
  ctx.lineTo(screenX + 20, screenY + 14);
  ctx.lineTo(screenX + 12, screenY + 14);
  ctx.closePath();
  ctx.fill();
};

const drawChest = (ctx, screenX, screenY) => {
  // Draw floor underneath
  ctx.fillStyle = '#374151';
  ctx.fillRect(screenX, screenY, 32, 32);

  // Chest body (wooden brown)
  ctx.fillStyle = '#92400e';
  ctx.fillRect(screenX + 4, screenY + 12, 24, 16);

  // Chest lid (darker brown)
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.moveTo(screenX + 4, screenY + 12);
  ctx.lineTo(screenX + 8, screenY + 6);
  ctx.lineTo(screenX + 24, screenY + 6);
  ctx.lineTo(screenX + 28, screenY + 12);
  ctx.closePath();
  ctx.fill();

  // Lid top
  ctx.fillStyle = '#a16207';
  ctx.fillRect(screenX + 8, screenY + 6, 16, 6);

  // Metal clasp
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(screenX + 13, screenY + 14, 6, 8);

  // Keyhole
  ctx.fillStyle = '#1f2937';
  ctx.beginPath();
  ctx.arc(screenX + 16, screenY + 17, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(screenX + 15, screenY + 18, 2, 3);

  // Metal bands
  ctx.fillStyle = '#d97706';
  ctx.fillRect(screenX + 4, screenY + 14, 2, 12);
  ctx.fillRect(screenX + 26, screenY + 14, 2, 12);
};

const drawFloorDetails = (ctx, screenX, screenY, x, y) => {
  // Subtle stone texture
  ctx.fillStyle = '#4b5563';
  const seed = x * 100 + y + 5000;
  if (seededRandom(seed) > 0.7) {
    const rx = seededRandom(seed + 1) * 20 + 6;
    const ry = seededRandom(seed + 2) * 20 + 6;
    ctx.beginPath();
    ctx.ellipse(screenX + rx, screenY + ry, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
};
