import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Webhook for Bayaa Business KPI Updates
 * 
 * Payload structure:
 * {
 *   "metric_key": "manychat_subscribers",
 *   "value": 150,
 *   "api_key": "YOUR_WEBHOOK_API_KEY",
 *   "action": "set" | "increment" (optional, default: "set")
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { metric_key, value, api_key, action = "set" } = body;

    // 1. Validation
    if (!metric_key || value === undefined || !api_key) {
      return NextResponse.json(
        { error: "Missing required fields: metric_key, value, api_key" },
        { status: 400 }
      );
    }

    // 2. Verify API Key against site_settings
    const { data: settings, error: settingsError } = await getServiceClient()
      .from("site_settings")
      .select("value")
      .eq("key", "webhook_api_key")
      .single();

    if (settingsError || !settings || settings.value !== api_key) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid API Key" },
        { status: 401 }
      );
    }

    // 3. Prepare Update
    let newValue = Number(value);
    
    if (action === "increment") {
      const { data: current, error: fetchError } = await getServiceClient()
        .from("kpi_metrics")
        .select("actual_value")
        .eq("metric_key", metric_key)
        .single();
      
      if (fetchError) {
        return NextResponse.json(
          { error: `Metric not found: ${metric_key}` },
          { status: 404 }
        );
      }
      
      newValue = (Number(current.actual_value) || 0) + Number(value);
    }

    // 4. Update Database
    const { error: updateError } = await getServiceClient()
      .from("kpi_metrics")
      .update({
        actual_value: newValue,
        updated_at: new Date().toISOString()
      })
      .eq("metric_key", metric_key);

    if (updateError) {
      console.error("[KPI Webhook] DB Update Error:", updateError);
      return NextResponse.json(
        { error: "Database update failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      metric: metric_key,
      new_value: newValue,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("[KPI Webhook] Server Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Health check and documentation info
export async function GET() {
  return NextResponse.json({
    status: "active",
    endpoint: "/api/webhooks/kpi",
    methods: ["POST"],
    description: "Secure endpoint for Bayaa Business real-time KPI updates."
  });
}
