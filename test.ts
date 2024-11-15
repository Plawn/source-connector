async function testTrustpilot() {
  const params = {
    businessUnitId: Deno.env.get("TRUSTPILOT_ID"),
    apiKey: Deno.env.get("TRUSTPILOT_API"),
  };

  const res = await fetch("https://source.temp1-webservice.blumana.app/trustpilot", {
    method: "POST",
    body: JSON.stringify({
      state: "{}",
      settings: JSON.stringify(params),
    }),
  });

  const j = await res.json();

  await Deno.writeTextFile("res-trustpilot.json", JSON.stringify(j));
}


async function testSlack() {
    const params = {
      channelId: Deno.env.get("SLACK_CHANNEL"),
      botToken: Deno.env.get("SLACK_KEY"),
    };
  
    const res = await fetch("https://source.temp1-webservice.blumana.app/slack", {
      method: "POST",
      body: JSON.stringify({
        state: "{}",
        settings: JSON.stringify(params),
      }),
    });
  
    const j = await res.json();
  
    await Deno.writeTextFile("res-slack.json", JSON.stringify(j));
  }

// await testTrustpilot();
await testSlack();
