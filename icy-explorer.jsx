import React, { useState, useEffect, useCallback, useRef } from 'react';

const TILE_SIZE = 32;
const WORLD_WIDTH = 100;
const WORLD_HEIGHT = 100;
const PLAYER_SPEED = 4;

// Vybrané slová po B a M
const VYBRANE_SLOVA = [
  // Po B
  "by", "aby", "koby", "čoby", "akoby", "toby",
  "bystrý", "bylina", "býk", "bývať", "bývalý",
  "kobyla", "bydlo", "obyčaj", "obyvateľ", "dobytok",
  "zbytočný", "nábytek", "príbytok", "dobývať",
  // Po M
  "my", "vy", "mýliť", "myš", "mydlo", "myseľ",
  "mýto", "myšlienka", "hmyz", "priemysel", "úmysel",
  "výmysel", "pomykov", "zamykať", "vymýšľať", "omyl",
  "mykať", "šmýkať", "chmýrie", "žmýkať"
];

// Tile types
const TILES = {
  SNOW: 0,
  ICE: 1,
  TREE: 2,
  ROCK: 3,
  CAVE_ENTRANCE: 4,
  FROZEN_LAKE: 5,
  DEEP_SNOW: 6,
};

// Tile colors and rendering
const TILE_COLORS = {
  [TILES.SNOW]: '#e8f4f8',
  [TILES.ICE]: '#a8d8ea',
  [TILES.TREE]: '#e8f4f8',
  [TILES.ROCK]: '#9ca3af',
  [TILES.CAVE_ENTRANCE]: '#1f2937',
  [TILES.FROZEN_LAKE]: '#7dd3fc',
  [TILES.DEEP_SNOW]: '#d1e7ed',
};

// Seeded random for consistent world generation
const seededRandom = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Generate the world map
const generateWorld = () => {
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

// Check if tile is walkable
const isWalkable = (tile) => {
  return tile !== TILES.TREE && tile !== TILES.ROCK;
};

// Generate treasure boxes
const generateTreasures = (world) => {
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

export default function IcyExplorer() {
  const canvasRef = useRef(null);
  const [viewportSize, setViewportSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 800,
    height: typeof window !== 'undefined' ? window.innerHeight : 600,
  });
  const [world] = useState(() => generateWorld());
  const [treasures, setTreasures] = useState(() => []);
  const [collectedWords, setCollectedWords] = useState([]);
  const [showInventory, setShowInventory] = useState(false);
  const [nearbyTreasure, setNearbyTreasure] = useState(null);
  const [showWordPopup, setShowWordPopup] = useState(null);
  const [player, setPlayer] = useState({
    x: WORLD_WIDTH * TILE_SIZE / 2,
    y: WORLD_HEIGHT * TILE_SIZE / 2,
    direction: 'down',
    frame: 0,
  });
  const [keys, setKeys] = useState({});
  const [frameCount, setFrameCount] = useState(0);

  // Handle window resize for fullscreen
  useEffect(() => {
    const handleResize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Initialize treasures after world is created
  useEffect(() => {
    setTreasures(generateTreasures(world));
  }, [world]);
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        setKeys(prev => ({ ...prev, [e.key]: true }));
      }
      if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault();
        // Open nearby treasure
        if (nearbyTreasure !== null) {
          setTreasures(prev => prev.map(t => {
            if (t.id === nearbyTreasure) {
              if (!t.opened) {
                setShowWordPopup({ word: t.word, id: t.id });
                return { ...t, opened: true };
              } else if (!t.collected) {
                setCollectedWords(words => [...words, t.word]);
                setShowWordPopup(null);
                return { ...t, collected: true };
              }
            }
            return t;
          }));
        }
      }
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        setShowInventory(prev => !prev);
      }
    };
    
    const handleKeyUp = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        setKeys(prev => ({ ...prev, [e.key]: false }));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [nearbyTreasure]);
  
  // Game loop
  useEffect(() => {
    const gameLoop = setInterval(() => {
      setFrameCount(f => f + 1);
      
      setPlayer(prev => {
        let newX = prev.x;
        let newY = prev.y;
        let direction = prev.direction;
        let moving = false;
        
        // Calculate new position based on keys
        if (keys.ArrowUp) {
          newY -= PLAYER_SPEED;
          direction = 'up';
          moving = true;
        }
        if (keys.ArrowDown) {
          newY += PLAYER_SPEED;
          direction = 'down';
          moving = true;
        }
        if (keys.ArrowLeft) {
          newX -= PLAYER_SPEED;
          direction = 'left';
          moving = true;
        }
        if (keys.ArrowRight) {
          newX += PLAYER_SPEED;
          direction = 'right';
          moving = true;
        }
        
        // Check collision with world bounds
        newX = Math.max(16, Math.min(WORLD_WIDTH * TILE_SIZE - 16, newX));
        newY = Math.max(16, Math.min(WORLD_HEIGHT * TILE_SIZE - 16, newY));
        
        // Check collision with non-walkable tiles
        const tileX = Math.floor(newX / TILE_SIZE);
        const tileY = Math.floor(newY / TILE_SIZE);
        
        // Check surrounding tiles for collision
        const checkPoints = [
          { x: newX - 10, y: newY - 10 },
          { x: newX + 10, y: newY - 10 },
          { x: newX - 10, y: newY + 10 },
          { x: newX + 10, y: newY + 10 },
        ];
        
        let canMove = true;
        for (const point of checkPoints) {
          const ptX = Math.floor(point.x / TILE_SIZE);
          const ptY = Math.floor(point.y / TILE_SIZE);
          if (ptX >= 0 && ptX < WORLD_WIDTH && ptY >= 0 && ptY < WORLD_HEIGHT) {
            if (!isWalkable(world[ptY][ptX])) {
              canMove = false;
              break;
            }
          }
        }
        
        if (!canMove) {
          newX = prev.x;
          newY = prev.y;
        }
        
        return {
          x: newX,
          y: newY,
          direction,
          frame: moving ? (prev.frame + 1) % 16 : 0,
        };
      });
      
      // Check for nearby treasures
      setPlayer(prev => {
        const nearby = treasures.find(t => {
          if (t.collected) return false;
          const dist = Math.sqrt((t.x - prev.x) ** 2 + (t.y - prev.y) ** 2);
          return dist < 40;
        });
        setNearbyTreasure(nearby ? nearby.id : null);
        return prev;
      });
    }, 1000 / 60);
    
    return () => clearInterval(gameLoop);
  }, [keys, world, treasures]);
  
  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const VIEWPORT_WIDTH = viewportSize.width;
    const VIEWPORT_HEIGHT = viewportSize.height;

    // Calculate camera position (centered on player)
    const cameraX = player.x - VIEWPORT_WIDTH / 2;
    const cameraY = player.y - VIEWPORT_HEIGHT / 2;

    // Clear canvas
    ctx.fillStyle = '#e8f4f8';
    ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    // Calculate visible tile range
    const startTileX = Math.max(0, Math.floor(cameraX / TILE_SIZE));
    const startTileY = Math.max(0, Math.floor(cameraY / TILE_SIZE));
    const endTileX = Math.min(WORLD_WIDTH, Math.ceil((cameraX + VIEWPORT_WIDTH) / TILE_SIZE) + 1);
    const endTileY = Math.min(WORLD_HEIGHT, Math.ceil((cameraY + VIEWPORT_HEIGHT) / TILE_SIZE) + 1);
    
    // Draw tiles
    for (let y = startTileY; y < endTileY; y++) {
      for (let x = startTileX; x < endTileX; x++) {
        const tile = world[y][x];
        const screenX = x * TILE_SIZE - cameraX;
        const screenY = y * TILE_SIZE - cameraY;
        
        // Draw base
        ctx.fillStyle = TILE_COLORS[tile];
        ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
        
        // Draw details
        if (tile === TILES.TREE) {
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
        }
        
        if (tile === TILES.ROCK) {
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
        }
        
        if (tile === TILES.CAVE_ENTRANCE) {
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
        }
        
        if (tile === TILES.FROZEN_LAKE) {
          // Ice cracks
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
        }
        
        if (tile === TILES.DEEP_SNOW) {
          // Snow mounds
          ctx.fillStyle = '#f0f9ff';
          ctx.beginPath();
          ctx.ellipse(screenX + 10, screenY + 12, 8, 5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(screenX + 22, screenY + 22, 10, 6, 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    
    // Draw player (space warrior)
    const playerScreenX = VIEWPORT_WIDTH / 2;
    const playerScreenY = VIEWPORT_HEIGHT / 2;
    
    // Animation bob
    const bob = Math.sin(player.frame * 0.4) * 2;
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(playerScreenX, playerScreenY + 14, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Body (space suit)
    ctx.fillStyle = '#1e3a5f';
    ctx.beginPath();
    ctx.ellipse(playerScreenX, playerScreenY + bob, 12, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Suit highlights
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.ellipse(playerScreenX - 4, playerScreenY - 2 + bob, 4, 8, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Helmet
    ctx.fillStyle = '#374151';
    ctx.beginPath();
    ctx.arc(playerScreenX, playerScreenY - 12 + bob, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Visor
    ctx.fillStyle = '#60a5fa';
    ctx.beginPath();
    if (player.direction === 'up') {
      ctx.arc(playerScreenX, playerScreenY - 12 + bob, 6, 0, Math.PI * 2);
    } else if (player.direction === 'down') {
      ctx.ellipse(playerScreenX, playerScreenY - 10 + bob, 7, 5, 0, 0, Math.PI * 2);
    } else if (player.direction === 'left') {
      ctx.ellipse(playerScreenX - 3, playerScreenY - 11 + bob, 5, 6, 0, 0, Math.PI * 2);
    } else {
      ctx.ellipse(playerScreenX + 3, playerScreenY - 11 + bob, 5, 6, 0, 0, Math.PI * 2);
    }
    ctx.fill();
    
    // Visor shine
    ctx.fillStyle = '#93c5fd';
    ctx.beginPath();
    ctx.arc(playerScreenX - 2, playerScreenY - 13 + bob, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Jetpack
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(playerScreenX - 14, playerScreenY - 4 + bob, 4, 10);
    ctx.fillRect(playerScreenX + 10, playerScreenY - 4 + bob, 4, 10);
    
    // Jetpack glow (subtle)
    if (Object.values(keys).some(k => k)) {
      ctx.fillStyle = `rgba(251, 146, 60, ${0.3 + Math.random() * 0.3})`;
      ctx.beginPath();
      ctx.ellipse(playerScreenX - 12, playerScreenY + 10 + bob, 3, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(playerScreenX + 12, playerScreenY + 10 + bob, 3, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Mini-map
    const mapSize = 120;
    const mapX = VIEWPORT_WIDTH - mapSize - 10;
    const mapY = 10;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(mapX, mapY, mapSize, mapSize);
    
    const mapScale = mapSize / (WORLD_WIDTH * TILE_SIZE);
    
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
    
    // Draw treasure boxes
    treasures.forEach(treasure => {
      if (treasure.collected) return;
      
      const screenX = treasure.x - cameraX;
      const screenY = treasure.y - cameraY;
      
      // Only draw if on screen
      if (screenX < -32 || screenX > VIEWPORT_WIDTH + 32 || 
          screenY < -32 || screenY > VIEWPORT_HEIGHT + 32) return;
      
      const isNearby = treasure.id === nearbyTreasure;
      const bobOffset = Math.sin(frameCount * 0.1 + treasure.id) * 2;
      
      // Glow effect for nearby treasures
      if (isNearby) {
        ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
        ctx.beginPath();
        ctx.arc(screenX, screenY + bobOffset, 24, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Chest shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.ellipse(screenX, screenY + 12, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      
      if (!treasure.opened) {
        // Closed chest - base
        ctx.fillStyle = '#92400e';
        ctx.fillRect(screenX - 12, screenY - 4 + bobOffset, 24, 16);
        
        // Chest lid
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.moveTo(screenX - 14, screenY - 4 + bobOffset);
        ctx.lineTo(screenX - 12, screenY - 12 + bobOffset);
        ctx.lineTo(screenX + 12, screenY - 12 + bobOffset);
        ctx.lineTo(screenX + 14, screenY - 4 + bobOffset);
        ctx.closePath();
        ctx.fill();
        
        // Metal bands
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(screenX - 13, screenY - 6 + bobOffset, 26, 3);
        ctx.fillRect(screenX - 2, screenY - 12 + bobOffset, 4, 20);
        
        // Lock
        ctx.fillStyle = '#fcd34d';
        ctx.beginPath();
        ctx.arc(screenX, screenY + 2 + bobOffset, 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Open chest - base
        ctx.fillStyle = '#92400e';
        ctx.fillRect(screenX - 12, screenY - 4 + bobOffset, 24, 16);
        
        // Inside (dark)
        ctx.fillStyle = '#451a03';
        ctx.fillRect(screenX - 10, screenY - 2 + bobOffset, 20, 10);
        
        // Open lid (tilted back)
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.moveTo(screenX - 14, screenY - 4 + bobOffset);
        ctx.lineTo(screenX - 16, screenY - 18 + bobOffset);
        ctx.lineTo(screenX + 10, screenY - 18 + bobOffset);
        ctx.lineTo(screenX + 14, screenY - 4 + bobOffset);
        ctx.closePath();
        ctx.fill();
        
        // Metal band on open lid
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(screenX - 15, screenY - 14 + bobOffset, 24, 2);
        
        // Sparkle effect
        ctx.fillStyle = '#fef3c7';
        const sparkle = Math.sin(frameCount * 0.2) * 0.5 + 0.5;
        ctx.globalAlpha = sparkle;
        ctx.beginPath();
        ctx.arc(screenX - 4, screenY - 8 + bobOffset, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(screenX + 5, screenY - 6 + bobOffset, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      
      // Draw on minimap
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
    ctx.strokeRect(mapX, mapY, mapSize, mapSize);
    
  }, [player, world, frameCount, keys, treasures, nearbyTreasure, viewportSize]);

  return (
    <div className="fixed inset-0 bg-gray-900 overflow-hidden">
      <div className="relative w-full h-full">
        <canvas
          ref={canvasRef}
          width={viewportSize.width}
          height={viewportSize.height}
          className="block"
          tabIndex={0}
        />
        
        {/* Word popup when treasure is opened */}
        {showWordPopup && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                          bg-amber-900/95 border-4 border-amber-500 rounded-lg p-6 text-center
                          shadow-xl shadow-amber-500/30">
            <div className="text-amber-200 text-sm mb-2">Vybrané slovo:</div>
            <div className="text-4xl font-bold text-amber-100 mb-4">{showWordPopup.word}</div>
            <div className="text-amber-300 text-sm animate-pulse">
              Stlač MEDZERNÍK pre zozbieranie
            </div>
          </div>
        )}
        
        {/* Inventory overlay */}
        {showInventory && (
          <div className="absolute inset-0 bg-gray-900/90 flex items-center justify-center">
            <div className="bg-gray-800 border-4 border-cyan-500 rounded-lg p-6 max-w-md w-full mx-4
                            shadow-xl shadow-cyan-500/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-cyan-300">Zozbierané slová</h2>
                <span className="text-cyan-400 text-sm">
                  {collectedWords.length} / {VYBRANE_SLOVA.length}
                </span>
              </div>
              
              <div className="mb-4">
                <h3 className="text-amber-400 font-semibold mb-2">Vybrané slová po B, M:</h3>
                {collectedWords.length === 0 ? (
                  <p className="text-gray-400 italic">Zatiaľ žiadne slová...</p>
                ) : (
                  <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
                    {collectedWords.map((word, i) => (
                      <span 
                        key={i}
                        className="bg-amber-900/50 border border-amber-500 text-amber-200 
                                   px-3 py-1 rounded-full text-sm"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="text-center text-gray-400 text-sm">
                Stlač <span className="text-cyan-300 font-bold">E</span> pre zatvorenie
              </div>
            </div>
          </div>
        )}
        
        {/* Nearby treasure hint */}
        {nearbyTreasure !== null && !showWordPopup && !showInventory && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2
                          bg-gray-800/90 border-2 border-amber-500 rounded-lg px-4 py-2
                          text-amber-300 text-sm animate-bounce">
            Stlač MEDZERNÍK pre otvorenie truhlice
          </div>
        )}
        
        {/* Stats bar */}
        <div className="absolute top-2 left-2 bg-gray-800/80 rounded px-3 py-1
                        text-amber-300 text-sm border border-amber-500/50">
          {collectedWords.length} slov
        </div>

        {/* Controls hint */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-cyan-200 text-center
                        bg-gray-900/70 rounded-lg px-4 py-2">
          <p className="text-sm">
            <span className="font-bold">Sipky</span> - pohyb |
            <span className="font-bold"> MEDZERNIK</span> - otvorit truhlicu |
            <span className="font-bold"> E</span> - inventar
          </p>
        </div>

        {/* Arrow key indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded border-2 flex items-center justify-center text-xl
                ${keys.ArrowUp ? 'bg-cyan-600 border-cyan-400' : 'bg-gray-700/80 border-gray-500'}`}
            >
              ^
            </div>
            <div className="flex gap-1 mt-1">
              <div
                className={`w-10 h-10 rounded border-2 flex items-center justify-center text-xl
                  ${keys.ArrowLeft ? 'bg-cyan-600 border-cyan-400' : 'bg-gray-700/80 border-gray-500'}`}
              >
                &lt;
              </div>
              <div
                className={`w-10 h-10 rounded border-2 flex items-center justify-center text-xl
                  ${keys.ArrowDown ? 'bg-cyan-600 border-cyan-400' : 'bg-gray-700/80 border-gray-500'}`}
              >
                v
              </div>
              <div
                className={`w-10 h-10 rounded border-2 flex items-center justify-center text-xl
                  ${keys.ArrowRight ? 'bg-cyan-600 border-cyan-400' : 'bg-gray-700/80 border-gray-500'}`}
              >
                &gt;
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
