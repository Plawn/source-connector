import { Connector, ExportItem } from "./connector.ts";

type Item = {
  id: string;
  title: string;
  text: string;
  createdAt: string; // date
  experiencedAt: string; // date
  stars: number;
};

type Res = {
  reviews: Item[];
  nextPageToken: string;
};

export type State = {
  page: undefined | number;
  last_ids: string[] | undefined;
};

export type Settings = {
  businessUnitId: string;
  apiKey: string;
};

export class TruspilotConnector implements Connector<State, Settings> {
  settings: Settings;

  constructor(settings: Settings) {
    this.settings = settings;
  }

  async get(state: State): Promise<{ result: ExportItem[]; state: State }> {
    try {
      let messages: Item[] = [];
      const last_ids = new Set<string>(state.last_ids || []);
      let page: number = state.page || 1;
      const headers = new Headers();
      let next_last_ids = new Set<string>();
      headers.append("apikey", this.settings.apiKey);
      while (true) {
        // order by
        // orderBy=createdat.asc
        const url =
          `https://api.trustpilot.com/v1/business-units/${this.settings.businessUnitId}/reviews?page=${page}&orderBy=createdat.asc&perPage=100`;

        const resp = await fetch(url, {
          headers,
        });
        const result: Res = await resp.json();
        if (result.reviews.length > 0) {
          // ensure no duplicates on last page
          next_last_ids = new Set(result.reviews.map((e) => e.id));
          messages = messages.concat(
            result.reviews.filter((e) => !last_ids.has(e.id)),
          );
        }
        if (result.reviews.length < 100) {
          break;
        }
        page++;
      }
      const result: ExportItem[] = messages
        .map((e) => ({
          content: e.title + "\n" + e.text,
          id: e.id,
          // already like: 2024-11-07T21:23:26.000Z
          //               2025-01-13T12:18:48
          date: e.createdAt,
          rating: e.stars,
          metadata: {},
        }));
      return {
        result,
        state: {
          page: page,
          last_ids: [...next_last_ids.values()],
        },
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des messages:", error);
      throw error;
    }
  }
}
