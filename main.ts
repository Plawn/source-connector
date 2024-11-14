import { Hono } from 'hono';
import { WebClient } from "slack-web";

const app = new Hono()

app.post('/', async (c) => {
  const params = {};

  const client = new WebClient(params.bot_token); // Remplace par ton OAuth Token Bot
  const channelId = params.channel_id;
  try {
    let messages: any[] = [];
    let hasMore = true;
    let cursor: string | undefined = params.last_cursor;
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
        console.log('cursor', result.response_metadata?.next_cursor)
        last_cursor_current = cursor;
      }
    }

    return { messages, last_cursor_current };
  } catch (error) {
    console.error("Erreur lors de la récupération des messages:", error);
    throw error;
  }
});

Deno.serve(app.fetch)
