import { Button } from '@/app/components/ui/button';
import './index.css';

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-24 text-zinc-50">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
                Chess <span className="text-emerald-400">AI</span>
            </h1>
            <p className="mt-6 text-lg tracking-tight text-zinc-400 sm:text-2xl">
                Your next-generation chess playing experience.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold shadow-sm transition-colors duration-200">
                    Play Now
                </Button>
                <Button variant="ghost" className="text-zinc-200 hover:text-white font-semibold transition-colors duration-200">
                    Learn more <span aria-hidden="true" className="ml-1">→</span>
                </Button>
            </div>
        </main>
    );
}
