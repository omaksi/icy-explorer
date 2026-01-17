// Game state management

// Generate treasures on server (same algorithm as client)
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const TILE_SIZE = 32;
const WORLD_WIDTH = 100;
const WORLD_HEIGHT = 100;

const VYBRANE_SLOVA = [
  "bystrý", "mýto", "bahno", "bieda", "blato", "bodka", "brána", "breza",
  "brzda", "budík", "cement", "cesta", "chuť", "cieľ", "cirkev", "divák",
  "dojem", "dolár", "domov", "drevo", "držať", "dôkaz", "energia", "farba",
  "forma", "hlavný", "hneď", "hodina", "horúci", "chlad", "izba", "jazyk",
  "jednota", "koleno", "krajina", "krása", "láska", "mat", "medzi", "miesto"
];

function generateTreasures() {
  const treasures = [];
  const usedWords = new Set();

  for (let y = 5; y < WORLD_HEIGHT - 5; y += 8) {
    for (let x = 5; x < WORLD_WIDTH - 5; x += 8) {
      const seed = y * WORLD_WIDTH + x + 5000;
      const rand = seededRandom(seed);

      if (rand > 0.6) {
        // Pick a random word
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
            id: treasures.length,
            x: x * TILE_SIZE + TILE_SIZE / 2,
            y: y * TILE_SIZE + TILE_SIZE / 2,
            word: word,
            opened: false,
            collected: false,
            collectedBy: null,
          });
        }
      }
    }
  }

  return treasures;
}

// Initialize game state
const gameState = {
  treasures: generateTreasures(),
  caveTreasures: {}, // playerId_caveId -> treasures
};

export function getTreasures() {
  return gameState.treasures;
}

export function getCaveTreasures(playerId, caveId) {
  const key = `${playerId}_${caveId}`;
  if (!gameState.caveTreasures[key]) {
    // Generate cave treasures for this player's cave
    gameState.caveTreasures[key] = generateCaveTreasures(caveId);
  }
  return gameState.caveTreasures[key];
}

export function updateTreasure(treasureId, updates, inCave = false, playerId = null, caveId = null) {
  let treasures;

  if (inCave && playerId && caveId) {
    const key = `${playerId}_${caveId}`;
    treasures = gameState.caveTreasures[key];
  } else {
    treasures = gameState.treasures;
  }

  if (treasures) {
    const treasure = treasures.find(t => t.id === treasureId);
    if (treasure) {
      Object.assign(treasure, updates);
      return treasure;
    }
  }

  return null;
}

function generateCaveTreasures(caveId) {
  // Generate 3-5 treasures for cave
  const treasures = [];
  const seed = parseInt(caveId.split('_').join('')) || 12345;

  for (let i = 0; i < 4; i++) {
    const wordIndex = Math.floor(seededRandom(seed + i * 1000) * VYBRANE_SLOVA.length);
    const x = 4 + Math.floor(seededRandom(seed + i * 100) * 17) * TILE_SIZE + TILE_SIZE / 2;
    const y = 4 + Math.floor(seededRandom(seed + i * 200) * 17) * TILE_SIZE + TILE_SIZE / 2;

    treasures.push({
      id: i,
      x,
      y,
      word: VYBRANE_SLOVA[wordIndex],
      opened: false,
      collected: false,
      collectedBy: null,
    });
  }

  return treasures;
}

export function getAllState() {
  return {
    treasures: gameState.treasures,
  };
}
