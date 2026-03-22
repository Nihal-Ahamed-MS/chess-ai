import Link from "next/link";
import { Sparkles } from "lucide-react";

const Navbar = () => {
    return (
        <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-6">
                <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tighter text-white transition-opacity hover:opacity-80">
                    <Sparkles className="h-5 w-5 text-emerald-400" />
                    Chess <span className="text-emerald-400">AI</span>
                </Link>
                <nav>
                    <ul className="flex items-center gap-6 text-sm font-medium text-zinc-400">
                        <li>
                            <Link href="/arena" className="transition-colors hover:text-white">Arena</Link>
                        </li>
                        <li>
                            <Link href="/vs-computer" className="transition-colors hover:text-white">Play Computer</Link>
                        </li>
                        <li>
                            <Link href="/analysis" className="transition-colors hover:text-white">Analysis</Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Navbar;