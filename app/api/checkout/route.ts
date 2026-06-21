import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// The Pro plan as advertised on the pricing page.
const PRO_PRICE_CENTS = 1900; // $19.00 / month
const TRIAL_DAYS = 7;

export async function GET(req: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY;
  const origin = req.nextUrl.origin;

  if (!key) {
    // Stripe not configured yet — send them back to pricing with a notice.
    return NextResponse.redirect(`${origin}/?checkout=unconfigured#pricing`);
  }

  try {
    const stripe = new Stripe(key);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            product_data: {
              name: "MedBill.ai Pro",
              description:
                "Unlimited bill analyses, full AI dispute letters, call scripts, dispute tracking, and email support.",
            },
            recurring: { interval: "month" },
            unit_amount: PRO_PRICE_CENTS,
          },
        },
      ],
      subscription_data: { trial_period_days: TRIAL_DAYS },
      allow_promotion_codes: true,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=cancelled#pricing`,
    });

    if (!session.url) throw new Error("No checkout URL returned");
    return NextResponse.redirect(session.url, { status: 303 });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.redirect(`${origin}/?checkout=error#pricing`);
  }
}
