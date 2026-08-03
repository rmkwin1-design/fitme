import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface PayPalLink {
  rel?: string;
  href?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { locale = "ko", provider = "primary", originUrl } = body;

    const baseUrl = originUrl || request.headers.get("origin") || "http://localhost:3010";
    const orderId = `fitme_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const successUrl = `${baseUrl}/payment/success?order_id=${orderId}&locale=${locale}`;
    const cancelUrl = `${baseUrl}/payment/cancel?locale=${locale}`;

    // 1. Korea Locale (ko): Toss Payments Primary, PayPal Secondary
    if (locale === "ko" && provider !== "paypal") {
      const tossKey = process.env.TOSS_SECRET_KEY;
      if (tossKey) {
        const tossRes = await fetch("https://api.tosspayments.com/v1/payments", {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(`${tossKey}:`).toString("base64")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: 9900,
            orderId,
            orderName: "FitMe 무제한 피팅 멤버십 (월간)",
            successUrl,
            failUrl: cancelUrl,
          }),
        });

        const tossData = await tossRes.json();
        if (tossData.checkout?.url) {
          return NextResponse.json({ url: tossData.checkout.url });
        }
      }
      return NextResponse.json({ url: successUrl });
    }

    // 2. Japan Locale (ja): Stripe Primary (PayPay, Konbini, Card), PayPal Secondary
    if (locale === "ja" && provider !== "paypal") {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (stripeKey) {
        const stripeParams = new URLSearchParams({
          "payment_method_types[0]": "card",
          "payment_method_types[1]": "konbini",
          "payment_method_types[2]": "paypay",
          "line_items[0][price_data][currency]": "jpy",
          "line_items[0][price_data][product_data][name]": "FitMe 無制限フィットプラン (月額)",
          "line_items[0][price_data][unit_amount]": "1100",
          "line_items[0][quantity]": "1",
          mode: "subscription",
          success_url: successUrl,
          cancel_url: cancelUrl,
        });

        const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${stripeKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: stripeParams.toString(),
        });

        const stripeData = await stripeRes.json();
        if (stripeData.url) {
          return NextResponse.json({ url: stripeData.url });
        }
      }
      return NextResponse.json({ url: successUrl });
    }

    // 3. English / Global Locale (en): Stripe Primary (Apple Pay, Google Pay, Cards), PayPal Secondary
    if (locale === "en" && provider !== "paypal") {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (stripeKey) {
        const stripeParams = new URLSearchParams({
          "payment_method_types[0]": "card",
          "line_items[0][price_data][currency]": "usd",
          "line_items[0][price_data][product_data][name]": "FitMe Unlimited Try-On Membership (Monthly)",
          "line_items[0][price_data][unit_amount]": "799",
          "line_items[0][quantity]": "1",
          mode: "subscription",
          success_url: successUrl,
          cancel_url: cancelUrl,
        });

        const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${stripeKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: stripeParams.toString(),
        });

        const stripeData = await stripeRes.json();
        if (stripeData.url) {
          return NextResponse.json({ url: stripeData.url });
        }
      }
      return NextResponse.json({ url: successUrl });
    }

    // 4. Secondary Option: PayPal Checkout (Supports both Sandbox and Live keys)
    if (provider === "paypal") {
      const paypalClientId = process.env.PAYPAL_CLIENT_ID;
      const paypalSecret = process.env.PAYPAL_CLIENT_SECRET;

      if (paypalClientId && paypalSecret) {
        const authHeader = `Basic ${Buffer.from(`${paypalClientId}:${paypalSecret}`).toString("base64")}`;
        
        let apiBase = "https://api-m.paypal.com";
        let authRes = await fetch(`${apiBase}/v1/oauth2/token`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: "grant_type=client_credentials",
        });

        // Fallback to Sandbox if Live endpoint fails
        if (!authRes.ok) {
          apiBase = "https://api-m.sandbox.paypal.com";
          authRes = await fetch(`${apiBase}/v1/oauth2/token`, {
            method: "POST",
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: "grant_type=client_credentials",
          });
        }

        const authData = await authRes.json();
        if (authData.access_token) {
          const orderRes = await fetch(`${apiBase}/v2/checkout/orders`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authData.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              intent: "CAPTURE",
              purchase_units: [
                {
                  amount: { currency_code: "USD", value: "7.99" },
                  description: "FitMe Unlimited Try-On Membership",
                },
              ],
              application_context: {
                return_url: successUrl,
                cancel_url: cancelUrl,
              },
            }),
          });

          const orderData = await orderRes.json();
          const approveLink = orderData.links?.find((l: PayPalLink) => l.rel === "approve")?.href;
          if (approveLink) {
            return NextResponse.json({ url: approveLink });
          }
        }
      }
      return NextResponse.json({ url: successUrl });
    }

    return NextResponse.json({ url: successUrl });
  } catch (error: unknown) {
    console.error("Checkout Server Route Error:", error);
    return NextResponse.json(
      { error: "결제 요청 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
