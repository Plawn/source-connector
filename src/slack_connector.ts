import { Connector, ExportItem } from "./connector.ts";
import { WebClient } from "slack-web";
import { prepare_date } from "./utils.ts";

export type State = {
  // can be undefined when a channel has not much messages
  last_cursor: string | undefined;
  last_ids: string[];
};

export type Settings = {
  botToken: string;
  channelId: string;
};

type SlackEvent = {
  type: string;
  subtype?: string;
  ts: string;
  client_msg_id?: string;
  text: string;
}

type SlackHistoryChunk = {
  messages: SlackEvent[];
  has_more: boolean;
  response_metadata?: {
    next_cursor?: string;
  }
};

export class SlackConnector implements Connector<State, Settings> {
  settings: Settings;

  constructor(settings: Settings) {
    this.settings = settings;
  }

  async get(state: Partial<State>): Promise<{ result: ExportItem[]; state: State }> {
    const client = new WebClient(this.settings.botToken); // Remplace par ton OAuth Token Bot
    const channelId = this.settings.channelId;

    try {
      let messages: SlackEvent[] = [];
      let hasMore = true;
      let next_last_ids = new Set<string>();
      const last_ids = new Set<string>(state.last_ids || []);
      let cursor: string | undefined = state.last_cursor;
      // console.log('entry cursor', cursor);
      while (hasMore) {
        const result: SlackHistoryChunk = await client.conversations.history({
          channel: channelId,
          cursor: cursor,
          limit: 100,
        });
        // console.log('result', result);
        if (result.messages) {
          next_last_ids = new Set(result.messages.map(e => e.ts));
          messages = messages.concat(
            result.messages.filter((e) => !last_ids.has(e.ts))
          );
        }

        hasMore = result.has_more || false;
        if (result.response_metadata?.next_cursor) {
          console.log("cursor", result.response_metadata?.next_cursor);
          cursor = result.response_metadata?.next_cursor;
        }
      }
      const result: ExportItem[] = messages
        .filter((e) => e?.type === "message"
          && e.subtype !== "channel_join") // keep messages only
        .map((e) => ({
          content: e.text,
          id: e.client_msg_id,
          date: prepare_date(e.ts),
          metadata: {},
        }));
      return {
        result,
        state: {
          last_cursor: cursor,
          last_ids: [...next_last_ids.values()],
        },
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des messages:", error);
      throw error;
    }
  }
}
