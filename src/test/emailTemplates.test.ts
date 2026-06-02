import { describe, it, expect } from "vitest";
import { getAdminBookingEmailHtml } from "../utils/emailTemplates";

describe("Email Templates - Google Calendar Integration", () => {
  it("should generate GCal URLs with correct local dates and Eastern timezone parameters", () => {
    // Construct a Date object for June 4, 2026.
    // In many local timezones (e.g. Asia/Kolkata), this date object's UTC value will represent June 3.
    // Our code extracts the local year/month/day parts to preserve the date selection.
    const selectedDate = new Date(2026, 5, 4); // June is month index 5 (0-indexed)
    
    const slots = [
      { date: selectedDate, time: "10:00 AM (EST)" },
      { date: selectedDate, time: "12:00 PM (EST)" },
      { date: selectedDate, time: "2:00 PM (EST)" }
    ];

    const html = getAdminBookingEmailHtml(
      "John Doe",
      "john@example.com",
      "123-456-7890",
      "Digital Marketing",
      "Hello world",
      slots
    );

    // Verify first slot (10:00 AM EST -> 10:00:00 local time America/New_York)
    expect(html).toContain("dates=20260604T100000%2F20260604T110000");
    expect(html).toContain("ctz=America/New_York");

    // Verify second slot (12:00 PM EST -> 12:00:00 local time America/New_York)
    expect(html).toContain("dates=20260604T120000%2F20260604T130000");

    // Verify third slot (2:00 PM EST -> 14:00:00 local time America/New_York)
    expect(html).toContain("dates=20260604T140000%2F20260604T150000");
  });
});
