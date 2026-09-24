// Primary Hotel Service Adapter
// Connects to Amadeus API first with seamless fallback to curated catalog

const amadeusService = require("./amadeusService");
const geminiHotelService = require("./geminiHotelService");
const hotelImageService = require("./hotelImageService");

// Curated Sri Lankan Hotels Catalog (Fallback provider)
const curatedHotelsCatalog = {
  ella: [
    {
      id: "ella-98acres",
      name: "98 Acres Resort & Spa",
      tier: "Luxury",
      pricePerNight: 48000,
      rating: 4.9,
      reviews: 420,
      amenities: ["Infinity Pool", "Tea Valley View", "Ayurvedic Spa", "Free Breakfast"],
      badge: "Top Luxury",
      icon: "🏰",
      description: "Breathtaking chalets built on scenic tea terraces facing Ella Rock and Little Adam's Peak.",
      source: "catalog",
    },
    {
      id: "ella-mountain-heavens",
      name: "Mountain Heavens Ella",
      tier: "Comfort",
      pricePerNight: 16000,
      rating: 4.6,
      reviews: 280,
      amenities: ["Valley View Balcony", "Swimming Pool", "Restaurant", "Free WiFi"],
      badge: "Best Value",
      icon: "🌄",
      description: "Panoramic views of the Ella Gap with cozy rooms and an open-air mountain restaurant.",
      source: "catalog",
    },
    {
      id: "ella-flower-garden",
      name: "Ella Flower Garden Resort",
      tier: "Comfort",
      pricePerNight: 12000,
      rating: 4.5,
      reviews: 190,
      amenities: ["Garden Setting", "Mountain View", "Breakfast Included", "Tour Desk"],
      badge: "Popular Choice",
      icon: "🌺",
      description: "Serene garden resort surrounded by blooming orchids and vibrant mountain flora.",
      source: "catalog",
    },
    {
      id: "ella-tunnel-gap",
      name: "Tunnel Gap Homestay",
      tier: "Budget",
      pricePerNight: 5500,
      rating: 4.7,
      reviews: 150,
      amenities: ["Homemade Breakfast", "Mountain Breeze", "Host Guided Walks", "Free WiFi"],
      badge: "Budget Friendly",
      icon: "🏡",
      description: "Warm local hospitality with authentic home-cooked Sri Lankan breakfast and great views.",
      source: "catalog",
    },
  ],
  mirissa: [
    {
      id: "mirissa-sharavi",
      name: "Sri Sharavi Beach Villas & Spa",
      tier: "Luxury",
      pricePerNight: 52000,
      rating: 4.8,
      reviews: 310,
      amenities: ["Beachfront Access", "Eco Wine Bar", "Spa Pavilion", "Gourmet Breakfast"],
      badge: "Top Luxury",
      icon: "🏖️",
      description: "Private contemporary oceanfront villas with direct access to pristine golden sand.",
      source: "catalog",
    },
    {
      id: "mirissa-triple-o-six",
      name: "Triple O Six Boutique Hotel",
      tier: "Comfort",
      pricePerNight: 18000,
      rating: 4.7,
      reviews: 240,
      amenities: ["Designer Pool", "Cocktail Lounge", "Steps to Beach", "High-speed WiFi"],
      badge: "Best Value",
      icon: "🍹",
      description: "Chic modern retreat with minimalist tropical design just 2 minutes from Mirissa Beach.",
      source: "catalog",
    },
    {
      id: "mirissa-paradise-beach",
      name: "Paradise Beach Club",
      tier: "Comfort",
      pricePerNight: 14000,
      rating: 4.4,
      reviews: 380,
      amenities: ["Beachfront Pool", "Seafood Grill", "Sun Loungers", "Breakfast Included"],
      badge: "Popular Choice",
      icon: "🌊",
      description: "Lively beachfront hotel with palm-shaded sun loungers and ocean-view dining.",
      source: "catalog",
    },
    {
      id: "mirissa-hangover",
      name: "Hangover Hostels Mirissa",
      tier: "Budget",
      pricePerNight: 5000,
      rating: 4.6,
      reviews: 410,
      amenities: ["Air Conditioning", "Social Rooftop", "Surf Board Storage", "Free WiFi"],
      badge: "Budget Friendly",
      icon: "🏄",
      description: "Vibrant and spotless hostel located right opposite the prime surf break.",
      source: "catalog",
    },
  ],
  galle: [
    {
      id: "galle-amangalla",
      name: "Amangalla Historic Heritage Hotel",
      tier: "Luxury",
      pricePerNight: 75000,
      rating: 4.9,
      reviews: 210,
      amenities: ["Heritage Architecture", "Hydrotherapy Pools", "Colonial Dining", "Butler Service"],
      badge: "Historic Luxury",
      icon: "🏛️",
      description: "World-renowned luxury icon dating back to 1684 within the ramparts of the UNESCO World Heritage fort.",
      source: "catalog",
    },
    {
      id: "galle-fort-printers",
      name: "The Fort Printers",
      tier: "Comfort",
      pricePerNight: 22000,
      rating: 4.7,
      reviews: 175,
      amenities: ["Boutique Courtyard", "Gourmet Seafood", "Art Deco Rooms", "Free Breakfast"],
      badge: "Boutique Pick",
      icon: "🖼️",
      description: "18th-century mansion transformed into an elegant boutique hotel celebrating heritage arts.",
      source: "catalog",
    },
    {
      id: "galle-tamarind-hill",
      name: "Tamarind Hill by Asia Leisure",
      tier: "Comfort",
      pricePerNight: 16000,
      rating: 4.5,
      reviews: 160,
      amenities: ["Riverfront Setting", "Lush Courtyard", "Swimming Pool", "Spa Treatments"],
      badge: "Best Value",
      icon: "🌿",
      description: "Tranquil colonial manor perched beside the Gintota River just minutes from the central fort.",
      source: "catalog",
    },
    {
      id: "galle-pedlars-inn",
      name: "Pedlar's Inn Hostel & Suites",
      tier: "Budget",
      pricePerNight: 6000,
      rating: 4.6,
      reviews: 290,
      amenities: ["Inside Fort", "Cafe Attached", "Air Conditioning", "Free High-Speed WiFi"],
      badge: "Budget Friendly",
      icon: "☕",
      description: "Charming rooms and dorms nestled inside the Dutch Fort next to artisan cafes and gelato bars.",
      source: "catalog",
    },
  ],
  kandy: [
    {
      id: "kandy-earls-regency",
      name: "Earl's Regency Hotel",
      tier: "Luxury",
      pricePerNight: 38000,
      rating: 4.8,
      reviews: 490,
      amenities: ["Mahaweli River View", "Tennis Court", "Spa Sanctuary", "Multiple Restaurants"],
      badge: "5-Star Luxury",
      icon: "⭐",
      description: "Luxury hillside resort nestled along the Mahaweli River offering 5-star mountain indulgence.",
      source: "catalog",
    },
    {
      id: "kandy-radh",
      name: "The Radh Hotel",
      tier: "Comfort",
      pricePerNight: 18000,
      rating: 4.7,
      reviews: 210,
      amenities: ["Walking to Temple", "Modern Suites", "Spa & Gym", "Free Gourmet Breakfast"],
      badge: "Prime Location",
      icon: "🏛️",
      description: "Boutique hotel with royal Kandyan craftsmanship situated just a short stroll from the Temple of the Tooth.",
      source: "catalog",
    },
    {
      id: "kandy-suisse",
      name: "Hotel Suisse",
      tier: "Comfort",
      pricePerNight: 14000,
      rating: 4.4,
      reviews: 320,
      amenities: ["Kandy Lake View", "Colonial Manor", "Large Pool", "Ayurveda Spa"],
      badge: "Colonial Classic",
      icon: "🌺",
      description: "A historic 17th-century governor's mansion situated directly opposite Kandy Lake surrounded by trees.",
      source: "catalog",
    },
    {
      id: "kandy-city-stay",
      name: "Kandy City Stay",
      tier: "Budget",
      pricePerNight: 5500,
      rating: 4.5,
      reviews: 180,
      amenities: ["City Center", "Air Conditioning", "Rooftop Terrace", "Free WiFi"],
      badge: "Budget Friendly",
      icon: "🛏️",
      description: "Spotlessly clean modern rooms in the center of Kandy within easy reach of the railway station.",
      source: "catalog",
    },
  ],
  sigiriya: [
    {
      id: "sigiriya-kandalama",
      name: "Heritance Kandalama",
      tier: "Luxury",
      pricePerNight: 55000,
      rating: 4.9,
      reviews: 650,
      amenities: ["Geoffrey Bawa Architecture", "Cliffside Pool", "Lake View", "Eco Luxury"],
      badge: "Architectural Wonder",
      icon: "🏞️",
      description: "An architectural masterpiece built into a cliff edge overlooking the Kandalama Lake and Sigiriya Rock.",
      source: "catalog",
    },
    {
      id: "sigiriya-aliya",
      name: "Aliya Resort & Spa",
      tier: "Comfort",
      pricePerNight: 24000,
      rating: 4.7,
      reviews: 340,
      amenities: ["Direct Sigiriya Rock View", "Infinity Pool", "Ayurvedic Village", "Buffet Feast"],
      badge: "Best Views",
      icon: "🐘",
      description: "Themed around the majestic Asian elephant, featuring an infinity pool framing direct views of the rock.",
      source: "catalog",
    },
    {
      id: "sigiriya-village",
      name: "Sigiriya Village Hotel",
      tier: "Comfort",
      pricePerNight: 14000,
      rating: 4.4,
      reviews: 230,
      amenities: ["Chalet Lodges", "Tropical Gardens", "Bird Watching", "Swimming Pool"],
      badge: "Rustic Comfort",
      icon: "🏡",
      description: "Spacious individual chalets tucked inside tranquil native jungle foliage beneath the lion rock.",
      source: "catalog",
    },
    {
      id: "sigiriya-rock-stay",
      name: "Pidurangala Rock Homestay",
      tier: "Budget",
      pricePerNight: 5000,
      rating: 4.6,
      reviews: 190,
      amenities: ["Base of Rock", "Farm-fresh Meals", "Bicycle Rental", "Free WiFi"],
      badge: "Budget Friendly",
      icon: "🥾",
      description: "Quaint rustic lodge steps away from the Pidurangala trail with delicious home-cooked curry and rice.",
      source: "catalog",
    },
  ],
  colombo: [
    {
      id: "colombo-galle-face",
      name: "Galle Face Hotel",
      tier: "Luxury",
      pricePerNight: 42000,
      rating: 4.8,
      reviews: 580,
      amenities: ["Seaside Saltwater Pool", "Historic Museum", "Ocean Sunset Terrace", "Fine Dining"],
      badge: "Heritage Luxury",
      icon: "🌅",
      description: "Legendary 1864 grand hotel facing the Indian Ocean where royals and dignitaries have stayed for 160 years.",
      source: "catalog",
    },
    {
      id: "colombo-cinnamon-red",
      name: "Cinnamon Red Colombo",
      tier: "Comfort",
      pricePerNight: 16000,
      rating: 4.6,
      reviews: 440,
      amenities: ["Rooftop Infinity Pool", "Sky Lounge", "City Skyline Views", "Modern Gym"],
      badge: "Best Value",
      icon: "🍸",
      description: "Lean luxury hotel boasting Colombo's highest rooftop infinity pool overlooking the sparkling skyline.",
      source: "catalog",
    },
    {
      id: "colombo-clock-inn",
      name: "Clock Inn Colombo",
      tier: "Budget",
      pricePerNight: 5000,
      rating: 4.5,
      reviews: 320,
      amenities: ["Clean Pods & Rooms", "Galle Road Location", "Guest Pantry", "Free WiFi"],
      badge: "Budget Friendly",
      icon: "🛏️",
      description: "Modern, hip boutique hostel on Galle Road close to cafes, beaches, and rail transit.",
      source: "catalog",
    },
  ],
  jaffna: [
    {
      id: "jaffna-jetwing",
      name: "Jetwing Jaffna",
      tier: "Luxury",
      pricePerNight: 32000,
      rating: 4.8,
      reviews: 380,
      amenities: ["Rooftop Restaurant", "Panoramic City Views", "Air Conditioning", "Free Breakfast"],
      badge: "Top Luxury",
      icon: "🏰",
      description: "Prestigious contemporary luxury hotel in the heart of Jaffna town with spectacular views of the peninsula.",
      source: "catalog",
    },
    {
      id: "jaffna-north-gate",
      name: "North Gate Jaffna",
      tier: "Comfort",
      pricePerNight: 18000,
      rating: 4.7,
      reviews: 290,
      amenities: ["Swimming Pool", "Fitness Center", "Next to Railway Station", "Free WiFi"],
      badge: "Best Value",
      icon: "🏨",
      description: "Stylish 4-star boutique hotel located right next to the Jaffna Railway Station offering modern comforts and northern delicacies.",
      source: "catalog",
    },
    {
      id: "jaffna-heritage",
      name: "Jaffna Heritage Hotel",
      tier: "Comfort",
      pricePerNight: 14000,
      rating: 4.6,
      reviews: 180,
      amenities: ["Traditional Architecture", "Vegetarian Cuisine", "Courtyard Garden", "Near Nallur Temple"],
      badge: "Cultural Pick",
      icon: "🌺",
      description: "Charming boutique hotel situated in Nallur celebrating authentic Tamil cultural heritage and hospitality.",
      source: "catalog",
    },
    {
      id: "jaffna-tilko",
      name: "Tilko Jaffna City Hotel",
      tier: "Budget",
      pricePerNight: 7500,
      rating: 4.4,
      reviews: 210,
      amenities: ["City Center", "Rooftop Terrace", "Bar & Restaurant", "Air Conditioning"],
      badge: "Budget Friendly",
      icon: "🛏️",
      description: "Popular city-center hotel within walking distance of Jaffna Fort, public transit, and vibrant local markets.",
      source: "catalog",
    },
  ],
  trincomalee: [
    {
      id: "trinco-blu",
      name: "Trinco Blu by Cinnamon",
      tier: "Luxury",
      pricePerNight: 36000,
      rating: 4.8,
      reviews: 450,
      amenities: ["Private Beach", "Diving Center", "Seafood Restaurant", "Oceanfront Pool"],
      badge: "Beach Resort",
      icon: "🏖️",
      description: "Retro-chic beachfront resort offering whale watching excursions and golden sandy beaches on the east coast.",
      source: "catalog",
    },
    {
      id: "trinco-jungle-beach",
      name: "Jungle Beach by Uga",
      tier: "Luxury",
      pricePerNight: 65000,
      rating: 4.9,
      reviews: 320,
      amenities: ["Private Beach Cabanas", "Spa Sanctuary", "Mangrove Surroundings", "Gourmet Dining"],
      badge: "Eco Luxury",
      icon: "🌿",
      description: "Exclusive eco-luxury retreat nestled between private coastal jungle and the pristine sea in Kuchchaveli.",
      source: "catalog",
    },
    {
      id: "trinco-french-garden",
      name: "French Garden Resort",
      tier: "Comfort",
      pricePerNight: 11000,
      rating: 4.5,
      reviews: 190,
      amenities: ["Uppuveli Beach", "Garden Dining", "Diving Packages", "Free WiFi"],
      badge: "Best Value",
      icon: "🌊",
      description: "Relaxed coastal resort steps away from Uppuveli Beach with lush palm gardens and water sports.",
      source: "catalog",
    },
    {
      id: "trinco-dyke-rest",
      name: "Dyke Rest Guesthouse",
      tier: "Budget",
      pricePerNight: 5500,
      rating: 4.4,
      reviews: 160,
      amenities: ["Beachfront Walk", "Clean AC Rooms", "Fresh Seafood", "Free WiFi"],
      badge: "Budget Friendly",
      icon: "🛏️",
      description: "Cozy budget guesthouse directly facing Dutch Bay with sunset views over the ocean.",
      source: "catalog",
    },
  ],
  "nuwara eliya": [
    {
      id: "nuwara-grand",
      name: "Grand Hotel Nuwara Eliya",
      tier: "Luxury",
      pricePerNight: 48000,
      rating: 4.9,
      reviews: 620,
      amenities: ["Colonial Heritage", "Award-winning Gardens", "High Tea", "Heated Pool"],
      badge: "Historic Luxury",
      icon: "🏰",
      description: "Iconic 19th-century British governor's residence surrounded by manicured rose gardens in Little England.",
      source: "catalog",
    },
    {
      id: "nuwara-heritance-tea",
      name: "Heritance Tea Factory",
      tier: "Luxury",
      pricePerNight: 52000,
      rating: 4.9,
      reviews: 480,
      amenities: ["Converted Tea Factory", "Tea Plucking Experience", "Mist Valley Views", "Spa"],
      badge: "Unique Stay",
      icon: "🍃",
      description: "Unique luxury hotel set in a restored colonial tea factory perched high in the misty Kandapola hills.",
      source: "catalog",
    },
    {
      id: "nuwara-st-andrews",
      name: "Jetwing St. Andrew's",
      tier: "Comfort",
      pricePerNight: 22000,
      rating: 4.7,
      reviews: 340,
      amenities: ["Tudor Manor Style", "Billiards Room", "Organic Garden", "Cozy Fireplaces"],
      badge: "Best Value",
      icon: "🌄",
      description: "Historic Georgian-style mansion nestled against the backdrop of pine-clad mountains and tea country.",
      source: "catalog",
    },
    {
      id: "nuwara-single-tree",
      name: "Single Tree Hotel",
      tier: "Budget",
      pricePerNight: 5500,
      rating: 4.5,
      reviews: 200,
      amenities: ["Mountain Views", "Hot Showers", "Lake Gregory Proximity", "Free WiFi"],
      badge: "Budget Friendly",
      icon: "🛏️",
      description: "Comfortable and friendly mountain lodge overlooking Lake Gregory and rolling green hills.",
      source: "catalog",
    },
  ],
};

// Fallback catalog lookup helper
function getFallbackHotels(destination) {
  const destKey = (destination || "").trim().toLowerCase();
  const found = Object.keys(curatedHotelsCatalog).find((k) => destKey.includes(k) || k.includes(destKey));

  let list = [];
  if (found) {
    list = curatedHotelsCatalog[found];
  } else {
    // No curated catalog for this destination — return empty so Gemini is the only source
    list = [];
  }

  return list.map((h) => ({
    ...h,
    image: h.image || hotelImageService.getHotelPhoto(h.name, destination, h.tier),
    images: h.images || hotelImageService.getHotelGallery(h.name, destination, h.tier),
  }));
}

// Master Hotel Provider Method
async function getHotels({ destination, budget, startDate, endDate, travelers, exclude }) {
  // 1. Check Gemini AI Provider first
  if (process.env.GEMINI_API_KEY) {
    try {
      console.log(`[HotelService] Querying Gemini AI for hotel recommendations in: ${destination}`);
      
      let nights = 3;
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
      }

      const geminiHotels = await geminiHotelService.fetchHotelsWithGemini({
        destination,
        budget: budget || 75000,
        nights,
        travelers: travelers || 1,
        exclude,
      });

      if (geminiHotels && geminiHotels.length > 0) {
        console.log(`[HotelService] Successfully generated ${geminiHotels.length} live hotels via Gemini AI`);
        return {
          provider: "gemini",
          hotels: geminiHotels,
        };
      }
    } catch (err) {
      console.warn(`[HotelService] Gemini AI fetch failed (${err.message}). Checking next provider.`);
    }
  }

  // 2. Check Amadeus Provider
  const hasAmadeusCredentials = !!(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET);
  if (hasAmadeusCredentials) {
    try {
      console.log(`[HotelService] Querying Amadeus API for: ${destination}`);
      const amadeusHotels = await amadeusService.fetchHotelsFromAmadeus({
        destination,
        startDate,
        endDate,
        travelers,
      });

      if (amadeusHotels && amadeusHotels.length > 0) {
        console.log(`[HotelService] Successfully loaded ${amadeusHotels.length} live hotels from Amadeus`);
        const enriched = await hotelImageService.enrichHotelsWithPhotos(amadeusHotels, destination);
        return {
          provider: "amadeus",
          hotels: enriched,
        };
      }
      console.log("[HotelService] Amadeus returned 0 hotels for destination, using curated catalog.");
    } catch (err) {
      console.warn(`[HotelService] Amadeus fetch failed (${err.message}). Falling back to curated catalog.`);
    }
  }

  // 3. Fallback to Curated Catalog
  console.log("[HotelService] Using curated Sri Lanka hotel catalog.");
  let fallbackHotels = getFallbackHotels(destination);
  if (exclude) {
    const excludeList = (Array.isArray(exclude) ? exclude : exclude.split(","))
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (excludeList.length > 0) {
      const filtered = fallbackHotels.filter(
        (h) => !excludeList.includes(h.name.toLowerCase())
      );
      if (filtered.length > 0) {
        fallbackHotels = filtered;
      }
    }
  }

  const enrichedFallback = await hotelImageService.enrichHotelsWithPhotos(fallbackHotels, destination);
  return {
    provider: "catalog",
    hotels: enrichedFallback,
  };
}

module.exports = {
  getHotels,
};
