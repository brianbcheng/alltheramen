"use client";

import { useState, useEffect, useRef } from "react";
import RamenBowlIcon from "./RamenBowlIcon";
import { getUserFingerprint } from "@/lib/fingerprint";

interface UserRatingProps {
  reviewNumber: number;
}

export default function UserRating({ reviewNumber }: UserRatingProps) {
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [totalRatings, setTotalRatings] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fingerprintRef = useRef("");

  useEffect(() => {
    fingerprintRef.current = getUserFingerprint();
    fetch(
      `/api/ratings?reviewNumber=${reviewNumber}&fingerprint=${fingerprintRef.current}`
    )
      .then((r) => r.json())
      .then((data) => {
        setAverageRating(data.averageRating);
        setTotalRatings(data.totalRatings);
        setUserRating(data.userRating);
        if (data.userRating) setSubmitted(true);
      })
      .catch(() => {});
  }, [reviewNumber]);

  async function submitRating(rating: number) {
    if (submitting || submitted) return;
    setSubmitting(true);
    setUserRating(rating);

    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewNumber,
          fingerprint: fingerprintRef.current,
          rating,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAverageRating(data.averageRating);
        setTotalRatings(data.totalRatings);
        setUserRating(data.userRating);
        setSubmitted(true);
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  }

  function handleMouseMove(e: React.MouseEvent, bowlIndex: number) {
    if (submitted) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;
    setHoverRating(isLeftHalf ? bowlIndex - 0.5 : bowlIndex);
  }

  const effectiveRating = hoverRating ?? userRating ?? 0;

  function getBowlState(index: number): "full" | "half" | "empty" {
    if (effectiveRating >= index) return "full";
    if (effectiveRating >= index - 0.5) return "half";
    return "empty";
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontFamily: "var(--font-mono)",
          fontSize: 12.5,
          fontWeight: 700,
          color: submitted ? "#16a34a" : "#78716C",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          lineHeight: "16px",
          marginBottom: 8,
          transition: "color 0.2s ease",
        }}
      >
        {submitted && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#16a34a"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
        {submitted ? "Rating submitted" : "Submit your rating!"}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          opacity: submitted ? 0.5 : 1,
          transition: "opacity 0.2s ease",
        }}
        onMouseLeave={() => setHoverRating(null)}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              cursor: submitted ? "default" : submitting ? "wait" : "pointer",
              padding: 2,
              transition: "transform 0.1s ease",
              transform:
                !submitted && hoverRating !== null && hoverRating >= i
                  ? "scale(1.1)"
                  : "scale(1)",
            }}
            onMouseMove={(e) => handleMouseMove(e, i)}
            onClick={() => {
              if (submitted) return;
              const rating = hoverRating ?? i;
              submitRating(rating);
            }}
          >
            <RamenBowlIcon filled={getBowlState(i)} size={28} />
          </div>
        ))}

        {userRating && (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              marginLeft: 8,
              fontSize: 14,
              color: "#78716C",
            }}
          >
            {userRating.toFixed(1)}
          </span>
        )}
      </div>

      {totalRatings > 0 && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            marginTop: 6,
            fontSize: 12,
            fontWeight: 400,
            color: "#78716C",
          }}
        >
          Community avg: {averageRating!.toFixed(2)} ({totalRatings}{" "}
          {totalRatings === 1 ? "rating" : "ratings"})
        </div>
      )}
    </div>
  );
}
