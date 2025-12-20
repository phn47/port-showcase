import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const generateContent = (title: string, topic: string) => `
# ${title}

In the rapidly evolving landscape of ${topic}, we find ourselves standing at the precipice of a new era. The intersection of technology and creativity has never been more vibrant, more chaotic, or more full of potential.

> "True innovation comes from the willingness to break things that already work."

## The Old Way vs. The New Way

Traditionally, we approached ${topic} with a linear mindset. Step A led to Step B. But today? The path is recursive. It's a loop.

1.  **Iterate**: Never stop moving.
2.  **Adapt**: The market changes daily.
3.  **Overcome**: Challenges are just features in disguise.

### A Code Analogy

Think of it like this javascript snippet:

\`\`\`javascript
const evolution = (state) => {
  if (state === 'stagnant') return 'decay';
  return 'growth';
}
\`\`\`

## Visualizing the Future

Imagine a world where interfaces are not just screens, but extensions of our thought process. That is the promise of modern design systems. We aren't just building pages; we are building environments.

*   **Immersion**: Deep focus modes.
*   **Clarity**: Typography that breathes.
*   **Motion**: Meaningful transitions.

### Key Takeaways

The most successful creators in this space are those who master the art of storytelling. Data is just noise without a narrative.

## Conclusion

So, what will you build tomorrow? The tools are in your hands. The canvas is infinite.
`;

const unsplashImages = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2864&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1614850523060-8da1d56ae167?q=80&w=2940&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?q=80&w=2788&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2940&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2874&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1614851099511-667793d59663?q=80&w=2788&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2940&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=2874&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2940&auto=format&fit=crop'
];

const topics = [
    { title: 'The Silent Revolution of AI', topic: 'Artificial Intelligence' },
    { title: 'Typography as Voice', topic: 'Graphic Design' },
    { title: 'The Death of Flat Design', topic: 'UI Trends' },
    { title: 'Web3: Beyond the Hype', topic: 'Decentralization' },
    { title: 'Mastering n8n Workflows', topic: 'Automation' },
    { title: 'Color Theory in 2025', topic: 'Visual Arts' },
    { title: 'The Psychology of UX', topic: 'User Research' },
    { title: 'React Server Components', topic: 'Web Development' },
    { title: 'Sustainable Digital Products', topic: 'Green Tech' },
    { title: 'The Rise of Digital Brutalism', topic: 'Aesthetics' },
    { title: 'Motion Design Systems', topic: 'Animation' },
    { title: 'Freelancing in a Global Market', topic: 'Career Growth' }
];

async function seedBlog() {
    console.log('🌱 Starting blog seed...');

    // Optional: Clear existing posts to avoid duplicates mixed with new ones
    // console.log('🗑️ Clearing existing posts...');
    // await supabase.from('posts').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    let counter = 0;
    for (const t of topics) {
        const image = unsplashImages[counter % unsplashImages.length];
        const post = {
            title: t.title,
            slug: t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
            excerpt: `Exploring the depths of ${t.topic} and how it shapes our digital landscape in ways we never imagined.`,
            cover_image: image,
            content: generateContent(t.title, t.topic),
            status: 'published',
            seo_title: `${t.title} | 9F Universe`,
            seo_description: `Deep dive into ${t.title} and ${t.topic}.`,
            keywords: [t.topic.toLowerCase(), 'design', 'tech'],
            tags: [t.topic.split(' ')[0], 'Guide'],
            display_order: counter,
            featured: counter === 0
        };

        const { error } = await supabase.from('posts').insert(post);
        if (error) {
            // Ignore unique violation for slug to keep script simple
            if (!error.message.includes('unique constraint')) {
                console.error(`Error inserting ${post.title}:`, error.message);
            }
        } else {
            console.log(`✅ Created: ${post.title}`);
        }
        counter++;
    }
    console.log('🎉 Blog seed completed!');
}

seedBlog();
