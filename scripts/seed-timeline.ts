import { createClient } from '@supabase/supabase-js';
import type { CreateTimelineEntryRequest } from '../src/services/api/types';

// Initialize Supabase client with SERVICE ROLE key for admin operations
// This bypasses RLS policies which is necessary for seeding
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables');
    console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY are set in your .env file');
    console.error('Note: Using VITE_SUPABASE_ANON_KEY will fail due to RLS policies');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Timeline data extracted from Timeline.tsx component
const timelineData: CreateTimelineEntryRequest[] = [
    {
        date_label: '2021 – 2022',
        title: 'Undoxxed Artist',
        body: 'Started as an anonymous artist in Web3.',
        media_url: 'https://i.ibb.co/Nnm4zpRb/92-result.webp',
        media_alt: '2021',
        display_order: 1,
        status: 'published',
        metadata: {
            alignment: 'left',
            imageStyle: 'grayscale contrast-125'
        }
    },
    {
        date_label: '2023 – 2024',
        title: '9F Studio Art',
        body: 'Founded 9F Studio, built a 50+ artist team, and expanded into NFTs, memecoins, animation, and branding.',
        media_url: 'https://i.ibb.co/WT9hk4k/ghensin-5-result.webp',
        media_alt: 'Studio',
        display_order: 2,
        status: 'published',
        metadata: {
            alignment: 'right',
            hasOverlay: true,
            overlayText: 'ART'
        }
    },
    {
        date_label: '2025',
        title: '9F Holding',
        body: 'Evolved into 9F Holding, developing Website Funnels, Development, UI/UX for Web3.',
        media_url: 'https://i.ibb.co/rfyV3KKs/38-result.webp',
        media_alt: '2025 Base',
        display_order: 3,
        status: 'published',
        metadata: {
            alignment: 'left',
            imageStyle: 'grayscale contrast-125',
            hasHoverImage: true,
            hoverImageUrl: 'https://i.ibb.co/8JHdSHh/74-result.webp'
        }
    },
    {
        date_label: 'Coming Soon...',
        title: 'FUTURE',
        body: 'Launching 9F Dev and 9F Chain soon.',
        display_order: 4,
        status: 'published',
        metadata: {
            alignment: 'center',
            isOutline: true
        }
    }
];

async function seedTimeline() {
    console.log('🌱 Starting timeline seed...\n');

    try {
        // Check if timeline entries already exist
        const { data: existingEntries, error: checkError } = await supabase
            .from('timeline_entries')
            .select('id, title');

        if (checkError) {
            throw new Error(`Failed to check existing entries: ${checkError.message}`);
        }

        if (existingEntries && existingEntries.length > 0) {
            console.log('⚠️  Timeline entries already exist:');
            existingEntries.forEach(entry => console.log(`   - ${entry.title}`));
            console.log('\n❓ Do you want to delete existing entries and re-seed? (y/n)');
            console.log('   Run with --force flag to skip this prompt\n');

            // For now, we'll skip if entries exist
            // You can add readline logic here if needed
            if (!process.argv.includes('--force')) {
                console.log('ℹ️  Skipping seed. Use --force flag to override.');
                return;
            }

            // Delete existing entries
            console.log('🗑️  Deleting existing entries...');
            const { error: deleteError } = await supabase
                .from('timeline_entries')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

            if (deleteError) {
                throw new Error(`Failed to delete existing entries: ${deleteError.message}`);
            }
            console.log('✅ Existing entries deleted\n');
        }

        // Insert timeline entries
        console.log('📝 Inserting timeline entries...\n');

        for (const entry of timelineData) {
            const { data, error } = await supabase
                .from('timeline_entries')
                .insert(entry)
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to insert "${entry.title}": ${error.message}`);
            }

            console.log(`✅ Created: ${entry.title} (${entry.date_label})`);
        }

        console.log('\n🎉 Timeline seed completed successfully!');
        console.log(`📊 Total entries created: ${timelineData.length}\n`);
        console.log('🔗 View in admin: /admin/timeline\n');

    } catch (error) {
        console.error('\n❌ Seed failed:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

// Run the seed
seedTimeline();
