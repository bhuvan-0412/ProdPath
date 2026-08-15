import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendMarketingEmail } from '@/lib/email/send';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify calling user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile || !profile.is_admin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { subject, message } = await request.json();

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
    }

    // Fetch opted-in users
    const adminSupabase = createAdminClient();
    const { data: optedInProfiles, error: fetchErr } = await adminSupabase
      .from('profiles')
      .select('email')
      .eq('marketing_opt_in', true);

    if (fetchErr || !optedInProfiles || optedInProfiles.length === 0) {
      return NextResponse.json(
        { error: fetchErr ? fetchErr.message : 'No users have opted into marketing emails.' },
        { status: 400 }
      );
    }

    const recipientEmails = optedInProfiles.map((p) => p.email).filter(Boolean);

    if (recipientEmails.length === 0) {
      return NextResponse.json({ error: 'No valid recipient email addresses found.' }, { status: 400 });
    }

    // Format HTML email message
    const htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333;">
        <h2 style="color: #6d28d9; margin-bottom: 16px;">${subject}</h2>
        <div style="white-space: pre-wrap; font-size: 15px;">${message}</div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #888;">
          You received this email because you opted into updates on ProdPath.
        </p>
      </div>
    `;

    await sendMarketingEmail({
      to: recipientEmails,
      subject,
      htmlContent: htmlBody,
      textContent: message,
    });

    return NextResponse.json({ success: true, count: recipientEmails.length });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error in send-email API route:', error);
    return NextResponse.json({ error: error.message || 'Failed to send emails' }, { status: 500 });
  }
}
