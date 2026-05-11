mod handlers;
mod models;
mod route;
mod routes;
mod schema;
mod state;
mod types;

use dotenv::dotenv;
use sqlx::postgres::PgPoolOptions;
use std::env;

use crate::route::create_router;
use crate::state::AppState;
use std::{
    collections::{HashMap, VecDeque},
    sync::{Arc, Mutex},
};

#[tokio::main]
async fn main() {
    dotenv().ok();

    let db_url = env::var("DATABASE_URL").expect("DATABASE URL must be present");
    let pool = match PgPoolOptions::new()
        .max_connections(10)
        .connect(&db_url)
        .await
    {
        Ok(pool) => {
            println!("Connected to DB successfully");
            pool
        }
        Err(err) => {
            eprintln!("Failed to connect to DB: {}", err);
            std::process::exit(1)
        }
    };

    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("Failed to run migrations");

    let listener = match tokio::net::TcpListener::bind("0.0.0.0:8080").await {
        Ok(l) => {
            println!("Server binded to the port");
            l
        }
        Err(e) => {
            eprintln!("Failed to bind the port 8080: {}", e);
            std::process::exit(0)
        }
    };

    let gemini_api_key = env::var("GEMINI_API_KEY").unwrap_or_default();

    let state = Arc::new(AppState {
        queue: Mutex::new(VecDeque::new()),
        games: Mutex::new(HashMap::new()),
        postgres_db: pool.clone(),
        connections: Mutex::new(HashMap::new()),
        gemini_api_key,
    });

    let app = create_router(state);

    match axum::serve(listener, app).await {
        Ok(_) => {
            println!("Server shut down cleanly.");
        }
        Err(e) => {
            eprintln!("Server failed to start {}", e);
            std::process::exit(0)
        }
    }
}
