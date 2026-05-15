"use client"

import { useEffect } from "react"

interface ErrorProps {
    error: Error & { digest?: string }
    reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold text-red-500">Something went wrong</h1>
                <p className="text-muted-foreground text-sm max-w-md">
                    {error.message || "An unexpected error occurred. Please try again."}
                </p>
                {error.digest && (
                    <p className="text-xs text-muted-foreground">
                        Error ID: <span className="font-mono">{error.digest}</span>
                    </p>
                )}
            </div>
            <button
                onClick={reset}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:opacity-90 transition"
            >
                Try Again
            </button>
        </div>
    )
}