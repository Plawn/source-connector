import { Connector, ExportItem } from "./connector";

type Item = {
  id: string;
  title: string;
  text: string;
  createdAt: string; // date
  experiencedAt: string; // date
};

type Res = {
  reviews: Item[];
  nextPageToken: string;
};

export type State = {
  last_cursor: undefined | string;
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
      let hasMore = true;
      let cursor: string | undefined = state.last_cursor;
      let last_cursor_current: string | undefined;
      const url =
        `https://api.trustpilot.com/v1/business-units/${this.settings.businessUnitId}/all-reviews`;
      const headers = new Headers();
      headers.append("apikey", this.settings.apiKey);

      while (hasMore) {
        const resp = await fetch(url, {
          headers,
        });
        const result: Res = await resp.json();

        if (result.reviews) {
          messages = messages.concat(result.reviews);
        }
        // TODO: handle has more
        // TODO: mettre à jour le last cursor

        // // Contrôler le curseur pour savoir si d'autres messages existent
        // hasMore = result.has_more || false;
        // cursor = result.response_metadata?.next_cursor;
        // if (cursor) {
        //     console.log("cursor", result.response_metadata?.next_cursor);
        //     last_cursor_current = cursor;
        // }
      }

      const result: ExportItem[] = messages
        .map((e) => ({
          content: e.text,
          id: e.id,
          // already like: 2024-11-07T21:23:26.000Z
          date: e.createdAt,
        }));
      return {
        result,
        state: {
          last_cursor: last_cursor_current,
        },
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des messages:", error);
      throw error;
    }
  }
}
