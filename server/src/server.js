import { WebSocketServer } from 'ws';
import { handleJoin, handleMove, handleInteract, handleLeave } from './messageHandlers.js';
import { getPlayersObject, getConnection, getAllPlayers } from './playerManager.js';
import { checkRateLimit, canAcceptConnection } from './security.js';

const PORT = process.env.PORT || 8080;
const wss = new WebSocketServer({ port: PORT });

// Track which player owns which WebSocket
const wsToPlayerId = new Map();

// Broadcast to all clients except sender
function broadcast(message, excludePlayerId = null) {
  const messageStr = JSON.stringify(message);

  getAllPlayers().forEach(player => {
    if (player.id !== excludePlayerId) {
      const ws = getConnection(player.id);
      if (ws && ws.readyState === 1) { // OPEN
        ws.send(messageStr);
      }
    }
  });
}

// Broadcast to all clients including sender
function broadcastAll(message) {
  const messageStr = JSON.stringify(message);

  getAllPlayers().forEach(player => {
    const ws = getConnection(player.id);
    if (ws && ws.readyState === 1) {
      ws.send(messageStr);
    }
  });
}

wss.on('connection', (ws) => {
  // Check connection limit
  if (!canAcceptConnection(getAllPlayers().length)) {
    console.log('Connection rejected: server full');
    ws.send(JSON.stringify({ type: 'error', message: 'Server is full. Please try again later.' }));
    ws.close();
    return;
  }

  console.log('New WebSocket connection');

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      const playerId = wsToPlayerId.get(ws);

      // Rate limiting (skip for join messages)
      if (message.type !== 'join' && playerId && !checkRateLimit(playerId)) {
        ws.send(JSON.stringify({ type: 'error', message: 'Rate limit exceeded' }));
        return;
      }

      switch (message.type) {
        case 'join':
          handleJoin(ws, message, broadcast);
          // Store mapping after join
          const players = getAllPlayers();
          const newPlayer = players[players.length - 1];
          if (newPlayer) {
            wsToPlayerId.set(ws, newPlayer.id);
          }
          break;

        case 'move':
          if (playerId) {
            handleMove(playerId, message);
          }
          break;

        case 'interact':
          if (playerId) {
            handleInteract(playerId, message, broadcastAll);
          }
          break;

        case 'leave':
          if (playerId) {
            handleLeave(playerId, broadcast);
            wsToPlayerId.delete(ws);
          }
          break;

        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  ws.on('close', () => {
    const playerId = wsToPlayerId.get(ws);
    if (playerId) {
      handleLeave(playerId, broadcast);
      wsToPlayerId.delete(ws);
    }
    console.log('WebSocket connection closed');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Broadcast player positions at 20 Hz (every 50ms)
setInterval(() => {
  const players = getPlayersObject();
  if (Object.keys(players).length > 0) {
    broadcastAll({
      type: 'players_update',
      players: players,
    });
  }
}, 50);

console.log(`WebSocket server running on port ${PORT}`);
