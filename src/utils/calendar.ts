/**
 * Universal Calendar integration for iPhone (iOS Calendar) and Android (Google Calendar).
 * Allows the admin and clients to add bookings directly to their phone calendar app.
 */

export interface CalendarEventDetails {
  title?: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  serviceName: string;
  selectedLength?: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:30 AM"
  depositAmount: number;
  totalPrice: number;
  paymentReference?: string;
  location?: string;
  notes?: string;
}

const DEFAULT_SALON_ADDRESS = "1941 West Huron Street, Chicago, Illinois 60622";

function parseDateTime(dateStr: string, timeStr: string): { start: Date; end: Date } {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();
  let day = now.getDate();

  if (dateStr) {
    const parts = dateStr.split("-").map(Number);
    if (parts.length === 3) {
      year = parts[0];
      month = parts[1] - 1;
      day = parts[2];
    }
  }

  let hours = 10;
  let minutes = 0;

  if (timeStr) {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      const ampm = (match[3] || "").toUpperCase();
      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;
    }
  }

  const start = new Date(year, month, day, hours, minutes, 0);
  // 3-hour appointment duration
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);

  return { start, end };
}

function formatDateToICS(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

/**
 * Generates and triggers download of a standard .ics file.
 * On iPhone / iPad, this automatically prompts to open Apple Calendar.
 */
export function downloadIcsCalendar(event: CalendarEventDetails) {
  const { start, end } = parseDateTime(event.date, event.time);
  const location = event.location || DEFAULT_SALON_ADDRESS;

  const descriptionLines = [
    `Hair Appointment: ${event.serviceName}`,
    event.selectedLength ? `Length: ${event.selectedLength}` : "",
    `Client: ${event.clientName}`,
    `Phone: ${event.clientPhone}`,
    event.clientEmail ? `Email: ${event.clientEmail}` : "",
    `Deposit: $${event.depositAmount}`,
    `Total: $${event.totalPrice}`,
    event.paymentReference ? `Ref Code: ${event.paymentReference}` : "",
    event.notes ? `Notes: ${event.notes}` : "",
    `Salon Address: ${location}`,
  ].filter(Boolean).join("\\n");

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Hair By Maeva//Salon Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:hbm-${Date.now()}-${Math.floor(Math.random() * 10000)}@hairbymaeva.com`,
    `DTSTAMP:${formatDateToICS(new Date())}`,
    `DTSTART:${formatDateToICS(start)}`,
    `DTEND:${formatDateToICS(end)}`,
    `SUMMARY:${event.serviceName} - ${event.clientName}`,
    `DESCRIPTION:${descriptionLines}`,
    `LOCATION:${location}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    `DESCRIPTION:Reminder: Appointment with ${event.clientName} in 2 hours`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `appointment-${event.clientName.toLowerCase().replace(/\s+/g, "-") || "booking"}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates Google Calendar web intent URL.
 * On Android, tapping this directly opens the Google Calendar app with all fields filled.
 */
export function getGoogleCalendarUrl(event: CalendarEventDetails): string {
  const { start, end } = parseDateTime(event.date, event.time);
  const location = event.location || DEFAULT_SALON_ADDRESS;

  const descriptionLines = [
    `Hair Appointment: ${event.serviceName}`,
    event.selectedLength ? `Length: ${event.selectedLength}` : "",
    `Client: ${event.clientName}`,
    `Phone: ${event.clientPhone}`,
    event.clientEmail ? `Email: ${event.clientEmail}` : "",
    `Deposit: $${event.depositAmount}`,
    `Total: $${event.totalPrice}`,
    event.paymentReference ? `Ref Code: ${event.paymentReference}` : "",
    event.notes ? `Notes: ${event.notes}` : "",
    `Salon Address: ${location}`,
  ].filter(Boolean).join("\n");

  const startFormatted = formatDateToICS(start);
  const endFormatted = formatDateToICS(end);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${event.serviceName} - ${event.clientName}`,
    dates: `${startFormatted}/${endFormatted}`,
    details: descriptionLines,
    location: location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
