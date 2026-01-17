import { useState, useEffect, useRef } from 'react';
import { TILE_SIZE, WORLD_WIDTH, WORLD_HEIGHT, PLAYER_SPEED } from '../constants';
import { isWalkable, TILES } from '../world/tiles';
import { isCaveWalkable, CAVE_TILES } from '../world/caveTiles';
import { CAVE_WIDTH, CAVE_HEIGHT } from '../world/caveGeneration';

export const useGameLoop = (keys, world, treasures, inCave, caveMap, caveTreasures, showWordPopup, showInventory) => {
  const [player, setPlayer] = useState({
    x: WORLD_WIDTH * TILE_SIZE / 2,
    y: WORLD_HEIGHT * TILE_SIZE / 2,
    direction: 'down',
    frame: 0,
  });
  const [frameCount, setFrameCount] = useState(0);
  const [nearbyTreasure, setNearbyTreasure] = useState(null);
  const [nearbyCave, setNearbyCave] = useState(null);
  const [nearbyExit, setNearbyExit] = useState(false);

  // Use refs to avoid recreating the interval on every state change
  const keysRef = useRef(keys);
  const worldRef = useRef(world);
  const treasuresRef = useRef(treasures);
  const inCaveRef = useRef(inCave);
  const caveMapRef = useRef(caveMap);
  const caveTreasuresRef = useRef(caveTreasures);
  const showWordPopupRef = useRef(showWordPopup);
  const showInventoryRef = useRef(showInventory);

  // Keep refs in sync
  useEffect(() => { keysRef.current = keys; }, [keys]);
  useEffect(() => { worldRef.current = world; }, [world]);
  useEffect(() => { treasuresRef.current = treasures; }, [treasures]);
  useEffect(() => { inCaveRef.current = inCave; }, [inCave]);
  useEffect(() => { caveMapRef.current = caveMap; }, [caveMap]);
  useEffect(() => { caveTreasuresRef.current = caveTreasures; }, [caveTreasures]);
  useEffect(() => { showWordPopupRef.current = showWordPopup; }, [showWordPopup]);
  useEffect(() => { showInventoryRef.current = showInventory; }, [showInventory]);

  // Single stable game loop that reads from refs
  useEffect(() => {
    const gameLoop = setInterval(() => {
      const keys = keysRef.current;
      const world = worldRef.current;
      const inCave = inCaveRef.current;
      const caveMap = caveMapRef.current;
      const treasures = treasuresRef.current;
      const caveTreasures = caveTreasuresRef.current;
      const showWordPopup = showWordPopupRef.current;
      const showInventory = showInventoryRef.current;

      const currentWorld = inCave ? caveMap : world;
      if (!currentWorld) return;

      const currentWidth = inCave ? CAVE_WIDTH : WORLD_WIDTH;
      const currentHeight = inCave ? CAVE_HEIGHT : WORLD_HEIGHT;
      const checkWalkable = inCave ? isCaveWalkable : isWalkable;

      setFrameCount(f => f + 1);

      setPlayer(prev => {
        let newX = prev.x;
        let newY = prev.y;
        let direction = prev.direction;
        let moving = false;

        // Disable movement when any popup is shown
        if (!showWordPopup && !showInventory) {
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
        }

        // Check collision with world bounds
        newX = Math.max(16, Math.min(currentWidth * TILE_SIZE - 16, newX));
        newY = Math.max(16, Math.min(currentHeight * TILE_SIZE - 16, newY));

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
          if (ptX >= 0 && ptX < currentWidth && ptY >= 0 && ptY < currentHeight) {
            if (!checkWalkable(currentWorld[ptY][ptX])) {
              canMove = false;
              break;
            }
          }
        }

        if (!canMove) {
          newX = prev.x;
          newY = prev.y;
        }

        // Check for nearby treasures (batched into same update)
        const currentTreasures = inCave ? caveTreasures : treasures;
        const nearby = currentTreasures?.find(t => {
          if (t.collected) return false;
          const dist = Math.sqrt((t.x - newX) ** 2 + (t.y - newY) ** 2);
          return dist < 40;
        });
        setNearbyTreasure(nearby ? nearby.id : null);

        // Check for nearby cave/exit (batched)
        const playerTileX = Math.floor(newX / TILE_SIZE);
        const playerTileY = Math.floor(newY / TILE_SIZE);

        if (!inCave) {
          // Check for nearby cave entrances (only in overworld)
          let foundCave = null;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const checkX = playerTileX + dx;
              const checkY = playerTileY + dy;
              if (checkX >= 0 && checkX < WORLD_WIDTH && checkY >= 0 && checkY < WORLD_HEIGHT) {
                if (world[checkY][checkX] === TILES.CAVE_ENTRANCE) {
                  foundCave = { x: checkX, y: checkY };
                  break;
                }
              }
            }
            if (foundCave) break;
          }
          setNearbyCave(foundCave);
          setNearbyExit(false);
        } else {
          setNearbyCave(null);
          // Check for nearby exit (only in cave)
          let onExit = false;
          if (playerTileX >= 0 && playerTileX < CAVE_WIDTH && playerTileY >= 0 && playerTileY < CAVE_HEIGHT) {
            if (caveMap[playerTileY][playerTileX] === CAVE_TILES.EXIT) {
              onExit = true;
            }
          }
          setNearbyExit(onExit);
        }

        return {
          x: newX,
          y: newY,
          direction,
          frame: moving ? (prev.frame + 1) % 16 : 0,
        };
      });
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, []); // Empty deps - interval is stable, reads from refs

  const setPlayerPosition = (x, y) => {
    setPlayer(prev => ({ ...prev, x, y }));
  };

  return { player, frameCount, nearbyTreasure, nearbyCave, nearbyExit, setPlayerPosition };
};
