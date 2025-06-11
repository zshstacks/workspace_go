import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token");

  if (!token) {
    const url = new URL("/signin", req.url);
    url.searchParams.set("session", "expired");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/workspace"],
};
