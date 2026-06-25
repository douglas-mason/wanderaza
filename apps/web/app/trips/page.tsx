import { MyTrips } from '@/features/trip/MyTrips';

export default function TripsPage() {
  return (
    <main className="min-h-screen max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">My Trips</h1>
      <MyTrips />
    </main>
  );
}
