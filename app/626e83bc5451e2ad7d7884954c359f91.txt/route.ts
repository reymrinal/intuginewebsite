import { NextResponse } from "next/server";
export const dynamic = "force-static";
export async function GET() {
  return new NextResponse("626e83bc5451e2ad7d7884954c359f91", {
    headers: { "Content-Type": "text/plain" },
  });
}
