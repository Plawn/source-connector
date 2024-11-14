import { Hono } from "hono";
import { WebClient } from "slack-web";

const app = new Hono();


type Input = {
  state: string;
  settings: string;
}

type State = {
  last_cursor: undefined | string;
}

type Settings = {
  bot_token: string;
  channel_id: string;
}

type ExportItem = {
  id: number | undefined,
  content: string | undefined,
  // Option<DateTime<Utc>> -> should be jackson date
  date: string | undefined,
}

function prepare_date(s: string | undefined): string | undefined {
  if (s === undefined) {
    return undefined;
  }
  const d = new Date(parseFloat(s) * 1000);
  /// TODO finish here
}

app.post("/", async (c) => {
  // comes from post json params
  const params: Input = await c.req.json();
  const state: State = JSON.parse(params.state);
  const settings: Settings = JSON.parse(params.settings);

  const client = new WebClient(settings.bot_token); // Remplace par ton OAuth Token Bot
  const channelId = settings.channel_id;

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
      .filter(e => e?.type === "message") // keep messages only
      .map(e => ({
        content: e.text,
        id: undefined,
        date: prepare_date(e.ts),
      }));

    return c.json({
      result,
      state: JSON.stringify({ // will be re injected on next call
        last_cursor: last_cursor_current
      }),
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des messages:", error);
    throw error;
  }
});

Deno.serve(app.fetch);
