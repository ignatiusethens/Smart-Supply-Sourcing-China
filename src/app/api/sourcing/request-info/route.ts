import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  'https://smart-supply-sourcing-china.vercel.app';

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.success) return auth.response;

  try {
    const { requestId, buyerEmail, buyerName, message, itemDescription } =
      await request.json();

    if (!buyerEmail || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to: buyerEmail,
      subject: `Additional Information Required — Your Sourcing Request`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9fafb; border-radius: 8px;">
          <div style="background: #1e3a5f; padding: 20px 24px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Additional Information Required</h1>
            <p style="color: #93c5fd; margin: 4px 0 0; font-size: 14px;">SmartSupplySourcingChina.com</p>
          </div>
          <div style="background: white; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="color: #374151; font-size: 15px; margin-top: 0;">Hi <strong>${buyerName}</strong>,</p>
            <p style="color: #374151; font-size: 15px;">Our team is reviewing your sourcing request for <strong>${itemDescription}</strong> and needs some additional information before we can proceed.</p>

            <div style="background: #f0f9ff; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <p style="color: #1e40af; font-size: 14px; font-weight: 600; margin: 0 0 8px;">Message from our team:</p>
              <p style="color: #1e3a5f; font-size: 14px; margin: 0; white-space: pre-line;">${message}</p>
            </div>

            <p style="color: #374151; font-size: 14px;">Please reply to this email with the requested information, or submit a new sourcing request with the updated details.</p>

            <div style="margin-top: 24px; text-align: center;">
              <a href="${APP_URL}/sourcing/request" style="display: inline-block; background: #2563eb; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">Update Your Request →</a>
            </div>

            <p style="color: #6b7280; font-size: 13px; margin-top: 20px;">Questions? Reply to this email or contact us at <a href="mailto:smartsupplysourcing@gmail.com" style="color: #2563eb;">smartsupplysourcing@gmail.com</a></p>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; text-align: center;">SmartSupplySourcingChina.com · Nairobi, Kenya</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: 'Email sent to buyer' });
  } catch (error) {
    console.error('Error sending more info request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
