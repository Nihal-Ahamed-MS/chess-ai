"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { encrypt } from "@/lib/helper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { USER_SIGN_UP } from "@/service/ui/auth.service";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ userName: "", email: "", password: "" });
    const [localError, setLocalError] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: USER_SIGN_UP,
        onSuccess: () => {
            router.push("/auth/login?registered=true");
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        try {
            const encryptedPassword = encrypt(formData.password);
            mutation.mutate({
                userName: formData.userName,
                email: formData.email,
                password: encryptedPassword,
            });
        } catch (err: any) {
            setLocalError("Encryption failed: " + err.message);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-zinc-900 border border-zinc-800 p-8 shadow-2xl">

                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-zinc-50 tracking-tight">
                        Join Chess <span className="text-emerald-400">AI</span>
                    </h2>
                    <p className="mt-2 text-sm text-zinc-400">
                        Create your account to start playing.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSignup}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label className="sr-only" htmlFor="userName">Username</label>
                            <Input
                                id="userName"
                                name="userName"
                                type="text"
                                required
                                className="bg-zinc-800 py-3 px-4 text-zinc-50 ring-1 ring-inset ring-zinc-700 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 border-0 transition-all"
                                placeholder="Username"
                                value={formData.userName}
                                onChange={handleChange}
                            />
                        </div>
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
                                autoComplete="new-password"
                                required
                                className="bg-zinc-800 py-3 px-4 text-zinc-50 ring-1 ring-inset ring-zinc-700 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 border-0 transition-all"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {(mutation.error || localError) && (
                        <div className="rounded-md bg-red-500/10 p-4 border border-red-500/20">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-500">{localError || mutation.error?.message}</h3>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <Button
                            type="submit"
                            disabled={mutation.isPending}
                            className="group relative flex w-full justify-center rounded-md bg-emerald-500 px-3 py-6 text-sm font-semibold text-white hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 transition-all shadow-lg"
                        >
                            {mutation.isPending ? (
                                <Spinner data-icon="inline-start" />
                            ) : (
                                "Sign up"
                            )}
                        </Button>
                    </div>

                    <div className="text-center text-sm text-zinc-400">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                            Log in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
