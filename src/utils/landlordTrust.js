export function calculateAverageRating(reviews = []) {
  if (!reviews.length) {
    return 0;
  }

  const total = reviews.reduce(
    (sum, review) => sum + Number(review.rating ?? 0),
    0
  );

  return Number((total / reviews.length).toFixed(1));
}

export function getRatingSummary(reviews = []) {
  return {
    average: calculateAverageRating(reviews),
    count: reviews.length,
  };
}

export function formatTrustDate(dateString) {
  if (!dateString) {
    return "Recently";
  }

  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
