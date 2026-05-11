"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { encrypt } from "@/lib/helper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { USER_SIGN_IN } from "@/service/ui/auth.service";
import { useMutation } from "@tanstack/react-query";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [activeTestUser, setActiveTestUser] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (searchParams.get("registered") === "true") {
            setSuccessMessage("Account created successfully! Please log in.");
        }
    }, [searchParams]);


    const mutation = useMutation({
        mutationFn: USER_SIGN_IN,
        onSuccess: () => {
            router.push("/");
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTestLogin = (user: number, email: string) => {
        setError(null);
        setSuccessMessage(null);
        setActiveTestUser(user);
        const encryptedPassword = encrypt("123");
        mutation.mutate({ email, password: encryptedPassword }, { onSettled: () => setActiveTestUser(null) });
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const encryptedPassword = encrypt(formData.password);
            mutation.mutate({
                email: formData.email,
                password: encryptedPassword,
            });
        } catch (err: any) {
            console.error(err)
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-zinc-900 border border-zinc-800 p-8 shadow-2xl">

                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-zinc-50 tracking-tight">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-sm text-zinc-400">
                        Log in to your Chess AI profile.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label className="sr-only" htmlFor="email-address">Email address</label>
                            <Input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="bg-zinc-800 py-3 px-4 text-zinc-50 ring-1 ring-inset ring-zinc-700 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 border-0 transition-all"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="sr-only" htmlFor="password">Password</label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="bg-zinc-800 py-3 px-4 text-zinc-50 ring-1 ring-inset ring-zinc-700 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 border-0 transition-all"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <Link href="/auth/forgot-password" className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
                                Forgot your password?
                            </Link>
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-500/10 p-4 border border-red-500/20">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-500">{error}</h3>
                                </div>
                            </div>
                        </div>
                    )}

                    {successMessage && (
                        <div className="rounded-md bg-emerald-500/10 p-4 border border-emerald-500/20">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-emerald-500">{successMessage}</h3>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-md bg-emerald-500 px-3 py-6 text-sm font-semibold text-white hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 transition-all shadow-lg"
                        >
                            {loading ? (
                                <Spinner data-icon="inline-start" />
                            ) : (
                                "Log in"
                            )}
                        </Button>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            type="button"
                            disabled={mutation.isPending}
                            onClick={() => handleTestLogin(1, "test@gmail.com")}
                            className="flex-1 rounded-md bg-zinc-700 px-3 py-6 text-sm font-semibold text-zinc-200 hover:bg-zinc-600 transition-all"
                        >
                            {activeTestUser === 1 ? <Spinner data-icon="inline-start" /> : "Test User 1"}
                        </Button>
                        <Button
                            type="button"
                            disabled={mutation.isPending}
                            onClick={() => handleTestLogin(2, "test2@gmail.com")}
                            className="flex-1 rounded-md bg-zinc-700 px-3 py-6 text-sm font-semibold text-zinc-200 hover:bg-zinc-600 transition-all"
                        >
                            {activeTestUser === 2 ? <Spinner data-icon="inline-start" /> : "Test User 2"}
                        </Button>
                    </div>

                    <div className="text-center text-sm text-zinc-400">
                        Don't have an account?{" "}
                        <Link href="/auth/register" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                            Sign up
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
