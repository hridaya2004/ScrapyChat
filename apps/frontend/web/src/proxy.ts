import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { authClient } from "@/lib/auth-client";

const PUBLIC_PATHS = ["/auth"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    PUBLIC_PATHS.some((path) => pathname.startsWith(path))
  ) {
    return NextResponse.next();
  }

  try {
    const session = await authClient.getSession({
      fetchOptions: {
        headers: req.headers,
      },
    });

    if (!session.data?.user) {
      const loginUrl = new URL("/auth", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    const loginUrl = new URL("/auth", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
