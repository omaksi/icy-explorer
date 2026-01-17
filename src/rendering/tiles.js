import { TILES, TILE_COLORS } from '../world/tiles';
import { seededRandom } from '../utils/random';

export const drawTile = (ctx, tile, screenX, screenY) => {
  // Draw base
  ctx.fillStyle = TILE_COLORS[tile];
  ctx.fillRect(screenX, screenY, 32, 32);

  // Draw details based on tile type
  switch (tile) {
    case TILES.TREE:
      drawTree(ctx, screenX, screenY);
      break;
    case TILES.ROCK:
      drawRock(ctx, screenX, screenY);
      break;
    case TILES.CAVE_ENTRANCE:
      drawCave(ctx, screenX, screenY);
      break;
    case TILES.DEEP_SNOW:
      drawDeepSnow(ctx, screenX, screenY);
      break;
  }
};

export const drawFrozenLakeCracks = (ctx, screenX, screenY, x, y) => {
  ctx.strokeStyle = '#bae6fd';
  ctx.lineWidth = 1;
  const crackSeed = seededRandom(x * 100 + y);
  if (crackSeed > 0.5) {
    ctx.beginPath();
    ctx.moveTo(screenX + 5, screenY + 10);
    ctx.lineTo(screenX + 20, screenY + 16);
    ctx.lineTo(screenX + 28, screenY + 25);
    ctx.stroke();
  }
  if (crackSeed > 0.7) {
    ctx.beginPath();
    ctx.moveTo(screenX + 25, screenY + 5);
    ctx.lineTo(screenX + 15, screenY + 20);
    ctx.stroke();
  }
};

const drawTree = (ctx, screenX, screenY) => {
  // Tree trunk
  ctx.fillStyle = '#5d4037';
  ctx.fillRect(screenX + 12, screenY + 20, 8, 12);

  // Snow-covered foliage
  ctx.fillStyle = '#2d5a3d';
  ctx.beginPath();
  ctx.moveTo(screenX + 16, screenY + 2);
  ctx.lineTo(screenX + 28, screenY + 14);
  ctx.lineTo(screenX + 24, screenY + 14);
  ctx.lineTo(screenX + 30, screenY + 22);
  ctx.lineTo(screenX + 2, screenY + 22);
  ctx.lineTo(screenX + 8, screenY + 14);
  ctx.lineTo(screenX + 4, screenY + 14);
  ctx.closePath();
  ctx.fill();

  // Snow on tree
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(screenX + 16, screenY + 2);
  ctx.lineTo(screenX + 22, screenY + 8);
  ctx.lineTo(screenX + 10, screenY + 8);
  ctx.closePath();
  ctx.fill();
};

const drawRock = (ctx, screenX, screenY) => {
  ctx.fillStyle = '#6b7280';
  ctx.beginPath();
  ctx.ellipse(screenX + 16, screenY + 20, 14, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#9ca3af';
  ctx.beginPath();
  ctx.ellipse(screenX + 14, screenY + 18, 10, 7, -0.3, 0, Math.PI * 2);
  ctx.fill();
  // Snow cap
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(screenX + 14, screenY + 14, 8, 4, -0.2, 0, Math.PI * 2);
  ctx.fill();
};

const drawCave = (ctx, screenX, screenY) => {
  // Dark cave opening
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.ellipse(screenX + 16, screenY + 20, 14, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  // Rocky edge
  ctx.fillStyle = '#4b5563';
  ctx.beginPath();
  ctx.arc(screenX + 16, screenY + 16, 16, Math.PI, 0);
  ctx.lineTo(screenX + 32, screenY + 32);
  ctx.lineTo(screenX, screenY + 32);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#1f2937';
  ctx.beginPath();
  ctx.ellipse(screenX + 16, screenY + 22, 12, 10, 0, 0, Math.PI * 2);
  ctx.fill();
};

const drawDeepSnow = (ctx, screenX, screenY) => {
  // Snow mounds
  ctx.fillStyle = '#f0f9ff';
  ctx.beginPath();
  ctx.ellipse(screenX + 10, screenY + 12, 8, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(screenX + 22, screenY + 22, 10, 6, 0.5, 0, Math.PI * 2);
  ctx.fill();
};
