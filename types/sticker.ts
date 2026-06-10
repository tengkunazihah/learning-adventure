export type StickerCategory = 'animals' | 'stars' | 'dinosaurs' | 'vehicles' | 'fruits';

export interface Sticker {
  id: string;
  name: string;
  category: StickerCategory;
  imageUrl: string;
  earnedAt: string;
}
