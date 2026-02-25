import { UCI_COMMANDS } from "@/lib/constants";

type MessageListener = (message: string) => void;

export interface EvalInfo {
    depth: number;
    score: { type: "cp" | "mate"; value: number } | null;
    pv: string;
    bestMove: string | null;
}

const STOCKFISH_SCRIPT_PATH = "/stockfish/stockfish-18-lite-single.js";

class StockfishService {
    private worker: Worker | null = null;
    private listeners: MessageListener[] = [];
    private evalListeners: ((info: EvalInfo) => void)[] = [];
    private isReady = false;
    private commandQueue: string[] = [];
    private latestEval: EvalInfo = { depth: 0, score: null, pv: "", bestMove: null };

    /**
     * Initialize the Stockfish engine inside a Web Worker.
     * The worker loads the WASM binary from `/public/stockfish/`.
     */
    init(): Promise<void> {
        console.info("[StockfishService] Initializing...");
        return new Promise((resolve, reject) => {
            if (this.worker) {
                resolve();
                return;
            }

            try {
                // The stockfish script expects to be loaded as a Worker via a hash URL
                // pointing to the .wasm file location
                const wasmPath = new URL(STOCKFISH_SCRIPT_PATH, window.location.origin).href;
                this.worker = new Worker(wasmPath + "#" + wasmPath.replace(/\.js$/, ".wasm"));

                this.worker.onmessage = (event: MessageEvent) => {
                    const message: string = typeof event.data === "string" ? event.data : String(event.data);

                    // Notify all registered listeners
                    this.listeners.forEach((listener) => listener(message));

                    // Parse evaluation-specific messages
                    this.parseEvalMessage(message);

                    // Detect when engine is ready
                    if (message === UCI_COMMANDS.UCI_OK) {
                        this.isReady = true;
                        this.flushQueue();
                        resolve();
                    }
                };

                this.worker.onerror = (error) => {
                    console.error("[StockfishService] Worker error:", error);
                    reject(error);
                };

                // Start UCI handshake
                this.worker.postMessage(UCI_COMMANDS.UCI);
            } catch (error) {
                console.error("[StockfishService] Failed to create worker:", error);
                reject(error);
            }
        });
    }

    /**
     * Send a UCI command to the engine.
     * Commands are queued until the engine is ready.
     */
    postMessage(command: string): void {
        if (!this.worker) {
            console.warn("[StockfishService] Engine not initialized. Call init() first.");
            return;
        }

        if (this.isReady) {
            this.worker.postMessage(command);
        } else {
            this.commandQueue.push(command);
        }
    }

    /**
     * Register a listener for engine messages.
     * Returns an unsubscribe function.
     */
    onMessage(listener: MessageListener): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }

    /**
     * Register a listener only for evaluation messages (info lines with score + bestmove).
     * The callback receives a parsed EvalInfo object.
     * Returns an unsubscribe function.
     */
    onEvaluation(listener: (info: EvalInfo) => void): () => void {
        this.evalListeners.push(listener);
        return () => {
            this.evalListeners = this.evalListeners.filter((l) => l !== listener);
        };
    }

    /**
     * Parse engine output and fire eval listeners for info/bestmove lines.
     */
    private parseEvalMessage(message: string): void {
        if (message.startsWith("info") && message.includes("score")) {
            const depthMatch = message.match(/\bdepth (\d+)/);
            const cpMatch = message.match(/\bscore cp (-?\d+)/);
            const mateMatch = message.match(/\bscore mate (-?\d+)/);
            const pvMatch = message.match(/\bpv (.+)$/);

            this.latestEval = {
                depth: depthMatch ? parseInt(depthMatch[1]) : 0,
                score: cpMatch
                    ? { type: "cp", value: parseInt(cpMatch[1]) }
                    : mateMatch
                        ? { type: "mate", value: parseInt(mateMatch[1]) }
                        : null,
                pv: pvMatch ? pvMatch[1] : "",
                bestMove: null,
            };

            this.evalListeners.forEach((l) => l({ ...this.latestEval }));
        } else if (message.startsWith(UCI_COMMANDS.BESTMOVE)) {
            const bestMove = message.split(" ")[1] || null;

            this.latestEval = { ...this.latestEval, bestMove };
            this.evalListeners.forEach((l) => l({ ...this.latestEval }));
        }
    }

    /**
     * Send queued commands once engine is ready.
     */
    private flushQueue(): void {
        while (this.commandQueue.length > 0) {
            const command = this.commandQueue.shift()!;
            this.worker?.postMessage(command);
        }
    }

    /**
     * Evaluate a position given a FEN string.
     * Sends `position fen ...` followed by `go depth <depth>`.
     */
    evaluatePosition(fen: string, depth: number = 15): void {
        this.postMessage(`${UCI_COMMANDS.POSITION} ${UCI_COMMANDS.FEN} ${fen}`);
        this.postMessage(`${UCI_COMMANDS.GO} ${UCI_COMMANDS.DEPTH} ${depth}`);
    }

    /**
     * Start a new game — resets the engine hash tables.
     */
    newGame(): void {
        this.postMessage(`${UCI_COMMANDS.UCINEWGAME}`);
        this.postMessage(`${UCI_COMMANDS.IS_READY}`);
    }

    /**
     * Stop the current search.
     */
    stop(): void {
        this.postMessage(`${UCI_COMMANDS.STOP}`);
    }

    /**
     * Set a UCI option on the engine.
     */
    setOption(name: string, value: string | number | boolean): void {
        this.postMessage(`${UCI_COMMANDS.SETOPTION} ${UCI_COMMANDS.NAME} ${name} ${UCI_COMMANDS.VALUE} ${value}`);
    }

    /**
     * Terminate the worker and clean up.
     */
    destroy(): void {
        if (this.worker) {
            this.postMessage(`${UCI_COMMANDS.QUIT}`);
            this.worker.terminate();
            this.worker = null;
            this.isReady = false;
            this.listeners = [];
            this.evalListeners = [];
            this.commandQueue = [];
            this.latestEval = { depth: 0, score: null, pv: "", bestMove: null };
        }
    }
}

// Export a singleton instance for app-wide usage
const stockfishService = new StockfishService();
export default stockfishService;
