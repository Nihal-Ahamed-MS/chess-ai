import type { Metadata } from 'next';
import './index.css';

export const metadata: Metadata = {
    title: 'Chess AI',
    description: 'Your next-generation chess playing experience.',
};

import Providers from './providers';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="bg-[#0a0a0a] text-zinc-50 antialiased font-sans selection:bg-cyan-500/30 selection:text-white">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
