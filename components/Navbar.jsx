import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function Navbar() {
    return (
        <nav className="glass px-8 py-5 shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white tracking-tight">
                    ✨ PromptPolish
                </h2>
                <div className="flex items-center gap-4">
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-blue-500 to-sky-600 text-white rounded-lg hover:from-blue-600 hover:to-sky-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/50 hover:scale-105">
                                Login
                            </button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <UserButton
                            afterSignOutUrl="/"
                            appearance={{
                                elements: {
                                    userButtonAvatarBox: "w-10 h-10 border-2 border-sky-400/30",
                                }
                            }}
                        />
                    </SignedIn>
                </div>
            </div>
        </nav>
    );
}
