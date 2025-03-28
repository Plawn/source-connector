import { Connector, ExportItem } from "./connector.ts";
import { Review, Root } from "./google_types.ts";
import { to_export_date } from "./utils.ts";

async function getToken(refresh_token: string, basic: string) {
  const body = {
    refresh_token,
    grant_type: "refresh_token",
  };

  const headers = new Headers();
  headers.append("Authorization", `Basic ${basic}`);

  const url = "https://oauth2.googleapis.com/token";

  const form = new FormData();

  for (const k in body) {
    // @ts-ignore
    form.set(k, body[k]);
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: form,
  });

  const resp = await res.json();
  return resp.access_token;
}

export type State = {
  nextToken: undefined | string;
  last_ids: string[] | undefined;
};

export type Settings = {
  appId: string;
  basic: string;
  refreshToken: string;
};

type Item = {
  id: string;
  title: string;
  text: string;
  createdAt: string; // date
  experiencedAt: string; // date
  stars: number;
};

function extractComment(i: Review) {
  for (const e of i.comments) {
    if (e.userComment) {
      return {
        text: e.userComment.text.trim(),
        stars: e.userComment.starRating,
        date: to_export_date(new Date((+e.userComment.lastModified.seconds) * 1000)),
      };
    }
  }
}

export class GoogleConnector implements Connector<State, Settings> {
  settings: Settings;

  constructor(settings: Settings) {
    this.settings = settings;
  }

  async get(state: State): Promise<{ result: ExportItem[]; state: State }> {
    const token = await getToken(
      this.settings.refreshToken,
      this.settings.basic,
    );
    try {
      let messages: Review[] = [];
      const last_ids = new Set<string>(state.last_ids || []);
      console.log("state", state);
      let nextToken = state.nextToken;
      const headers = new Headers();
      let next_last_ids = new Set<string>();
      headers.append("Authorization", `Bearer ${token}`);
      while (true) {
        const url =
          `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${this.settings.appId}/reviews?maxResults=50`;
        const resp = await fetch(url, {
          headers,
        });
        const result: Root = await resp.json();
        if (result.reviews.length > 0) {
          // ensure no duplicates on last page
          next_last_ids = new Set(result.reviews.map((e) => e.reviewId));
          messages = messages.concat(
            result.reviews.filter((e) => !last_ids.has(e.reviewId)),
          );
        }
        nextToken = result.tokenPagination?.nextPageToken;
        console.log("next cursor", nextToken, [...Object.keys(result)].join(','));
        if (!result.tokenPagination?.nextPageToken) {
          break;
        }
      }
      // console.log(messages[0]);
      const result: ExportItem[] = messages
        .map((e) => [e, extractComment(e)] as [Review, any])
        .filter(([e, comment]) => comment != undefined)
        .map(([e, comment]) => {
          return {
            content: comment.text,
            id: e.reviewId,
            date: comment.date,
            metadata: {
              "google_play.stars": `${comment.stars}`,
            },
          };
        });
      return {
        result,
        state: {
          nextToken,
          last_ids: [...next_last_ids.values()],
        },
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des messages:", error);
      throw error;
    }
  }
}
