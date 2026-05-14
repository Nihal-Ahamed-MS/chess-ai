"use client";
import Link from "next/link";
import Image from "next/image";
import { BadgeCheckIcon, BellIcon, CreditCardIcon, LogOutIcon, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSubTrigger, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useAuth } from "@/store/context/AuthContext";
import { logout } from "@/lib/helper";


const Navbar = () => {
    const { isSessionValid } = useAuth();

    return (
        <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#0a0a0a]/60 backdrop-blur-xl">
            <div className="container mx-auto flex h-16 items-center justify-between px-6 lg:px-8">
                <Link href="/" className="group flex items-center gap-2 text-lg font-medium tracking-tight text-zinc-100 transition-opacity hover:opacity-90">
                    <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors overflow-hidden">
                        <Image src="/logo.png" alt="Neural Logo" fill className="object-contain" />
                    </div>
                    Chess <span className="text-zinc-400 font-normal">AI</span>
                </Link>
                <nav>
                    <ul className="flex items-center gap-6 text-sm text-zinc-400 transition-colors font-medium">
                        <li>
                            <Link href="/arena" className="transition-colors hover:text-zinc-100">Arena</Link>
                        </li>
                        <li>
                            <Link href="/vs-stockfish" className="transition-colors hover:text-zinc-100">Vs Stockfish</Link>
                        </li>
                        <li>
                            <Link href="/history" className="transition-colors hover:text-zinc-100">History</Link>
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
                                        <DropdownMenuItem onClick={() => {
                                            logout()
                                        }} className="cursor-pointer">
                                            <LogOutIcon />
                                            <p className="text-sm font-medium">Log Out</p>
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