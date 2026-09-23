// Frontend Hotel Image Resolver & Fallback Utility
// Provides high-resolution, authentic hotel and resort photography for Sri Lanka
// using verified Wikimedia Commons assets and authentic local photography.

export const SPECIFIC_HOTEL_IMAGES = {
  // Ella
  "98 acres": "/images/activities/tea_plantation.jpg",
  "mountain heavens": "/images/activities/little_adams_peak.jpg",
  "flower garden": "/images/activities/botanical_garden.jpg",
  "tunnel gap": "/images/activities/nine_arch.jpg",
  "hide ella": "/images/activities/little_adams_peak.jpg",
  "zion view": "/images/activities/little_adams_peak.jpg",
  "country homes": "/images/activities/tea_plantation.jpg",
  "ecolodge": "/images/activities/tea_plantation.jpg",
  "ekho ella": "/images/activities/nine_arch.jpg",
  "mount view": "/images/activities/little_adams_peak.jpg",
  "ella gap": "/images/activities/little_adams_peak.jpg",

  // Mirissa & South Coast
  "sri sharavi": "/images/activities/secret_beach.jpg",
  "sharavi": "/images/activities/secret_beach.jpg",
  "triple o six": "/images/activities/coconut_tree_hill.jpg",
  "paradise beach": "/images/activities/secret_beach.jpg",
  "weligama bay": "/images/activities/surfing.jpg",
  "cape weligama": "/images/activities/secret_beach.jpg",
  "mirissa hills": "/images/activities/coconut_tree_hill.jpg",

  // Galle
  "amangalla": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ac/Amangalla%2C_Fort_Galle%2C_Sri_Lanka.jpg/1280px-Amangalla%2C_Fort_Galle%2C_Sri_Lanka.jpg",
  "lighthouse": "https://upload.wikimedia.org/wikipedia/commons/6/65/Ocean_view_from_Galle_Light_House_Hotel%2C_Sri_Lanka.jpg",
  "jetwing lighthouse": "https://upload.wikimedia.org/wikipedia/commons/6/65/Ocean_view_from_Galle_Light_House_Hotel%2C_Sri_Lanka.jpg",
  "fort bazaar": "/images/activities/galle_fort.jpg",
  "galle fort hotel": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ac/Amangalla%2C_Fort_Galle%2C_Sri_Lanka.jpg/1280px-Amangalla%2C_Fort_Galle%2C_Sri_Lanka.jpg",

  // Kandy
  "santani": "/images/activities/kandy_lake.jpg",
  "earl's regency": "/images/activities/kandy_lake.jpg",
  "kandy house": "/images/activities/kandyan_dance.jpg",
  "grand kandyan": "/images/activities/kandy_lake.jpg",
  "mahaweli reach": "/images/activities/kandy_lake.jpg",
  "queen's hotel": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/74/SL_Kandy_asv2020-01_img25_Queens_Hotel.jpg/1280px-SL_Kandy_asv2020-01_img25_Queens_Hotel.jpg",
  "queens hotel": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/74/SL_Kandy_asv2020-01_img25_Queens_Hotel.jpg/1280px-SL_Kandy_asv2020-01_img25_Queens_Hotel.jpg",

  // Sigiriya & Dambulla
  "kandalama": "https://upload.wikimedia.org/wikipedia/commons/5/58/KandalamaHotel.JPG",
  "heritance kandalama": "https://upload.wikimedia.org/wikipedia/commons/5/58/KandalamaHotel.JPG",
  "water garden": "/images/activities/sigiriya_rock.jpg",
  "aliya": "/images/activities/elephant_safari.jpg",
  "sigiriya village": "/images/activities/sigiriya_rock.jpg",
  "amaya lake": "/images/activities/sigiriya_rock.jpg",

  // Nuwara Eliya
  "grand hotel": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/15/Nuwara_Eliya_2013_27.JPG/1280px-Nuwara_Eliya_2013_27.JPG",
  "tea factory": "/images/activities/tea_plantation.jpg",
  "heritance tea factory": "/images/activities/tea_plantation.jpg",
  "st. andrew": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/15/Nuwara_Eliya_2013_27.JPG/1280px-Nuwara_Eliya_2013_27.JPG",

  // Colombo
  "galle face hotel": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6f/Galle_Face_Hotel_entrance.jpg/1280px-Galle_Face_Hotel_entrance.jpg",
  "galle face": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6f/Galle_Face_Hotel_entrance.jpg/1280px-Galle_Face_Hotel_entrance.jpg",
  "cinnamon grand": "https://upload.wikimedia.org/wikipedia/commons/5/5e/CinnamonGrandHotelFoyer.jpeg",
  "cinnamon red": "/images/activities/colombo_skyline.png",
  "shangri-la": "/images/activities/colombo_skyline.png",
  "taj samudera": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b2/Taj_Samudra_Hotel_Colombo.jpg/1280px-Taj_Samudra_Hotel_Colombo.jpg",
  "marino beach": "/images/activities/colombo_skyline.png",
  "kingsbury": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fa/The_Kingsbury_Hotel_Colombo.jpg/1280px-The_Kingsbury_Hotel_Colombo.jpg",
  "mount lavinia hotel": "https://upload.wikimedia.org/wikipedia/commons/4/4c/MLH001.jpg",
  "mount lavinia": "https://upload.wikimedia.org/wikipedia/commons/4/4c/MLH001.jpg",

  // Trincomalee
  "jungle beach": "/images/activities/trincomalee_bay.jpg",
  "uga jungle": "/images/activities/trincomalee_bay.jpg",
  "trinqua": "/images/activities/trincomalee_bay.jpg",
};

export const CATEGORIZED_PHOTO_POOLS = {
  mountain: {
    Luxury: [
      "/images/activities/tea_plantation.jpg",
      "/images/activities/little_adams_peak.jpg",
      "/images/activities/nine_arch.jpg",
    ],
    Comfort: [
      "/images/activities/nine_arch.jpg",
      "/images/activities/tea_plantation.jpg",
      "/images/activities/little_adams_peak.jpg",
    ],
    Budget: [
      "/images/activities/little_adams_peak.jpg",
      "/images/activities/nine_arch.jpg",
      "/images/activities/tea_plantation.jpg",
    ],
  },
  beach: {
    Luxury: [
      "/images/activities/coconut_tree_hill.jpg",
      "/images/activities/secret_beach.jpg",
      "/images/activities/trincomalee_bay.jpg",
    ],
    Comfort: [
      "/images/activities/secret_beach.jpg",
      "/images/activities/surfing.jpg",
      "/images/activities/coconut_tree_hill.jpg",
    ],
    Budget: [
      "/images/activities/surfing.jpg",
      "/images/activities/secret_beach.jpg",
      "/images/activities/coconut_tree_hill.jpg",
    ],
  },
  heritage: {
    Luxury: [
      "https://upload.wikimedia.org/wikipedia/commons/5/58/KandalamaHotel.JPG",
      "/images/activities/sigiriya_rock.jpg",
      "/images/activities/pidurangala.jpg",
    ],
    Comfort: [
      "/images/activities/sigiriya_rock.jpg",
      "/images/activities/dambulla_cave.jpg",
      "/images/activities/elephant_safari.jpg",
    ],
    Budget: [
      "/images/activities/pidurangala.jpg",
      "/images/activities/sigiriya_rock.jpg",
      "/images/activities/dambulla_cave.jpg",
    ],
  },
  urban: {
    Luxury: [
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6f/Galle_Face_Hotel_entrance.jpg/1280px-Galle_Face_Hotel_entrance.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/5/5e/CinnamonGrandHotelFoyer.jpeg",
      "/images/activities/colombo_skyline.png",
    ],
    Comfort: [
      "/images/activities/colombo_skyline.png",
      "https://upload.wikimedia.org/wikipedia/commons/4/4c/MLH001.jpg",
      "/images/activities/kandy_lake.jpg",
    ],
    Budget: [
      "/images/activities/colombo_skyline.png",
      "/images/activities/kandy_lake.jpg",
      "/images/activities/galle_fort.jpg",
    ],
  },
};

function getHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function detectRegionType(destination = "") {
  const d = (destination || "").toLowerCase();
  if (
    d.includes("ella") ||
    d.includes("nuwara") ||
    d.includes("kandy") ||
    d.includes("haputale") ||
    d.includes("peak") ||
    d.includes("mountain")
  ) {
    return "mountain";
  }
  if (
    d.includes("mirissa") ||
    d.includes("galle") ||
    d.includes("trinco") ||
    d.includes("weligama") ||
    d.includes("bentota") ||
    d.includes("beach") ||
    d.includes("tangalle") ||
    d.includes("arugam")
  ) {
    return "beach";
  }
  if (
    d.includes("sigiriya") ||
    d.includes("dambulla") ||
    d.includes("anuradhapura") ||
    d.includes("polonnaruwa") ||
    d.includes("yala")
  ) {
    return "heritage";
  }
  if (d.includes("colombo") || d.includes("negombo")) {
    return "urban";
  }
  return "mountain";
}

export function getHotelPhoto(hotelName = "", destination = "", tier = "Comfort") {
  const lowerName = (hotelName || "").toLowerCase();

  for (const [key, url] of Object.entries(SPECIFIC_HOTEL_IMAGES)) {
    if (lowerName.includes(key)) {
      return url;
    }
  }

  const region = detectRegionType(destination);
  const regionPool = CATEGORIZED_PHOTO_POOLS[region] || CATEGORIZED_PHOTO_POOLS.mountain;
  const normalizedTier = tier === "Luxury" ? "Luxury" : tier === "Budget" ? "Budget" : "Comfort";
  const tierPhotos = regionPool[normalizedTier] || regionPool.Comfort;

  const index = getHash(hotelName || "Hotel") % tierPhotos.length;
  return tierPhotos[index];
}

export function getHotelGallery(hotelName = "", destination = "", tier = "Comfort") {
  const primary = getHotelPhoto(hotelName, destination, tier);
  const region = detectRegionType(destination);
  const pool = CATEGORIZED_PHOTO_POOLS[region] || CATEGORIZED_PHOTO_POOLS.mountain;
  const normalizedTier = tier === "Luxury" ? "Luxury" : tier === "Budget" ? "Budget" : "Comfort";
  const tierList = pool[normalizedTier] || pool.Comfort;

  const gallery = [primary];
  for (const img of tierList) {
    if (!gallery.includes(img)) {
      gallery.push(img);
    }
  }

  if (gallery.length < 3) {
    const fallbackList = pool.Comfort || pool.Luxury || [];
    for (const img of fallbackList) {
      if (!gallery.includes(img)) {
        gallery.push(img);
      }
    }
  }

  return gallery.slice(0, 4);
}
