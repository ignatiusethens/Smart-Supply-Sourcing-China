import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL = 'smartsupplysourcing@gmail.com';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

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
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://smart-supply-sourcing-china.vercel.app';

    await resend.emails.send({
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
            <p style="color: #374151; font-size: 15px; margin-top: 0;">
              A new sourcing request has been submitted and requires your review.
            </p>

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
              <a href="${appUrl}/admin/sourcing/${requestId}"
                style="display: inline-block; background: #2563eb; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">
                Review Request →
              </a>
            </div>

            <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; text-align: center;">
              Smart Supply Sourcing · Nairobi, Kenya
            </p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    // Log but don't throw — email failure shouldn't break the request submission
    console.error('Failed to send sourcing notification email:', error);
  }
}
