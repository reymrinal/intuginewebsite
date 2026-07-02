import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cruise\u2122 \u2014 AI Control Tower for Indian Logistics | Intugine",
  description:
    "Cruise autonomously resolves logistics exceptions \u2014 halts, SLA breaches, route deviations \u2014 calling drivers in 8 Indian languages. 85%+ resolution, 70% less manual headcount.",
  alternates: {
    canonical: "https://library.intugine.com/cruise",
  },
  openGraph: {
    title: "Cruise\u2122 \u2014 AI Control Tower for Indian Logistics",
    description:
      "The autonomous control tower that detects, diagnoses, calls, and resolves logistics exceptions \u2014 while your team sleeps.",
    url: "https://library.intugine.com/cruise",
    type: "website",
  },
};

export default function CruiseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
