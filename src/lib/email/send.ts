import { Resend } from 'resend';

export async function sendMarketingEmail({
  to,
  subject,
  htmlContent,
  textContent,
}: {
  to: string[];
  subject: string;
  htmlContent: string;
  textContent?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not defined.');
  }

  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send({
    from: 'ProdPath <onboarding@resend.dev>',
    to,
    subject,
    html: htmlContent,
    text: textContent || htmlContent.replace(/<[^>]*>?/gm, ''),
  });

  if (error) {
    throw new Error(`Resend API Error: ${error.message}`);
  }

  return data;
}

export async function sendFeedbackEmail({
  userEmail,
  userName,
  feedbackText,
  timestamp,
}: {
  userEmail: string;
  userName: string;
  feedbackText: string;
  timestamp: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.FEEDBACK_RECIPIENT_EMAIL;

  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not defined.');
  }

  if (!recipient) {
    throw new Error('FEEDBACK_RECIPIENT_EMAIL environment variable is not defined.');
  }

  const resend = new Resend(apiKey);

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #18181b; background-color: #ffffff; border-radius: 16px; border: 1px solid #e4e4e7;">
      <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #7c3aed;">
        <h2 style="margin: 0; color: #6d28d9; font-size: 20px; font-weight: 700;">ProdPath User Feedback</h2>
        <p style="margin: 4px 0 0 0; color: #71717a; font-size: 13px;">Received via ProdPath Feedback Portal</p>
      </div>

      <div style="margin-bottom: 20px; font-size: 14px; line-height: 1.6;">
        <p style="margin: 4px 0;"><strong>User Name:</strong> ${userName}</p>
        <p style="margin: 4px 0;"><strong>User Email:</strong> <a href="mailto:${userEmail}" style="color: #6d28d9;">${userEmail}</a></p>
        <p style="margin: 4px 0;"><strong>Timestamp:</strong> ${new Date(timestamp).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'long' })}</p>
      </div>

      <div style="background-color: #f4f4f5; border-left: 4px solid #7c3aed; padding: 16px; border-radius: 8px; font-size: 14px; line-height: 1.6; color: #27272a; white-space: pre-wrap;">${feedbackText}</div>

      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e4e4e7; font-size: 11px; color: #a1a1aa; text-align: center;">
        ProdPath Learning Platform &bull; Automated Feedback Mailer
      </div>
    </div>
  `;

  const { data, error } = await resend.emails.send({
    from: 'ProdPath Feedback <onboarding@resend.dev>',
    to: [recipient],
    replyTo: userEmail,
    subject: `[ProdPath Feedback] New feedback from ${userName}`,
    html: htmlContent,
    text: `Feedback from ${userName} (${userEmail}) at ${timestamp}:\n\n${feedbackText}`,
  });

  if (error) {
    throw new Error(`Resend API Error: ${error.message}`);
  }

  return data;
}
