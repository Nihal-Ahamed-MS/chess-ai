use std::sync::Arc;

use crate::{handlers::match_making_handler::match_making_handler, state::AppState};
use axum::{
    Router,
    routing::{delete, get, post, put},
};

pub fn match_making_routes(app_state: Arc<AppState>) -> Router {
    Router::new()
        .route("/", get(match_making_handler))
        .route("/", post(match_making_handler))
        .route("/{id}", put(match_making_handler))
        .route("/{id}", delete(match_making_handler))
        .with_state(app_state)
}
