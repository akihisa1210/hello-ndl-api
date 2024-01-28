import { parse } from "https://deno.land/x/xml@2.1.3/mod.ts";

const title = Deno.args[0];
if (!title) {
  console.log(
    "書籍名を指定してください。 Usage: deno run --allow-net main.ts <書籍名>"
  );
  Deno.exit(1);
}

// 最大取得件数
const MAX_RESULTS = 20;

// データプロバイダーID
const DATA_PROVIDER_ID = "iss-ndl-opac";

const url = `https://ndlsearch.ndl.go.jp/api/opensearch?title=${encodeURIComponent(
  title
)}&cnt=${MAX_RESULTS}&dpid=${DATA_PROVIDER_ID}`;

const res = await fetch(url);
const body = await res.text();

const parsedXML = parse(body);
// デバッグ用
// console.log(parsedXML);

const extractInfo = (item: any) => {
  const author = item.author ?? "N/A";
  const bookTitle = item["dc:title"] ?? "N/A";
  const publisher = item["dc:publisher"] ?? "N/A";
  const publicationYear = item["dc:date"]?.["#text"] ?? "N/A";

  return `${author}, 『${bookTitle}』, ${publisher}, ${publicationYear}`;
};

// 検索結果が1つしかない場合は、itemは書誌情報のオブジェクトになる
// 検索結果が複数ある場合は、itemは書誌情報のオブジェクトの配列になる
// 後の処理をシンプルにしたいので、検索結果が1つの場合も配列になるようにする
const result = parsedXML.rss.channel.item;
const items = Array.isArray(result) ? result : [result];
items.forEach((item: any) => {
  console.log(extractInfo(item));
});
