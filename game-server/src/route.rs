use crate::handlers::ws_handler::ws_handler;
use crate::routes::match_making_route::match_making_routes;
use crate::state::AppState;
use axum::Router;
use axum::routing::get;
use std::sync::Arc;

pub fn create_router(app_state: Arc<AppState>) -> Router {
    Router::new()
        .route("/game-ws", get(ws_handler))
        .with_state(app_state)
}
