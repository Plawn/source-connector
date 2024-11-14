import { Hono } from "hono";
import { Settings, SlackConnector, State } from "./slack_connector.ts";
import { Input } from "./connector.ts";
import { TruspilotConnector } from "./trustpilot_connector.ts";

const app = new Hono();

// const connectors = {
//   "slack": SlackConnector,
//   "truspilot": TruspilotConnector,
// }

function getConnector(name: string, settings: string) {
  switch (name) {
    case "slack":
      // should check params
      return new SlackConnector(JSON.parse(settings));
    case "trustpilot":
      // should check params
      return new TruspilotConnector(JSON.parse(settings));
    default:
      throw new Error("failed to find connector");
  }
}

type Input = {
  state: string;
  settings: string;
};


app.post("/:connector_name", async (c) => {
  // comes from post json params
  const connector_name = "";
  const params: Input = await c.req.json();
  // should check params of state
  const state: State = JSON.parse(params.state);
  const connector = getConnector(connector_name, params.settings);

  const result = await connector.get(state);

  return c.json({
    result: result.result,
    state: JSON.stringify(result.state),
  });
});

Deno.serve(app.fetch);
