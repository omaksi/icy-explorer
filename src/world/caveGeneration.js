import { CAVE_TILES } from './caveTiles';
import { seededRandom } from '../utils/random';

const CAVE_WIDTH = 25;
const CAVE_HEIGHT = 25;

const SPAWN_X = 3;
const SPAWN_Y = 3;
const EXIT_X = CAVE_WIDTH - 3;
const EXIT_Y = CAVE_HEIGHT - 3;

// BFS pathfinding to check if exit is reachable from spawn
const isWalkable = (tile) => {
  return tile !== CAVE_TILES.WALL && tile !== CAVE_TILES.ICE_SPIKE;
};

const findPath = (cave, startX, startY, endX, endY) => {
  const visited = new Set();
  const queue = [{ x: startX, y: startY, path: [] }];
  const directions = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
  ];

  while (queue.length > 0) {
    const { x, y, path } = queue.shift();
    const key = `${x},${y}`;

    if (x === endX && y === endY) {
      return path;
    }

    if (visited.has(key)) continue;
    visited.add(key);

    for (const { dx, dy } of directions) {
      const nx = x + dx;
      const ny = y + dy;

      if (nx < 0 || nx >= CAVE_WIDTH || ny < 0 || ny >= CAVE_HEIGHT) continue;
      if (visited.has(`${nx},${ny}`)) continue;
      if (!isWalkable(cave[ny][nx]) && !(nx === endX && ny === endY)) continue;

      queue.push({ x: nx, y: ny, path: [...path, { x: nx, y: ny }] });
    }
  }

  return null; // No path found
};

const carvePath = (cave, path) => {
  for (const { x, y } of path) {
    if (cave[y][x] === CAVE_TILES.WALL || cave[y][x] === CAVE_TILES.ICE_SPIKE) {
      cave[y][x] = CAVE_TILES.FLOOR;
    }
  }
};

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

      // Exit tile
      if (x === EXIT_X && y === EXIT_Y) {
        row.push(CAVE_TILES.EXIT);
        continue;
      }

      // Wall clusters (cave walls)
      const wallNoise = seededRandom(Math.floor(x / 4) * 100 + Math.floor(y / 4) + seed);
      if (wallNoise > 0.65 && rand < 0.5) {
        row.push(CAVE_TILES.WALL);
        continue;
      }

      // Ice spikes (dangerous, scattered)
      const spikeNoise = seededRandom(Math.floor(x / 3) * 50 + Math.floor(y / 3) + seed + 500);
      if (spikeNoise > 0.75 && rand < 0.3) {
        row.push(CAVE_TILES.ICE_SPIKE);
        continue;
      }

      // Ore deposits (clusters)
      const oreNoise = seededRandom(Math.floor(x / 4) * 70 + Math.floor(y / 4) + seed + 2000);
      if (oreNoise > 0.8 && rand2 > 0.6) {
        row.push(CAVE_TILES.ORE);
        continue;
      }

      // Crystals (rare, beautiful)
      if (rand > 0.97) {
        row.push(CAVE_TILES.CRYSTAL);
        continue;
      }

      // Chests (very rare treasure)
      const chestRand = seededRandom(tileSeed + 3000);
      if (chestRand > 0.985) {
        row.push(CAVE_TILES.CHEST);
        continue;
      }

      row.push(CAVE_TILES.FLOOR);
    }
    cave.push(row);
  }

  // Ensure entrance area is clear (player spawns at SPAWN_X, SPAWN_Y)
  for (let y = SPAWN_Y - 1; y <= SPAWN_Y + 1; y++) {
    for (let x = SPAWN_X - 1; x <= SPAWN_X + 1; x++) {
      if (y > 0 && y < CAVE_HEIGHT - 1 && x > 0 && x < CAVE_WIDTH - 1) {
        if (cave[y][x] !== CAVE_TILES.EXIT) {
          cave[y][x] = CAVE_TILES.FLOOR;
        }
      }
    }
  }

  // Ensure exit area is clear
  for (let y = EXIT_Y - 1; y <= EXIT_Y + 1; y++) {
    for (let x = EXIT_X - 1; x <= EXIT_X + 1; x++) {
      if (y > 0 && y < CAVE_HEIGHT - 1 && x > 0 && x < CAVE_WIDTH - 1) {
        if (cave[y][x] !== CAVE_TILES.EXIT) {
          cave[y][x] = CAVE_TILES.FLOOR;
        }
      }
    }
  }

  // Check if path exists, if not carve one
  const path = findPath(cave, SPAWN_X, SPAWN_Y, EXIT_X, EXIT_Y);
  if (!path) {
    // Carve a direct path if no path exists
    const directPath = [];
    let x = SPAWN_X;
    let y = SPAWN_Y;

    while (x !== EXIT_X || y !== EXIT_Y) {
      if (x < EXIT_X) x++;
      else if (x > EXIT_X) x--;

      directPath.push({ x, y });

      if (y < EXIT_Y) y++;
      else if (y > EXIT_Y) y--;

      if (x !== EXIT_X || y !== EXIT_Y) {
        directPath.push({ x, y });
      }
    }

    carvePath(cave, directPath);
  }

  return cave;
};

export { CAVE_WIDTH, CAVE_HEIGHT };
