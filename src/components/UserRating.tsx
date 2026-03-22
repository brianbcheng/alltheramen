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
      })
      .catch(() => {});
  }, [reviewNumber]);

  async function submitRating(rating: number) {
    if (submitting) return;
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
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  }

  function handleMouseMove(e: React.MouseEvent, bowlIndex: number) {
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
          fontSize: 12,
          color: "#666",
          textTransform: "uppercase",
          letterSpacing: "1.2px",
          lineHeight: "16px",
          marginBottom: 8,
        }}
      >
        Submit your rating!
      </div>

      <div
        style={{ display: "flex", alignItems: "center", gap: 2 }}
        onMouseLeave={() => setHoverRating(null)}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              cursor: submitting ? "wait" : "pointer",
              padding: 2,
              transition: "transform 0.1s ease",
              transform: hoverRating !== null && hoverRating >= i ? "scale(1.1)" : "scale(1)",
            }}
            onMouseMove={(e) => handleMouseMove(e, i)}
            onClick={() => {
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
              marginLeft: 8,
              fontSize: 14,
              color: "#666",
            }}
          >
            {userRating.toFixed(1)}
          </span>
        )}
      </div>

      {totalRatings > 0 && (
        <div
          style={{
            marginTop: 6,
            fontSize: 12,
            color: "#666",
          }}
        >
          Community avg: {averageRating!.toFixed(2)} ({totalRatings}{" "}
          {totalRatings === 1 ? "rating" : "ratings"})
        </div>
      )}
    </div>
  );
}
