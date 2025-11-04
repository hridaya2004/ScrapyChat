import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { authClient } from "@/lib/auth-client";

const PUBLIC_PATHS = ["/auth"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    PUBLIC_PATHS.some((path) => pathname.startsWith(path))
  ) {
    return NextResponse.next();
  }

  try {
    // check if there are existing session
    const session = await authClient.getSession({
      fetchOptions: {
        headers: Object.fromEntries(req.headers.entries()),
      },
    });

    if (!session?.data?.user) {
      const loginUrl = new URL("/auth", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch (err) {
    console.error("Middleware auth check failed:", err);
    const loginUrl = new URL("/auth", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
