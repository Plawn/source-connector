// import data from "./resp-auto.json" with { type: "json" };

/**
 * Extracts all update token for consumption with the make body api
 */
export function extractFromResultUpdateTokens(
    result: any,
): { page: string; updateToken: string }[] {
    const links =
        result.find((e: any) =>
            e.__typename === "WebPresentation_QueryWebDetailResponse"
        )
            .detailSectionGroups.find((e: any) =>
                e.clusterId === "ReviewsAndQASection"
            )
            .detailSections.find((e: any) => e.clusterId === "POI_REVIEWS_WEB")
            .tabs.find((e: any) => e.__typename === "WebPresentation_Tab")
            .content.find((e: any) =>
                e.__typename ===
                    "WebPresentation_PartialUpdatePaginationLinksListWeb"
            ).links;
    const mapped = links.map((e: any) => ({
        page: e.pageNumber,
        updateToken: e.updateLink.updateToken,
    }));
    return mapped;
    // here we get all the update tokens and the data
}

/**
 * Extracts all update token for consumption with the make body api
 *
 * OK on paging result
 */
export function extractUpdateTokensForPaging(data: any) {
    const res = data.find((e: any) => e.data.Result !== undefined).data.Result;
    return extractFromResultUpdateTokens(res);
}

/**
 * Extracts all update token for consumption with the make body api
 * * OK on paging result
 */
export function extractFromResultFeedbacks(
    data: any,
): { content: string; id: string; rating: number; date: string }[] {
    const items = data
        .find((e: any) => e.__typename === "WebPresentation_QueryWebDetailResponse")
        .detailSectionGroups.find((e: any) => e.clusterId === "ReviewsAndQASection")
        .detailSections.find((e: any) => e.clusterId === "POI_REVIEWS_WEB")
        .tabs.find((e: any) => e.__typename === "WebPresentation_Tab")
        .content.filter((e: any) =>
            e.__typename === "WebPresentation_ReviewCardWeb"
        );
    // here we get all the update tokens and the data
    const mapped = items.map((e: any) => ({
        content: e.htmlText.text,
        id: e.helpfulVote.helpfulVoteAction.objectId,
        rating: e.bubbleRatingNumber,
        date: e.publishedDate.text,
    }));
    return mapped;
}

export function extractFeedbacksForPaging(data: any) {
    const res = data.find((e: any) => e.data.Result !== undefined).data.Result;
    return extractFromResultFeedbacks(res);
}

export function getDetailsFromUrl(url: string) {
    const u = new URL(url);
    const p = u.pathname;
    const res = p.match(/g(\d+)-d(\d+)/)!;
    return { geoId: Number(res[1]), detailId: Number(res[2]) };
}

// function test() {
//     console.log(extractFeedbacksForPaging(data));
//     // const res = extractUpdateTokens(data);
//     // console.log(res);
//     console.log(
//         getDetailsFromUrl(
//             "https://fr.tripadvisor.ca/Attraction_Review-g155032-d155197-Reviews-Casino_de_Montreal-Montreal_Quebec.html",
//         ),
//     );
// }
// test()
