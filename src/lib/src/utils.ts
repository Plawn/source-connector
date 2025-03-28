import listugcposts from "./listugcposts.ts";
import parser from "./parser.ts";

export const SortEnum = {
  "relevent": 1,
  "newest": 2,
  "highest_rating": 3,
  "lowest_rating": 4,
};

/**
 * Fetches reviews from a given URL with sorting and pagination options.
 *
 * @param {string} url - The URL to fetch reviews from.
 * @param {string} sort - The sorting option for the reviews.
 * @param {string} [nextPage=""] - Token for the next page, if any.
 * @param {string} [search_query=""] - Search query to filter reviews, if any.
 * @returns {Promise<Object>} Parsed JSON data of reviews.
 * @throws {Error} If the request fails or the response is invalid.
 */
export async function fetchReviews(
  url: string,
  nextPage: string = "",
): Promise<object> {
  const apiUrl = listugcposts(url, SortEnum["newest"] as any, nextPage);
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch reviews: ${response.statusText}`);
  }
  const textData = await response.text();
  const rawData = textData.split(")]}'")[1];
  return JSON.parse(rawData);
}

/**
 * Paginates through reviews from a given URL.
 *
 * @param {string} url - The URL to fetch reviews from.
 * @param {string} sort - Sorting parameter for reviews.
 * @param {string|number} pages - Number of pages or "max".
 * @param {string} search_query - Search query to filter reviews.
 * @param {Array} initialData - Initial data containing reviews and next page token.
 * @returns {Promise<Array>} Array of reviews or parsed reviews.
 */
export async function paginateReviews(
  url: string,
  lastIds: Set<string>,
  initialData: any,
) {

  let reviews = parser(initialData[2]);
  const newIds = new Set(reviews.map((e) => e.review_id));
  const lastReviews = [...reviews];
  if (newIds.intersection(lastIds).size > 0) {
    // we already fecthed the rest
    return { reviews: reviews, lastIds: lastReviews.map((e) => e.review_id) };
  }
  
  let nextPage = initialData[1]?.replace(/"/g, "");
  let currentPage = 2;
  while (true) {
    console.log(`Scraping page ${currentPage}...`);
    const data = await fetchReviews(url, nextPage);
    const newReviews = parser(data[2]);
    // if one of last ids in new reviews -> then stop
    reviews = [...reviews, ...newReviews];
    nextPage = data[1]?.replace(/"/g, "");
    console.log(nextPage, newIds, newIds.size);
    if (!nextPage) {
      break;
    }
    console.log('last ids', newIds);
    console.log("did all", newIds.intersection(lastIds));
    if (newIds.intersection(lastIds).size > 0) {
      // we already fecthed the rest
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Avoid rate-limiting
    currentPage++;
  }
  return { reviews: reviews, lastIds: lastReviews.map((e) => e.review_id) };
}
