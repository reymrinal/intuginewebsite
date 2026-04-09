import { getAllPages } from "@/lib/api";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LibraryIndex from "@/components/LibraryIndex";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Supply Chain Visibility Library | Intugine",
  description: "Guides, glossary, and industry resources on logistics visibility, freight tracking, and supply chain intelligence for enterprise teams.",
};

export default async function LibraryPage() {
  const pages = await getAllPages();
  return (
    <>
      {/* Bing Webmaster Verification — must be in <head>, injected via Next.js head export */}
      <head>
        <meta name="msvalidate.01" content="626E83BC5451E2AD7D7884954C359F91" />
      </head>
      <Nav />
      <LibraryIndex pages={pages} />
      <Footer />
    </>
  );
}
