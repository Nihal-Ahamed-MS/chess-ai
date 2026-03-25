import { Button } from '@/components/ui/button';
import { Bot, Swords, BrainCircuit, Sparkles, ChevronRight, Activity } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/navbar';

export default function Home() {
    return (
        <div className="relative min-h-screen bg-[#0a0a0a] text-zinc-50 font-sans selection:bg-indigo-500/30 selection:text-white pb-24">
            <Navbar />

            {/* Futuristic Tech Ambient Glows */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                <div className="absolute top-[-20%] right-[-10%] h-[50rem] w-[50rem] rounded-full bg-indigo-500/10 blur-[120px]" />
                <div className="absolute top-[40%] left-[-10%] h-[40rem] w-[40rem] rounded-full bg-cyan-500/10 blur-[100px]" />
                <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/djpdb839k/image/upload/v1707018318/grid-noise-dark-subtle.png')] opacity-[0.03] mix-blend-overlay" />
            </div>

            <main className="relative z-10 flex flex-col items-center px-6 pt-32 sm:pt-48 pb-20">
                {/* Tech Hero Section */}
                <section className="flex flex-col items-center text-center max-w-5xl mx-auto">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 py-1.5 px-3 backdrop-blur-md mb-8 shadow-sm">
                        <Activity className="h-4 w-4 text-indigo-400" />
                        <span className="text-xs font-medium text-zinc-300">Chess AI Engine v2.0 Live</span>
                        <div className="h-4 w-px bg-white/10 mx-1" />
                        <Link href="/log" className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300">
                            Read Changelog <ChevronRight className="h-3 w-3" />
                        </Link>
                    </div>

                    <h1 className="text-5xl sm:text-7xl lg:text-8xl font-medium tracking-tighter leading-[1.05] text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 mb-6 drop-shadow-sm">
                        Intelligence applied <br className="hidden sm:block" />
                        to the ultimate game.
                    </h1>

                    <p className="max-w-2xl text-lg sm:text-xl font-normal text-zinc-400 leading-relaxed mb-10">
                        Compete on a global scale. Train against advanced heuristic engines. Demystify complex positions with integrated Large Language Models.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        <Link href="/arena" className="w-full sm:w-auto">
                            <Button size="lg" className="h-12 w-full sm:w-auto rounded-full bg-white px-8 text-sm font-semibold text-zinc-950 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transition-all hover:bg-zinc-200 hover:scale-105 active:scale-95">
                                Start Playing
                            </Button>
                        </Link>
                        <Link href="/vs-computer" className="w-full sm:w-auto">
                            <Button size="lg" variant="outline" className="h-12 w-full sm:w-auto rounded-full border-white/10 bg-white/5 px-8 text-sm font-medium text-zinc-300 transition-all hover:bg-white/10 hover:text-white backdrop-blur-sm">
                                Explore AI Features
                            </Button>
                        </Link>
                    </div>
                </section>

                {/* Dashboard / UI Mockup Hint */}
                <section className="mt-32 w-full max-w-6xl relative animate-in fade-in slide-in-from-bottom-10 duration-1000">
                    <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-b from-indigo-500/20 to-transparent blur-xl opacity-50" />
                    <div className="relative aspect-[16/9] w-full rounded-[2rem] border border-white/10 bg-[#050505]/80 backdrop-blur-2xl shadow-2xl overflow-hidden flex items-center justify-center p-8">
                        {/* Abstract Tech Graphic inside the mockup */}
                        <div className="w-full h-full border border-white/5 rounded-2xl bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] flex items-center justify-center relative shadow-inner">
                            <div className="absolute h-full w-full bg-[radial-gradient(circle_500px_at_50%_50%,#00000000,var(--tw-gradient-stops))] from-transparent via-[#050505]/40 to-[#050505]" />
                            <div className="h-24 w-24 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md flex items-center justify-center relative shadow-[0_0_80px_rgba(99,102,241,0.2)]">
                                <Sparkles className="h-8 w-8 text-indigo-400 animate-pulse" />
                                <div className="absolute w-[300px] h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent rotate-45" />
                                <div className="absolute w-[300px] h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent -rotate-45" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Feature Infrastructure Grid */}
                <section className="w-full max-w-6xl mt-32 grid gap-6 sm:grid-cols-3">
                    {/* Feature 1 */}
                    <div className="group relative flex flex-col justify-between rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 transition-all hover:border-white/10 hover:bg-white/[0.04] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-300 shadow-inner">
                                <Swords className="h-5 w-5" />
                            </div>
                            <h3 className="mb-2 text-xl font-medium tracking-tight text-white">Global Multiplayer</h3>
                            <p className="text-sm font-normal text-zinc-400 leading-relaxed">
                                Low latency matchmaking. ELO rankings updated instantly via WebSockets for real-time play synchronization.
                            </p>
                        </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="group relative flex flex-col justify-between rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 transition-all hover:border-white/10 hover:bg-white/[0.04] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-300 shadow-inner">
                                <BrainCircuit className="h-5 w-5" />
                            </div>
                            <h3 className="mb-2 text-xl font-medium tracking-tight text-white">Generative Game Review</h3>
                            <p className="text-sm font-normal text-zinc-400 leading-relaxed">
                                Don't just rely on centipawn loss numbers. Advanced LLMs evaluate your blunders and deliver highly contextual narrative post-mortems.
                            </p>
                        </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="group relative flex flex-col justify-between rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 transition-all hover:border-white/10 hover:bg-white/[0.04] overflow-hidden sm:col-span-3 lg:col-span-1">
                        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-300 shadow-inner">
                                <Bot className="h-5 w-5" />
                            </div>
                            <h3 className="mb-2 text-xl font-medium tracking-tight text-white">Engine Partnership</h3>
                            <p className="text-sm font-normal text-zinc-400 leading-relaxed">
                                Integrated Stockfish 18 execution within the browser using WebAssembly, heavily pipelined for near-native computational depth.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
