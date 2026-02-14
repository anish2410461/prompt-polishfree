
import { supabaseAdmin } from "@/lib/supabase";

export async function getUserPlan(userId) {
    const { data, error } = await supabaseAdmin
        .from("user_plans")
        .select("*")
        .eq("user_id", userId)
        .single();

    if (error || !data) {
        return { plan: "free", prompts_used: 0 };
    }

    return data;
}

export async function incrementUserUsage(userId) {
    // This part depends on how you want to track daily usage in the DB
    // For now, let's assume we update a prompts_used field if they are on free plan
    const { data: planData } = await supabaseAdmin
        .from("user_plans")
        .select("plan, prompts_used, last_reset")
        .eq("user_id", userId)
        .single();

    if (planData?.plan === 'pro') return;

    const today = new Date().toDateString();
    let newCount = (planData?.prompts_used || 0) + 1;

    if (planData?.last_reset !== today) {
        newCount = 1;
    }

    await supabaseAdmin
        .from("user_plans")
        .upsert({
            user_id: userId,
            prompts_used: newCount,
            last_reset: today
        }, { onConflict: 'user_id' });
}
