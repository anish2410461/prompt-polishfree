"use server";

import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function polishPrompt(prompt) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("Missing OpenAI API Key");
    }

    const systemPrompt = `
    Role: Expert Prompter and AI Consultant.
    Task: Rewrite the user's prompt to be clear, professional, and optimized for LLMs like GPT-4.
    Context: The user wants to improve their prompt engineering skills.
    
    Structure the response with markdown:
    ## 🎯 Optimized Prompt
    ... (the rewritten prompt) ...
    
    ## 📝 Explanation
    - **Clarity:** (why this change helps)
    - **Context:** (why this context matters)
    
    Do NOT include any conversational filler. Just the structured response.
  `;

    try {
        const stream = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt },
            ],
            stream: true,
        });

        // Create a readable stream for the client
        const encoder = new TextEncoder();
        const readable = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    const text = chunk.choices[0]?.delta?.content || "";
                    if (text) {
                        controller.enqueue(encoder.encode(text));
                    }
                }
                controller.close();
            },
        });

        return readable;

    } catch (error) {
        console.error("OpenAI Error:", error);
        throw new Error("Failed to polish prompt");
    }
}
