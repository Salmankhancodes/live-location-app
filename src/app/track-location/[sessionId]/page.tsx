import MapWindow from "@/components/Map/Map";

export default async function TrackMapPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = await params;
  return <MapWindow mode="track" sessionId={resolvedParams.sessionId} />;
}
