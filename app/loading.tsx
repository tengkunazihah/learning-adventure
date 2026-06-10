export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="text-6xl animate-bounce">⭐</span>
        <p className="text-kid-heading font-bold text-primary">Loading...</p>
      </div>
    </div>
  );
}
