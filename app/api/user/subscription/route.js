
import { auth } from "@clerk/nextjs/server";
import { getUserPlan } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        let planData = { plan: "free", prompts_used: 0 };

        if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
            planData = await getUserPlan(userId);
        }

        // Calculate remaining for free plan
        const remaining = Math.max(0, 5 - (planData.prompts_used || 0));

        return NextResponse.json({
            plan: planData.plan || "free",
            promptsUsed: planData.prompts_used || 0,
            remaining: remaining,
            status: planData.status || "active"
        });
    } catch (error) {
        console.error("Subscription Status Fetch Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
