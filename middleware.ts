import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let static files with extensions pass through directly (xml, txt, etc.)
  if (pathname.match(/\.[a-zA-Z0-9]+$/)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  // Only run on paths that don't have a file extension
  matcher: "/((?!_next/static|_next/image|favicon|.*\\.).*)",
};
