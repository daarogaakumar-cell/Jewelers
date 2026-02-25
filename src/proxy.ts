import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

// Edge-safe auth — no bcrypt / mongoose imports
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public admin routes (login page)
  const publicAdminRoutes = ["/login"];

  // Check if it's an admin route
  const isAdminRoute = pathname.startsWith("/admin");

  const isPublicAdminRoute = publicAdminRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If authenticated user tries to access login, redirect to dashboard
  if (isPublicAdminRoute && req.auth) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  // If unauthenticated user tries to access admin routes, redirect to login
  if (isAdminRoute && !req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
