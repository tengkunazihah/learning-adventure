import { NavigationCard } from '@/components/ui/NavigationCard';
import { BackButton } from '@/components/ui/BackButton';

export default function EnglishHub() {
  return (
    <div className="flex flex-col min-h-screen bg-background px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <BackButton href="/" label="Home" />
        <h1 className="text-kid-large font-bold text-primary">English</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl mx-auto">
        <NavigationCard
          href="/english/letter-recognition"
          label="Letter Recognition"
          color="bg-card-english"
          icon="🔤"
        />
        <NavigationCard
          href="/english/beginning-sounds"
          label="Beginning Sounds"
          color="bg-secondary"
          icon="🎵"
        />
        <NavigationCard
          href="/english/first-words"
          label="First Words"
          color="bg-primary"
          icon="📖"
        />
      </div>
    </div>
  );
}
