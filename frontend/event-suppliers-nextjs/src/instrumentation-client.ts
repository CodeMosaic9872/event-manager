import type { NextWebVitalsMetric } from "next/app";

export function reportWebVitals(metric: NextWebVitalsMetric) {
  if (typeof window === "undefined") return;
  const metricWithRating = metric as NextWebVitalsMetric & { rating?: string; navigationType?: string };
  const payload = {
    id: metric.id,
    name: metric.name,
    value: metric.value,
    rating: metricWithRating.rating,
    navigationType: metricWithRating.navigationType,
  };

  if (process.env.NODE_ENV !== "production") {
    console.info("[web-vitals]", payload);
  }
}
