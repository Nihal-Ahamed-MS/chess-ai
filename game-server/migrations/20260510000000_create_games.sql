CREATE TABLE IF NOT EXISTS games (
    id UUID PRIMARY KEY,
    white TEXT NOT NULL,
    black TEXT NOT NULL,
    moves JSONB,
    game_status TEXT NOT NULL,
    result TEXT,
    fen TEXT NOT NULL
);
