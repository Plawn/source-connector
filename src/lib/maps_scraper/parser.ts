/**
 * Parses an array of reviews and returns a minified JSON string of the parsed reviews.
 * @param {Array} reviews - The array of reviews to parse. Each review is expected to be an array with specific nested structures.
 * @returns {Promise<string>} A promise that resolves to a JSON string of the parsed reviews.
 */
export default function parseReviews(reviews: any[]) {
  const parsedReviews = reviews
    .map(([review]) => ({
      review_id: review[0],
      time: {
        published: review[1][2],
        last_edited: review[1][3],
      },
      author: {
        name: review[1][4][5][0],
        profile_url: review[1][4][5][1],
        url: review[1][4][5][2][0],
        id: review[1][4][5][3],
      },
      review: {
        rating: review[2][0]?.[0], // rating could be null
        text: review[2][15]?.[0]?.[0] || null, // text could be null
        language: review[2][14]?.[0] || null,
      },
      images: review[2][2]?.map((image) => ({
        id: image[0],
        url: image[1][6][0],
        size: {
          width: image[1][6][2][0],
          height: image[1][6][2][1],
        },
        location: {
          friendly: image[1][21][3][7]?.[0],
          lat: image[1][8][0][2],
          long: image[1][8][0][1],
        },
        caption: image[1][21][3][5]?.[0] || null,
      })) || null,
      source: review[1][13][0],
    }))
    .filter((e) => e.review.text);

  return parsedReviews;
}
