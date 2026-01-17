import { useState, useEffect } from 'react';
import { TILE_SIZE, WORLD_WIDTH, WORLD_HEIGHT, PLAYER_SPEED } from '../constants';
import { isWalkable, TILES } from '../world/tiles';
import { isCaveWalkable, CAVE_TILES } from '../world/caveTiles';
import { CAVE_WIDTH, CAVE_HEIGHT } from '../world/caveGeneration';

export const useGameLoop = (keys, world, treasures, inCave, caveMap, caveTreasures) => {
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

  // Get current map dimensions and walkability check
  const currentWorld = inCave ? caveMap : world;
  const currentWidth = inCave ? CAVE_WIDTH : WORLD_WIDTH;
  const currentHeight = inCave ? CAVE_HEIGHT : WORLD_HEIGHT;
  const checkWalkable = inCave ? isCaveWalkable : isWalkable;

  useEffect(() => {
    if (!currentWorld) return;

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

        return {
          x: newX,
          y: newY,
          direction,
          frame: moving ? (prev.frame + 1) % 16 : 0,
        };
      });

      // Check for nearby treasures
      const currentTreasures = inCave ? caveTreasures : treasures;
      setPlayer(prev => {
        const nearby = currentTreasures?.find(t => {
          if (t.collected) return false;
          const dist = Math.sqrt((t.x - prev.x) ** 2 + (t.y - prev.y) ** 2);
          return dist < 40;
        });
        setNearbyTreasure(nearby ? nearby.id : null);
        return prev;
      });

      if (!inCave) {
        // Check for nearby cave entrances (only in overworld)
        setPlayer(prev => {
          const playerTileX = Math.floor(prev.x / TILE_SIZE);
          const playerTileY = Math.floor(prev.y / TILE_SIZE);

          // Check adjacent tiles for cave entrance
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
          return prev;
        });
      } else {
        setNearbyCave(null);

        // Check for nearby exit (only in cave)
        setPlayer(prev => {
          const playerTileX = Math.floor(prev.x / TILE_SIZE);
          const playerTileY = Math.floor(prev.y / TILE_SIZE);

          let onExit = false;
          if (playerTileX >= 0 && playerTileX < CAVE_WIDTH && playerTileY >= 0 && playerTileY < CAVE_HEIGHT) {
            if (caveMap[playerTileY][playerTileX] === CAVE_TILES.EXIT) {
              onExit = true;
            }
          }
          setNearbyExit(onExit);
          return prev;
        });
      }
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [keys, currentWorld, treasures, inCave, caveMap, caveTreasures, currentWidth, currentHeight, checkWalkable]);

  const setPlayerPosition = (x, y) => {
    setPlayer(prev => ({ ...prev, x, y }));
  };

  return { player, frameCount, nearbyTreasure, nearbyCave, nearbyExit, setPlayerPosition };
};
