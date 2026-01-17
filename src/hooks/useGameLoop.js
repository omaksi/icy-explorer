import { useState, useEffect } from 'react';
import { TILE_SIZE, WORLD_WIDTH, WORLD_HEIGHT, PLAYER_SPEED } from '../constants';
import { isWalkable } from '../world/tiles';

export const useGameLoop = (keys, world, treasures) => {
  const [player, setPlayer] = useState({
    x: WORLD_WIDTH * TILE_SIZE / 2,
    y: WORLD_HEIGHT * TILE_SIZE / 2,
    direction: 'down',
    frame: 0,
  });
  const [frameCount, setFrameCount] = useState(0);
  const [nearbyTreasure, setNearbyTreasure] = useState(null);

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

  return { player, frameCount, nearbyTreasure };
};
