import { notFound } from 'next/navigation';
import { getPublicTrip } from '@/features/trip/api/tripsApi';
import { TripPanel } from '@/features/trip/TripPanel';

interface SharedTripPageProps {
  params: Promise<{ share_slug: string }>;
}

export default async function SharedTripPage({ params }: SharedTripPageProps) {
  const { share_slug } = await params;
  const trip = await getPublicTrip(share_slug);

  if (!trip) {
    notFound();
  }

  return (
    <main className="min-h-screen max-w-3xl mx-auto px-6 py-10">
      <TripPanel trip={trip} items={trip.items} />
    </main>
  );
}
