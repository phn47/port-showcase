import { createClient } from '@supabase/supabase-js';
import type { CreateServiceRequest } from '../src/services/api/types';

// Initialize Supabase client with SERVICE ROLE key for admin operations
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables');
    console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY are set in your .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Services data extracted from Services.tsx component
const servicesData: CreateServiceRequest[] = [
    {
        name: 'Web3 Development',
        slug: 'web3-development',
        description: 'Building decentralized applications and smart contracts for the Web3 ecosystem',
        image_url: 'https://i.ibb.co/Jw3g2Fj8/96-result.webp',
        display_order: 1,
        status: 'published',
        metadata: {}
    },
    {
        name: 'Motion Art',
        slug: 'motion-art',
        description: 'Creating dynamic animations and motion graphics for digital experiences',
        image_url: 'https://res.cloudinary.com/dpcmdnqbb/video/upload/v1765940924/2_kzi0sr.mp4',
        display_order: 2,
        status: 'published',
        metadata: {}
    },
    {
        name: 'Web Portfolio',
        slug: 'web-portfolio',
        description: 'Designing and developing stunning portfolio websites',
        image_url: 'https://i.ibb.co/8gkWvpXG/70-result.webp',
        display_order: 3,
        status: 'published',
        metadata: {}
    },
    {
        name: 'Brand Pages',
        slug: 'brand-pages',
        description: 'Creating impactful brand landing pages and digital experiences',
        image_url: 'https://i.ibb.co/kkHmfFq/ver-1-result.webp',
        display_order: 4,
        status: 'published',
        metadata: {}
    },
    {
        name: 'Web Funnels',
        slug: 'web-funnels',
        description: 'Building conversion-optimized sales funnels and marketing pages',
        image_url: 'https://i.ibb.co/fdysG9wd/221rr-banner-result.webp',
        display_order: 5,
        status: 'published',
        metadata: {}
    }
];

async function seedServices() {
    console.log('🌱 Starting services seed...\n');

    try {
        // Check if services already exist
        const { data: existingServices, error: checkError } = await supabase
            .from('services')
            .select('id, name');

        if (checkError) {
            throw new Error(`Failed to check existing services: ${checkError.message}`);
        }

        if (existingServices && existingServices.length > 0) {
            console.log('⚠️  Services already exist:');
            existingServices.forEach(service => console.log(`   - ${service.name}`));
            console.log('\n❓ Do you want to delete existing services and re-seed? (y/n)');
            console.log('   Run with --force flag to skip this prompt\n');

            if (!process.argv.includes('--force')) {
                console.log('ℹ️  Skipping seed. Use --force flag to override.');
                return;
            }

            // Delete existing services
            console.log('🗑️  Deleting existing services...');
            const { error: deleteError } = await supabase
                .from('services')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

            if (deleteError) {
                throw new Error(`Failed to delete existing services: ${deleteError.message}`);
            }
            console.log('✅ Existing services deleted\n');
        }

        // Insert services
        console.log('📝 Inserting services...\n');

        for (const service of servicesData) {
            const { data, error } = await supabase
                .from('services')
                .insert(service)
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to insert "${service.name}": ${error.message}`);
            }

            console.log(`✅ Created: ${service.name} (${service.slug})`);
        }

        console.log('\n🎉 Services seed completed successfully!');
        console.log(`📊 Total services created: ${servicesData.length}\n`);
        console.log('🔗 View in admin: /admin/settings\n');
        console.log('🌐 View on frontend: /#services\n');

    } catch (error) {
        console.error('\n❌ Seed failed:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

// Run the seed
seedServices();
