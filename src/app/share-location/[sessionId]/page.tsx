import MapWindow from "@/components/Map/Map";

export default async function SharerMapPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  return <MapWindow mode="share" sessionId={sessionId} />;
}
