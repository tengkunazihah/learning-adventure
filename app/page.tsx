import { NavigationCard } from '@/components/ui/NavigationCard';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-6 py-8">
      <h1 className="text-kid-large font-bold text-primary mb-8">
        Learning Adventure
      </h1>
      <div className="grid grid-cols-2 gap-5 w-full max-w-3xl">
        <NavigationCard
          href="/math"
          label="Math"
          color="bg-card-math"
          icon="🔢"
        />
        <NavigationCard
          href="/english"
          label="English"
          color="bg-card-english"
          icon="📚"
        />
        <NavigationCard
          href="/sticker-book"
          label="Sticker Book"
          color="bg-card-stickers"
          icon="⭐"
        />
        <NavigationCard
          href="/parent-dashboard"
          label="Parent Dashboard"
          color="bg-card-parent"
          icon="👨‍👩‍👧"
        />
      </div>
    </div>
  );
}
