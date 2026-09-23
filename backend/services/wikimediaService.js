// Wikimedia Commons & Wikipedia Page Images Service
// Resolves authentic, genuine, real-world photography for hotels, landmarks, and travel activities in Sri Lanka.
// Adheres strictly to Wikimedia API policies (User-Agent header, thumbnail resizing, media filtering, geographic relevance).

const https = require("https");

const USER_AGENT = "SriLankaTripPlanner/1.0 (contact@tripplanner.local; open-source travel planner)";

// In-memory cache to guarantee sub-millisecond response times on repeated queries
const imageCache = new Map();

// Blacklisted keywords in image titles to filter out maps, diagrams, logos, and non-photographic assets
const TITLE_BLACKLIST = [
  "map",
  "plan",
  "logo",
  "flag",
  "diagram",
  "coat_of_arms",
  "arms_of",
  "blason",
  "seal_of",
  "icon",
  "locator",
  "stamp",
  "currency",
  "coin",
  "banknote",
  "symbol",
  "drawing",
  "sketch",
  "illustration",
  "location",
  "route",
  "schema",
  "emblem",
  "chart",
  "graph",
];

// Common generic stop words that shouldn't alone count as an entity match
const STOP_WORDS = new Set([
  "hotel",
  "resort",
  "spa",
  "villas",
  "villa",
  "inn",
  "stay",
  "homestay",
  "the",
  "and",
  "in",
  "at",
  "of",
  "road",
  "street",
  "city",
  "house",
  "lodge",
  "retreat",
  "deluxe",
  "boutique",
  "luxury",
  "palace",
  "suites",
  "suite",
  "beach",
  "park",
  "view",
]);

/**
 * Extract distinctive identifying words from an entity name (excluding city name & stop words)
 */
function getDistinctiveKeywords(name = "", destination = "") {
  const destWords = (destination || "").toLowerCase().split(/\s+/);
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w) && !destWords.includes(w));
}

/**
 * Perform a safe GET request returning parsed JSON
 */
function fetchJson(url) {
  return new Promise((resolve) => {
    const req = https.get(
      url,
      {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "application/json",
        },
      },
      (res) => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          res.resume();
          return resolve(null);
        }
        let raw = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(raw));
          } catch (err) {
            resolve(null);
          }
        });
      }
    );

    req.on("error", () => resolve(null));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(null);
    });
  });
}

/**
 * Filter image title to ensure it is a real photograph and not an icon, map, or logo
 */
function isValidPhotoTitle(title = "") {
  const lower = title.toLowerCase();
  for (const b of TITLE_BLACKLIST) {
    if (lower.includes(b)) return false;
  }
  return true;
}

/**
 * Validate that a search result is genuinely about the target entity and in Sri Lanka
 */
function isConfidentMatch(entityName, resultTitle, resultContext = "", destination = "") {
  const keywords = getDistinctiveKeywords(entityName, destination);
  if (keywords.length === 0) return false;

  const text = `${resultTitle} ${resultContext}`.toLowerCase();

  // 1. Must match at least one distinctive keyword from the entity's actual name
  const matched = keywords.filter((k) => text.includes(k));
  if (matched.length === 0) return false;

  // 2. Must be geographically linked to Sri Lanka or destination
  const destLower = (destination || "").toLowerCase();
  const isSriLankan =
    text.includes("sri lanka") ||
    text.includes("ceylon") ||
    (destLower && text.includes(destLower));

  return isSriLankan;
}

/**
 * 1. Fetch Primary Image via Wikipedia Page Images API
 */
async function searchWikipediaPageImage(query, entityName = "", destination = "") {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      query
    )}&format=json&utf8=1&srlimit=3`;
    const searchRes = await fetchJson(searchUrl);
    const searchResults = searchRes?.query?.search || [];

    if (searchResults.length === 0) return null;

    // Check top results for confident match
    let matchedPage = null;
    for (const res of searchResults) {
      if (isConfidentMatch(entityName, res.title, res.snippet || "", destination)) {
        matchedPage = res;
        break;
      }
    }

    if (!matchedPage) return null;

    const pageUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
      matchedPage.title
    )}&prop=pageimages|info&pithumbsize=1200&format=json`;
    const pageRes = await fetchJson(pageUrl);
    const pages = pageRes?.query?.pages;
    if (!pages) return null;

    const pageId = Object.keys(pages)[0];
    const thumbUrl = pages[pageId]?.thumbnail?.source;
    if (thumbUrl && !thumbUrl.endsWith(".svg")) {
      return {
        title: matchedPage.title,
        url: thumbUrl,
        source: "wikipedia",
      };
    }
    return null;
  } catch (err) {
    return null;
  }
}

/**
 * 2. Search Wikimedia Commons Media Files
 */
async function searchWikimediaCommons(query, entityName = "", destination = "", maxResults = 4) {
  try {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      query + " filetype:bitmap"
    )}&gsrnamespace=6&prop=imageinfo&iiprop=url|mime|extmetadata&iiurlwidth=1200&gsrlimit=${Math.max(
      maxResults * 2,
      8
    )}&format=json`;

    const res = await fetchJson(url);
    const pages = res?.query?.pages;
    if (!pages) return [];

    const photos = [];
    for (const pid of Object.keys(pages)) {
      const page = pages[pid];
      const title = page.title || "";
      if (!isValidPhotoTitle(title)) continue;

      const meta = page.imageinfo?.[0]?.extmetadata;
      const desc = meta?.ImageDescription?.value || "";
      const categories = meta?.Categories?.value || "";

      // Ensure confident match to the entity in Sri Lanka
      if (!isConfidentMatch(entityName, title, `${desc} ${categories}`, destination)) {
        continue;
      }

      const info = page?.imageinfo?.[0];
      const mime = (info?.mime || "").toLowerCase();
      if (!mime.startsWith("image/") || mime.includes("svg")) continue;

      const photoUrl = info.thumburl || info.url;
      if (photoUrl) {
        photos.push({
          title,
          url: photoUrl,
          source: "wikimedia",
        });
        if (photos.length >= maxResults) break;
      }
    }

    return photos;
  } catch (err) {
    return [];
  }
}

/**
 * Search Wikimedia for a hotel or attraction, returning both primary photo and gallery photos
 * @param {string} name - Entity name (e.g. "Galle Face Hotel", "Temple of the Tooth")
 * @param {string} destination - Destination or region context (e.g. "Colombo", "Kandy")
 * @returns {Promise<{ primary: string|null, gallery: string[] }>}
 */
async function getPhotosForEntity(name = "", destination = "") {
  if (!name) return { primary: null, gallery: [] };

  const cacheKey = `${name.trim().toLowerCase()}_${(destination || "").trim().toLowerCase()}`;
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }

  // Targeted search queries: always anchored to destination and Sri Lanka
  const queriesToTry = [
    destination ? `${name} ${destination} Sri Lanka` : `${name} Sri Lanka`,
    name,
  ];

  let primary = null;
  const gallery = [];

  // 1. Try Wikimedia Commons search first (best for galleries and authentic architectural shots)
  for (const q of queriesToTry) {
    const commonsPhotos = await searchWikimediaCommons(q, name, destination, 4);
    if (commonsPhotos.length > 0) {
      if (!primary) primary = commonsPhotos[0].url;
      for (const p of commonsPhotos) {
        if (!gallery.includes(p.url)) {
          gallery.push(p.url);
        }
      }
      if (gallery.length >= 2) break;
    }
  }

  // 2. Fall back to Wikipedia Page Image
  if (!primary) {
    for (const q of queriesToTry) {
      const wikiImage = await searchWikipediaPageImage(q, name, destination);
      if (wikiImage && wikiImage.url) {
        primary = wikiImage.url;
        if (!gallery.includes(wikiImage.url)) {
          gallery.unshift(wikiImage.url);
        }
        break;
      }
    }
  }

  const result = {
    primary,
    gallery: gallery.slice(0, 4),
  };

  // Cache result
  imageCache.set(cacheKey, result);
  return result;
}

module.exports = {
  getPhotosForEntity,
  searchWikipediaPageImage,
  searchWikimediaCommons,
};
