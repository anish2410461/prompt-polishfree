"use client";

import { useState, useEffect } from "react";
import PromptInput from "@/components/PromptInput";
import OutputCard from "@/components/OutputCard";
import HistorySidebar from "@/components/HistorySidebar";

const ELECTRIC_BLUE = "blue-600";
const ACCENT_GRADIENT = "from-blue-600 to-indigo-600";

export default function Home() {
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [history, setHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [useMock, setUseMock] = useState(false);
  const [mode, setMode] = useState("Reasoning");
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [subscription, setSubscription] = useState({ plan: 'free', remaining: 5 });

  const fetchSubscription = async () => {
    try {
      const res = await fetch("/api/user/subscription");
      if (res.ok) {
        const data = await res.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error("Failed to fetch subscription", error);
    }
  };

  // Load data
  useEffect(() => {
    const saved = localStorage.getItem("promptHistory");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.warn("Failed to parse history", e);
      }
    }

    fetchSubscription();
  }, []);

  const saveHistory = (newHistory) => {
    setHistory(newHistory);
    localStorage.setItem("promptHistory", JSON.stringify(newHistory));
  };

  const addToHistory = (original, enhanced) => {
    const newItem = {
      original,
      enhanced,
      timestamp: Date.now(),
    };
    const newHistory = [newItem, ...history];
    saveHistory(newHistory);
  };

  const handleClearHistory = () => {
    saveHistory([]);
  };

  const handleSelectHistory = (item) => {
    setOriginalPrompt(item.original);
    setOutput(item.enhanced);
    setStatus("Done");
    setIsHistoryOpen(false);
    // Scroll to the tool if needed, but for now just show
    document.getElementById('app-tool')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePolishSafe = async (inputText) => {
    setIsLoading(true);
    setStatus("Checking Usage...");
    setOriginalPrompt(inputText);
    setOutput("");

    if (useMock) {
      setTimeout(() => {
        setStatus("Polishing...");
        setIsLoading(false);
        const enhancedPrompt = generateMockResponse(inputText);
        let index = 0;
        const interval = setInterval(() => {
          if (index < enhancedPrompt.length) {
            setOutput((prev) => prev + enhancedPrompt.charAt(index));
            index++;
          } else {
            clearInterval(interval);
            setStatus("Done");
            addToHistory(inputText, enhancedPrompt);
          }
        }, 10);
      }, 1500);
      return;
    }

    try {
      const response = await fetch("/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: inputText, mode }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setStatus("Polishing...");
      setIsLoading(false);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunkValue = decoder.decode(value, { stream: true });
        accumulatedText += chunkValue;
        setOutput((prev) => prev + chunkValue);

        // Dynamic status updates based on tags
        if (accumulatedText.includes("[VERSION_A]")) setStatus("Generating Variations...");
        else if (accumulatedText.includes("[IMPROVEMENTS]")) setStatus("Structuring...");
        else if (accumulatedText.includes("[WEAKNESSES]")) setStatus("Scoring...");
      }

      setStatus("Done");
      addToHistory(inputText, accumulatedText);
      await fetchSubscription();

    } catch (error) {
      console.error("Error polishing prompt:", error);
      setStatus("Error");

      if (error.message.includes("Free trial limit reached")) {
        setStatus("Limit Reached");
        setOutput("⚠️ **Free Trial Limit Reached** \n\nYou have used your 5 free prompt optimizations for today. \n\n[Upgrade to Pro](#pricing) to unlock unlimited optimizations, advanced scoring, and all optimization modes.");
      } else {
        setOutput(`⚠️ Failed to polish prompt. \n\nError: ${error.message || "Unknown error"}. \n\n💡 Tip: Try switching to "Demo Mode" using the toggle above to test the UI without an API key.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockResponse = (text) => {
    return `✨ **Polished Prompt (Demo Mode)** ✨\n\n` +
      `**Role:** Act as an expert consultant.\n` +
      `**Task:** ${text}\n` +
      `**Context:** Provide a detailed, professional, and well-structured response.\n` +
      `**Format:** Use clear headings, bullet points, and a professional tone.\n\n` +
      `---\n` +
      `*Optimized for Clarity & Impact*`;
  };

  const handleClear = () => {
    setOutput("");
    setStatus("Ready");
    setOriginalPrompt("");
  };

  const scrollToApp = () => {
    document.getElementById('app-tool')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen text-white overflow-x-hidden">
      <HistorySidebar
        history={history}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelect={handleSelectHistory}
        onClear={handleClearHistory}
      />

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
            Upgrade Any Prompt Into <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              High-Performance AI Instruction
            </span>.
          </h1>
          <p className="max-w-2xl mx-auto text-xl md:text-2xl text-slate-300 font-light mb-12">
            Analyze, score, and optimize your prompts like a pro.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
            <button
              onClick={scrollToApp}
              className={`px-10 py-5 text-xl font-bold bg-gradient-to-r ${ACCENT_GRADIENT} rounded-full hover:scale-105 transition-all shadow-2xl shadow-blue-500/20 active:scale-95 cursor-pointer`}
            >
              Start Polishing Free
            </button>
          </div>

          {/* Visual Proof / App Preview */}
          <div className="max-w-5xl mx-auto mt-8 perspective-1000">
            <div className="glass-strong rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform-gpu hover:rotate-x-1 transition-transform duration-700 ease-out" id="app-tool">
              {/* Window Controls Decor */}
              <div className="bg-slate-900/50 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                </div>
                <div className="flex items-center gap-6">
                  {/* Demo Mode Toggle */}
                  <label className="flex items-center cursor-pointer gap-3">
                    <span className="text-white/40 text-xs font-semibold uppercase tracking-wider">Demo Mode</span>
                    <div className="relative">
                      <input type="checkbox" className="sr-only" checked={useMock} onChange={() => setUseMock(!useMock)} />
                      <div className={`block w-10 h-5 rounded-full transition-colors ${useMock ? 'bg-indigo-500' : 'bg-white/10'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform ${useMock ? 'translate-x-5' : ''}`}></div>
                    </div>
                  </label>
                  <button
                    onClick={() => setIsHistoryOpen(true)}
                    className="text-white/40 hover:text-white transition-colors text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <span>🕒</span> History
                  </button>
                </div>
              </div>

              {/* Tool Content */}
              <div className="p-8 md:p-12 text-left">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${status === 'Ready' ? 'bg-green-400' : status === 'Error' ? 'bg-red-500' : 'bg-blue-400 animate-pulse'}`}></div>
                    <span className="text-blue-400/80 text-sm font-medium tracking-wide uppercase">{status === 'Ready' ? 'System Ready' : status}</span>
                  </div>

                  {/* Usage HUD */}
                  <div className="flex items-center gap-4">
                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${subscription.plan === 'pro'
                      ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                      : 'bg-white/5 border-white/10 text-white/40'
                      }`}>
                      {subscription.plan} Plan
                    </div>
                    {subscription.plan === 'free' && (
                      <div className="text-sm font-medium text-white/60">
                        {subscription.remaining} / 5 <span className="text-white/20">Credits</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-12">
                  <PromptInput
                    onPolish={handlePolishSafe}
                    isLoading={isLoading}
                    mode={mode}
                    onModeChange={setMode}
                    isPro={subscription.plan === 'pro'}
                  />

                  <OutputCard
                    output={output}
                    isLoading={isLoading}
                    onClear={handleClear}
                    originalPrompt={originalPrompt}
                    isPro={subscription.plan === 'pro'}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="py-32 px-6" id="pricing">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-8">Choose Your Plan</h2>
          <p className="text-xl text-slate-400 mb-20">Unlock the full power of Prompt Engineering.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="glass-strong p-12 rounded-[2.5rem] border border-white/5 space-y-8 flex flex-col text-left">
              <div>
                <h3 className="text-2xl font-bold">Free</h3>
                <p className="text-slate-500 mt-2">Perfect for casual use.</p>
              </div>
              <div className="text-5xl font-bold">$0<span className="text-lg text-slate-600 font-normal">/mo</span></div>
              <ul className="space-y-4 flex-grow">
                {["5 prompt optimizations / day", "Basic text enhancement", "No advanced scoring", "No optimization modes"].map(f => (
                  <li key={f} className="flex items-center gap-3 text-slate-400">
                    <span className="text-red-500/50">✕</span> {f}
                  </li>
                ))}
              </ul>
              <button disabled className="w-full py-4 bg-white/5 text-white/40 rounded-2xl font-bold border border-white/10">Current Plan</button>
            </div>

            {/* Pro Plan */}
            <div className="glass-strong p-12 rounded-[2.5rem] border border-blue-500/30 space-y-8 flex flex-col text-left relative overflow-hidden group">
              <div className="absolute top-0 right-0 px-6 py-2 bg-blue-600 text-white text-xs font-bold uppercase tracking-widest rounded-bl-2xl">Recommended</div>
              <div>
                <h3 className="text-2xl font-bold">Pro</h3>
                <p className="text-slate-400 mt-2">For power users & devs.</p>
              </div>
              <div className="text-5xl font-bold">₹10<span className="text-lg text-slate-600 font-normal">/mo</span></div>
              <ul className="space-y-4 flex-grow">
                {[
                  "Unlimited prompt optimizations",
                  "Full Prompt Intelligence Scoring",
                  "All Optimization Modes (Code, Reasoning, etc.)",
                  "Multi-variation output (A/B testing)",
                  "Advanced Why-This-Is-Better analysis"
                ].map(f => (
                  <li key={f} className="flex items-center gap-3">
                    <span className="text-blue-500">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch("/api/create-checkout-session", { method: "POST" });
                    const data = await res.json();

                    if (res.ok && data.url) {
                      window.location.href = data.url;
                    } else {
                      alert(`Checkout error: ${data.error || "Unknown error"}`);
                    }
                  } catch (error) {
                    console.error("Checkout error:", error);
                    alert("Failed to initiate checkout. Ensure your STRIPE_PRICE_ID is set correctly in .env.local");
                  }
                }}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 hover:scale-[1.02] transition-all"
              >
                {subscription.plan === 'pro' ? 'Manage Subscription' : 'Upgrade to Pro'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PAIN SECTION */}
      <section className="py-32 px-6 bg-slate-950/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-16 px-4">Stop wasting time with average AI output.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
            <div className="space-y-4 p-8 rounded-2xl border border-white/5 bg-white/[0.02]">
              <div className="text-red-400 text-3xl">❌</div>
              <h3 className="text-xl font-semibold">Vague Responses</h3>
              <p className="text-slate-400 leading-relaxed">Getting "as an AI model" lectures instead of the actual data you need.</p>
            </div>
            <div className="space-y-4 p-8 rounded-2xl border border-white/5 bg-white/[0.02]">
              <div className="text-red-400 text-3xl">❌</div>
              <h3 className="text-xl font-semibold">Endless Tweaking</h3>
              <p className="text-slate-400 leading-relaxed">Rewriting the same instruction 10 times just to get a decent result.</p>
            </div>
            <div className="space-y-4 p-8 rounded-2xl border border-white/5 bg-white/[0.02]">
              <div className="text-red-400 text-3xl">❌</div>
              <h3 className="text-xl font-semibold">Inconsistent Quality</h3>
              <p className="text-slate-400 leading-relaxed">One good output followed by three garbage ones because the prompt was weak.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SOLUTION SECTION */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-bold uppercase tracking-widest mb-8">
            The Solution
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-12">Prompt engineering, automated.</h2>
          <p className="text-2xl text-slate-300 leading-relaxed max-w-3xl mx-auto mb-16">
            PromptPolish handles the structure and strategy for you. Our specialized engine takes your rough thoughts and transforms them into <span className="text-white font-semibold italic">high-performing instructions</span> optimized for any LLM.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="glass-strong p-10 rounded-3xl border-l-4 border-blue-500">
              <h4 className="text-blue-400 font-bold mb-2 uppercase text-xs tracking-widest">Before</h4>
              <p className="text-slate-500 italic">"Write me a blog post about coffee."</p>
            </div>
            <div className="glass-strong p-10 rounded-3xl border-l-4 border-emerald-500">
              <h4 className="text-emerald-400 font-bold mb-2 uppercase text-xs tracking-widest">After</h4>
              <p className="text-slate-200">"Act as a professional food writer. Create a 1,000-word SEO-optimized blog post about artisan coffee beans, focusing on the flavor profiles of Ethiopian vs. Colombian roast..."</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="py-32 px-6 bg-blue-900/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-20 text-center">Get better results in 3 steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              { step: "01", title: "Paste Prompt", desc: "Drop your rough idea or draft into the input field above." },
              { step: "02", title: "AI Refines", desc: "Our engine analyzes your intent and adds necessary context and structure." },
              { step: "03", title: "Copy & Use", desc: "Get your professional-grade prompt ready for GPT-4, Claude, or Gemini." }
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-8xl font-black text-white/[0.03] absolute -top-10 -left-4 select-none">
                  {item.step}
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                  <p className="text-slate-400 text-lg leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SOCIAL PROOF SECTION */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-strong p-12 md:p-20 rounded-[3rem] border border-white/10 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-64 h-64 bg-${ELECTRIC_BLUE}/20 blur-[100px] -z-10 group-hover:bg-blue-500/30 transition-all`}></div>
            <div className="text-5xl md:text-7xl mb-10 opacity-20 group-hover:opacity-40 transition-opacity">“</div>
            <p className="text-2xl md:text-3xl font-medium leading-relaxed mb-12">
              Since using PromptPolish, our AI's accuracy jumped by <span className="text-blue-400">40%</span>. It's a game changer for our content workflow and dev productivity.
            </p>
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-2xl font-bold border border-white/10 overflow-hidden">
                AR
              </div>
              <div>
                <div className="text-lg font-bold">Alex Rivers</div>
                <div className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Founder, SaaSFlow</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA SECTION */}
      <section className="py-32 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-12">
          <h2 className="text-4xl md:text-7xl font-bold tracking-tight">Ready to transform <br />your AI results?</h2>
          <p className="text-xl text-slate-400">Join thousands of power users and start polishing for free today.</p>
          <button
            onClick={scrollToApp}
            className={`px-12 py-6 text-2xl font-bold bg-gradient-to-r ${ACCENT_GRADIENT} rounded-full hover:scale-105 hover:shadow-[0_0_40px_rgba(37,99,235,0.4)] transition-all cursor-pointer`}
          >
            Start Polishing Free
          </button>
        </div>
      </section>

      {/* Footer minimal */}
      <footer className="py-12 px-6 border-t border-white/5 text-center text-slate-600 text-sm">
        <p>&copy; 2026 PromptPolish. All rights reserved. Polishing prompts for a better future.</p>
      </footer>
    </main>
  );
}
