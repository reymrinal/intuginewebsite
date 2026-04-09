import { NextResponse } from "next/server";

export async function GET() {
  const xml = `<?xml version="1.0"?>
<users>
\t<user>626E83BC5451E2AD7D7884954C359F91</user>
</users>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
