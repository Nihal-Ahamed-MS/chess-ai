use futures::{SinkExt, StreamExt};
use shakmaty::{Chess, Position, fen::Fen};
use std::sync::Arc;
use tokio::sync::mpsc;
use uuid::Uuid;

use axum::{
    extract::{
        State,
        ws::{Message, WebSocket, WebSocketUpgrade},
    },
    response::IntoResponse,
};

use crate::{
    models::game_model::{Game, Move, Player},
    state::AppState,
    types::game_types::{ClientGameMessage, GameId, GameStatus, ServerGameMessage},
};

fn game_status_str(status: &GameStatus) -> &'static str {
    match status {
        GameStatus::OnGoing => "OnGoing",
        GameStatus::Ended => "Ended",
        GameStatus::Aborted => "Aborted",
    }
}

async fn db_insert_game(pool: &sqlx::PgPool, game: &Game) {
    if let Err(e) = sqlx::query(
        "INSERT INTO games (id, white, black, moves, game_status, result, fen)
         VALUES ($1, $2, $3, $4, $5, $6, $7)",
    )
    .bind(game.id)
    .bind(&game.white)
    .bind(&game.black)
    .bind(&game.moves)
    .bind(game_status_str(&game.game_status))
    .bind(&game.result)
    .bind(&game.fen)
    .execute(pool)
    .await
    {
        eprintln!("Failed to insert game {}: {}", game.id, e);
    }
}

async fn db_end_game(pool: &sqlx::PgPool, game_id: GameId, winner_id: &str) {
    if let Err(e) = sqlx::query(
        "UPDATE games SET game_status = 'Ended', result = $1 WHERE id = $2",
    )
    .bind(winner_id)
    .bind(game_id)
    .execute(pool)
    .await
    {
        eprintln!("Failed to end game {}: {}", game_id, e);
    }
}

async fn db_update_game_move(
    pool: &sqlx::PgPool,
    game_id: GameId,
    fen: &str,
    moves: &Option<sqlx::types::Json<Vec<Move>>>,
) {
    if let Err(e) = sqlx::query(
        "UPDATE games SET fen = $1, moves = $2 WHERE id = $3",
    )
    .bind(fen)
    .bind(moves)
    .bind(game_id)
    .execute(pool)
    .await
    {
        eprintln!("Failed to update game {}: {}", game_id, e);
    }
}

pub fn join_queue(state: Arc<AppState>, player: Player) -> Option<Game> {
    let mut queue = state.queue.lock().unwrap();

    for val in queue.iter() {
        if player.id == val.id {
            return None;
        }
    }

    queue.push_back(player);

    if queue.len() >= 2 {
        let p1 = queue.pop_front().unwrap();
        let p2 = queue.pop_front().unwrap();

        let game = Game {
            id: Uuid::new_v4(),
            white: p1.id,
            black: p2.id,
            game_status: GameStatus::OnGoing,
            result: None,
            moves: None,
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1".to_string(),
        };

        let mut games = state.games.lock().unwrap();
        games.insert(game.id, game.clone());

        Some(game)
    } else {
        None
    }
}

async fn handle_socket(socket: WebSocket, state: Arc<AppState>) {
    let (mut ws_sender, mut ws_receiver) = socket.split();

    let (tx, mut rx) = mpsc::unbounded_channel::<String>();

    tokio::spawn(async move {
        while let Some(msg) = rx.recv().await {
            ws_sender.send(Message::Text(msg.into())).await.unwrap();
        }
    });

    let mut player: Option<Player> = None;

    while let Some(Ok(msg)) = ws_receiver.next().await {
        if let Message::Text(text) = msg {
            let parsed = serde_json::from_str(&text).unwrap();

            match parsed {
                ClientGameMessage::Init { player_id } => {
                    let p = Player {
                        id: player_id.clone(),
                    };
                    player = Some(p.clone());

                    state
                        .connections
                        .lock()
                        .unwrap()
                        .insert(player_id, tx.clone());

                    let response = serde_json::to_string(&ServerGameMessage::Connected).unwrap();
                    tx.send(response).unwrap();

                    let mut existing_game = None;
                    {
                        let game_state = state.games.lock().unwrap();
                        for game in game_state.values() {
                            if p.id == game.black || p.id == game.white {
                                existing_game = Some(game.clone());
                                break;
                            }
                        }
                    }
                    
                    if let Some(game) = existing_game {
                        let msg = serde_json::to_string(&game).unwrap();
                        tx.send(msg).unwrap();
                    } else if let Some(game) = join_queue(state.clone(), p) {
                        {
                            let connections = state.connections.lock().unwrap();
                            let msg = serde_json::to_string(&ServerGameMessage::Matched {
                                game_id: game.id.to_string(),
                            })
                            .unwrap();

                            if let Some(tx1) = connections.get(&game.white) {
                                tx1.send(msg.clone()).unwrap();
                            }
                            if let Some(tx2) = connections.get(&game.black) {
                                tx2.send(msg.clone()).unwrap();
                            }
                        } // connections lock released before await

                        db_insert_game(&state.postgres_db, &game).await;
                    } else {
                        let msg = serde_json::to_string(&ServerGameMessage::Waiting).unwrap();
                        tx.send(msg).unwrap();
                    }
                }

                ClientGameMessage::Move {
                    game_id,
                    player_id,
                    from,
                    to,
                } => {
                    let new_move = Move {
                        from: from.clone(),
                        to: to.clone(),
                    };

                    let db_snapshot = {
                        let connections = state.connections.lock().unwrap();
                        let mut games = state.games.lock().unwrap();

                        if let Some(game) = games.get_mut(&game_id) {
                            let fen_wrapper: Fen = match game.fen.parse() {
                                Ok(f) => f,
                                Err(_) => {
                                    eprintln!("Invalid FEN syntax");
                                    continue;
                                }
                            };

                            let mut pos: Chess =
                                match fen_wrapper.into_position(shakmaty::CastlingMode::Standard) {
                                    Ok(p) => p,
                                    Err(_) => {
                                        eprintln!("Illegal FEN position");
                                        continue;
                                    }
                                };

                            let is_white_turn = pos.turn().is_white();
                            if (is_white_turn && game.white != player_id)
                                || (!is_white_turn && game.black != player_id)
                            {
                                continue;
                            }

                            let uci_move = format!("{}{}", from, to);
                            let maybe_move = uci_move
                                .parse::<shakmaty::uci::UciMove>()
                                .ok()
                                .and_then(|uci| uci.to_move(&pos).ok());

                            match maybe_move {
                                Some(m) if pos.is_legal(m) => {
                                    pos.play_unchecked(m);
                                    game.fen =
                                        Fen::from_position(&pos, shakmaty::EnPassantMode::Legal)
                                            .to_string();

                                    if let Some(moves_json) = &mut game.moves {
                                        moves_json.push(new_move.clone());
                                    } else {
                                        game.moves =
                                            Some(sqlx::types::Json(vec![new_move.clone()]));
                                    }

                                    let opp_id = if game.white == player_id {
                                        game.black.clone()
                                    } else {
                                        game.white.clone()
                                    };

                                    if let Some(opp_tx) = connections.get(&opp_id) {
                                        let msg = serde_json::to_string(&ServerGameMessage::Move {
                                            from: from.clone(),
                                            to: to.clone(),
                                            fen: game.fen.clone(),
                                        })
                                        .unwrap();
                                        opp_tx.send(msg).unwrap();
                                    }

                                    Some((game_id, game.fen.clone(), game.moves.clone()))
                                }
                                _ => {
                                    eprintln!("Illegal move attempted: {} to {}", from, to);
                                    None
                                }
                            }
                        } else {
                            None
                        }
                    };

                    if let Some((id, fen, moves)) = db_snapshot {
                        db_update_game_move(&state.postgres_db, id, &fen, &moves).await;
                    }
                }

                ClientGameMessage::END { game_id } => {
                    let end_snapshot = {
                        let connections = state.connections.lock().unwrap();
                        let mut games = state.games.lock().unwrap();

                        if let Some(game) = games.get_mut(&game_id) {
                            let resigning_id = player
                                .as_ref()
                                .map(|p| p.id.clone())
                                .unwrap_or_default();

                            let winner_id = if game.white == resigning_id {
                                game.black.clone()
                            } else {
                                game.white.clone()
                            };

                            game.game_status = GameStatus::Ended;
                            game.result = Some(winner_id.clone());

                            let ended_msg =
                                serde_json::to_string(&ServerGameMessage::Ended).unwrap();

                            if let Some(tx1) = connections.get(&game.white) {
                                tx1.send(ended_msg.clone()).unwrap();
                            }
                            if let Some(tx2) = connections.get(&game.black) {
                                tx2.send(ended_msg.clone()).unwrap();
                            }

                            Some((game_id, winner_id))
                        } else {
                            None
                        }
                    };

                    if let Some((id, winner_id)) = end_snapshot {
                        state.games.lock().unwrap().remove(&id);
                        db_end_game(&state.postgres_db, id, &winner_id).await;
                    }
                }
            }
        }
    }
}

pub async fn ws_handler(
    ws: WebSocketUpgrade,
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, state))
}
