import { SortEnum } from "./src/types.ts";
import { fetchReviews, paginateReviews } from "./src/utils.ts";
import parseReviews from "./src/parser.ts";

/**
 * Scrapes reviews from a given Google Maps URL.
 *
 * @param {string} url - The URL of the Google Maps location to scrape reviews from.
 * @param {Object} options - The options for scraping.
 * @param {string} [options.sort_type="relevent"] - The type of sorting for the reviews ("relevent", "newest", "highest_rating", "lowest_rating").
 * @param {string} [options.search_query=""] - The search query to filter reviews.
 * @param {string} [options.pages="max"] - The number of pages to scrape (default is "max"). If set to a number, it will scrape that number of pages (results will be 10 * pages) or until there are no more reviews.
 * @param {boolean} [options.clean=false] - Whether to return clean reviews or not.
 * @returns {Promise<Array|number>} - Returns an array of reviews or 0 if no reviews are found.
 * @throws {Error} - Throws an error if the URL is not provided or if fetching reviews fails.
 */
export async function scraper(
  url: string,
  lastIds: Set<string>,
) {
  const initialData = await fetchReviews(url, "");

  if (!initialData || !initialData[2] || !initialData[2].length) {
    return [];
  }

  //   if not next
  if (!initialData[1]) {
    const reviews = parseReviews(initialData[2]);
    return {
      reviews,
      lastIds: new Set(reviews.map((e) => e.review_id)),
    };
  }
  const { reviews, lastIds: newtLast } = await paginateReviews(
    url,
    lastIds,
    initialData,
  );
  return {
    reviews: reviews,
    lastIds: newtLast,
  };
}
