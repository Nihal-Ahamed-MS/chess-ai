Chess-llm is an experiment project to understand the usecase of RAG systems and pgvector.

## Overview

A full-stack chess platform where players compete in real-time and receive AI coaching powered by vector similarity search and a large language model. After each game, the move sequence is embedded via Gemini and stored in PostgreSQL with pgvector. The system then finds positionally similar past games, determines whether you won or lost those games, and generates tailored feedback — reinforcing what worked or identifying recurring mistakes.

## Architecture

```
┌─────────────────────────────────────┐
│          Next.js Frontend           │
│  React 19 · Tailwind · shadcn/ui    │
│  react-chessboard · chess.js        │
└────────────┬────────────────────────┘
             │ REST + WebSocket
     ┌───────┴────────┐
     │                │
     ▼                ▼
┌─────────┐    ┌──────────────────────┐
│  Next.js │    │  Rust Game Server    │
│  API     │    │  Axum · shakmaty     │
│  Routes  │    │  WebSocket · sqlx    │
└────┬─────┘    └──────────┬───────────┘
     │                     │
     ▼                     ▼
┌──────────┐        ┌────────────────┐
│ MongoDB  │        │  PostgreSQL     │
│  Users   │        │  + pgvector     │
│  Auth    │        │  Games · Embed  │
└──────────┘        └────────────────┘
     │
     ▼
┌──────────────────┐
│   Gemini API     │
│  gemini-2-flash  │
│  embedding-2     │
└──────────────────┘
```

### Prerequisites

- Node.js 20+
- Rust (stable toolchain)
- PostgreSQL with the `pgvector` extension installed
- MongoDB
- A Google Gemini API key

### Environment Variables

Create `.env.local` in the project root:

```env
TOKEN_SECRET=your_jwt_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/chess-ai-backend
NEXT_PUBLIC_KEY=<rsa_public_key>
PRIVATE_KEY=<rsa_private_key>
GOOGLE_GENAI_API_KEY=your_gemini_api_key
GEMINI_MODEL_NAME=gemini-2-flash
NEXT_PUBLIC_WS_URL=ws://localhost:8080
GAME_DB_URL=postgres://localhost:5432/chess-llm-service
```

Create `game-server/.env`:

```env
DATABASE_URL=postgres://localhost:5432/chess-llm-service
GEMINI_API_KEY=your_gemini_api_key
```

### Running Locally

**Option 1 — Process Compose (recommended)**

Builds and starts both services in the correct order with a single command:

```bash
npm install
process-compose up
```

Process Compose will:
1. Build the Rust game server (`cargo build --release`)
2. Start the game server and wait for it to be healthy on port 8080
3. Start the Next.js dev server once the game server is ready

> Install Process Compose: https://github.com/F1bonacc1/process-compose

**Option 2 — Manual**

```bash
# Terminal 1
npm install && npm run dev

# Terminal 2
cd game-server && cargo run
```

The Rust server runs migrations automatically on startup via `sqlx::migrate!`.

### Database Setup

```sql
-- Enable pgvector (requires the extension installed on your PostgreSQL instance)
CREATE EXTENSION IF NOT EXISTS vector;
```

The `games` table and `embedding` column are created automatically by the migrations in `game-server/migrations/`.
