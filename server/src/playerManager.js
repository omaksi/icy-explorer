// Player connection management

const players = new Map();
const connections = new Map(); // playerId -> WebSocket

export function generatePlayerId() {
  return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function validateName(name) {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 20) return false;
  // Allow alphanumeric and spaces
  return /^[a-zA-Z0-9 ]+$/.test(trimmed);
}

export function addPlayer(ws, name, initialX = 1600, initialY = 1600) {
  const playerId = generatePlayerId();

  const player = {
    id: playerId,
    name: name.trim(),
    x: initialX,
    y: initialY,
    direction: 'down',
    frame: 0,
    collectedWords: [],
    inCave: false,
    caveId: null,
    lastUpdate: Date.now(),
  };

  players.set(playerId, player);
  connections.set(playerId, ws);

  return player;
}

export function removePlayer(playerId) {
  players.delete(playerId);
  connections.delete(playerId);
}

export function getPlayer(playerId) {
  return players.get(playerId);
}

export function getAllPlayers() {
  return Array.from(players.values());
}

export function getConnection(playerId) {
  return connections.get(playerId);
}

export function getPlayersObject() {
  const obj = {};
  players.forEach((player, id) => {
    obj[id] = player;
  });
  return obj;
}

export function updatePlayer(playerId, updates) {
  const player = players.get(playerId);
  if (player) {
    Object.assign(player, updates);
    player.lastUpdate = Date.now();
  }
}
