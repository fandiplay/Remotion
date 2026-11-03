import { mkdirSync, writeFileSync } from "node:fs";

const TEXT =
  "Kok bisa ya, iklan di papan stadion berbeda, padahal pertandingan yang ditonton sama?";

async function tts(label: string, extra: Record<string, string>) {
  const r = await fetch("https://api.speechify.ai/v1/audio/stream", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SPEECHIFY_API_KEY}`,
      Accept: "audio/mpeg",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: TEXT,
      voice_id: "laras",
      model: "simba-3.0",
      ...extra,
    }),
  });
  console.log(label, "->", r.status);
  if (!r.ok) {
    console.log(await r.text());
    return;
  }
  mkdirSync("public/vo", { recursive: true });
  writeFileSync(`public/vo/test-${label}.mp3`, Buffer.from(await r.arrayBuffer()));
  console.log(`OK -> public/vo/test-${label}.mp3`);
}

async function main() {
  if (!process.env.SPEECHIFY_API_KEY) {
    throw new Error("SPEECHIFY_API_KEY belum ada di .env");
  }
  const v = await fetch("https://api.speechify.ai/v1/voices", {
    headers: { Authorization: `Bearer ${process.env.SPEECHIFY_API_KEY}` },
  });
  const d = await v.json();
  console.log("voices:", d.voices?.length, "has_more:", d.has_more);

  await tts("id-ID", { language: "id-ID" });
  await tts("auto", {});
}
main();
