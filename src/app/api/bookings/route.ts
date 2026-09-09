import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const resendApiKey = process.env.RESEND_API_KEY || "";
const salonNotificationEmail = process.env.SALON_NOTIFICATION_EMAIL || "Maevausa@outlook.com";

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(req: Request) {
  try {
    const booking = await req.json();

    if (!booking.clientName || !booking.clientPhone || !booking.appointmentDate) {
      return NextResponse.json(
        { error: "Missing required booking information" },
        { status: 400 }
      );
    }

    // 1. Sync to Supabase Cloud Database (if configured)
    let supabaseSaved = false;
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("bookings").upsert([
          {
            id: booking.id,
            reference_code: booking.paymentReference || null,
            client_name: booking.clientName,
            client_phone: booking.clientPhone,
            client_email: booking.clientEmail || null,
            service_id: booking.serviceId || null,
            service_name: booking.serviceName,
            appointment_date: booking.appointmentDate,
            appointment_time: booking.appointmentTime,
            status: booking.status || "pending",
            total_amount: booking.totalPrice,
            deposit_amount: booking.depositAmount,
            notes: booking.notes || null,
            zelle_sender_name: booking.zelleSenderName || null,
            zelle_memo: booking.paymentMethod
              ? `[Method: ${booking.paymentMethod}] ${booking.zelleMemo || ""}`.trim()
              : (booking.zelleMemo || null),
            payment_verified: booking.status === "confirmed",
          },
        ]);
        if (!error) supabaseSaved = true;
        else console.warn("Supabase upsert error:", error);
      } catch (dbErr) {
        console.warn("Supabase database insert error:", dbErr);
      }
    }

    // 2. Dispatch Email to Awa Diongue (Maevausa@outlook.com) via Resend
    let emailSent = false;
    if (resend) {
      try {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FAF7F2; border: 1px solid #E8DFD5; padding: 24px; color: #2B1E1E;">
            <div style="background-color: #4E141B; padding: 18px; text-align: center;">
              <h1 style="color: #FAF7F2; margin: 0; font-size: 20px; font-weight: normal; letter-spacing: 2px;">HAIR BY MAEVA</h1>
              <p style="color: #C5A059; margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px;">New Client Appointment Request</p>
            </div>

            <div style="background-color: #ffffff; padding: 20px; border: 1px solid #E8DFD5; margin-top: 16px;">
              <h2 style="color: #4E141B; margin: 0 0 12px 0; font-size: 17px;">Appointment Summary</h2>
              <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; color: #6B5B56; width: 40%;">Client Name:</td>
                  <td style="padding: 6px 0; font-weight: bold; color: #4E141B;">${booking.clientName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6B5B56;">Client Phone:</td>
                  <td style="padding: 6px 0; font-weight: bold;"><a href="tel:${booking.clientPhone}" style="color: #4E141B; text-decoration: underline;">${booking.clientPhone}</a></td>
                </tr>
                ${booking.clientEmail ? `
                <tr>
                  <td style="padding: 6px 0; color: #6B5B56;">Client Email:</td>
                  <td style="padding: 6px 0;"><a href="mailto:${booking.clientEmail}" style="color: #4E141B;">${booking.clientEmail}</a></td>
                </tr>
                ` : ""}
                <tr>
                  <td style="padding: 6px 0; color: #6B5B56;">Hairstyle:</td>
                  <td style="padding: 6px 0; font-weight: bold; color: #4E141B;">${booking.serviceName}</td>
                </tr>
                ${booking.selectedLength ? `
                <tr>
                  <td style="padding: 6px 0; color: #6B5B56;">Length Tier:</td>
                  <td style="padding: 6px 0;">${booking.selectedLength}</td>
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
                  <td style="padding: 6px 0; color: #6B5B56;">Total Estimated Price:</td>
                  <td style="padding: 6px 0; font-weight: bold;">$${booking.totalPrice}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6B5B56;">Deposit Required:</td>
                  <td style="padding: 6px 0; font-weight: bold; color: #C5A059; font-size: 15px;">$${booking.depositAmount}</td>
                </tr>
                ${booking.notes ? `
                <tr>
                  <td style="padding: 6px 0; color: #6B5B56;">Notes / Hair Specs:</td>
                  <td style="padding: 6px 0; font-style: italic;">${booking.notes}</td>
                </tr>
                ` : ""}
              </table>
            </div>

            <div style="background-color: #FAF7F2; border: 1px solid #C5A059; padding: 16px; margin-top: 16px;">
              <h3 style="color: #4E141B; margin: 0 0 8px 0; font-size: 14px;">Deposit & Payment Verification</h3>
              <p style="font-size: 12px; margin: 4px 0; color: #2B1E1E;">
                <strong>Unique Booking Reference:</strong> <span style="font-family: monospace; font-size: 14px; color: #4E141B;">${booking.paymentReference || "N/A"}</span>
              </p>
              ${booking.paymentMethod ? `
              <p style="font-size: 12px; margin: 4px 0; color: #2B1E1E;">
                <strong>Payment Channel Selected:</strong> <span style="font-weight: bold; color: #4E141B; background: #FAF7F2; border: 1px solid #C5A059; padding: 2px 6px;">${booking.paymentMethod}</span>
              </p>
              ` : ""}
              ${booking.zelleSenderName ? `
              <p style="font-size: 12px; margin: 4px 0; color: #2B1E1E;">
                <strong>Sender Account Name:</strong> <span style="font-weight: bold; color: #4E141B;">${booking.zelleSenderName}</span>
              </p>
              ` : `
              <p style="font-size: 11px; margin: 4px 0; color: #6B5B56; font-style: italic;">
                Client has not yet submitted their payment account name.
              </p>
              `}
              ${booking.zelleMemo ? `
              <p style="font-size: 12px; margin: 4px 0; color: #2B1E1E;">
                <strong>Client Memo / Note:</strong> ${booking.zelleMemo}
              </p>
              ` : ""}
            </div>

            <div style="margin-top: 20px; font-size: 11px; color: #6B5B56; text-align: center; border-top: 1px solid #E8DFD5; padding-top: 14px;">
              <p style="margin: 2px 0;">Hair By Maeva • 1941 West Huron Street, Chicago, Illinois 60622</p>
              <p style="margin: 2px 0;">Contact: (773) 269-7505 • Maevausa@outlook.com</p>
            </div>
          </div>
        `;

        await resend.emails.send({
          from: "Hair By Maeva Bookings <onboarding@resend.dev>",
          to: salonNotificationEmail,
          subject: `New Booking: ${booking.serviceName} - ${booking.clientName} (${booking.appointmentDate})`,
          html: emailHtml,
        });

        emailSent = true;
      } catch (emailErr) {
        console.warn("Resend email dispatch error:", emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      supabaseSaved,
      emailSent,
    });
  } catch (error) {
    console.error("Booking API error:", error);
    return NextResponse.json(
      { error: "Failed to process booking request" },
      { status: 500 }
    );
  }
}
