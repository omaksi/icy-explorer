import { useState, useEffect, useRef, useCallback } from 'react';

export const useMultiplayer = (onTreasureUpdate, onPlayerUpdate) => {
  const [isConnected, setIsConnected] = useState(false);
  const [playerId, setPlayerId] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [otherPlayers, setOtherPlayers] = useState({});
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connect = useCallback((wsUrl) => {
    if (wsRef.current) return;

    console.log('Connecting to WebSocket server...');
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    wsRef.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case 'joined':
            setPlayerId(message.playerId);
            setPlayerName(message.player.name);
            // Set other players (exclude self)
            const { [message.playerId]: _, ...others } = message.players;
            setOtherPlayers(others);
            // Initialize treasures
            if (onTreasureUpdate) {
              onTreasureUpdate(message.treasures);
            }
            console.log('Joined game as', message.player.name);
            break;

          case 'player_joined':
            setOtherPlayers(prev => ({
              ...prev,
              [message.player.id]: message.player,
            }));
            console.log('Player joined:', message.player.name);
            break;

          case 'player_left':
            setOtherPlayers(prev => {
              const { [message.playerId]: _, ...rest } = prev;
              return rest;
            });
            console.log('Player left:', message.playerId);
            break;

          case 'players_update':
            // Update all player positions
            const { [playerId]: __, ...otherPlayerUpdates } = message.players;
            setOtherPlayers(prev => {
              const updated = { ...prev };
              Object.entries(otherPlayerUpdates).forEach(([id, player]) => {
                if (updated[id]) {
                  updated[id] = { ...updated[id], ...player };
                }
              });
              return updated;
            });
            break;

          case 'treasure_update':
            if (onTreasureUpdate) {
              onTreasureUpdate(message.treasure, message.inCave, message.caveKey);
            }
            break;

          case 'error':
            console.error('Server error:', message.message);
            alert(message.message);
            break;

          default:
            console.log('Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      wsRef.current = null;

      // Attempt reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('Attempting to reconnect...');
        connect(wsUrl);
      }, 3000);
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }, [playerId, onTreasureUpdate]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const send = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const sendJoin = useCallback((name) => {
    send({ type: 'join', name });
  }, [send]);

  const sendMove = useCallback((keys) => {
    send({ type: 'move', keys });
  }, [send]);

  const sendInteract = useCallback(() => {
    send({ type: 'interact' });
  }, [send]);

  const sendLeave = useCallback(() => {
    send({ type: 'leave' });
  }, [send]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    playerId,
    playerName,
    otherPlayers,
    connect,
    disconnect,
    sendJoin,
    sendMove,
    sendInteract,
    sendLeave,
  };
};
