'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { BarChart2 } from 'lucide-react';

import { useAuth } from '@/store/context/AuthContext';
import { getGames } from '@/service/ui/llm.service';
import ChessBoard from '@/components/chessboard';
import { Spinner } from '@/components/ui/spinner';

const History = () => {
    const { user } = useAuth();
    const router = useRouter();

    const { data: games, isLoading } = useQuery({
        queryKey: ['games', user?._id],
        queryFn: () => getGames(user!._id),
        enabled: !!user?._id,
    });

    const getResult = (game: { white: string; black: string; result: string }) => {
        const iWon = (game.result === user?._id)
        return iWon
            ? { label: 'Win', color: 'text-emerald-400' }
            : { label: 'Loss', color: 'text-red-400' };
    };

    return (
        <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-[#09090b]">
            <div className="flex-1 h-full px-8 py-6">
                {isLoading && (
                    <div className="flex h-full items-center justify-center">
                        <Spinner />
                    </div>
                )}

                {!isLoading && (!games || games.length === 0) && (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-sm text-zinc-600">No games played yet.</p>
                    </div>
                )}

                {games && games.length > 0 && (
                    <div className="mx-auto max-w-3xl space-y-3 h-full">
                        <div className="mb-6">
                            <h1 className="text-lg font-semibold tracking-wide text-zinc-200">
                                Game History
                            </h1>
                            <p className="mt-0.5 text-xs text-zinc-600">All your past games</p>
                        </div>
                        <div style={{ overflow: "scroll", height: "calc(100% - 46px)", display: "flex", flexDirection: "column", gap: "12px" }}>
                            {games.map((game) => {
                                const result = getResult(game);
                                return (
                                    <div
                                        key={game.id}
                                        className="flex items-center gap-5 rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4 transition-colors hover:bg-zinc-900/60"
                                    >
                                        <div
                                            className="shrink-0 overflow-hidden rounded-md border border-zinc-800/50"
                                            style={{ width: 80, height: 80, pointerEvents: 'none' }}
                                        >
                                            <ChessBoard options={{ position: game.fen }} />
                                        </div>

                                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                                            <p className="truncate text-xs text-zinc-500">
                                                vs Anonymous
                                            </p>
                                            <p className={`text-md font-semibold ${result.color}`}>
                                                {result.label}
                                            </p>
                                            <p className="text-[11px] text-zinc-600">You</p>
                                        </div>

                                        <button
                                            onClick={() =>
                                                router.push(`/analytics?gameId=${game.id}`)
                                            }
                                            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-zinc-700/40 bg-zinc-800/40 text-zinc-400 transition-colors hover:bg-zinc-700/60 hover:text-zinc-200"
                                            title="Analyze"
                                        >
                                            <BarChart2 size={15} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;
