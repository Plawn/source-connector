import {
    extractFromResultFeedbacks,
    extractFromResultUpdateTokens,
    // extractUpdateTokens,
} from "./extract_utils.ts";

function prepareAfterEval(data: any) {
    const results = data.urqlSsrData.results;
    for (const e of Object.values(results)) {
        const d = JSON.parse((e as any).data);
        if ("Result" in d) {
            const result = d.Result;
            // await Deno.writeTextFile("index_result.json", JSON.stringify(result));
            const links = extractFromResultUpdateTokens(result);
            const reviews = extractFromResultFeedbacks(result);
            return { links, reviews };
        }
    }
    throw new Error("failed to find links");
}

function findFirstFromEnd(s: string, c: string) {
    for (let i = s.length;; i--) {
        if (s[i] === c) {
            return i;
        }
    }
}

function findEnd(s: string) {
    const i = findFirstFromEnd(s, '"');
    return i - s.length;
}

export async function getResults(html: string) {
    const start = `<script async src="data:text/javascript,`;
    const match = html.indexOf(start);

    // console.log(match);
    const end = findEnd(html);
    console.log(end);
    // const end = -41;
    // await Deno.writeTextFile("slice", html.slice(match + start.length, end));
    const js = decodeURIComponent(html.slice(match + start.length, end));
    // console.log(js);
    // await Deno.writeTextFile("extract.js", js);
    const json_start = 'JSON.parse("';
    const end_json = -3;
    const json_start_index = js.indexOf(json_start);
    const data = js.slice(json_start_index, end_json);
    await Deno.writeTextFile("final.js", data);
    console.log(data);
    const r = eval(data);
    // console.log(r);
    // await Deno.writeTextFile("index.json", JSON.stringify(r));
    const links = prepareAfterEval(r);
    return links;
}

async function test() {
    const html = await Deno.readTextFile("example/index.html");
    return getResults(html);
}
console.log(await test());
