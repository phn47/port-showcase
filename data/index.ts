
import { animatedStickers } from './animatedStickers';
import { animations } from './animations';
import { banners } from './banners';
import { comics } from './comics';
import { gifs } from './gifs';
import { socialMedia } from './socialMedia';
import { illustrations } from './illustrations';
import { logos } from './logos';
import { memes } from './memes';
import { nfts } from './nfts';
import { stickers } from './stickers';

// Combine all raw assets
const allRawAssets = [
  ...animatedStickers,
  ...animations,
  ...banners,
  ...comics,
  ...gifs,
  ...socialMedia,
  ...illustrations,
  ...logos,
  ...memes,
  ...nfts,
  ...stickers
];

// Helper to format ID into a nice title
const formatTitle = (id: string) => {
  return id
    .replace(/-/g, ' ')
    .replace(/\d+/g, '') // Remove numbers if you want cleaner titles, or keep them
    .trim()
    .toUpperCase();
};

// Map to GalleryItem interface expected by the component
export const galleryData = allRawAssets.map(asset => {
  // Determine contain vs cover based on category or explicit flag
  // Logos, Stickers, NFTs, and Memes usually look better contained
  const shouldContain = 
    (asset as any).contain === true || 
    ['Logo', 'Sticker', 'Animated Sticker', 'NFT', 'Meme', 'GIF', 'Animation'].includes(asset.category);

  return {
    id: asset.id,
    src: asset.image_url,
    title: formatTitle(asset.id), // Use the ID as the base for the title
    category: asset.category,
    contain: shouldContain,
    tags: (asset as any).tags, // Pass tags through for filtering
    // Additional metadata for detail view
    description: asset.alt_text || 'No description available.',
    dimensions: asset.dimensions ? `${asset.dimensions.width}x${asset.dimensions.height}` : 'Unknown',
    fileSize: asset.fileSize || 'Unknown',
    format: asset.format || 'Unknown'
  };
});
