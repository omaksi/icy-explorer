// Security utilities

const MAX_PLAYERS = 100;
const MAX_MESSAGES_PER_SECOND = 100;
const MESSAGE_WINDOW_MS = 1000;

// Rate limiting
const messageCounts = new Map();

export function checkRateLimit(playerId) {
  const now = Date.now();
  const record = messageCounts.get(playerId) || { count: 0, resetTime: now + MESSAGE_WINDOW_MS };

  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + MESSAGE_WINDOW_MS;
  }

  record.count++;
  messageCounts.set(playerId, record);

  if (record.count > MAX_MESSAGES_PER_SECOND) {
    console.warn(`Rate limit exceeded for player ${playerId}: ${record.count} msgs/sec`);
    return false;
  }

  return true;
}

export function cleanupRateLimits() {
  const now = Date.now();
  for (const [playerId, record] of messageCounts.entries()) {
    if (now > record.resetTime + MESSAGE_WINDOW_MS * 2) {
      messageCounts.delete(playerId);
    }
  }
}

// Anti-cheat: validate movement distance
export function validateMovement(oldX, oldY, newX, newY, maxSpeed = 8) {
  const distance = Math.sqrt((newX - oldX) ** 2 + (newY - oldY) ** 2);
  return distance <= maxSpeed;
}

// Connection limits
export function canAcceptConnection(currentPlayerCount) {
  return currentPlayerCount < MAX_PLAYERS;
}

// Validate treasure proximity
export function isNearTreasure(playerX, playerY, treasureX, treasureY, maxDistance = 50) {
  const distance = Math.sqrt((treasureX - playerX) ** 2 + (treasureY - playerY) ** 2);
  return distance < maxDistance;
}

// Clean up old rate limit records every 5 minutes
setInterval(cleanupRateLimits, 5 * 60 * 1000);

export const SECURITY_CONFIG = {
  MAX_PLAYERS,
  MAX_MESSAGES_PER_SECOND,
  MESSAGE_WINDOW_MS,
};
