// FIXME: Fis player can with opponset picesx

Here's where embeddings actually add value and how to wire them in:

Where embeddings get used
1. Find similar past losses (pgvector cosine search)

When a game ends, embed it and find the most similar games the user has lost before:


// In /api/v1/games/embed/route.ts — after storing the embedding
const { rows: similarLosses } = await pool.query(
    `SELECT id, moves, result
     FROM games
     WHERE (white = $1 OR black = $1)
       AND result != $1
       AND embedding IS NOT NULL
     ORDER BY embedding <=> $2   -- cosine similarity
     LIMIT 5`,
    [userId, `[${vector.join(',')}]`]
);
// Return these to the frontend so the user sees: "You've lost 3 similar games before"
2. Cluster recurring mistakes in the analysis endpoint

Instead of just fetching recent losses, group by similarity:


// In /api/v1/games/analysis/route.ts
// Embed the current game, then find all user losses that are close to it
const currentEmbedding = await embedText(text);

const { rows } = await pool.query(
    `SELECT id, moves, white, black, result,
            (embedding <=> $2) AS distance
     FROM games
     WHERE (white = $1 OR black = $1)
       AND result != $1
       AND embedding IS NOT NULL
       AND (embedding <=> $2) < 0.3   -- similarity threshold
     ORDER BY distance
     LIMIT 10`,
    [userId, `[${currentEmbedding.join(',')}]`]
);
// These are games with SIMILAR move patterns where the user lost
// Feed these as a cluster to Gemini: "You keep losing in this type of position"