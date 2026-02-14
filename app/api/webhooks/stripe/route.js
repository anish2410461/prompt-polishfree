
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature");

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object;

    if (event.type === "checkout.session.completed") {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);

        if (!session?.metadata?.userId) {
            return new NextResponse("User ID not found in metadata", { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from("user_plans")
            .upsert({
                user_id: session.metadata.userId,
                stripe_customer_id: session.customer,
                stripe_subscription_id: session.subscription,
                plan: "pro",
                status: subscription.status,
            }, { onConflict: 'user_id' });

        if (error) {
            console.error("Supabase Error (Webhooks):", error);
            return new NextResponse("Database update failed", { status: 500 });
        }
    }

    if (event.type === "customer.subscription.deleted" || event.type === "customer.subscription.updated") {
        const subscription = session;

        const { error } = await supabaseAdmin
            .from("user_plans")
            .update({
                status: subscription.status,
                plan: subscription.status === "active" ? "pro" : "free",
            })
            .eq("stripe_subscription_id", subscription.id);

        if (error) {
            console.error("Supabase Update Error (Webhooks):", error);
            return new NextResponse("Database update failed", { status: 500 });
        }
    }

    return new NextResponse(null, { status: 200 });
}
