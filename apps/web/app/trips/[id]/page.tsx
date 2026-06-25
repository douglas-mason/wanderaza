'use client';

import { useParams } from 'next/navigation';
import { TripPlanner } from '@/features/trip/TripPlanner';

export default function TripEditPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <main className="min-h-screen">
      <TripPlanner tripId={id} />
    </main>
  );
}
