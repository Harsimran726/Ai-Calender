import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getReminders, getClasses, getDemoClasses, getUsers } from '@/lib/store';

export async function GET(request: Request) {
  // Verify Cron / Worker Auth Header
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const processedReminders = [];

  const supabase = await createServerSupabaseClient();

  if (supabase) {
    // 1. Fetch pending reminders due to be sent from Supabase
    const { data: pending, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('sent', false)
      .lte('send_at', now.toISOString());

    if (!error && pending && pending.length > 0) {
      for (const reminder of pending) {
        // Dispatch Email / Push Notification logic here
        console.log(`[PRODUCTION CRON] Processing reminder ID: ${reminder.id} for event ${reminder.event_id}`);

        // Mark as sent in DB
        await supabase
          .from('reminders')
          .update({ sent: true })
          .eq('id', reminder.id);

        processedReminders.push(reminder);
      }
    }
  } else {
    // In-memory store processing for fallback mode
    const pending = getReminders().filter((r) => !r.sent && new Date(r.send_at) <= now);
    for (const r of pending) {
      r.sent = true;
      processedReminders.push(r);
    }
  }

  return NextResponse.json({
    status: 'success',
    timestamp: now.toISOString(),
    processed_count: processedReminders.length,
    processed: processedReminders
  });
}
