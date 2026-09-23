// Pexels API Service
// Resolves high-resolution photography for generic activities ("Hiking", "Snorkeling", "Fine Dining")
// and generic destination cards/header backgrounds.
// Uses in-memory caching to respect rate limits and provides instant curated CDN fallbacks.

const https = require("https");

// In-memory cache for Pexels search results
const pexelsCache = new Map();

// Curated high-resolution direct Pexels CDN images for generic activities & categories
// These ensure immediate, reliable rendering even when API keys are not configured or rate-limited.
const CURATED_PEXELS_ACTIVITIES = {
  hiking: "https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=1200",
  snorkeling: "https://images.pexels.com/photos/3046582/pexels-photo-3046582.jpeg?auto=compress&cs=tinysrgb&w=1200",
  finedining: "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1200",
  food: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=1200",
  cooking: "https://images.pexels.com/photos/4253302/pexels-photo-4253302.jpeg?auto=compress&cs=tinysrgb&w=1200",
  surfing: "https://images.pexels.com/photos/1654498/pexels-photo-1654498.jpeg?auto=compress&cs=tinysrgb&w=1200",
  safari: "https://images.pexels.com/photos/631317/pexels-photo-631317.jpeg?auto=compress&cs=tinysrgb&w=1200",
  zipline: "https://images.pexels.com/photos/2832061/pexels-photo-2832061.jpeg?auto=compress&cs=tinysrgb&w=1200",
  wellness: "https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=1200",
  massage: "https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=1200",
  beach: "https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1200",
  sunset: "https://images.pexels.com/photos/189349/pexels-photo-189349.jpeg?auto=compress&cs=tinysrgb&w=1200",
  market: "https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg?auto=compress&cs=tinysrgb&w=1200",
  scenic: "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=1200",
  waterfall: "https://images.pexels.com/photos/358457/pexels-photo-358457.jpeg?auto=compress&cs=tinysrgb&w=1200",
  adventure: "https://images.pexels.com/photos/2832061/pexels-photo-2832061.jpeg?auto=compress&cs=tinysrgb&w=1200",
  sightseeing: "https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg?auto=compress&cs=tinysrgb&w=1200",
};

// Curated high-resolution direct Pexels CDN images for generic destination cards & header backgrounds
const CURATED_PEXELS_DESTINATIONS = {
  ella: "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=1600",
  galle: "https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1600",
  kandy: "https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg?auto=compress&cs=tinysrgb&w=1600",
  sigiriya: "https://images.pexels.com/photos/2832061/pexels-photo-2832061.jpeg?auto=compress&cs=tinysrgb&w=1600",
  mirissa: "https://images.pexels.com/photos/189349/pexels-photo-189349.jpeg?auto=compress&cs=tinysrgb&w=1600",
  colombo: "https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "nuwara eliya": "https://images.pexels.com/photos/158607/cairn-fog-mystical-background-158607.jpeg?auto=compress&cs=tinysrgb&w=1600",
  trincomalee: "https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1600",
  default: "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=1600",
};

/**
 * Execute HTTP GET request against Pexels API
 * @param {string} query
 * @param {number} perPage
 * @returns {Promise<string|null>}
 */
function queryPexelsApi(query, perPage = 1) {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`;

    const req = https.get(
      url,
      {
        headers: {
          Authorization: apiKey.trim(),
          "User-Agent": "SriLankaTripPlanner/1.0",
        },
      },
      (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          return resolve(null);
        }

        let raw = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          try {
            const data = JSON.parse(raw);
            const photo = data?.photos?.[0];
            if (photo && photo.src) {
              const imageUrl = photo.src.large2x || photo.src.large || photo.src.landscape;
              return resolve(imageUrl);
            }
            resolve(null);
          } catch (err) {
            resolve(null);
          }
        });
      }
    );

    req.on("error", () => resolve(null));
    req.setTimeout(4000, () => {
      req.destroy();
      resolve(null);
    });
  });
}

/**
 * Search Pexels for an activity or generic theme
 * @param {string} query - e.g. "hiking", "snorkeling", "fine dining"
 * @returns {Promise<string|null>}
 */
async function searchPexelsPhotos(query) {
  if (!query) return null;
  const cleanKey = query.trim().toLowerCase();

  if (pexelsCache.has(cleanKey)) {
    return pexelsCache.get(cleanKey);
  }

  // 1. Attempt live Pexels API search if key configured
  const liveUrl = await queryPexelsApi(query);
  if (liveUrl) {
    pexelsCache.set(cleanKey, liveUrl);
    return liveUrl;
  }

  // 2. Curated Pexels fallback
  for (const [key, url] of Object.entries(CURATED_PEXELS_ACTIVITIES)) {
    if (cleanKey.includes(key)) {
      pexelsCache.set(cleanKey, url);
      return url;
    }
  }

  return null;
}

/**
 * Get Pexels photo for generic activities ("Hiking", "Snorkeling", "Fine Dining")
 * @param {string} title
 * @param {string} description
 * @param {string} category
 * @returns {Promise<string>}
 */
async function getPexelsActivityPhoto(title = "", description = "", category = "") {
  const corpus = `${title} ${description} ${category}`.toLowerCase();

  // Pattern detection for generic activities
  let query = "tropical outdoor experience";
  let fallbackKey = "scenic";

  if (corpus.includes("snorkel") || corpus.includes("scuba") || corpus.includes("coral") || corpus.includes("marine")) {
    query = "snorkeling tropical reef";
    fallbackKey = "snorkeling";
  } else if (corpus.includes("hike") || corpus.includes("hiking") || corpus.includes("trek") || corpus.includes("mountain trail") || (category && category.toLowerCase() === "hiking")) {
    query = "hiking mountain trail landscape";
    fallbackKey = "hiking";
  } else if (corpus.includes("fine dining") || corpus.includes("culinary") || corpus.includes("dinner") || corpus.includes("wine") || corpus.includes("restaurant") || corpus.includes("gourmet")) {
    query = "fine dining gourmet food";
    fallbackKey = "finedining";
  } else if (corpus.includes("cooking") || corpus.includes("curry") || corpus.includes("cooking class") || corpus.includes("chef")) {
    query = "cooking fresh ingredients food";
    fallbackKey = "cooking";
  } else if (corpus.includes("surf") || corpus.includes("wave") || corpus.includes("surfboard")) {
    query = "surfing ocean wave";
    fallbackKey = "surfing";
  } else if (corpus.includes("safari") || corpus.includes("elephant") || corpus.includes("wildlife") || corpus.includes("leopard")) {
    query = "wildlife safari nature";
    fallbackKey = "safari";
  } else if (corpus.includes("zipline") || corpus.includes("adventure") || (category && category.toLowerCase() === "adventure")) {
    query = "outdoor adventure nature";
    fallbackKey = "zipline";
  } else if (corpus.includes("massage") || corpus.includes("spa") || corpus.includes("ayurveda") || corpus.includes("wellness") || (category && category.toLowerCase() === "wellness")) {
    query = "wellness spa relaxation massage";
    fallbackKey = "wellness";
  } else if (corpus.includes("beach") || corpus.includes("sunset") || corpus.includes("bay") || (category && category.toLowerCase() === "beaches")) {
    query = "tropical beach ocean landscape";
    fallbackKey = "beach";
  } else if (corpus.includes("market") || corpus.includes("street food") || corpus.includes("bazaar")) {
    query = "vibrant food market street";
    fallbackKey = "market";
  } else if (corpus.includes("waterfall") || corpus.includes("falls") || corpus.includes("cascade")) {
    query = "tropical waterfall jungle";
    fallbackKey = "waterfall";
  }

  // Attempt Pexels API
  const pexelsPhoto = await searchPexelsPhotos(query);
  if (pexelsPhoto) return pexelsPhoto;

  // Curated Pexels CDN image
  return CURATED_PEXELS_ACTIVITIES[fallbackKey] || CURATED_PEXELS_ACTIVITIES.scenic;
}

/**
 * Get Pexels photo for generic destination cards and header backgrounds
 * @param {string} destination - e.g. "Ella", "Galle", "Kandy"
 * @returns {Promise<string>}
 */
async function getPexelsDestinationPhoto(destination = "") {
  const d = (destination || "").toLowerCase().trim();
  const cacheKey = `dest_${d}`;

  if (pexelsCache.has(cacheKey)) {
    return pexelsCache.get(cacheKey);
  }

  // 1. Live search if API key exists
  const searchQuery = d ? `${destination} landscape scenery tropical` : "Sri Lanka tropical scenery";
  const liveUrl = await queryPexelsApi(searchQuery);
  if (liveUrl) {
    pexelsCache.set(cacheKey, liveUrl);
    return liveUrl;
  }

  // 2. Curated destination fallback
  for (const [key, url] of Object.entries(CURATED_PEXELS_DESTINATIONS)) {
    if (d.includes(key)) {
      pexelsCache.set(cacheKey, url);
      return url;
    }
  }

  return CURATED_PEXELS_DESTINATIONS.default;
}

module.exports = {
  searchPexelsPhotos,
  getPexelsActivityPhoto,
  getPexelsDestinationPhoto,
  CURATED_PEXELS_ACTIVITIES,
  CURATED_PEXELS_DESTINATIONS,
};
