async function testTrustpilot() {
  const params = {
    businessUnitId: Deno.env.get("TRUSTPILOT_ID"),
    apiKey: Deno.env.get("TRUSTPILOT_API"),
  };

  const res = await fetch("http://localhost:8000/trustpilot", {
    method: "POST",
    body: JSON.stringify({
      state: "{}",
      settings: JSON.stringify(params),
    }),
  });

  const j = await res.json();

  await Deno.writeTextFile("res-trustpilot.json", JSON.stringify(j));
}

await testTrustpilot();
