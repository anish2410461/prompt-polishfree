"use client";

import { useState } from "react";

const MODES = [
    { id: "Reasoning", icon: "🧠", label: "Reasoning & Logic" },
    { id: "Code Generation", icon: "💻", label: "Code Generation" },
    { id: "Creative Writing", icon: "✍️", label: "Creative Writing" },
    { id: "Business Strategy", icon: "📊", label: "Business Strategy" },
    { id: "Academic Output", icon: "🎓", label: "Academic Output" }
];

export default function PromptInput({ onPolish, isLoading, mode, onModeChange }) {
    const [input, setInput] = useState("");

    const handleSubmit = () => {
        if (!input.trim()) {
            return;
        }
        onPolish(input);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Optimization Modes */}
            <div className="flex flex-wrap gap-2">
                {MODES.map((m) => {
                    return (
                        <button
                            key={m.id}
                            onClick={() => onModeChange(m.id)}
                            disabled={isLoading}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border flex items-center gap-2 relative ${mode === m.id
                                ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/20"
                                : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
                                }`}
                        >
                            <span>{m.icon}</span>
                            {m.label}
                        </button>
                    );
                })}
            </div>

            <div className="relative group">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Paste your rough prompt here..."
                    className="w-full h-48 p-8 text-lg text-white border border-white/10 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none placeholder:text-white/20 bg-slate-900/50 backdrop-blur-xl transition-all duration-500"
                    disabled={isLoading}
                />
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>

            <button
                onClick={handleSubmit}
                disabled={isLoading || !input.trim()}
                className="px-8 py-5 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-500/20 active:scale-95"
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-3">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Analyzing Prompt...
                    </span>
                ) : (
                    "✨ Polish Prompt"
                )}
            </button>
        </div>
    );
}
