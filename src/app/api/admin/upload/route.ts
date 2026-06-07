import { createClient } from "@/utils/supabase/server";
import { AwsClient } from "aws4fetch";
import { NextResponse } from "next/server";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET;
const publicBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

const SIZES = ["thumb", "md", "full"] as const;

export async function POST(req: Request) {
  // Admin gate — mirrors the (admin) layout check.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicBase) {
    return NextResponse.json(
      { error: "R2 storage is not configured" },
      { status: 500 },
    );
  }

  const form = await req.formData();
  const id = crypto.randomUUID();

  const r2 = new AwsClient({
    accessKeyId,
    secretAccessKey,
    region: "auto",
    service: "s3",
  });
  const endpointBase = `https://${accountId}.r2.cloudflarestorage.com/${bucket}`;

  for (const size of SIZES) {
    const file = form.get(size);
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: `missing variant: ${size}` },
        { status: 400 },
      );
    }
    const key = `products/${id}/${size}.webp`;
    const res = await r2.fetch(`${endpointBase}/${key}`, {
      method: "PUT",
      body: await file.arrayBuffer(),
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `upload failed for ${size} (${res.status})` },
        { status: 502 },
      );
    }
  }

  const url = `${publicBase.replace(/\/$/, "")}/products/${id}/full.webp`;
  return NextResponse.json({ url });
}
