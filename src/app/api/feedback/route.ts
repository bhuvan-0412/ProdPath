import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendFeedbackEmail } from '@/lib/email/send';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Please log in to send feedback.' }, { status: 401 });
    }

    const body = await request.json();
    const feedback = body?.feedback?.trim();

    if (!feedback || typeof feedback !== 'string') {
      return NextResponse.json({ error: 'Feedback message is required.' }, { status: 400 });
    }

    if (feedback.length < 10) {
      return NextResponse.json({ error: 'Feedback must be at least 10 characters long.' }, { status: 400 });
    }

    if (feedback.length > 2000) {
      return NextResponse.json({ error: 'Feedback must not exceed 2000 characters.' }, { status: 400 });
    }

    // Fetch user profile info if available
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    const userEmail = user.email || profile?.email || 'Unknown Email';
    const userName = profile?.full_name || user.user_metadata?.full_name || userEmail.split('@')[0] || 'Anonymous User';
    const timestamp = new Date().toISOString();

    await sendFeedbackEmail({
      userEmail,
      userName,
      feedbackText: feedback,
      timestamp,
    });

    return NextResponse.json({ success: true, message: 'Feedback sent successfully.' });
  } catch (err: any) {
    console.error('Feedback API error:', err);
    return NextResponse.json(
      { error: err.message || 'Something went wrong, try again.' },
      { status: 500 }
    );
  }
}
