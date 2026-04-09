import { NextResponse } from "next/server";

export async function GET() {
  return new NextResponse("756e7247211148e21808006bd23cdc23", {
    headers: { "Content-Type": "text/plain" },
  });
}
