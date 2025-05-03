
function makeBody(
    location: Location,
    page: string,
    pageUpdateToken: string,
    // sessionId: string,
  ) {
    const offset = (Number(page) - 1) * 10;
    const {detailId, geoId} = location;
    const input = [{
      "variables": {
        "page": "Attraction_Review",
        "pos": "fr-CA",
        "parameters": [{ "key": "geoId", "value": `${geoId}` }, {
          "key": "detailId",
          "value": `${detailId}`,
        }, { "key": "offset", "value": `r${offset}` }],
        "factors": [
          "TITLE",
          "META_DESCRIPTION",
          "MASTHEAD_H1",
          "MAIN_H1",
          "IS_INDEXABLE",
          "RELCANONICAL",
        ],
        "route": {
          "page": "Attraction_Review",
          "params": {
            "geoId": geoId,
            "detailId": detailId,
            "offset": `r${offset}`,
          },
        },
        "currencyCode": "CAD",
      },
      "extensions": { "preRegisteredQueryId": "18d4572907af4ea5" },
    }, {
      "variables": {
        "pageName": "Attraction_Review",
        "relativeUrl":
          "/Attraction_Review-g155032-d155197-Reviews-or50-Casino_de_Montreal-Montreal_Quebec.html",
        "parameters": [{ "key": "geoId", "value": `${geoId}` }, {
          "key": "detailId",
          "value": `${detailId}`,
        }, { "key": "offset", "value": `r${offset}` }],
        "route": {
          "page": "Attraction_Review",
          "params": {
            "geoId": geoId,
            "detailId": detailId,
            "offset": `r${offset}`,
          },
        },
        "routingLinkBuilding": false,
      },
      "extensions": { "preRegisteredQueryId": "211573a2b002568c" },
    }, {
      "variables": {
        "request": {
        //   "tracking": {
        //     "screenName": "Attraction_Review",
        //     "pageviewUid": "fb2501b1-678e-4cdd-80a4-cbc86f24db61",
        //   },
          "routeParameters": {
            "contentType": "attraction",
            "contentId": `${detailId}`,
          },
          "clientState": null,
          // TODO: finalyze using this
          "updateToken": pageUpdateToken,
        },
        // "commerce": {@},
        // "sessionId": "39765D0F98D8CBA16A3041D8876E4827",
        // "tracking": {
        //   "screenName": "Attraction_Review",
        //   "pageviewUid": "fb2501b1-678e-4cdd-80a4-cbc86f24db61",
        // },
        "currency": "CAD",
        "currentGeoPoint": null,
        "unitLength": "KILOMETERS",
      },
      "extensions": { "preRegisteredQueryId": "0426c00949a5ece4" },
    }, {
      "variables": {
        "page": "Attraction_Review",
        "params": [{ "key": "geoId", "value": `${geoId}` }, {
          "key": "detailId",
          "value": `${detailId}`,
        }, { "key": "offset", "value": `r${offset}` }],
        "route": {
          "page": "Attraction_Review",
          "params": {
            "geoId": geoId,
            "detailId": detailId,
            "offset": `r${offset}`,
          },
        },
      },
      "extensions": { "preRegisteredQueryId": "f742095592a84542" },
    }];
    return input;
  }

export type Location = {
    url: string;
    geoId: number;
    detailId: number;
}

export async function loadPage(
    location: Location,
    page: string,
    updateToken: string,
) {
    const body = makeBody(location, page, updateToken);

    const req = await fetch("https://fr.tripadvisor.ca/data/graphql/ids", {
        "headers": {
          "accept": "*/*",
          "accept-language": "fr-FR,fr;q=0.9",
          "content-type": "application/json",
          "priority": "u=1, i",
          "sec-ch-device-memory": "8",
          "sec-ch-ua": '"Not?A_Brand";v="99", "Chromium";v="130"',
          "sec-ch-ua-arch": '"arm"',
          "sec-ch-ua-full-version-list":
            '"Not?A_Brand";v="99.0.0.0", "Chromium";v="130.0.6723.174"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-model": '""',
          "sec-ch-ua-platform": '"macOS"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "same-origin",
          "sec-fetch-site": "same-origin",
          "sec-gpc": "1",
        },
        "referrer": location.url,
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": JSON.stringify(body),
        "method": "POST",
        "mode": "cors",
        "credentials": "include",
      });
      const resp = await req.json();
      return resp;
}