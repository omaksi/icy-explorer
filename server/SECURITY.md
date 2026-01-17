# Security Features

## Implemented Protections

### 1. Rate Limiting ✅
- **Max 100 messages/second per player**
- Sliding window of 1 second
- Automatic cleanup of old records every 5 minutes
- Violators receive error message and are throttled

### 2. Connection Limits ✅
- **Max 100 simultaneous players**
- New connections rejected when server is full
- Prevents resource exhaustion attacks

### 3. Anti-Cheat (Movement) ✅
- **Maximum movement distance validation**
- Players can't move more than 8 pixels per update (2x PLAYER_SPEED)
- Invalid movements are logged and rejected
- Prevents teleportation and speed hacks

### 4. Anti-Cheat (Treasure Collection) ✅
- **Proximity verification**
- Players must be within 45 pixels of treasure to collect
- Double-checks distance on server side
- Prevents remote treasure collection exploits

### 5. Input Validation ✅
- **Name validation**: 2-20 characters, alphanumeric + spaces only
- Prevents injection attacks and malformed data
- Clear error messages returned to client

## File Structure

```
server/
├── src/
│   ├── server.js          # Main server with connection limits
│   ├── security.js        # Security utilities (NEW)
│   ├── messageHandlers.js # Message handlers with validation
│   ├── playerManager.js   # Player management
│   └── gameState.js       # Game state management
├── package.json
├── Dockerfile
└── SECURITY.md (this file)
```

## Security Metrics

| Feature | Status | Protection Level |
|---------|--------|------------------|
| Rate Limiting | ✅ Enabled | High |
| Connection Limits | ✅ Enabled | High |
| Movement Validation | ✅ Enabled | Medium |
| Treasure Proximity | ✅ Enabled | Medium |
| Input Validation | ✅ Enabled | High |
| HTTPS/WSS | ⚠️ Not configured | N/A (local dev) |

## Production Recommendations

### Still Needed for Production:

1. **HTTPS/WSS** - Use SSL certificate and `wss://` protocol
2. **Origin Validation** - Whitelist allowed domains
3. **Reverse Proxy** - Deploy behind nginx with DDoS protection
4. **Monitoring** - Log suspicious activity, set up alerts
5. **Environment Variables** - Use for configuration (no hardcoded values)

### Example nginx Configuration:

```nginx
upstream websocket {
    server localhost:8080;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://websocket;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;

        # Rate limiting at nginx level
        limit_req zone=websocket burst=20 nodelay;
    }
}
```

## Threat Model

### Protected Against:
- ✅ DoS via message spam (rate limiting)
- ✅ Server resource exhaustion (connection limits)
- ✅ Speed hacks and teleportation (movement validation)
- ✅ Remote treasure collection (proximity checks)
- ✅ Name injection attacks (input sanitization)

### Not Protected Against (requires additional setup):
- ⚠️ DDoS attacks (need reverse proxy + CDN)
- ⚠️ Man-in-the-middle (need HTTPS/WSS)
- ⚠️ Reconnaissance (need origin validation)
- ⚠️ Account takeover (no authentication system)

## Configuration

Security settings can be adjusted in `server/src/security.js`:

```javascript
const MAX_PLAYERS = 100;                    // Connection limit
const MAX_MESSAGES_PER_SECOND = 100;        // Rate limit
const MESSAGE_WINDOW_MS = 1000;             // Rate limit window
```

## Logging

The server logs security events:

```
✅ Rate limit exceeded for player player_xxx: 150 msgs/sec
✅ Player player_xxx attempted invalid movement: (100,100) -> (500,500)
✅ Player player_xxx attempted to collect treasure from too far away
✅ Connection rejected: server full
```

Monitor these logs in production to detect attacks or bugs.

## Testing Security

To test security features:

1. **Rate Limiting**: Send >100 messages/second from a client
2. **Connection Limits**: Connect 101 clients simultaneously
3. **Movement Validation**: Modify client to send large position changes
4. **Treasure Proximity**: Modify client to interact with distant treasures

All tests should result in rejection and console warnings.
