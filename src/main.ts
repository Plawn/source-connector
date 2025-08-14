import { Hono } from "hono";
import { SlackConnector } from "./slack_connector.ts";
import { TruspilotConnector } from "./trustpilot_connector.ts";
import { AppStoreConnector } from "./app_store_connector.ts";
import { prometheus } from "npm:@hono/prometheus";
import {} from "npm:prom-client";
import { MapsConnector } from "./google_maps.ts";
import { TripadivsorConnector } from "./tripadvisor.ts";

const app = new Hono();

const { printMetrics, registerMetrics } = prometheus();

// @ts-ignore
app.use("*", registerMetrics);
// @ts-ignore
app.get("/metrics", printMetrics);

function getConnector(name: string, settings: string) {
  switch (name) {
    case "slack":
      // TODO should check params
      return new SlackConnector(JSON.parse(settings));
    case "trustpilot":
      // TODO should check params
      return new TruspilotConnector(JSON.parse(settings));
    case "app_store":
      // TODO should check params
      return new AppStoreConnector(JSON.parse(settings));
    case "play_store":
      // TODO should check params
      // return new GoogleConnector(JSON.parse(settings));
      throw new Error("not supported anymore");
    case "maps":
      return new MapsConnector(JSON.parse(settings));
    // case "tripadvisor":
    //   return new TripadivsorConnector(JSON.parse(settings));
    default:
      // TODO: throw 404
      throw new Error("failed to find connector");
  }
}

type Input = {
  state?: string | undefined | null;
  settings: string;
};

app.post("/:connectorName", async (c) => {
  const connectorName = c.req.param("connectorName");
  // TODO: validate
  const params: Input = await c.req.json();
  const connector = getConnector(connectorName, params.settings);
  console.log("using connector", connector);
  // should check params of state
  const state = JSON.parse(params.state || "{}");
  const result = await connector.get(state);

  return c.json({
    result: result.result,
    state: JSON.stringify(result.state),
  });
});

Deno.serve(app.fetch);
