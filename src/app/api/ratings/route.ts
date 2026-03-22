import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT = 30; // max requests per window
const RATE_WINDOW = 60_000; // 1 minute

function isRateLimited(fingerprint: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(fingerprint) || []).filter(
    (t) => now - t < RATE_WINDOW
  );
  if (timestamps.length >= RATE_LIMIT) return true;
  timestamps.push(now);
  rateLimitMap.set(fingerprint, timestamps);
  return false;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reviewNumber = searchParams.get("reviewNumber");
  const fingerprint = searchParams.get("fingerprint");

  if (!reviewNumber) {
    return NextResponse.json(
      { error: "reviewNumber required" },
      { status: 400 }
    );
  }

  const rn = parseInt(reviewNumber, 10);

  // Get aggregate ratings
  const { data: allRatings, error } = await supabase
    .from("ratings")
    .select("rating")
    .eq("review_number", rn);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const totalRatings = allRatings?.length || 0;
  const averageRating =
    totalRatings > 0
      ? allRatings.reduce((sum, r) => sum + Number(r.rating), 0) / totalRatings
      : null;

  // Get user's existing rating if fingerprint provided
  let userRating: number | null = null;
  if (fingerprint) {
    const { data: userRow } = await supabase
      .from("ratings")
      .select("rating")
      .eq("review_number", rn)
      .eq("fingerprint", fingerprint)
      .maybeSingle();

    if (userRow) userRating = Number(userRow.rating);
  }

  return NextResponse.json({ averageRating, totalRatings, userRating });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reviewNumber, fingerprint, rating } = body;

    // Validate
    if (!reviewNumber || !fingerprint || rating == null) {
      return NextResponse.json(
        { error: "reviewNumber, fingerprint, and rating required" },
        { status: 400 }
      );
    }

    const numRating = Number(rating);
    if (numRating < 0.5 || numRating > 5 || numRating % 0.5 !== 0) {
      return NextResponse.json(
        { error: "Rating must be 0.5-5.0 in 0.5 increments" },
        { status: 400 }
      );
    }

    // Rate limit
    if (isRateLimited(fingerprint)) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    // Upsert rating
    const { error } = await supabase.from("ratings").upsert(
      {
        review_number: reviewNumber,
        fingerprint,
        rating: numRating,
      },
      { onConflict: "review_number,fingerprint" }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return updated aggregates
    const { data: allRatings } = await supabase
      .from("ratings")
      .select("rating")
      .eq("review_number", reviewNumber);

    const totalRatings = allRatings?.length || 0;
    const averageRating =
      totalRatings > 0
        ? allRatings!.reduce((sum, r) => sum + Number(r.rating), 0) /
          totalRatings
        : null;

    return NextResponse.json({
      averageRating,
      totalRatings,
      userRating: numRating,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
