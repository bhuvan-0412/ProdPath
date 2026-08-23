import { NextResponse } from 'next/server';
import { createClient, isSupabaseConfiguredServer } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (!isSupabaseConfiguredServer()) {
    return NextResponse.redirect(`${origin}/login?error=Authentication%20not%20configured`);
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();

          if (!existingProfile) {
            await supabase.from('profiles').insert({
              id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
              is_admin: false,
              marketing_opt_in: false,
              has_seen_opt_in: false,
            });
          }
        }
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch (err) {
      console.error('Error during auth code exchange:', err);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could%20not%20authenticate%20user`);
}
