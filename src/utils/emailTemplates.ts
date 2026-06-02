/**
 * Utility for generating highly polished, responsive HTML email templates for SA Consultant & Staffing.
 * Uses inline styling compatible with modern email clients (Gmail, Outlook, Apple Mail, etc.).
 */

const baseStyles = `
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  line-height: 1.6;
  color: #1e293b;
  background-color: #f8fafc;
  margin: 0;
  padding: 0;
`;

const getEmailWrapper = (content: string) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Notification</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;850&display=swap');
        @media only screen and (max-width: 600px) {
          .container { width: 100% !important; padding: 20px !important; }
          .slot-card { flex-direction: column !important; align-items: start !important; }
        }
      </style>
    </head>
    <body style="${baseStyles}">
      <div style="max-width: 600px; margin: 40px auto; padding: 32px; background-color: #ffffff; border-radius: 24px; border: 1px border-box solid #f1f5f9; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05);" class="container">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #4f46e5, #06b6d4); padding: 12px 24px; border-radius: 16px; margin-bottom: 16px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.1);">
            <span style="font-weight: 850; font-size: 20px; color: #ffffff; letter-spacing: -0.025em; text-transform: uppercase;">SA Consultant</span>
          </div>
          <p style="color: #64748b; font-size: 14px; font-weight: 500; margin: 0; text-transform: uppercase; letter-spacing: 0.1em;">Appointment System</p>
        </div>

        <!-- Content -->
        ${content}

        <!-- Footer -->
        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #f1f5f9; text-align: center;">
          <p style="color: #64748b; font-size: 13px; margin: 0 0 8px 0;">This is an automated email from SA Consultant & Staffing.</p>
          <p style="color: #94a3b8; font-size: 11px; margin: 0;">© 2026 SA Consultant and Staffing. All rights reserved. New Jersey, USA.</p>
        </div>
      </div>
    </body>
  </html>
`;

/**
 * Helper to generate a Google Calendar template URL for a given preferred slot.
 * Uses the America/New_York timezone to match the "(EST)" label on appointments,
 * and extracts local date parameters to prevent timezone shift bugs.
 */
const getGoogleCalendarUrl = (clientName: string, service: string, slot: { date: Date; time: string }) => {
  const d = new Date(slot.date);
  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();
  
  // Determine hours (default 10 AM)
  let startHour = 10;
  if (slot.time.includes('12:00 PM')) {
    startHour = 12;
  } else if (slot.time.includes('2:00 PM')) {
    startHour = 14;
  } else if (slot.time.includes('10:00 AM')) {
    startHour = 10;
  }
  
  const endHour = startHour + 1;

  // Helper to format Date to YYYYMMDDTHHMMSS format (no Z at the end, so we can specify ctz)
  const formatLocalGCalDate = (yr: number, mo: number, dy: number, hr: number) => {
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${yr}${pad(mo + 1)}${pad(dy)}T${pad(hr)}0000`;
  };

  const startStr = formatLocalGCalDate(year, month, day, startHour);
  const endStr = formatLocalGCalDate(year, month, day, endHour);

  const eventTitle = encodeURIComponent(`Consultation: ${clientName} - ${service || 'SA Staffing'}`);
  const eventDates = encodeURIComponent(`${startStr}/${endStr}`);
  const eventDetails = encodeURIComponent(`Consultation meeting with ${clientName} regarding ${service || 'requested services'}.\n\nClient Details:\n- Name: ${clientName}\n- Booked via SA Consultant & Staffing.`);
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${eventDates}&ctz=America/New_York&details=${eventDetails}`;
};

/**
 * Generates HTML for the email sent to the Administrator
 */
export const getAdminBookingEmailHtml = (
  clientName: string,
  clientEmail: string,
  clientPhone: string,
  clientService: string,
  clientMessage: string,
  slots: { date: Date; time: string }[]
) => {
  const formattedSlots = slots.map((slot, index) => `
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px 20px; border-radius: 16px; margin-bottom: 12px;" class="slot-card">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
        <span style="background-color: #e0e7ff; color: #4f46e5; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0;">${index + 1}</span>
        <div>
          <p style="font-size: 14px; font-weight: 600; color: #0f172a; margin: 0;">${slot.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
          <p style="font-size: 12px; color: #64748b; margin: 2px 0 0 0; display: flex; align-items: center; gap: 4px;">⏰ ${slot.time}</p>
        </div>
      </div>
      <div style="margin-left: 40px;">
        <a href="${getGoogleCalendarUrl(clientName, clientService, slot)}" target="_blank" style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 8px 16px; font-size: 12px; font-weight: 700; text-decoration: none; border-radius: 10px; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.1);">📅 Add to Calendar</a>
      </div>
    </div>
  `).join('');

  const content = `
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0; letter-spacing: -0.025em; text-align: center;">New Booking Request Received</h1>
      <p style="font-size: 16px; color: #475569; text-align: center; margin: 0;">A client has requested a consultation meeting.</p>
    </div>

    <!-- Client Info Card -->
    <div style="background-color: #f8fafc; border-radius: 20px; padding: 24px; border: 1px solid #e2e8f0; margin-bottom: 32px;">
      <h3 style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #4f46e5; margin: 0 0 16px 0; letter-spacing: 0.05em;">Client Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; font-size: 14px; color: #64748b; width: 100px;">Name</td>
          <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #0f172a;">${clientName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 14px; color: #64748b;">Email</td>
          <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #0f172a;"><a href="mailto:${clientEmail}" style="color: #4f46e5; text-decoration: none;">${clientEmail}</a></td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 14px; color: #64748b;">Phone</td>
          <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #0f172a;"><a href="tel:${clientPhone}" style="color: #4f46e5; text-decoration: none;">${clientPhone}</a></td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 14px; color: #64748b;">Service</td>
          <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #0f172a;">${clientService || 'Not specified'}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 14px; color: #64748b; vertical-align: top;">Message</td>
          <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #0f172a;">${clientMessage ? clientMessage.replace(/\n/g, '<br>') : 'None'}</td>
        </tr>
      </table>
    </div>

    <!-- Selected Slots -->
    <div style="margin-bottom: 32px;">
      <h3 style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #0f172a; margin: 0 0 16px 0; letter-spacing: 0.05em;">Preferred Slots</h3>
      ${formattedSlots}
    </div>

  `;

  return getEmailWrapper(content);
};

/**
 * Generates HTML for the email confirmation sent to the Client
 */
export const getClientBookingEmailHtml = (
  clientName: string,
  slots: { date: Date; time: string }[]
) => {
  const formattedSlots = slots.map((slot, index) => `
    <div style="display: flex; align-items: center; gap: 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 14px 20px; border-radius: 16px; margin-bottom: 12px;" class="slot-card">
      <span style="background-color: #ecfeff; color: #0891b2; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0;">${index + 1}</span>
      <div>
        <p style="font-size: 14px; font-weight: 600; color: #0f172a; margin: 0;">${slot.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
        <p style="font-size: 12px; color: #64748b; margin: 2px 0 0 0;">⏰ ${slot.time}</p>
      </div>
    </div>
  `).join('');

  const content = `
    <div style="margin-bottom: 28px; text-align: center;">
      <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0; letter-spacing: -0.025em;">Booking Request Placed!</h1>
      <p style="font-size: 16px; color: #475569; margin: 0;">Hi ${clientName}, thank you for choosing SA Consultant.</p>
    </div>

    <div style="background-color: #ecfeff; border: 1px solid #c5f2f7; border-radius: 20px; padding: 20px; text-align: center; margin-bottom: 32px;">
      <p style="font-size: 14px; font-weight: 550; color: #0891b2; margin: 0;">🤝 We have successfully registered your preferred meeting slots. An SA Consultant and Staffing member will contact you through email to finalize your appointment.</p>
    </div>

    <!-- Selected Slots -->
    <div style="margin-bottom: 32px;">
      <h3 style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #0f172a; margin: 0 0 16px 0; letter-spacing: 0.05em;">Your Preferred Slots</h3>
      ${formattedSlots}
    </div>

  `;

  return getEmailWrapper(content);
};
