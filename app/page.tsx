import { getAllPages, getTemplateLabel } from "@/lib/api";
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
      <Nav />
      <LibraryIndex pages={pages} />
      <Footer />
    </>
  );
}
