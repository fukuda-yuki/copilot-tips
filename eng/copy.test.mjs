// 利用者に見える文言 (ボードのページ、感想スレッドの本文) に、説明のための文が混ざっていないかを確かめる。
// 方針は AGENTS.md の「利用者に見える文言」。ここで止めるのは典型的な言い回しだけ。
import { test } from "node:test";
import assert from "node:assert/strict";
import { renderBoard } from "./board.mjs";
import { discussionBody } from "./board-collect.mjs";

/** 書かない言い回しと、その理由。 */
const BANNED = [
  [/です。|ます。|ません。|ください/, "です・ます調の文は説明になりやすい。名詞か短い指示で書く"],
  [/押すと|クリック|並べ替わ|見られ|できます/, "画面の操作方法を説明しない"],
  [/自動で|GitHub Actions|集計/, "どう作られたか・どう集めたかを書かない"],
  [/この(ページ|スレッド|数字)|について/, "いま見ているものを言い直さない"],
  [/合計/, "見えている数字を言い直さない"],
];

/** 利用者に見える文字だけを取り出す (タグ・スクリプト・スタイル・コメントは除く)。 */
function visibleText(html) {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;|&#\d+;/g, " ");
}

function sampleTexts() {
  // Skill の説明や感想は書き手のものなので、ここでは中立な文字で置き換える
  const skills = [
    { name: "a", description: "x", plugins: ["p"], versions: { p: "1.0.0" }, authors: [{ name: "n", url: "https://example.com" }], published: "2026-01-01T00:00:00Z", updated: "2026-11-13T00:00:00Z" },
    { name: "b", description: "x", plugins: [], versions: {}, authors: [], published: "2026-11-13T00:00:00Z", updated: "2026-11-13T00:00:00Z" },
  ];
  const stats = {
    generatedAt: "2026-11-14T00:00:00Z",
    skills: { a: { url: "https://example.com/1", number: 1, up: 1, commentCount: 1, comments: [{ url: "u", body: "c", createdAt: "2026-11-13T00:00:00Z", author: "m" }] } },
  };
  const files = renderBoard({ skills, stats });
  const texts = Object.entries(files).filter(([f]) => f.endsWith(".html")).map(([f, html]) => [f, visibleText(html)]);
  texts.push(["感想スレッドの本文", visibleText(discussionBody("a"))]);
  return texts;
}

test("利用者に見える文言に説明の文を入れない", () => {
  for (const [where, text] of sampleTexts()) {
    for (const [pattern, reason] of BANNED) {
      const hit = pattern.exec(text);
      assert.equal(hit, null, `${where}: 「${hit?.[0]}」 ${reason}`);
    }
  }
});
