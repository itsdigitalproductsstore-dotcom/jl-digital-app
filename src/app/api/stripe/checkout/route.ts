import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerSupabaseClient } from '@/utils/supabase/server-data';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      serviceTitle,
      serviceTitleAr,
      packageType,
      price,
      currency,
      customerName,
      customerEmail,
      customerPhone,
      companyName
    } = body;

    const supabase = await createServerSupabaseClient();
    const { data: settings } = await supabase
      .from('site_settings')
      .select('payment_settings')
      .eq('id', 'default')
      .single();

    const paymentSettings = settings?.payment_settings;

    if (!paymentSettings?.stripe_enabled || !paymentSettings?.stripe_secret_key || typeof paymentSettings.stripe_secret_key !== 'string') {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 400 }
      );
    }

    // Ensure the key looks like a Stripe secret key
    if (!paymentSettings.stripe_secret_key.startsWith('sk_')) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 400 }
      );
    }

    const stripe = new Stripe(paymentSettings.stripe_secret_key);

    const currencyMap: Record<string, string> = {
      OMR: 'omr',
      SAR: 'sar',
      USD: 'usd',
      AED: 'aed',
    };

    const stripeCurrency = currencyMap[currency] || 'usd';
    const amountInSmallestUnit = Math.round(Number(price) * (stripeCurrency === 'omr' ? 1000 : 100)); // OMR has 3 decimal places

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: stripeCurrency,
            product_data: {
              name: `${serviceTitle} - ${packageType.toUpperCase()}`,
              description: `${serviceTitleAr} - ${packageType.toUpperCase()}`,
            },
            unit_amount: amountInSmallestUnit,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: customerEmail,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout?step=4&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout?cancelled=true`,
      metadata: {
        service_title: serviceTitle,
        package_type: packageType,
        customer_name: customerName,
        customer_phone: customerPhone || '',
        company_name: companyName || '',
        currency: currency,
        original_price: price.toString(),
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
