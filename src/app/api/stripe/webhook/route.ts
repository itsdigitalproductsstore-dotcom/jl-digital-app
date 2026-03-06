import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerSupabaseClient } from '@/utils/supabase/server-data';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  const supabase = await createServerSupabaseClient();
  const { data: settings } = await supabase
    .from('site_settings')
    .select('payment_settings')
    .eq('id', 'default')
    .single();

  const paymentSettings = settings?.payment_settings;

  if (!paymentSettings?.stripe_enabled || !paymentSettings?.stripe_secret_key) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 400 }
    );
  }

  const stripe = new Stripe(paymentSettings.stripe_secret_key);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      paymentSettings.stripe_webhook_secret || ''
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const { error: insertError } = await supabase
      .from('orders')
      .insert({
        stripe_session_id: session.id,
        customer_email: session.customer_email || '',
        customer_name: session.metadata?.customer_name || '',
        customer_phone: session.metadata?.customer_phone || '',
        company_name: session.metadata?.company_name || '',
        service_title: session.metadata?.service_title || '',
        package_type: session.metadata?.package_type || '',
        currency: session.metadata?.currency || 'USD',
        amount: parseFloat(session.metadata?.original_price || '0'),
        status: 'paid',
        payment_method: 'stripe',
      });

    if (insertError) {
      console.error('Failed to save order:', insertError);
    }
  }

  return NextResponse.json({ received: true });
}
