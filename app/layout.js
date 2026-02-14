import Navbar from "@/components/Navbar";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "PromptPolish - Turn Rough Prompts Into Powerful AI Instructions",
  description: "Polish your prompts instantly with AI-powered refinement. Get professional, optimized prompts for GPT-4 and other LLMs in seconds.",
  keywords: ["prompt engineering", "AI prompt", "GPT-4", "LLM", "prompt optimizer", "AI tools"],
  openGraph: {
    title: "PromptPolish - Turn Rough Prompts Into Powerful AI Instructions",
    description: "Polish your prompts instantly with AI-powered refinement.",
    url: "https://promptpolish.com", // Placeholder
    siteName: "PromptPolish",
    images: [
      {
        url: "https://promptpolish.com/og-image.jpg", // Placeholder
        width: 1200,
        height: 630,
        alt: "PromptPolish Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PromptPolish",
    description: "Polish your prompts instantly with AI-powered refinement.",
    creator: "@promptpolish", // Placeholder
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} antialiased min-h-screen relative bg-[#020617]`}>
          {/* Global Background Layer */}
          <div
            className="fixed inset-0 z-0"
            style={{
              background: 'radial-gradient(circle at top right, #1e1b4b, #020617)',
            }}
          >
            {/* Dark overlay for better text contrast */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950/80 to-slate-950"></div>

            {/* Animated glow effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-glow"></div>
              <div className="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-glow" style={{ animationDelay: '2s' }}></div>
            </div>
          </div>

          {/* Main Content Layer */}
          <div className="relative z-10">
            <Navbar />
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
