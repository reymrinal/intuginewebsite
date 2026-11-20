export const metadata = {
  title: "Grand Truck Auto 6 — The Jelhi–Ranglore Run",
  description:
    "Drive the Jelhi–Ranglore expressway with Intugine. Activity sensing, shipment integrity and IntuTrack 2.0 radar, played as a game.",
  alternates: { canonical: "https://library.intugine.com/grand-truck-auto" },
  openGraph: {
    title: "Grand Truck Auto 6 — The Jelhi–Ranglore Run",
    description: "Intugine presents the Jelhi–Ranglore expressway run. Deliver the launch-day drop before midnight.",
    url: "https://library.intugine.com/grand-truck-auto",
    type: "website",
  },
};

export default function GrandTruckAutoPage() {
  return (
    <div style={{ margin: 0, padding: 0, height: "100dvh", overflow: "hidden", background: "#160a26" }}>
      <iframe
        src="/grand-truck-auto.html"
        title="Grand Truck Auto 6 — playable game"
        style={{ width: "100%", height: "100%", border: "none", display: "block" }}
        allow="autoplay; fullscreen"
      />
    </div>
  );
}
