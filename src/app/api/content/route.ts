import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const VALID_KEYS = [
  "services",
  "hero_images",
  "payment_settings",
  "salon_info",
  "policies",
  "newsletter_subscribers",
];

export async function POST(req: Request) {
  try {
    const adminKey = req.headers.get("x-admin-key") || "";
    const expectedKey = process.env.ADMIN_PASSKEY || "admin123";
    if (!adminKey || adminKey !== expectedKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { key, value } = body || {};
    if (!VALID_KEYS.includes(key)) {
      return NextResponse.json({ error: "Invalid content key" }, { status: 400 });
    }
    if (value === undefined || value === null) {
      return NextResponse.json({ error: "Missing content value" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Cloud sync is not configured (missing SUPABASE_SERVICE_ROLE_KEY)" },
        { status: 503 }
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { error } = await adminClient.from("site_content").upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );

    if (error) {
      console.warn("site_content upsert error:", error);
      return NextResponse.json({ error: "Database save failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true, key });
  } catch (error) {
    console.error("Content API error:", error);
    return NextResponse.json({ error: "Failed to save content" }, { status: 500 });
  }
}
