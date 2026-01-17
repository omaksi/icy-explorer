# Icy Explorer

A multiplayer educational game where players explore an icy world collecting Slovak vocabulary words.

## Project Structure

```
icy-explorer/
├── client/              # React + Vite client
│   ├── src/            # React components and game logic
│   ├── public/         # Static assets
│   └── package.json    # Client dependencies
│
├── server/             # Node.js WebSocket server
│   ├── src/            # Server source code
│   │   ├── server.js
│   │   ├── security.js
│   │   └── ...
│   ├── Dockerfile      # Container configuration
│   └── package.json    # Server dependencies
│
└── .github/workflows/  # CI/CD pipelines
```

## Quick Start

### Development

**Terminal 1 - Server:**
```bash
cd server
npm install
npm run dev
```

**Terminal 2 - Client:**
```bash
cd client
npm install
npm run dev
```

Visit http://localhost:5173

### Using Docker

```bash
# Start server
docker-compose up

# Or build and run manually
cd server
docker build -t icy-explorer-server .
docker run -p 8080:8080 icy-explorer-server
```

## Environment Variables

**Client** (create `client/.env`):
```
VITE_WS_URL=ws://localhost:8080
```

## Deployment

- **Client**: Automatically deployed to GitHub Pages via `.github/workflows/deploy.yml`
- **Server**: Containerized and pushed to GHCR via `.github/workflows/docker-build.yml`

## Documentation

- [Server Security](server/SECURITY.md) - Security features and configuration
- [Server README](server/README.md) - Server setup and deployment

## Tech Stack

- **Client**: React 19, Vite 7, Tailwind CSS 4
- **Server**: Node.js 20, WebSocket (ws)
- **Deployment**: GitHub Pages (client), Docker + GHCR (server)
