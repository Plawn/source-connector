import { Connector, ExportItem } from "./connector.ts";
import { WebClient } from "slack-web";
import { prepare_date } from "./utils.ts";

export type State = {
  last_cursor: undefined | string;
};

export type Settings = {
  bot_token: string;
  channel_id: string;
};

export class SlackConnector implements Connector<State, Settings> {
  settings: Settings;

  constructor(settings: Settings) {
    this.settings = settings;
  }

  async get(state: State): Promise<{ result: ExportItem[]; state: State }> {
    const client = new WebClient(this.settings.bot_token); // Remplace par ton OAuth Token Bot
    const channelId = this.settings.channel_id;

    try {
      let messages: any[] = [];
      let hasMore = true;
      let cursor: string | undefined = state.last_cursor;
      let last_cursor_current: string | undefined;
      while (hasMore) {
        const result = await client.conversations.history({
          channel: channelId,
          cursor: cursor,
          limit: 100,
        });

        if (result.messages) {
          messages = messages.concat(result.messages);
        }

        // Contrôler le curseur pour savoir si d'autres messages existent
        hasMore = result.has_more || false;
        cursor = result.response_metadata?.next_cursor;
        if (cursor) {
          console.log("cursor", result.response_metadata?.next_cursor);
          last_cursor_current = cursor;
        }
      }

      const result: ExportItem[] = messages
        .filter((e) => e?.type === "message") // keep messages only
        .map((e) => ({
          content: e.text,
          id: undefined,
          date: prepare_date(e.ts),
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
