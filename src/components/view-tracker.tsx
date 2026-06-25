"use client";

import { useEffect } from "react";

export function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `viewed_${slug}`;
    if (localStorage.getItem(key)) return;

    fetch(`/api/v1/views/${slug}`, { method: "POST" })
      .then(() => localStorage.setItem(key, "1"))
      .catch(() => {});
  }, [slug]);

  return null;
}
