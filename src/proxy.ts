import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Maintenance gate. Runs before any Supabase call so it works even while the
  // backend is down. Flip MAINTENANCE_MODE=true (env) to send all visitor
  // traffic to the static maintenance page with a 503 (keeps SEO intact).
  if (process.env.MAINTENANCE_MODE === "true") {
    if (pathname !== "/maintenance" && !pathname.startsWith("/_next")) {
      const url = request.nextUrl.clone();
      url.pathname = "/maintenance";
      return NextResponse.rewrite(url, {
        status: 503,
        headers: { "Retry-After": "3600" },
      });
    }
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginPage = request.nextUrl.pathname === "/admin";
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

  if (!user && isAdminRoute && !isLoginPage) {
    const url = new URL("/admin", request.url);
    url.searchParams.set("redirectedFrom", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (user && isLoginPage) {
    return NextResponse.redirect(new URL("/admin/products", request.url));
  }

  return response;
}
