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
