# Icy Explorer Server

WebSocket server for multiplayer Icy Explorer game.

## Development

```bash
npm install
npm run dev
```

## Production

```bash
npm start
```

## Docker

```bash
# Build
docker build -t icy-explorer-server .

# Run
docker run -p 8080:8080 icy-explorer-server
```

## Environment Variables

- `PORT` - WebSocket server port (default: 8080)
