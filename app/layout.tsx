import type { Metadata } from 'next';
import './index.css';

export const metadata: Metadata = {
    title: 'Chess AI',
    description: 'Your next-generation chess playing experience.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="bg-zinc-950 text-zinc-50 antialiased">{children}</body>
        </html>
    );
}
