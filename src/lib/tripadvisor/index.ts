import {
  extractFeedbacksForPaging,
  extractUpdateTokensForPaging,
  getDetailsFromUrl,
} from "./extract_utils.ts";
import { getResults } from "./decode_index.ts";
import { loadPage, Location } from "./query_utils.ts";

type NextPage = {
  page: string;
  updateToken: string;
};

type Review = {
  id: string;
  content: string;
  date: string;
  rating: number;
  metadata: any;
};

type FirstResponse = {
  location: Location;
  pages: NextPage[];
  reviews: Review[];
};

async function loadFirst(url: string): Promise<FirstResponse> {
  // -> return html
  // example
  // https://fr.tripadvisor.ca/Attraction_Review-g155032-d155197-Reviews-Casino_de_Montreal-Montreal_Quebec.html
  const req = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
      "Accept":
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3",
      "Accept-Encoding": "gzip, deflate",
      "Connection": "keep-alive",
      "Sec-Fetch-Site": "none",
      "Upgrade-Insecure-Requests": "1",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-User": "?1",
      "Priority": "u=0, i",
    },
  });
  const text = await req.text();
  const location = getDetailsFromUrl(url);
  const { links, reviews } = await getResults(text);

  return {
    location: { ...location, url },
    reviews: reviews.map((e) => ({
      ...e,
      metadata: {},
    })),
    pages: links, // das ok
  };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function sortBy<T extends {}>(array: T[], getter: (a: T) => any) {
  array.sort((a, b) => {
    const a1 = getter(a);
    const b1 = getter(b);
    if (a1 > b1) {
      return 1;
    }
    if (b1 > a1) {
      return -1;
    }
    return 0;
  });
  return array;
}

export async function scrape(url: string, previous: string[]) {
  let result: Review[] = [];
  const todo: NextPage[] = [];
  const pageDone = new Set<string>();

  function addToQueue(p: NextPage) {
    if (pageDone.has(p.page)) {
      return;
    }
    todo.push(p);
  }

  function checkPrevious(reviews: Review[]) {
    for (const n of reviews.map((e) => e.id)) {
      if (previous.includes(n)) {
        return true;
      }
    }
    return false;
  }

  function end() {
    result = result.filter((e) => !previous.includes(e.id));
    return {
      last_ids: newPrevious,
      result,
    };
  }

  const { pages, reviews, location } = await loadFirst(url);
  const newPrevious = reviews.map((e) => e.id);
  result = result.concat(reviews);
  if (checkPrevious(reviews)) {
    // go to end
    console.log("reach previous items");
    return end();
  }
  pageDone.add("1");
  pages.forEach(addToQueue);
  while (todo.length > 0) {
    console.log("TODO is", todo);
    const next = todo.shift()!;
    console.log("doing page", next.page);
    const content = await loadPage(location, next.page, next.updateToken);
    const newLinks = extractUpdateTokensForPaging(content);
    const reviews = extractFeedbacksForPaging(content).map((e) => ({
      ...e,
      metadata: {},
    }));
    // ensure we do it in order
    sortBy(newLinks, (e) => e.page);
    newLinks.forEach(addToQueue);
    result = result.concat(reviews);
    pageDone.add(next.page);
    if (checkPrevious(reviews)) {
      console.log("reach previous items");
      break;
    }
    await sleep(10_000);
    if (pageDone.size > 0) {
      console.log("did all for tests");
      break;
    }
  }

  return end();
}

// const url =
//   "https://fr.tripadvisor.ca/Attraction_Review-g182183-d2311154-Reviews-Casino_De_Mont_tremblant-Mont_Tremblant_Quebec.html";

console.log(await loadFirst("https://fr.tripadvisor.ca/Attraction_Review-g155032-d155197-Reviews-Casino_de_Montreal-Montreal_Quebec.html"))

// const result = await scrape(url, []);

// console.log(result);

// await Deno.writeTextFile("real_result.json", JSON.stringify(result));
