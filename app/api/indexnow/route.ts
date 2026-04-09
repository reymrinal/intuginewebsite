import { NextRequest, NextResponse } from "next/server";
import { pingIndexNow, slugToUrl } from "@/lib/indexnow";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slugs, urls } = body;

    let urlList: string[] = [];

    if (urls && Array.isArray(urls)) {
      urlList = urls;
    } else if (slugs && Array.isArray(slugs)) {
      urlList = slugs.map(slugToUrl);
    } else {
      return NextResponse.json({ error: "Provide slugs or urls array" }, { status: 400 });
    }

    await pingIndexNow(urlList);

    return NextResponse.json({ success: true, pinged: urlList.length, urls: urlList });
  } catch (err) {
    console.error("IndexNow error:", err);
    return NextResponse.json({ error: "Failed to ping IndexNow" }, { status: 500 });
  }
}
