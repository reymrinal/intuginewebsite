const INDEXNOW_KEY = "756e7247211148e21808006bd23cdc23";
const HOST = "library.intugine.com";
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

export async function pingIndexNow(urls: string[]): Promise<void> {
  if (!urls.length) return;

  const body = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });

  console.log(`IndexNow ping: ${res.status} for ${urls.length} URL(s)`);
}

export function slugToUrl(slug: string): string {
  return `https://${HOST}/${slug}`;
}
