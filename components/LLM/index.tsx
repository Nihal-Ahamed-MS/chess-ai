'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, Bot, User, MessageSquare } from 'lucide-react';
import { ChatMessage } from '@/service/ui/llm.service';
import { MESSAGE_TYPE } from '@/lib/constants';
import Image from 'next/image';

const LLM = (props: any) => {
    const { messages, setMessages, messagesEndRef, scrollToBottom, mutation } = props;
    const [input, setInput] = useState('');

    const handleSend = () => {
        const trimmed = input.trim();
        if (!trimmed || mutation.isPending) return;

        const userMessage: ChatMessage = { role: MESSAGE_TYPE.USER, content: trimmed };
        const updatedMessages = [...messages, userMessage];

        setMessages(updatedMessages);
        setInput('');
        scrollToBottom();

        mutation.mutate(updatedMessages);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="mx-auto flex h-full w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center gap-3 border-b border-zinc-800 bg-zinc-900/80 px-6 py-4">
                <div className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg border border-indigo-500/20 bg-indigo-500/10 transition-colors group-hover:bg-indigo-500/20">
                    <Image src="/logo.png" alt="Neural Logo" fill className="object-contain" />
                </div>
                <div>
                    <h2 className="text-sm font-semibold text-zinc-50">Chess Coach</h2>
                    <p className="text-xs text-zinc-500">Powered by Gemini</p>
                </div>
            </div>

            <div className="scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent flex-1 space-y-4 overflow-y-auto px-4 py-6">
                {messages && messages.length === 0 && (
                    <div className="flex h-full flex-col items-center justify-center gap-4 py-12 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-700/50 bg-zinc-800/50">
                            <MessageSquare className="h-8 w-8 text-zinc-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-400">No messages yet</p>
                            <p className="mt-1 max-w-xs text-xs text-zinc-600">
                                Ask about chess openings, tactics, endgame strategies, or get help
                                analyzing your games.
                            </p>
                        </div>
                    </div>
                )}

                {messages &&
                    messages
                        .filter((x) => x.role !== MESSAGE_TYPE.SYSTEM)
                        .map((msg, i) => (
                            <div
                                key={i}
                                className={`flex items-start gap-3 ${msg.role === MESSAGE_TYPE.USER ? 'flex-row-reverse' : ''}`}
                            >
                                <div
                                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                                        msg.role === MESSAGE_TYPE.USER
                                            ? 'border border-emerald-500/20 bg-emerald-500/10'
                                            : 'border border-zinc-700 bg-zinc-800'
                                    }`}
                                >
                                    {msg.role === MESSAGE_TYPE.USER ? (
                                        <User className="h-4 w-4 text-emerald-400" />
                                    ) : (
                                        <Bot className="h-4 w-4 text-zinc-400" />
                                    )}
                                </div>
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                                        msg.role === MESSAGE_TYPE.USER
                                            ? 'rounded-br-md border border-emerald-500/20 bg-emerald-500/15 text-emerald-50'
                                            : 'rounded-bl-md border border-zinc-700/50 bg-zinc-800/80 text-zinc-200'
                                    }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                {mutation.isPending && (
                    <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800">
                            <Bot className="h-4 w-4 text-zinc-400" />
                        </div>
                        <div className="rounded-2xl rounded-bl-md border border-zinc-700/50 bg-zinc-800/80 px-4 py-3">
                            <div className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:0ms]" />
                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:150ms]" />
                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:300ms]" />
                            </div>
                        </div>
                    </div>
                )}

                {mutation.isError && (
                    <div className="mx-auto max-w-sm rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center">
                        <p className="text-xs text-red-400">
                            {mutation.error?.message || 'Something went wrong. Please try again.'}
                        </p>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-zinc-800 bg-zinc-900/80 px-4 py-4">
                <div className="flex items-center gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask your chess coach..."
                        disabled={mutation.isPending}
                        className="flex-1 rounded-xl border-zinc-700 bg-zinc-800 px-4 py-4 text-zinc-50 transition-all placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!input.trim() || mutation.isPending}
                        size="icon"
                        className="h-11 w-11 rounded-xl bg-gray-500 text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 disabled:opacity-40 disabled:shadow-none"
                    >
                        {mutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default LLM;
