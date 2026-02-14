import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";
import { getUserPlan, incrementUserUsage } from "@/lib/db";

export async function POST(req) {
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
        return new Response("Missing Google API Key", { status: 500 });
    }

    const { userId } = await auth();
    if (!userId) {
        return new Response("Unauthorized", { status: 401 });
    }

    // Check plan and usage from DB (Server-side Source of Truth)
    // Fallback to free if DB keys are missing (demo mode)
    let planData = { plan: 'free', prompts_used: 0 };
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        planData = await getUserPlan(userId);
    }

    if (planData.plan === 'free' && planData.prompts_used >= 5) {
        return new Response("Free trial limit reached. Upgrade to Pro to continue.", { status: 403 });
    }

    const { prompt, mode = "Reasoning" } = await req.json();

    const systemInstruction = `
    Role: Senior Prompt Engineer and AI Strategy Consultant.
    Task: Transform the user's messy prompt into a high-performance AI instruction set using the "${mode}" optimization strategy.
    
    Structure your response EXACTLY as follows using these specific delimiters:
    
    [ANALYSIS]
    Provide a JSON-style object (but keep it as text) with 4 scores (0-100):
    Clarity: <score>
    Specificity: <score>
    Constraints: <score>
    Context: <score>
    
    [WEAKNESSES]
    List 3-4 bullet points of what is missing or weak in the original prompt.
    
    [IMPROVEMENTS]
    List 3-4 bullet points of exactly what you changed and why it's better.
    
    [VERSION_A]
    ## Structured Implementation
    (A highly structured, professional version with clear role and task definition)
    
    [VERSION_B]
    ## Detailed Constraints
    (A version focused on edge cases, negative prompts, and strict constraints)
    
    [VERSION_C]
    ## Concise High-Impact
    (A shorter, punchy version that gets straight to the point but remains effective)
    
    Rules:
    - No conversational filler.
    - Be brutally honest in analysis.
    - Version outputs must be ready to copy-paste.
  `;

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: systemInstruction
        });

        const result = await model.generateContentStream(prompt);

        const readable = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of result.stream) {
                        const chunkText = chunk.text();
                        if (chunkText) {
                            controller.enqueue(encoder.encode(chunkText));
                        }
                    }
                    controller.close();
                } catch (streamError) {
                    console.error("Stream Error:", streamError);
                    controller.error(streamError);
                }
            },
        });

        // Increment usage after successful stream setup
        if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
            await incrementUserUsage(userId);
        }

        return new Response(readable, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
            },
        });

    } catch (error) {
        console.error("Gemini Error:", error);
        return new Response(`Failed to polish prompt: ${error.message}`, { status: 500 });
    }
}
