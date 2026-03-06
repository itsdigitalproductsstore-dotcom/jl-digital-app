import { createClient } from "@supabase/supabase-js";
import { services } from "../src/data/services";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// We need SUPABASE_SERVICE_ROLE_KEY to bypass RLS, or we can use anon key if RLS allows insert?
// If anon key doesn't allow insert without auth, we might need a workaround.
// Let's assume anon key allows insert for now or we will get an error.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(url, key);

async function seed() {
    console.log("Seeding services...");
    let order = 1;
    for (const s of services) {
        const { error } = await supabase.from('services').insert({
            slug: s.slug,
            title: s.title,
            title_ar: s.titleAr,
            subtitle: s.subtitle,
            subtitle_ar: s.subtitleAr,
            description: s.description,
            description_ar: s.descriptionAr,
            features: s.features,
            features_ar: s.featuresAr,
            pricing_basic: s.pricing.basic,
            pricing_pro: s.pricing.pro,
            pricing_enterprise: s.pricing.enterprise,
            timeline: s.timeline,
            timeline_ar: s.timelineAr,
            icon: s.icon,
            is_active: true,
            order: order++
        });

        if (error) {
            console.error(`Error inserting ${s.title}:`, error.message);
        } else {
            console.log(`Inserted ${s.title}`);
        }
    }
    console.log("Seeding finished.");
}

seed().catch(console.error);
