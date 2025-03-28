import { scraper } from "./lib/index.ts";
import { Connector, ExportItem } from "./connector.ts";
import { to_export_date } from "./utils.ts";

export type State = {
  last_ids: string[];
};

export type Settings = {
  url: string;
};

type Review = {
  review_id: string;
  time: {
    published: number;
    last_edited: number;
  };
  review: {
    rating: number;
    text: string;
    language: string;
  };
};

function prepare_date(d: number) {
  const date = new Date(d / 1000);
  return to_export_date(date);
}

export class MapsConnector implements Connector<State, Settings> {
  settings: Settings;

  constructor(settings: Settings) {
    this.settings = settings;
  }
  async get(
    state: Partial<State>,
  ): Promise<{ result: ExportItem[]; state: State }> {
    // if has already fetched ids, then stop
    console.log('starting', state);
    const { reviews, lastIds }: { reviews: Review[] } = await scraper(
      this.settings.url,
      new Set(state.last_ids),
    );
    console.log('reviews', reviews);
    const result = reviews.map((e) => ({
      id: e.review_id,
      content: e.review.text,
      date: prepare_date(e.time.last_edited),
      metadata: {
        "stars": `${e.review.rating}`,
        "language": e.review.language,
      },
    }));
    return {
      result: result.filter(e => !lastIds.includes(e.id)),
      state: {
        last_ids: lastIds,
      },
    };
  }
}
