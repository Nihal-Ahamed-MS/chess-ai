"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Bot, User, MessageSquare } from "lucide-react";
import { ChatMessage } from "@/service/ui/llm.service";
import { MESSAGE_TYPE } from "@/lib/constants";

const LLM = (props: any) => {
    const { messages, setMessages, messagesEndRef, scrollToBottom, mutation, } = props
    const [input, setInput] = useState("");

    const handleSend = () => {
        const trimmed = input.trim();
        if (!trimmed || mutation.isPending) return;

        const userMessage: ChatMessage = { role: MESSAGE_TYPE.USER, content: trimmed };
        const updatedMessages = [...messages, userMessage];

        setMessages(updatedMessages);
        setInput("");
        scrollToBottom();

        mutation.mutate(updatedMessages);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full w-full max-w-2xl mx-auto bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-800 bg-zinc-900/80">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <Bot className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                    <h2 className="text-sm font-semibold text-zinc-50">Chess Coach</h2>
                    <p className="text-xs text-zinc-500">Powered by Gemini</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-zinc-500">Online</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                {messages && messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-12">
                        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-800/50 border border-zinc-700/50">
                            <MessageSquare className="w-8 h-8 text-zinc-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-400">No messages yet</p>
                            <p className="text-xs text-zinc-600 mt-1 max-w-xs">
                                Ask about chess openings, tactics, endgame strategies, or get help analyzing your games.
                            </p>
                        </div>
                    </div>
                )}

                {messages && messages.filter((x) => x.role !== MESSAGE_TYPE.SYSTEM).map((msg, i) => (
                    <div
                        key={i}
                        className={`flex items-start gap-3 ${msg.role === MESSAGE_TYPE.USER ? "flex-row-reverse" : ""}`}
                    >
                        <div
                            className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg ${msg.role === MESSAGE_TYPE.USER
                                ? "bg-emerald-500/10 border border-emerald-500/20"
                                : "bg-zinc-800 border border-zinc-700"
                                }`}
                        >
                            {msg.role === MESSAGE_TYPE.USER ? (
                                <User className="w-4 h-4 text-emerald-400" />
                            ) : (
                                <Bot className="w-4 h-4 text-zinc-400" />
                            )}
                        </div>
                        <div
                            className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === MESSAGE_TYPE.USER
                                ? "bg-emerald-500/15 text-emerald-50 border border-emerald-500/20 rounded-br-md"
                                : "bg-zinc-800/80 text-zinc-200 border border-zinc-700/50 rounded-bl-md"
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}

                {mutation.isPending && (
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700">
                            <Bot className="w-4 h-4 text-zinc-400" />
                        </div>
                        <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-zinc-800/80 border border-zinc-700/50">
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:0ms]" />
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:150ms]" />
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:300ms]" />
                            </div>
                        </div>
                    </div>
                )}

                {mutation.isError && (
                    <div className="mx-auto max-w-sm rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-center">
                        <p className="text-xs text-red-400">
                            {mutation.error?.message || "Something went wrong. Please try again."}
                        </p>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className="px-4 py-4 border-t border-zinc-800 bg-zinc-900/80">
                <div className="flex items-center gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask your chess coach..."
                        disabled={mutation.isPending}
                        className="flex-1 bg-zinc-800 text-zinc-50 border-zinc-700 placeholder:text-zinc-500 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl py-3 px-4 transition-all"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!input.trim() || mutation.isPending}
                        size="icon"
                        className="h-11 w-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-40 disabled:shadow-none"
                    >
                        {mutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default LLM;