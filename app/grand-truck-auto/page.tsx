import Nav from "@/components/Nav";

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
    <div style={{ background: "#160a26", minHeight: "100vh" }}>
      <Nav />
      <iframe
        src="/grand-truck-auto.html"
        title="Grand Truck Auto 6 — playable game"
        style={{ width: "100%", height: "calc(100vh - 64px)", border: "none", display: "block" }}
        allow="autoplay; fullscreen"
      />
    </div>
  );
}
