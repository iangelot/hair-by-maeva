import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { Resend } from "resend";
import { supabase, supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

const salonNotificationEmail = (process.env.SALON_NOTIFICATION_EMAIL || "maevausa@outlook.com").toLowerCase().trim();

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    let savedToDb = false;

    // 1. Save to Supabase Cloud Database
    const dbClient = supabaseAdmin || supabase;
    if (isSupabaseConfigured && dbClient) {
      try {
        // Try dedicated subscribers table
        const { error } = await dbClient
          .from("subscribers")
          .upsert([{ email: cleanEmail, created_at: new Date().toISOString() }], { onConflict: "email" });

        if (!error) {
          savedToDb = true;
        } else {
          // Fallback to site_content key if table is not yet migrated
          const { data: contentRow } = await dbClient
            .from("site_content")
            .select("value")
            .eq("key", "newsletter_subscribers")
            .single();

          const existing: string[] = Array.isArray(contentRow?.value) ? contentRow.value : [];
          if (!existing.includes(cleanEmail)) {
            const updated = [cleanEmail, ...existing];
            await dbClient
              .from("site_content")
              .upsert([{ key: "newsletter_subscribers", value: updated }]);
            savedToDb = true;
          }
        }
      } catch (dbErr) {
        console.warn("Newsletter DB save error:", dbErr);
      }
    }

    // 2. Dispatch Automated VIP Welcome Email to the Subscriber
    const smtpUser = (process.env.GMAIL_USER || process.env.SMTP_USER || "").trim();
    const rawSmtpPass = (process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || "").trim();
    const smtpPass = rawSmtpPass.replace(/\s+/g, "");
    const resendApiKey = (process.env.RESEND_API_KEY || "").trim();
    const resend = resendApiKey ? new Resend(resendApiKey) : null;

    const welcomeHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FAF7F2; border: 1px solid #E8DFD5; padding: 24px; color: #2B1E1E;">
        <div style="background-color: #4E141B; padding: 22px; text-align: center;">
          <h1 style="color: #FAF7F2; margin: 0; font-size: 22px; font-weight: normal; letter-spacing: 2px;">HAIR BY MAEVA</h1>
          <p style="color: #C5A059; margin: 6px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">VIP Hair Care & Updates</p>
        </div>

        <div style="background-color: #ffffff; padding: 24px; border: 1px solid #E8DFD5; margin-top: 16px; text-align: center;">
          <h2 style="color: #4E141B; margin: 0 0 10px 0; font-size: 18px;">You're on the VIP List! ✨</h2>
          <p style="color: #6B5B56; font-size: 13px; line-height: 1.6; margin: 0 0 18px 0;">
            Thank you for subscribing. You'll now be the first to know about newly opened weekend calendar slots, seasonal hair promotions, and holiday booking schedules.
          </p>

          <div style="background-color: #FAF7F2; border: 1px solid #E8DFD5; padding: 16px; margin: 16px 0; text-align: left; font-size: 12px; color: #4E141B;">
            <p style="margin: 3px 0;"><strong>Salon Location:</strong> 1941 West Huron Street, Chicago, IL 60622</p>
            <p style="margin: 3px 0;"><strong>Hours:</strong> Tuesday – Sunday (7:00 AM – 4:00 PM)</p>
            <p style="margin: 3px 0;"><strong>Direct Contact:</strong> +1 (773) 269-7505</p>
          </div>

          <a href="https://hair-by-maeva.vercel.app/#services" style="display: inline-block; background-color: #4E141B; color: #FAF7F2; text-decoration: none; padding: 12px 24px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 8px;">
            Explore Styles & Book
          </a>
        </div>

        <div style="margin-top: 20px; font-size: 11px; color: #6B5B56; text-align: center; border-top: 1px solid #E8DFD5; padding-top: 14px;">
          <p style="margin: 2px 0;">Hair By Maeva • Master Craftsmanship & Luxury Braiding</p>
        </div>
      </div>
    `;

    let emailDispatched = false;

    // Send via Gmail SMTP if configured
    if (smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: smtpUser, pass: smtpPass },
        });

        await transporter.sendMail({
          from: `"Hair By Maeva" <${smtpUser}>`,
          to: cleanEmail,
          replyTo: salonNotificationEmail,
          subject: "Welcome to Hair By Maeva VIP List! ✨",
          html: welcomeHtml,
        });
        emailDispatched = true;
      } catch (smtpErr) {
        console.warn("Newsletter welcome email SMTP error:", smtpErr);
      }
    }

    // Fallback: send via Resend if available
    if (!emailDispatched && resend) {
      try {
        const resendFrom = process.env.RESEND_FROM_EMAIL || "Hair By Maeva <onboarding@resend.dev>";
        await resend.emails.send({
          from: resendFrom,
          to: cleanEmail,
          replyTo: salonNotificationEmail,
          subject: "Welcome to Hair By Maeva VIP List! ✨",
          html: welcomeHtml,
        });
        emailDispatched = true;
      } catch (resendErr) {
        console.warn("Newsletter welcome email Resend error:", resendErr);
      }
    }

    return NextResponse.json({
      success: true,
      email: cleanEmail,
      savedToDb,
      emailDispatched,
      message: "Subscribed successfully!",
    });
  } catch (error) {
    console.error("Newsletter API error:", error);
    return NextResponse.json(
      { error: "Failed to process newsletter subscription" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    let subscribers: string[] = [];
    const dbClient = supabaseAdmin || supabase;

    if (isSupabaseConfigured && dbClient) {
      // Check subscribers table
      const { data, error } = await dbClient
        .from("subscribers")
        .select("email, created_at")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        subscribers = data.map((d: any) => d.email);
      } else {
        // Check site_content key
        const { data: contentRow } = await dbClient
          .from("site_content")
          .select("value")
          .eq("key", "newsletter_subscribers")
          .single();

        if (Array.isArray(contentRow?.value)) {
          subscribers = contentRow.value;
        }
      }
    }

    return NextResponse.json({ subscribers });
  } catch (err) {
    return NextResponse.json({ subscribers: [] });
  }
}
