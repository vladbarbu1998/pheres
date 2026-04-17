import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  { auth: { persistSession: false } },
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const match = pathname.match(/^\/shop\/collection\/([^/]+)$/);
  if (!match) return NextResponse.next();

  const slug = match[1];
  const { data } = await supabase
    .from("collections")
    .select("collection_type")
    .eq("slug", slug)
    .maybeSingle();

  if (data?.collection_type === "couture") {
    return NextResponse.redirect(new URL(`/couture/${slug}`, request.url), 307);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/shop/collection/:slug",
};
