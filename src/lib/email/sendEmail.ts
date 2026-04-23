import { Resend } from 'resend';

// Lazy initialization — avoids crash during build when env var is missing
function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key || key === 're_your_api_key_here') return null;
  return new Resend(key);
}

const ADMIN_EMAIL = 'smartsupplysourcing@gmail.com';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  'https://smart-supply-sourcing-china.vercel.app';

export async function sendSourcingRequestNotification({
  buyerName,
  buyerEmail,
  itemDescription,
  quantity,
  deliveryLocation,
  timeline,
  requestId,
}: {
  buyerName: string;
  buyerEmail: string;
  itemDescription: string;
  quantity: number;
  deliveryLocation: string;
  timeline: string;
  requestId: string;
}) {
  try {
    await getResend()?.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New Sourcing Request from ${buyerName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9fafb; border-radius: 8px;">
          <div style="background: #1e3a5f; padding: 20px 24px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">New Sourcing Request</h1>
            <p style="color: #93c5fd; margin: 4px 0 0; font-size: 14px;">Smart Supply Sourcing Platform</p>
          </div>
          <div style="background: white; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="color: #374151; font-size: 15px; margin-top: 0;">A new sourcing request has been submitted and requires your review.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 10px 0; color: #6b7280; font-size: 13px; width: 40%;">Buyer Name</td>
                <td style="padding: 10px 0; color: #111827; font-size: 13px; font-weight: 600;">${buyerName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 10px 0; color: #6b7280; font-size: 13px;">Buyer Email</td>
                <td style="padding: 10px 0; color: #111827; font-size: 13px;">${buyerEmail}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 10px 0; color: #6b7280; font-size: 13px;">Item Description</td>
                <td style="padding: 10px 0; color: #111827; font-size: 13px; font-weight: 600;">${itemDescription}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 10px 0; color: #6b7280; font-size: 13px;">Quantity</td>
                <td style="padding: 10px 0; color: #111827; font-size: 13px;">${quantity} units</td>
              </tr>
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 10px 0; color: #6b7280; font-size: 13px;">Delivery Location</td>
                <td style="padding: 10px 0; color: #111827; font-size: 13px;">${deliveryLocation || 'Not specified'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280; font-size: 13px;">Timeline</td>
                <td style="padding: 10px 0; color: #111827; font-size: 13px;">${timeline || 'Not specified'}</td>
              </tr>
            </table>
            <div style="margin-top: 24px; text-align: center;">
              <a href="${APP_URL}/admin/sourcing/${requestId}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">Review Request →</a>
            </div>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; text-align: center;">Smart Supply Sourcing · Nairobi, Kenya</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send sourcing notification email:', error);
  }
}

export async function sendQuoteNotificationToBuyer({
  buyerName,
  buyerEmail,
  buyerPhone,
  itemDescription,
  totalAmount,
  quoteId,
  invoiceNumber,
}: {
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  itemDescription: string;
  totalAmount: number;
  quoteId: string;
  invoiceNumber: string;
}) {
  const quoteUrl = `${APP_URL}/sourcing/quote/${quoteId}`;
  const formattedAmount = `KES ${totalAmount.toLocaleString()}`;

  // ── Email to buyer ──────────────────────────────────────────────────────────
  try {
    await getResend()?.emails.send({
      from: FROM_EMAIL,
      to: buyerEmail,
      subject: `Your Quote is Ready — ${invoiceNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9fafb; border-radius: 8px;">
          <div style="background: #1e3a5f; padding: 20px 24px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Your Quote is Ready</h1>
            <p style="color: #93c5fd; margin: 4px 0 0; font-size: 14px;">SmartSupplySourcingChina.com</p>
          </div>
          <div style="background: white; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="color: #374151; font-size: 15px; margin-top: 0;">Hi <strong>${buyerName}</strong>,</p>
            <p style="color: #374151; font-size: 15px;">Your sourcing request has been reviewed and a pro-forma invoice has been prepared for you.</p>

            <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #e0f2fe;">
                  <td style="padding: 8px 0; color: #0369a1; font-size: 13px;">Invoice Number</td>
                  <td style="padding: 8px 0; color: #0c4a6e; font-size: 13px; font-weight: 700;">${invoiceNumber}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e0f2fe;">
                  <td style="padding: 8px 0; color: #0369a1; font-size: 13px;">Items</td>
                  <td style="padding: 8px 0; color: #0c4a6e; font-size: 13px;">${itemDescription}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #0369a1; font-size: 13px;">Total Amount</td>
                  <td style="padding: 8px 0; color: #0c4a6e; font-size: 16px; font-weight: 900;">${formattedAmount}</td>
                </tr>
              </table>
            </div>

            <p style="color: #374151; font-size: 14px;">You can pay via <strong>M-Pesa</strong> (instant) or <strong>Bank Transfer</strong> (1-3 business days).</p>

            <div style="margin-top: 24px; text-align: center;">
              <a href="${quoteUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: 700;">View Quote &amp; Pay →</a>
            </div>

            <p style="color: #6b7280; font-size: 13px; margin-top: 20px;">This quote is valid for 7 days. If you have any questions, reply to this email or contact us at <a href="mailto:smartsupplysourcing@gmail.com" style="color: #2563eb;">smartsupplysourcing@gmail.com</a></p>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; text-align: center;">SmartSupplySourcingChina.com · Nairobi, Kenya</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send quote email to buyer:', error);
  }

  // ── WhatsApp message to buyer (via wa.me link logged for manual send or Twilio) ──
  if (buyerPhone) {
    const whatsappMessage = encodeURIComponent(
      `Hello ${buyerName},\n\nYour sourcing quote is ready on SmartSupplySourcingChina.com!\n\n` +
        `📋 Invoice: ${invoiceNumber}\n` +
        `💰 Total: ${formattedAmount}\n\n` +
        `Click the link below to view your quote and proceed with payment:\n${quoteUrl}\n\n` +
        `Payment options: M-Pesa (instant) or Bank Transfer.\n\n` +
        `Questions? Reply to this message or email smartsupplysourcing@gmail.com`
    );

    // Clean phone number — remove spaces, dashes, ensure it starts with country code
    const cleanPhone = buyerPhone
      .replace(/[\s\-\(\)]/g, '')
      .replace(/^0/, '254');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${whatsappMessage}`;

    // Log the WhatsApp URL — admin can click it to send manually
    // Or integrate Twilio WhatsApp API here with process.env.TWILIO_* credentials
    console.log(`WhatsApp notification URL for ${buyerName}: ${whatsappUrl}`);

    // Also email the WhatsApp link to admin so they can send it
    try {
      await getResend()?.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `Send WhatsApp to ${buyerName} — Quote ${invoiceNumber} Ready`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #1e3a5f;">Quote Ready — Send WhatsApp to Buyer</h2>
            <p>Invoice <strong>${invoiceNumber}</strong> has been generated for <strong>${buyerName}</strong> (${buyerEmail}).</p>
            <p>Total: <strong>${formattedAmount}</strong></p>
            <p>Click the button below to send the WhatsApp notification to the buyer:</p>
            <div style="margin: 24px 0; text-align: center;">
              <a href="${whatsappUrl}" style="display: inline-block; background: #25d366; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: 700;">📱 Send WhatsApp to ${buyerName}</a>
            </div>
            <p style="color: #6b7280; font-size: 13px;">Buyer phone: ${buyerPhone}</p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Failed to send WhatsApp link email to admin:', error);
    }
  }
}
