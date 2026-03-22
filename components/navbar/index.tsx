"use client";
import Link from "next/link";
import { BadgeCheckIcon, BellIcon, CreditCardIcon, LogOutIcon, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSubTrigger, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { getCookie } from "@/lib/helper";
import { useEffect, useState } from "react";
import { useAuth } from "@/store/context/AuthContenxt";

const Navbar = () => {
    const { isSessionValid } = useAuth();

    useEffect(() => {
        const user = getCookie("token");
        if (user) {

        }
    }, [])

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
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <Avatar>
                                        <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" className="grayscale" />
                                        <AvatarFallback>LR</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {isSessionValid ? (
                                    <>
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem className="cursor-pointer">
                                                <BadgeCheckIcon />
                                                <p className="text-sm font-medium">Account</p>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="cursor-pointer">
                                                <CreditCardIcon />
                                                <p className="text-sm font-medium">Billing</p>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="cursor-pointer">
                                                <BellIcon />
                                                <p className="text-sm font-medium">Notifications</p>
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="cursor-pointer">
                                            <LogOutIcon />
                                            <p className="text-sm font-medium">Sign Out</p>
                                        </DropdownMenuItem>
                                    </>

                                ) : (
                                    <>
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem className="cursor-pointer">
                                                <BadgeCheckIcon />
                                                <p className="text-sm font-medium">About Us</p>
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="cursor-pointer" asChild>
                                            <Link href="/auth/login">
                                                <LogOutIcon />
                                                <p className="text-sm font-medium">Log In</p>
                                            </Link>
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </ul>
                </nav>


            </div>
        </header >
    );
};

export default Navbar;