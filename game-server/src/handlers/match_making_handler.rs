use std::sync::Arc;

use axum::{Json, extract::State, http::StatusCode, response::IntoResponse};

use crate::{schema::match_making_schema::MatchMakingSchema, state::AppState};

pub async fn match_making_handler() -> String {
    "Hello, World!".to_string()
}
