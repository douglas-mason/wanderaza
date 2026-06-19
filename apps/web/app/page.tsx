import { SearchExperience } from '@/features/search/SearchExperience';

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="text-center pt-10">
        <h1 className="text-4xl font-bold tracking-tight">Wanderaza</h1>
        <p className="mt-2 text-muted-foreground text-lg">
          Plan trips around real events happening when you visit.
        </p>
      </div>
      <SearchExperience />
    </main>
  );
}
