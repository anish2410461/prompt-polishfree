"use client";

import { useEffect, useRef } from "react";

export default function HistorySidebar({ history, isOpen, onClose, onSelect, onClear }) {
    const sidebarRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose]);

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 right-0 z-50 w-80 bg-slate-900/95 backdrop-blur-xl shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-white/10 ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
                ref={sidebarRef}
            >
                <div className="flex flex-col h-full p-6">
                    <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            📜 History
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-white/50 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {history.length === 0 ? (
                            <div className="text-center py-12 text-white/30">
                                <p className="text-4xl mb-3">🕒</p>
                                <p>No history yet</p>
                            </div>
                        ) : (
                            history.map((item, index) => (
                                <div
                                    key={index}
                                    onClick={() => onSelect(item)}
                                    className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-all border border-white/5 hover:border-white/20 active:scale-95"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-blue-300 font-mono">
                                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span className="text-xs text-white/30 group-hover:text-white/50 transition-colors">
                                            {new Date(item.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-white/90 text-sm line-clamp-2 font-light group-hover:text-white break-words">
                                        {item.original}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>

                    {history.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                            <button
                                onClick={onClear}
                                className="w-full py-3 text-sm font-semibold text-red-300 bg-red-500/10 hover:bg-red-500/20 hover:text-red-200 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                🗑️ Clear History
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
