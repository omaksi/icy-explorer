import { TILE_SIZE, WORLD_WIDTH, WORLD_HEIGHT } from '../constants';
import { TILES, isWalkable } from './tiles';
import { seededRandom } from '../utils/random';
import { VYBRANE_SLOVA } from '../data/words';

export const generateWorld = () => {
  const world = [];

  for (let y = 0; y < WORLD_HEIGHT; y++) {
    const row = [];
    for (let x = 0; x < WORLD_WIDTH; x++) {
      const seed = y * WORLD_WIDTH + x;
      const rand = seededRandom(seed);
      const rand2 = seededRandom(seed + 1000);

      // Create some frozen lakes (clusters)
      const lakeNoise = seededRandom(Math.floor(x / 8) * 100 + Math.floor(y / 8));
      if (lakeNoise > 0.75 && rand < 0.7) {
        row.push(TILES.FROZEN_LAKE);
        continue;
      }

      // Create cave entrances (rare)
      if (rand > 0.995) {
        row.push(TILES.CAVE_ENTRANCE);
        continue;
      }

      // Create tree clusters
      const treeNoise = seededRandom(Math.floor(x / 5) * 50 + Math.floor(y / 5));
      if (treeNoise > 0.6 && rand < 0.4) {
        row.push(TILES.TREE);
        continue;
      }

      // Rocks
      if (rand > 0.97) {
        row.push(TILES.ROCK);
        continue;
      }

      // Ice patches
      if (rand2 > 0.85) {
        row.push(TILES.ICE);
        continue;
      }

      // Deep snow patches
      if (rand > 0.7 && rand2 < 0.3) {
        row.push(TILES.DEEP_SNOW);
        continue;
      }

      row.push(TILES.SNOW);
    }
    world.push(row);
  }

  return world;
};

export const generateTreasures = (world) => {
  const treasures = [];
  const usedWords = new Set();

  for (let y = 5; y < WORLD_HEIGHT - 5; y += 8) {
    for (let x = 5; x < WORLD_WIDTH - 5; x += 8) {
      const seed = y * WORLD_WIDTH + x + 5000;
      const rand = seededRandom(seed);

      if (rand > 0.6) {
        // Find a valid position nearby
        for (let dy = 0; dy < 5; dy++) {
          for (let dx = 0; dx < 5; dx++) {
            const tx = x + dx;
            const ty = y + dy;
            if (tx < WORLD_WIDTH && ty < WORLD_HEIGHT && isWalkable(world[ty][tx])) {
              // Pick a random word that hasn't been used
              let word;
              let attempts = 0;
              do {
                const wordIndex = Math.floor(seededRandom(seed + attempts * 100) * VYBRANE_SLOVA.length);
                word = VYBRANE_SLOVA[wordIndex];
                attempts++;
              } while (usedWords.has(word) && attempts < 50);

              if (!usedWords.has(word)) {
                usedWords.add(word);
                treasures.push({
                  x: tx * TILE_SIZE + TILE_SIZE / 2,
                  y: ty * TILE_SIZE + TILE_SIZE / 2,
                  word: word,
                  opened: false,
                  collected: false,
                  id: treasures.length,
                });
              }
              break;
            }
          }
          if (treasures.length > 0 && treasures[treasures.length - 1].x === (x) * TILE_SIZE + TILE_SIZE / 2) break;
        }
      }
    }
  }

  return treasures;
};
