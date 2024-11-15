import { Connector, ExportItem } from "./connector.ts";

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
    console.log("in connector Trustpilot");
    try {
      let messages: Item[] = [];
      let cursor: string | undefined = state.last_cursor;

      while (true) {
        const url =
          `https://api.trustpilot.com/v1/business-units/${this.settings.businessUnitId}/all-reviews${
            cursor ? "?pageToken=" + cursor : ""
          }`;
        const headers = new Headers();
        headers.append("apikey", this.settings.apiKey);
        const resp = await fetch(url, {
          headers,
        });
        const result: Res = await resp.json();
        if (result.nextPageToken) {
          cursor = result.nextPageToken;
        } else {
          break;
        }
        if (result.reviews) {
          messages = messages.concat(result.reviews);
        }
        console.log("did token", cursor, "having", messages.length);
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
          last_cursor: cursor,
        },
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des messages:", error);
      throw error;
    }
  }
}
