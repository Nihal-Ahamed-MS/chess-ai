import { Button } from '@/components/ui/button';
import { Sparkles, ChevronRight, Activity } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/navbar';

export default function Home() {
    return (
        <div className="relative min-h-screen bg-[#0a0a0a] text-zinc-50 font-sans selection:bg-indigo-500/30 selection:text-white pb-24">
            <Navbar />

            {/* <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                <div className="absolute top-[-20%] right-[-10%] h-[50rem] w-[50rem] rounded-full bg-indigo-500/10 blur-[120px]" />
                <div className="absolute top-[40%] left-[-10%] h-[40rem] w-[40rem] rounded-full bg-cyan-500/10 blur-[100px]" />
                <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/djpdb839k/image/upload/v1707018318/grid-noise-dark-subtle.png')] opacity-[0.03] mix-blend-overlay" />
            </div> */}

            <main className="relative z-10 flex flex-col items-center px-6 pt-32 sm:pt-48 pb-20">
                <section className="flex flex-col items-center text-center max-w-5xl mx-auto">
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
                        <Link href="/arena" className="w-full sm:w-auto">
                            <Button size="lg" variant="outline" className="h-12 w-full sm:w-auto rounded-full border-white/10 bg-white/5 px-8 text-sm font-medium text-zinc-300 transition-all hover:bg-white/10 hover:text-white backdrop-blur-sm">
                                Explore AI Features
                            </Button>
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
}
