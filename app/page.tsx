"use client";
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, Swords, BrainCircuit, Sparkles, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import './index.css';

export default function Home() {
    return (
        <div className="relative min-h-screen bg-zinc-950 text-zinc-50 selection:bg-emerald-500/30">
            {/* Background Gradients & Effects */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] h-[40rem] w-[40rem] rounded-full bg-emerald-500/10 blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] h-[40rem] w-[40rem] rounded-full bg-cyan-500/10 blur-[120px]" />
            </div>

            <Navbar />

            <main className="relative z-10 flex flex-col items-center pb-20 pt-32 sm:pt-40">
                {/* Hero Section */}
                <section className="container mx-auto px-6 text-center">
                    <div className="mx-auto flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 backdrop-blur-sm transition-all hover:bg-emerald-500/20">
                        <Sparkles className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm font-medium text-emerald-300">The Next-Generation Chess Experience</span>
                    </div>

                    <h1 className="mx-auto mt-8 max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl">
                        Master the game with <br className="hidden sm:block" />
                        <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent animate-gradient-x">AI Intelligence</span>
                    </h1>

                    <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400 sm:text-xl leading-relaxed">
                        Play against opponents worldwide and analyze every move with advanced LLMs. Or challenge Stockfish with a generative AI coach by your side.
                    </p>

                    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link href="/arena">
                            <Button size="lg" className="h-14 bg-emerald-500 px-8 text-base font-semibold text-white shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] transition-all hover:bg-emerald-400 hover:shadow-[0_0_60px_-15px_rgba(16,185,129,0.7)] hover:-translate-y-0.5 group">
                                Play Multiplayer
                                <Swords className="ml-2 h-5 w-5 transition-transform group-hover:scale-110" />
                            </Button>
                        </Link>
                        <Link href="/vs-computer">
                            <Button size="lg" variant="outline" className="h-14 border-zinc-700 bg-zinc-900/50 px-8 text-base font-semibold text-zinc-200 backdrop-blur transition-all hover:bg-zinc-800 hover:text-white hover:-translate-y-0.5 group">
                                Play Computer
                                <Bot className="ml-2 h-5 w-5 transition-transform group-hover:scale-110" />
                            </Button>
                        </Link>
                    </div>

                    <div className="mt-10 flex items-center justify-center gap-6 text-sm font-medium text-zinc-500 sm:mt-12">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> PvP Matches
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> LLM Analysis
                        </div>
                        <div className="flex items-center gap-2 hidden sm:flex">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> AI Coach
                        </div>
                    </div>
                </section>

                {/* Features Highlights Section */}
                <section className="container mx-auto mt-32 px-6">
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Feature 1 */}
                        <div className="group relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 p-8 pt-12 backdrop-blur-sm transition-all hover:bg-zinc-900/80 hover:border-white/10 hover:shadow-2xl hover:shadow-emerald-500/5">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-emerald-500/10 blur-xl transition-all group-hover:bg-emerald-500/20" />
                            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                                <Swords className="h-6 w-6" />
                            </div>
                            <h3 className="mb-3 text-2xl font-bold text-white">Player vs Player</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                Challenge players globally in real-time matches. Every game is tracked and recorded for deep post-match analysis.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="group relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 p-8 pt-12 backdrop-blur-sm transition-all hover:bg-zinc-900/80 hover:border-white/10 hover:shadow-2xl hover:shadow-cyan-500/5">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-cyan-500/10 blur-xl transition-all group-hover:bg-cyan-500/20" />
                            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20">
                                <BrainCircuit className="h-6 w-6" />
                            </div>
                            <h3 className="mb-3 text-2xl font-bold text-white">Post-Game LLM Review</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                Don't just see the best move—understand why. Our integrated LLM explains critical moments and blunders in plain language.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="group relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 p-8 pt-12 backdrop-blur-sm transition-all hover:bg-zinc-900/80 hover:border-white/10 hover:shadow-2xl hover:shadow-purple-500/5 sm:col-span-2 lg:col-span-1">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-purple-500/10 blur-xl transition-all group-hover:bg-purple-500/20" />
                            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20">
                                <Bot className="h-6 w-6" />
                            </div>
                            <h3 className="mb-3 text-2xl font-bold text-white">AI-Assisted Stockfish</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                Spar against Stockfish while a personalized AI coach offers hints, warns of threats, and suggests plans in real-time.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Secondary CTA / Decorative Section */}
                <section className="container mx-auto mt-32 px-6">
                    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-900/50 p-8 sm:p-12 lg:p-20 shadow-2xl backdrop-blur-md">
                        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
                            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-emerald-500 to-cyan-400 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
                        </div>

                        <div className="grid items-center gap-12 lg:grid-cols-2">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
                                    Elevate your game with <span className="text-emerald-400">Contextual Advice</span>
                                </h2>
                                <p className="mt-6 text-lg/8 text-zinc-300">
                                    Whether you are a beginner learning the ropes or a grandmaster refining your repertoire, Chess AI provides the perfect combination of human intuition and unparalleled machine precision.
                                </p>
                                <div className="mt-8 flex gap-4 auto-rows-auto">
                                    <Link href="/arena" className="inline-flex items-center text-emerald-400 font-semibold hover:text-emerald-300 transition-colors group">
                                        Start playing now <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </div>
                            </div>

                            {/* Decorative Glassmorphism Grid representing a chess setup/AI concept */}
                            <div className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950/80 p-2 shadow-2xl backdrop-blur-xl lg:mx-0 lg:max-w-none">
                                <div className="grid grid-cols-4 grid-rows-4 gap-1.5 opacity-90">
                                    {Array.from({ length: 16 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={`aspect-square rounded-lg ${((Math.floor(i / 4) + i % 4) % 2 === 0) ? 'bg-zinc-800/80 shadow-inner' : 'bg-zinc-900/80'} flex items-center justify-center transition-all hover:bg-zinc-700`}
                                        >
                                            {i === 5 && <div className="h-6 w-6 rounded-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)] animate-pulse" />}
                                            {i === 10 && <Bot className="h-7 w-7 text-cyan-400 opacity-80" />}
                                            {i === 15 && <Sparkles className="h-5 w-5 text-purple-400 opacity-60" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Subtle Footer */}
            <footer className="mt-20 border-t border-white/5 bg-zinc-950 py-10 text-center">
                <p className="text-sm text-zinc-600">&copy; {new Date().getFullYear()} Chess AI. Built with Next.js and Generative AI.</p>
            </footer>
        </div>
    );
}
