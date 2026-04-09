import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.intugine.com"),
  title: { default: "Intugine | Supply Chain Visibility", template: "%s | Intugine" },
  description: "Intugine provides real-time supply chain visibility and logistics intelligence for enterprise supply chains.",
  openGraph: {
    siteName: "Intugine",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
