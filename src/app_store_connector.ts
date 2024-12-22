import { Connector, ExportItem } from "./connector.ts";
import { prepare_date_appstore } from "./utils.ts";
import {
  create,
  getNumericDate,
  Header,
  Payload,
} from "https://deno.land/x/djwt@v3.0.2/mod.ts";

export type State = {
  // can be undefined when a channel has not much messages
  lastCursor: string | undefined;
  lastIds: string[] | undefined;
};

export type Settings = {
  /**
   * P8 key
   */
  key: string;
  keyId: string;
  appId: string;
};

export interface AppstoreChunk {
  data: Datum[];
  links: AppstoreLinks;
  meta: Meta;
}

export interface Datum {
  type: Type;
  id: string;
  attributes: Attributes;
  relationships: Relationships;
  links: DatumLinks;
}

export interface Attributes {
  rating: number;
  title: string;
  body: string;
  reviewerNickname: string;
  createdDate: string;
  territory: Territory;
}

export enum Territory {
  Fra = "FRA",
}

export interface DatumLinks {
  self: string;
}

export interface Relationships {
  response: Response;
}

export interface Response {
  links: ResponseLinks;
}

export interface ResponseLinks {
  self: string;
  related: string;
}

export enum Type {
  CustomerReviews = "customerReviews",
}

export interface AppstoreLinks {
  self: string;
  next: string;
}

export interface Meta {
  paging: Paging;
}

export interface Paging {
  total: number;
  limit: number;
}

async function importPrivateKey(pemKey: string): Promise<CryptoKey> {
  // Remove the header and footer of the PEM key
  const pemContents = pemKey
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\n/g, ""); // Remove line breaks
  // Decode the Base64-encoded string to a Uint8Array
  const binaryDerString = atob(pemContents); // Decode Base64
  const binaryDer = new Uint8Array(
    Array.from(binaryDerString, (char) => char.charCodeAt(0)),
  );

  // Import the key using SubtleCrypto
  return await crypto.subtle.importKey(
    "pkcs8", // Format of the input key
    binaryDer, // The binary DER
    {
      name: "ECDSA", // ECDSA is used in ES256
      namedCurve: "P-256", // Curve name for ES256
    },
    false, // The key cannot be exported
    ["sign"], // Usage: Sign
  );
}
async function generateTokenWithSub(
  keyId: string,
  privateKeyString: string,
): Promise<string> {
  // Read the private key (e.g., AuthKey.p8)
  const privateKey = await importPrivateKey(privateKeyString);

  // Set JWT header and payload
  const header: Header = { alg: "ES256", kid: keyId };
  const payload: Payload = {
    // iss: issuerId,             // Issuer
    sub: "user", // Subject (e.g., App Bundle ID)
    exp: getNumericDate(20 * 60), // Token expiration (20 minutes)
    aud: "appstoreconnect-v1", // Audience
  };

  // Create the JWT
  const token = await create(header, payload, privateKey);
  return token;
}

async function getAppData(
  appId: string,
  token: string,
  cursor: string | undefined,
): Promise<AppstoreChunk> {
  const url =
    `https://api.appstoreconnect.apple.com/v1/apps/${appId}/customerReviews?limit=200${
      cursor ? `&cursor=${cursor}` : ""
    }`;
  console.log(url);
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(url, { headers });

  if (response.ok) {
    return await response.json(); // Return app data as JSON
  } else {
    console.error(`Error: ${response.status} - ${await response.text()}`);
    throw new Error("failed to query app store api")
  }
}

type AppStoreItem = {
  id: string;
  content: string;
  date: string;
  metadata: {
    rating: string;
  };
};

export class AppStoreConnector implements Connector<State, Settings> {
  settings: Settings;

  constructor(settings: Settings) {
    this.settings = settings;
  }

  async get(
    state: Partial<State>,
  ): Promise<{ result: ExportItem[]; state: State }> {
    const token = await generateTokenWithSub(
      this.settings.keyId,
      this.settings.key,
    );

    try {
      let messages: AppStoreItem[] = [];
      let hasMore = true;
      let next_last_ids = new Set<string>();
      const last_ids = new Set<string>(state.lastIds || []);
      let cursor: string | undefined = state.lastCursor;
      // console.log('entry cursor', cursor);
      while (hasMore) {
        // need to handle paging
        const result = await getAppData(
          this.settings.appId,
          token,
          cursor,
        );
        // just in case, just keep customer reviews
        result.data = result.data.filter((e) => {
          return e.type === "customerReviews";
        });
        console.log("got", result.data.length);
        if (result.data) {
          next_last_ids = new Set(result.data.map((e) => e.id));
          messages = messages.concat(
            result.data
              .filter((e) => !last_ids.has(e.id))
              .map((e) => ({
                id: e.id,
                content: e.attributes.body,
                date: prepare_date_appstore(e.attributes.createdDate),
                metadata: {
                  rating: "" + e.attributes.rating,
                },
              })),
          );
        }
        console.log("links", result.links);
        // TODO: handle paging properly
        hasMore = Boolean(result.links.next) || false;
        if (result.links.next) {
          const c = new URL(result.links.next);
          console.log("did page", cursor);
          cursor = c.searchParams.get("cursor") as string;
        }
      }
      const result: ExportItem[] = messages;
      return {
        result,
        state: {
          lastCursor: cursor,
          // ensure on we don't have the smae multiple times on the last page
          lastIds: [...next_last_ids.values()],
        },
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des messages:", error);
      throw error;
    }
  }
}
