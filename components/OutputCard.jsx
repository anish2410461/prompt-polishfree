"use client";

import { useState } from 'react';
import { marked } from 'marked';

export default function OutputCard({ output, isLoading, onClear, originalPrompt }) {
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('VERSION_A');

    const handleCopy = (text) => {
        if (text) {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const parseSection = (tag) => {
        if (!output) return "";
        const parts = output.split(`[${tag}]`);
        if (parts.length < 2) return "";
        const section = parts[1].split(/\[[A-Z_]+\]/)[0];
        return section.trim();
    };

    const parseScores = () => {
        const analysis = parseSection("ANALYSIS");
        const scores = { Clarity: 0, Specificity: 0, Constraints: 0, Context: 0 };
        if (!analysis) return scores;

        analysis.split('\n').forEach(line => {
            const [key, val] = line.split(':');
            if (key && val && scores.hasOwnProperty(key.trim())) {
                scores[key.trim()] = parseInt(val.trim()) || 0;
            }
        });
        return scores;
    };

    const scores = parseScores();
    const weaknesses = parseSection("WEAKNESSES");
    const improvements = parseSection("IMPROVEMENTS");
    const versionA = parseSection("VERSION_A");
    const versionB = parseSection("VERSION_B");
    const versionC = parseSection("VERSION_C");

    const getActiveVersion = () => {
        if (activeTab === 'VERSION_A') return versionA;
        if (activeTab === 'VERSION_B') return versionB;
        if (activeTab === 'VERSION_C') return versionC;
        return "";
    };

    const renderMarkdown = (text) => {
        if (!text) return { __html: "" };
        return { __html: marked.parse(text) };
    };

    if (!output && !isLoading) return null;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* 1. ANALYSIS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
                {/* Scores */}
                <div className="glass-strong p-8 rounded-3xl border border-white/5 space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-white/40">
                        <span>📊</span> Intelligence Score
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                        {Object.entries(scores).map(([label, score]) => (
                            <div key={label} className="space-y-2">
                                <div className="flex justify-between text-sm"><span className="text-white/40">{label}</span><span>{score}%</span></div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-1000"
                                        style={{ width: `${score}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Weaknesses */}
                <div className="glass-strong p-8 rounded-3xl border border-red-500/10 space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-red-400">
                        <span>🔍</span> Weaknesses
                    </h3>
                    <div className="text-white/60 text-sm leading-relaxed markdown-content">
                        {weaknesses ? (
                            <div dangerouslySetInnerHTML={renderMarkdown(weaknesses)} />
                        ) : (
                            <div className="space-y-3 animate-pulse">
                                <div className="bg-white/5 h-4 w-full rounded"></div>
                                <div className="bg-white/5 h-4 w-3/4 rounded"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. SPLIT VIEW & IMPROVEMENTS */}
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold">Transformation</h3>
                    <button onClick={onClear} className="text-white/20 hover:text-white transition-colors text-sm font-semibold uppercase tracking-widest">Clear</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden">
                    {/* Original */}
                    <div className="p-10 bg-slate-900/40 space-y-4">
                        <div className="text-xs font-bold uppercase tracking-widest text-white/30">Original Prompt</div>
                        <div className="text-lg text-white/40 italic font-light bg-black/20 p-6 rounded-2xl border border-white/5 min-h-[150px]">
                            {originalPrompt ? `"${originalPrompt}"` : "Waiting for input..."}
                        </div>
                    </div>

                    {/* Improvements */}
                    <div className="p-10 bg-blue-600/5 space-y-4 border-l border-white/5">
                        <div className="text-xs font-bold uppercase tracking-widest text-blue-400">🧠 Why This Is Better</div>
                        <div className="text-white/80 text-base leading-relaxed markdown-content space-y-2">
                            {improvements ? (
                                <div dangerouslySetInnerHTML={renderMarkdown(improvements)} />
                            ) : (
                                <div className="space-y-3 animate-pulse">
                                    <div className="h-4 bg-white/5 rounded w-3/4"></div>
                                    <div className="h-4 bg-white/5 rounded w-5/6"></div>
                                    <div className="h-4 bg-white/5 rounded w-2/3"></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. MULTI-VARIATION OUTPUT */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                        {[
                            { id: 'VERSION_A', label: 'Structured' },
                            { id: 'VERSION_B', label: 'Detailed' },
                            { id: 'VERSION_C', label: 'Concise' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                    : "text-white/40 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => handleCopy(getActiveVersion())}
                        className={`px-8 py-3 rounded-2xl font-bold transition-all border active:scale-95 flex items-center gap-2 ${copied
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                            : "bg-blue-600 text-white border-blue-400 hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                            }`}
                    >
                        {copied ? "✨ Copied!" : "📋 Copy Optimized Prompt"}
                    </button>
                </div>

                <div className="glass-strong p-10 rounded-[2.5rem] border border-white/10 min-h-[300px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-white/5 font-black text-8xl select-none group-hover:text-blue-500/5 transition-colors">
                        {activeTab.split('_')[1]}
                    </div>
                    <div className="relative z-10 markdown-content prose prose-invert max-w-none text-lg">
                        {getActiveVersion() ? (
                            <div dangerouslySetInnerHTML={renderMarkdown(getActiveVersion())} />
                        ) : (
                            <div className="space-y-4 animate-pulse">
                                <div className="h-6 bg-white/5 rounded w-1/4"></div>
                                <div className="h-4 bg-white/5 rounded w-full"></div>
                                <div className="h-4 bg-white/5 rounded w-full"></div>
                                <div className="h-4 bg-white/5 rounded w-3/4"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
