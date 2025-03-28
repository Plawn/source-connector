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
        '{"page":113,"last_ids":["67370411e6adce7989055f7a","673711d1a1c708cf599ecff0","67371601716d1f5032037433","67371eec0b1c475c501138ca","673740e609bd12d8282d1eb6","6737534f7eddc857b2f37aec","6737887aab269b42df19dfcd","67378ebeea4b957b6d319c54","6737953605eaa6448b882ffd","67379fbb4efd6ea92c1d74ca","673854d1dbcab5164c4f8c51","6738b649cdeee758c458fc22","6738bc8a950c1488ded06be7","6738c6c0b466b38a68f8bb25","6738d8f2eb7caadce228d5f2"]}',
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
    // const res = await fetch("http://localhost:8000/slack", {
    method: "POST",
    body: JSON.stringify({
      state:
        '{"last_ids":["1731859345.155019","1731859342.622239","1731859339.016269","1731859333.165229","1731859328.085839","1731859327.926829","1731859327.836099","1731859327.748379","1731859327.670149","1731859323.310419"]}',
      settings: JSON.stringify(params),
    }),
  });

  const j = await res.json();

  await Deno.writeTextFile("res-slack.json", JSON.stringify(j));
}

async function testAppStore() {
  const params = {
    appId: Deno.env.get("APPSTORE_APPID"),
    key: Deno.env.get("APPSTORE_KEY"),
    keyId: Deno.env.get("APPSTORE_KEYID"),
  };

  const state =
    '{"lastCursor":"BOI.AN8kDFM","lastIds":["00000056-5c27-ad02-577c-7bc300000000","00000056-5c27-ad02-52cb-527600000000","00000056-5c27-ad02-5000-b24d00000000","00000056-5c27-ad02-4946-6da300000000","00000056-5c27-ad02-4736-51d800000000","00000056-5c27-ad02-460b-18f200000000","00000056-5c27-ad02-3b96-e5c000000000","00000056-5c27-ad02-38ea-419c00000000","00000056-5c27-ad02-36dc-309100000000","00000056-5c27-ad02-3362-304200000000","00000056-5c27-ad02-31d7-c8ff00000000","00000056-5c27-ad02-0560-bd9f00000000","00000056-5c27-ad01-f0f5-b2cc00000000","00000056-5c27-ad01-ef9f-f17b00000000","00000056-5c27-ad01-e265-3cdb00000000","00000056-5c27-ad01-daa5-1df100000000","00000056-5c27-ad01-d757-170900000000","00000056-5c27-ad01-cd98-7a8400000000","00000056-5c27-ad01-b694-b7b900000000","00000056-5c27-ad01-aa73-235f00000000","00000056-5c27-ad01-9243-5da100000000","00000056-5c27-ad01-9136-3b4500000000","00000056-5c27-ad01-8b1e-78f700000000","00000056-5c27-ad01-7429-0b4800000000","00000056-5c27-ad01-73b1-2ae500000000","00000056-5c27-ad01-44e8-ad1500000000","00000056-5c27-ad01-2549-5dbf00000000","00000056-5c27-ad01-0b08-705d00000000"]}';

  // const res = await fetch("https://source.temp1-webservice.blumana.app/slack", {
  const res = await fetch("http://localhost:8000/app_store", {
    method: "POST",
    body: JSON.stringify({
      // state: JSON.stringify(state),
      state,
      settings: JSON.stringify(params),
    }),
  });

  const j = await res.json();

  await Deno.writeTextFile("res-appstore.json", JSON.stringify(j));
}

async function testPlaystoreStore() {
  const params = {
    refreshToken: Deno.env.get("PLAYSTORE_REFRESH"),
    basic: Deno.env.get("PLAYSTORE_BASIC"),
    appId: Deno.env.get("PLAYSTORE_APPID"),
  };

  const state = "{}";

  const res = await fetch("http://localhost:8000/play_store", {
    method: "POST",
    body: JSON.stringify({
      // state: JSON.stringify(state),
      state,
      settings: JSON.stringify(params),
    }),
  });

  const j = await res.json();
  console.log("got", j.result.length);

  await Deno.writeTextFile("res-playstore.json", JSON.stringify(j));
}

async function testMaps() {
  const params = {
    url: "https://www.google.com/maps/place/Krispy+Kreme+-+Gare+Ch%C3%A2telet+RATP/@48.8624293,2.3467738,17z/data=!3m1!4b1!4m6!3m5!1s0x47e66f54aa0bb9f7:0x1f2e322a2e2ee1db!8m2!3d48.8624293!4d2.3467738!16s%2Fg%2F11wnn12_v5",
  };

  const state = "{\"last_ids\":[\"ChZDSUhNMG9nS0VJQ0FnTUR3cDVDMFZnEAE\",\"ChdDSUhNMG9nS0VJQ0FnTUR3eDg3aW1BRRAB\",\"ChdDSUhNMG9nS0VJQ0FnTUR3eDVUY3V3RRAB\",\"ChdDSUhNMG9nS0VJQ0FnTUR3aC11MzR3RRAB\"]}";
  const res = await fetch("http://localhost:8000/maps", {
    method: "POST",
    body: JSON.stringify({
      // state: JSON.stringify(state),
      state,
      settings: JSON.stringify(params),
    }),
  });

  const j = await res.json();
  console.log("got", j.result.length);

  await Deno.writeTextFile("res-maps.json", JSON.stringify(j));
}

// await testTrustpilot();
// await testSlack();
// await testAppStore();
// await testPlaystoreStore();
await testMaps();
