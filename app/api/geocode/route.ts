import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const NOMINATIM = "https://nominatim.openstreetmap.org";
const headers = {
  "Accept-Language": "en",
  "User-Agent": "QAH-Material-Testing/0.4 (MPW BARMM internal application)",
};

function validCoordinate(value: string | null, min: number, max: number) {
  if (value === null || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : null;
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim();
  const lat = validCoordinate(url.searchParams.get("lat"), -90, 90);
  const lng = validCoordinate(url.searchParams.get("lng"), -180, 180);

  try {
    if (q) {
      if (q.length < 2 || q.length > 160) return NextResponse.json({ error: "Enter a valid place name." }, { status: 400 });
      const endpoint = new URL(`${NOMINATIM}/search`);
      endpoint.searchParams.set("format", "jsonv2");
      endpoint.searchParams.set("q", q);
      endpoint.searchParams.set("countrycodes", "ph");
      endpoint.searchParams.set("limit", "5");
      endpoint.searchParams.set("addressdetails", "1");

      const response = await fetch(endpoint, { headers, cache: "no-store" });
      if (!response.ok) throw new Error("Geocoding service unavailable.");
      const rows = await response.json();
      const results = Array.isArray(rows)
        ? rows.map((row) => ({
            lat: Number(row.lat),
            lng: Number(row.lon),
            label: String(row.display_name || "").trim(),
          })).filter((row) => Number.isFinite(row.lat) && Number.isFinite(row.lng) && row.label)
        : [];

      return NextResponse.json({ results }, { headers: { "Cache-Control": "no-store" } });
    }

    if (lat !== null && lng !== null) {
      const endpoint = new URL(`${NOMINATIM}/reverse`);
      endpoint.searchParams.set("format", "jsonv2");
      endpoint.searchParams.set("lat", String(lat));
      endpoint.searchParams.set("lon", String(lng));
      endpoint.searchParams.set("zoom", "18");
      endpoint.searchParams.set("addressdetails", "1");

      const response = await fetch(endpoint, { headers, cache: "no-store" });
      if (!response.ok) throw new Error("Reverse geocoding service unavailable.");
      const row = await response.json();
      return NextResponse.json({ label: String(row.display_name || "").trim() }, { headers: { "Cache-Control": "no-store" } });
    }

    return NextResponse.json({ error: "Provide a place name or coordinates." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Location lookup is temporarily unavailable. You can still type the location and set the pin manually." }, { status: 503 });
  }
}
