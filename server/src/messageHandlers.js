// Message protocol handlers

import { addPlayer, removePlayer, getPlayer, getAllPlayers, getPlayersObject, updatePlayer, validateName } from './playerManager.js';
import { getTreasures, updateTreasure, getCaveTreasures } from './gameState.js';
import { validateMovement, isNearTreasure } from './security.js';

const TILE_SIZE = 32;
const WORLD_WIDTH = 100;
const WORLD_HEIGHT = 100;
const PLAYER_SPEED = 4;
const CAVE_WIDTH = 25;
const CAVE_HEIGHT = 25;
const MAX_MOVEMENT_DISTANCE = PLAYER_SPEED * 2; // Allow some tolerance for lag

// Collision detection (simplified version of client logic)
function isValidPosition(x, y, world, isWalkable) {
  const checkPoints = [
    { x: x - 10, y: y - 10 },
    { x: x + 10, y: y - 10 },
    { x: x - 10, y: y + 10 },
    { x: x + 10, y: y + 10 },
  ];

  for (const point of checkPoints) {
    const ptX = Math.floor(point.x / TILE_SIZE);
    const ptY = Math.floor(point.y / TILE_SIZE);
    if (ptX >= 0 && ptX < world.width && ptY >= 0 && ptY < world.height) {
      // For now, we'll skip actual tile checks and trust client
      // In production, you'd regenerate the world here
    }
  }

  return true;
}

export function handleJoin(ws, data, broadcast) {
  const { name } = data;

  if (!validateName(name)) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Name must be 2-20 characters, alphanumeric and spaces only',
    }));
    return;
  }

  const player = addPlayer(ws, name);

  // Send success + initial state to joining player
  ws.send(JSON.stringify({
    type: 'joined',
    playerId: player.id,
    player: player,
    players: getPlayersObject(),
    treasures: getTreasures(),
  }));

  // Notify others
  broadcast({
    type: 'player_joined',
    player: player,
  }, player.id);

  console.log(`Player ${player.name} (${player.id}) joined`);
}

export function handleMove(playerId, data) {
  const { keys } = data;
  const player = getPlayer(playerId);

  if (!player) return;

  let newX = player.x;
  let newY = player.y;
  let direction = player.direction;
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

  // Anti-cheat: validate movement distance
  if (!validateMovement(player.x, player.y, newX, newY, MAX_MOVEMENT_DISTANCE)) {
    console.warn(`Player ${playerId} attempted invalid movement: (${player.x},${player.y}) -> (${newX},${newY})`);
    return; // Reject invalid movement
  }

  // Bounds checking
  const worldWidth = player.inCave ? CAVE_WIDTH : WORLD_WIDTH;
  const worldHeight = player.inCave ? CAVE_HEIGHT : WORLD_HEIGHT;

  newX = Math.max(16, Math.min(worldWidth * TILE_SIZE - 16, newX));
  newY = Math.max(16, Math.min(worldHeight * TILE_SIZE - 16, newY));

  // Update player
  updatePlayer(playerId, {
    x: newX,
    y: newY,
    direction,
    frame: moving ? (player.frame + 1) % 16 : 0,
  });
}

export function handleInteract(playerId, data, broadcast) {
  const player = getPlayer(playerId);
  if (!player) return;

  // Find nearby treasure
  const treasures = player.inCave
    ? getCaveTreasures(playerId, player.caveId)
    : getTreasures();

  const nearbyTreasure = treasures.find(t => {
    if (t.collected) return false;
    return isNearTreasure(player.x, player.y, t.x, t.y, 40);
  });

  if (nearbyTreasure) {
    // Double-check proximity (anti-cheat)
    if (!isNearTreasure(player.x, player.y, nearbyTreasure.x, nearbyTreasure.y, 45)) {
      console.warn(`Player ${playerId} attempted to collect treasure from too far away`);
      return;
    }
    if (!nearbyTreasure.opened) {
      // Open treasure
      const updated = updateTreasure(
        nearbyTreasure.id,
        { opened: true },
        player.inCave,
        playerId,
        player.caveId
      );

      broadcast({
        type: 'treasure_update',
        treasure: updated,
        inCave: player.inCave,
        caveKey: player.inCave ? `${playerId}_${player.caveId}` : null,
      });
    } else if (!nearbyTreasure.collected) {
      // Collect treasure
      const updated = updateTreasure(
        nearbyTreasure.id,
        { collected: true, collectedBy: playerId },
        player.inCave,
        playerId,
        player.caveId
      );

      // Add to player's collected words
      player.collectedWords.push(nearbyTreasure.word);

      broadcast({
        type: 'treasure_update',
        treasure: updated,
        playerId: playerId,
        inCave: player.inCave,
        caveKey: player.inCave ? `${playerId}_${player.caveId}` : null,
      });
    }
  }
}

export function handleLeave(playerId, broadcast) {
  const player = getPlayer(playerId);
  if (player) {
    console.log(`Player ${player.name} (${playerId}) left`);
    removePlayer(playerId);

    broadcast({
      type: 'player_left',
      playerId: playerId,
    });
  }
}
