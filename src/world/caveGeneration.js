import { CAVE_TILES } from './caveTiles';
import { seededRandom } from '../utils/random';

const CAVE_WIDTH = 50;
const CAVE_HEIGHT = 50;

export const generateCave = (seed) => {
  const cave = [];

  for (let y = 0; y < CAVE_HEIGHT; y++) {
    const row = [];
    for (let x = 0; x < CAVE_WIDTH; x++) {
      const tileSeed = seed + y * CAVE_WIDTH + x;
      const rand = seededRandom(tileSeed);
      const rand2 = seededRandom(tileSeed + 1000);

      // Walls around edges
      if (x === 0 || x === CAVE_WIDTH - 1 || y === 0 || y === CAVE_HEIGHT - 1) {
        row.push(CAVE_TILES.WALL);
        continue;
      }

      // Exit in the far corner (opposite from entrance)
      if (x >= CAVE_WIDTH - 4 && x <= CAVE_WIDTH - 2 && y >= CAVE_HEIGHT - 4 && y <= CAVE_HEIGHT - 2) {
        if (x === CAVE_WIDTH - 3 && y === CAVE_HEIGHT - 3) {
          row.push(CAVE_TILES.EXIT);
        } else {
          row.push(CAVE_TILES.FLOOR);
        }
        continue;
      }

      // Wall clusters (cave walls)
      const wallNoise = seededRandom(Math.floor(x / 6) * 100 + Math.floor(y / 6) + seed);
      if (wallNoise > 0.7 && rand < 0.5) {
        row.push(CAVE_TILES.WALL);
        continue;
      }

      // Ice spikes (dangerous, scattered)
      const spikeNoise = seededRandom(Math.floor(x / 4) * 50 + Math.floor(y / 4) + seed + 500);
      if (spikeNoise > 0.75 && rand < 0.3) {
        row.push(CAVE_TILES.ICE_SPIKE);
        continue;
      }

      // Ore deposits (clusters)
      const oreNoise = seededRandom(Math.floor(x / 5) * 70 + Math.floor(y / 5) + seed + 2000);
      if (oreNoise > 0.8 && rand2 > 0.6) {
        row.push(CAVE_TILES.ORE);
        continue;
      }

      // Crystals (rare, beautiful)
      if (rand > 0.97) {
        row.push(CAVE_TILES.CRYSTAL);
        continue;
      }

      row.push(CAVE_TILES.FLOOR);
    }
    cave.push(row);
  }

  // Ensure entrance area is clear (player spawns at 3,3)
  for (let y = 2; y <= 5; y++) {
    for (let x = 2; x <= 5; x++) {
      if (cave[y][x] !== CAVE_TILES.EXIT) {
        cave[y][x] = CAVE_TILES.FLOOR;
      }
    }
  }

  // Ensure path to exit is somewhat passable
  for (let i = 0; i < CAVE_WIDTH - 6; i++) {
    const pathY = Math.floor(CAVE_HEIGHT / 2) + Math.floor(seededRandom(seed + i * 10) * 6) - 3;
    if (pathY > 0 && pathY < CAVE_HEIGHT - 1) {
      if (cave[pathY][i + 3] === CAVE_TILES.WALL || cave[pathY][i + 3] === CAVE_TILES.ICE_SPIKE) {
        cave[pathY][i + 3] = CAVE_TILES.FLOOR;
      }
    }
  }

  return cave;
};

export { CAVE_WIDTH, CAVE_HEIGHT };
