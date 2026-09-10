import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { Resend } from "resend";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const resendApiKey = process.env.RESEND_API_KEY || "";
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const salonNotificationEmail = (process.env.SALON_NOTIFICATION_EMAIL || "maevausa@outlook.com").toLowerCase().trim();

// Gmail / Custom SMTP credentials (free zero-domain delivery)
const smtpUser = process.env.GMAIL_USER || process.env.SMTP_USER || "";
const smtpPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || "";

export async function POST(req: Request) {
  try {
    const booking = await req.json();

    if (!booking.id || !booking.clientName) {
      return NextResponse.json(
        { error: "Missing required booking details" },
        { status: 400 }
      );
    }

    // 1. Update status in Supabase Database (if configured)
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from("bookings")
          .update({
            status: "confirmed",
            payment_verified: true,
          })
          .eq("id", booking.id);
      } catch (dbErr) {
        console.warn("Supabase confirmation update error:", dbErr);
      }
    }

    // If client provided no email address, return early with status update
    if (!booking.clientEmail || !booking.clientEmail.trim()) {
      return NextResponse.json({
        success: true,
        emailDispatched: false,
        reason: "No client email address provided on booking",
      });
    }

    const recipientEmail = booking.clientEmail.trim().toLowerCase();
    const balanceDue = Math.max(0, (booking.totalPrice || 0) - (booking.depositAmount || 20));

    const confirmationHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FAF7F2; border: 1px solid #E8DFD5; padding: 24px; color: #2B1E1E;">
        <div style="background-color: #4E141B; padding: 20px; text-align: center;">
          <h1 style="color: #FAF7F2; margin: 0; font-size: 22px; font-weight: normal; letter-spacing: 2px;">HAIR BY MAEVA</h1>
          <p style="color: #C5A059; margin: 6px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Appointment Confirmed • Deposit Verified</p>
        </div>

        <div style="background-color: #ffffff; padding: 20px; border: 1px solid #E8DFD5; margin-top: 16px;">
          <div style="text-align: center; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid #FAF0E6;">
            <span style="background-color: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; display: inline-block;">
              ✓ Deposit Verified & Spot Reserved
            </span>
            <h2 style="color: #4E141B; margin: 12px 0 4px 0; font-size: 18px;">We Look Forward to Seeing You, ${booking.clientName}!</h2>
            <p style="color: #6B5B56; font-size: 13px; margin: 0;">Your deposit of <strong>$${booking.depositAmount || 20}</strong> has been verified and your appointment is officially locked in.</p>
          </div>

          <h3 style="color: #4E141B; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Appointment Details</h3>
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #6B5B56; width: 40%;">Hairstyle:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #4E141B;">${booking.serviceName}</td>
            </tr>
            ${booking.selectedLength ? `
            <tr>
              <td style="padding: 6px 0; color: #6B5B56;">Length Tier:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #4E141B;">${booking.selectedLength}</td>
            </tr>
            ` : ""}
            <tr>
              <td style="padding: 6px 0; color: #6B5B56;">Date:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #4E141B;">${booking.appointmentDate}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6B5B56;">Time Slot:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #4E141B;">${booking.appointmentTime}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6B5B56;">Salon Location:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #4E141B;">1941 West Huron Street, Chicago, IL 60622</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6B5B56;">Booking Reference:</td>
              <td style="padding: 6px 0; font-family: monospace; font-weight: bold; color: #4E141B;">${booking.paymentReference || "N/A"}</td>
            </tr>
          </table>

          <div style="background-color: #FAF7F2; border: 1px solid #C5A059; padding: 14px; margin-top: 16px;">
            <table style="width: 100%; font-size: 13px;">
              <tr>
                <td style="color: #6B5B56;">Total Service Estimate:</td>
                <td style="text-align: right; font-weight: bold;">$${booking.totalPrice}</td>
              </tr>
              <tr>
                <td style="color: #065F46; font-weight: bold;">Deposit Paid (Today):</td>
                <td style="text-align: right; font-weight: bold; color: #065F46;">-$${booking.depositAmount || 20}</td>
              </tr>
              <tr style="border-top: 1px solid #E8DFD5;">
                <td style="padding-top: 8px; color: #4E141B; font-weight: bold;">Remaining Balance Due:</td>
                <td style="padding-top: 8px; text-align: right; font-weight: bold; color: #4E141B; font-size: 15px;">$${balanceDue} <span style="font-size: 11px; font-weight: normal; color: #6B5B56;">(Cash Only)</span></td>
              </tr>
            </table>
          </div>

          <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid #E8DFD5;">
            <h4 style="color: #4E141B; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Important Appointment Guidelines:</h4>
            <ul style="font-size: 12px; color: #6B5B56; margin: 0; padding-left: 18px; line-height: 1.6;">
              <li>Please arrive with your hair <strong>washed, completely detangled, and blown out straight</strong> from roots to ends.</li>
              <li>Remaining balance is strictly <strong>Cash only</strong> upon completion.</li>
              <li>Please arrive on time. A 15-minute grace period applies; past 20 minutes your appointment may be rescheduled.</li>
            </ul>
          </div>
        </div>

        <div style="margin-top: 20px; font-size: 11px; color: #6B5B56; text-align: center; border-top: 1px solid #E8DFD5; padding-top: 14px;">
          <p style="margin: 2px 0;"><strong>Hair By Maeva</strong> • 1941 West Huron Street, Chicago, Illinois 60622</p>
          <p style="margin: 2px 0;">Questions? Call/Text: <a href="tel:+17732697505" style="color: #4E141B;">+1 (773) 269-7505</a> or reply directly to this email.</p>
        </div>
      </div>
    `;

    let emailSent = false;
    let dispatchMethod = "none";

    // Method 1: Free Gmail / SMTP Transport (Zero domain requirement)
    if (smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        await transporter.sendMail({
          from: `"Hair By Maeva" <${smtpUser}>`,
          to: recipientEmail,
          replyTo: salonNotificationEmail,
          subject: `Appointment Confirmed: ${booking.serviceName} - Hair By Maeva (${booking.appointmentDate})`,
          html: confirmationHtml,
        });

        emailSent = true;
        dispatchMethod = "smtp_gmail";
      } catch (smtpErr) {
        console.warn("Gmail SMTP confirmation dispatch failed:", smtpErr);
      }
    }

    // Method 2: Resend API Dispatch
    if (!emailSent && resend) {
      try {
        const resendFrom = process.env.RESEND_FROM_EMAIL || "Hair By Maeva Bookings <onboarding@resend.dev>";
        const resendRes = await resend.emails.send({
          from: resendFrom,
          to: recipientEmail,
          replyTo: salonNotificationEmail,
          subject: `Appointment Confirmed: ${booking.serviceName} - Hair By Maeva (${booking.appointmentDate})`,
          html: confirmationHtml,
        });

        if (resendRes.data && !resendRes.error) {
          emailSent = true;
          dispatchMethod = "resend";
        } else if (resendRes.error) {
          console.warn("Resend client confirmation dispatch error:", resendRes.error);
        }
      } catch (resendErr) {
        console.warn("Resend client confirmation error:", resendErr);
      }
    }

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      emailSent,
      dispatchMethod,
      recipient: recipientEmail,
    });
  } catch (error) {
    console.error("Booking confirmation API error:", error);
    return NextResponse.json(
      { error: "Failed to process booking confirmation" },
      { status: 500 }
    );
  }
}
