async function testTrustpilot() {
  const params = {
    businessUnitId: Deno.env.get("TRUSTPILOT_ID"),
    apiKey: Deno.env.get("TRUSTPILOT_API"),
  };

  //   const res = await fetch("https://source.temp1-webservice.blumana.app/trustpilot", {
  const res = await fetch("http://localhost:8000/trustpilot", {
    method: "POST",
    body: JSON.stringify({
      state:
        '{\"page\":113,\"last_ids\":[\"67370411e6adce7989055f7a\",\"673711d1a1c708cf599ecff0\",\"67371601716d1f5032037433\",\"67371eec0b1c475c501138ca\",\"673740e609bd12d8282d1eb6\",\"6737534f7eddc857b2f37aec\",\"6737887aab269b42df19dfcd\",\"67378ebeea4b957b6d319c54\",\"6737953605eaa6448b882ffd\",\"67379fbb4efd6ea92c1d74ca\",\"673854d1dbcab5164c4f8c51\",\"6738b649cdeee758c458fc22\",\"6738bc8a950c1488ded06be7\",\"6738c6c0b466b38a68f8bb25\",\"6738d8f2eb7caadce228d5f2\"]}',
      settings: JSON.stringify(params),
    }),
  });

  const j = await res.json();
  console.log(j.result.length);

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

await testTrustpilot();
// await testSlack();
