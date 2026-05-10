use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::types::game_types::{ClientGameMessage, GameStatus, PlayerId};

#[derive(Clone, Debug)]
pub struct Player {
    pub id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Move {
    pub from: String,
    pub to: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Game {
    pub id: Uuid,
    pub white: PlayerId,
    pub black: PlayerId,
    pub moves: Option<sqlx::types::Json<Vec<Move>>>,
    pub game_status: GameStatus,
    pub result: Option<PlayerId>,
    pub fen: String,
}
