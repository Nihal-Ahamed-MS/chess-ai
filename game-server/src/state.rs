use sqlx::PgPool;
use std::collections::{HashMap, VecDeque};
use std::sync::{Arc, Mutex};
use tokio::sync::mpsc;

use crate::models::game_model::{Game, Player};
use crate::types::game_types::{GameId, PlayerId};

pub struct AppState {
    pub queue: Mutex<VecDeque<Player>>,
    pub games: Mutex<HashMap<GameId, Game>>,
    pub postgres_db: PgPool,
    pub connections: Mutex<HashMap<PlayerId, mpsc::UnboundedSender<String>>>,
    pub gemini_api_key: String,
}
