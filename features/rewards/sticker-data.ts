import { StickerCategory } from '@/types/sticker';

/**
 * A sticker definition without the earnedAt timestamp.
 * The earnedAt field is added when a sticker is awarded.
 */
export interface StickerDefinition {
  id: string;
  name: string;
  category: StickerCategory;
  emoji: string;
}

/**
 * All available stickers across 5 categories (at least 5 per category).
 */
export const ALL_STICKERS: StickerDefinition[] = [
  // Animals (6 stickers)
  { id: 'animal-cat', name: 'Cat', category: 'animals', emoji: '🐱' },
  { id: 'animal-dog', name: 'Dog', category: 'animals', emoji: '🐶' },
  { id: 'animal-bunny', name: 'Bunny', category: 'animals', emoji: '🐰' },
  { id: 'animal-fox', name: 'Fox', category: 'animals', emoji: '🦊' },
  { id: 'animal-panda', name: 'Panda', category: 'animals', emoji: '🐼' },
  { id: 'animal-giraffe', name: 'Giraffe', category: 'animals', emoji: '🦒' },

  // Stars (5 stickers)
  { id: 'star-gold', name: 'Gold Star', category: 'stars', emoji: '⭐' },
  { id: 'star-glowing', name: 'Glowing Star', category: 'stars', emoji: '🌟' },
  { id: 'star-sparkle', name: 'Sparkle', category: 'stars', emoji: '✨' },
  { id: 'star-shooting', name: 'Shooting Star', category: 'stars', emoji: '💫' },
  { id: 'star-night', name: 'Night Star', category: 'stars', emoji: '🌠' },

  // Dinosaurs (5 stickers)
  { id: 'dino-bronto', name: 'Brontosaurus', category: 'dinosaurs', emoji: '🦕' },
  { id: 'dino-trex', name: 'T-Rex', category: 'dinosaurs', emoji: '🦖' },
  { id: 'dino-dragon', name: 'Dragon', category: 'dinosaurs', emoji: '🐲' },
  { id: 'dino-lizard', name: 'Lizard', category: 'dinosaurs', emoji: '🦎' },
  { id: 'dino-egg', name: 'Dino Egg', category: 'dinosaurs', emoji: '🥚' },

  // Vehicles (5 stickers)
  { id: 'vehicle-car', name: 'Car', category: 'vehicles', emoji: '🚗' },
  { id: 'vehicle-rocket', name: 'Rocket', category: 'vehicles', emoji: '🚀' },
  { id: 'vehicle-train', name: 'Train', category: 'vehicles', emoji: '🚂' },
  { id: 'vehicle-helicopter', name: 'Helicopter', category: 'vehicles', emoji: '🚁' },
  { id: 'vehicle-ufo', name: 'UFO', category: 'vehicles', emoji: '🛸' },

  // Fruits (5 stickers)
  { id: 'fruit-apple', name: 'Apple', category: 'fruits', emoji: '🍎' },
  { id: 'fruit-orange', name: 'Orange', category: 'fruits', emoji: '🍊' },
  { id: 'fruit-grapes', name: 'Grapes', category: 'fruits', emoji: '🍇' },
  { id: 'fruit-strawberry', name: 'Strawberry', category: 'fruits', emoji: '🍓' },
  { id: 'fruit-banana', name: 'Banana', category: 'fruits', emoji: '🍌' },
];
