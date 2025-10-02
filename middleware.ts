import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/*
* Middleware needs to be in the project root!
* Intercept request and can be used for redirects
* We use this to guard Gamification Routes
*/

export function middleware(req: NextRequest) {
  // Add protected routes here:
  const protectedRoutes = [
    "/items",
    "/achievements",
    "/leaderboard",
    "/badges",
  ];
  const displayGamification = false;

  const path = req.nextUrl.pathname;

  if (!displayGamification && protectedRoutes.some(route => path.includes(route))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}


