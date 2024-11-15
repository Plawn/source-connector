import { Hono } from "hono";
import { Settings, SlackConnector, State } from "./slack_connector.ts";
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

app.post("/:connectorName", async (c) => {
  // comes from post json params
  const connectorName = c.req.param("connectorName");
  const params: Input = await c.req.json();
  // should check params of state
  const state: State = JSON.parse(params.state);
  const connector = getConnector(connectorName, params.settings);

  const result = await connector.get(state);

  return c.json({
    result: result.result,
    state: JSON.stringify(result.state),
  });
});

Deno.serve(app.fetch);
