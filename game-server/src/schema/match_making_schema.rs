use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct MatchMakingSchema {
    pub player_id: String,
    pub player_elo: String,
}
