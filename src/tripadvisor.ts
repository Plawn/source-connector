import { Connector, ExportItem } from "./connector.ts";
import { scrape } from "./lib/tripadvisor/index.ts";

export type State = {
  last_ids: string[] | undefined;
};

export type Settings = {
  url: string;
};

export class TripadivsorConnector implements Connector<State, Settings> {
  settings: Settings;

  constructor(settings: Settings) {
    this.settings = settings;
  }

  async get(state: State): Promise<{ result: ExportItem[]; state: State }> {
    try {
      const result = await scrape(this.settings.url, state.last_ids || []);
      return {
        result: result.result,
        state: {
          last_ids: result.last_ids || [],
        },
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des messages:", error);
      throw error;
    }
  }
}
