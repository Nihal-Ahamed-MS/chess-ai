use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Deserialize)]
#[serde(tag = "type")]
pub enum ClientGameMessage {
    Init {
        player_id: String,
    },
    Move {
        game_id: Uuid,
        player_id: String,
        from: String,
        to: String,
    },
    END {
        game_id: Uuid,
    },
    GameOver {
        game_id: Uuid,
        winner: String, // "white" | "black" | "draw"
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum GameStatus {
    OnGoing,
    Ended,
    Aborted,
}

#[derive(Serialize)]
#[serde(tag = "type")]
pub enum ServerGameMessage {
    Connected,
    Waiting,
    Matched { game_id: String },
    Move { from: String, to: String, fen: String },
    Ended,
}

pub type PlayerId = String;
pub type GameId = Uuid;
pub type White = String;
pub type Black = String;
