// Master Food & Dining Service Adapter
// Connects to Gemini AI first with seamless fallback to curated authentic Sri Lankan restaurants

const geminiFoodService = require("./geminiFoodService");

// In-memory cache for fast sub-millisecond responses
const foodCache = new Map();

// Curated authentic Sri Lankan Culinary Catalog
const curatedFoodCatalog = {
  mirissa: [
    {
      id: "dewmini-roti-shop",
      name: "Dewmini Roti Shop",
      type: "Roti & Kottu",
      icon: "🥘",
      specialty: "Famous cheese, avocado & kottu rotis with spicy chicken sambol",
      priceRange: "LKR 600 - 1,500",
      rating: 4.8,
      reviews: 2150,
      badge: "Must-Try Legend",
      location: "Boraluketiya Road, Mirissa",
      whyVisit: "Arrive early to beat the crowds craving their legendary, freshly made flaky rotis.",
      googleMapsUrl: "https://www.google.com/maps/search/Dewmini+Roti+Shop+Mirissa+Sri+Lanka",
      source: "catalog",
    },
    {
      id: "mirissa-catch-seafood",
      name: "Zephyr Restaurant & Bar",
      type: "Seafood Grill",
      icon: "🦀",
      specialty: "Fresh daily catch jumbo prawns & grilled red snapper on the beachfront",
      priceRange: "LKR 2,500 - 4,500",
      rating: 4.7,
      reviews: 1420,
      badge: "Top Rated",
      location: "Mirissa Beachfront",
      whyVisit: "Watch the golden sunset right on the sand while enjoying expertly spiced grilled seafood.",
      googleMapsUrl: "https://www.google.com/maps/search/Zephyr+Restaurant+Mirissa+Sri+Lanka",
      source: "catalog",
    },
    {
      id: "mamas-dinner-mirissa",
      name: "Mama's Dinner Buffet",
      type: "Rice & Curry",
      icon: "🍛",
      specialty: "Authentic 10-curry claypot dinner buffet with fresh tuna curry & coconut dhal",
      priceRange: "LKR 1,200 - 2,200",
      rating: 4.9,
      reviews: 980,
      badge: "Local Favorite",
      location: "Galle Road, Mirissa",
      whyVisit: "Traditional home-cooked banquet offering unlimited authentic Sri Lankan claypot curries.",
      googleMapsUrl: "https://www.google.com/maps/search/Mama's+Dinner+Mirissa+Sri+Lanka",
      source: "catalog",
    },
  ],
  ahangama: [
    {
      id: "ceylon-sliders-ahangama",
      name: "Ceylon Sliders",
      type: "Cafe & Bakery",
      icon: "☕",
      specialty: "Artisanal surf-style brunch bowls, Ceylon iced coffee & fresh sourdough",
      priceRange: "LKR 1,500 - 3,000",
      rating: 4.8,
      reviews: 840,
      badge: "Top Rated",
      location: "Beach Road, Ahangama",
      whyVisit: "Iconic ocean-view rooftop cafe celebrated for healthy coastal breakfast and vibrant energy.",
      googleMapsUrl: "https://www.google.com/maps/search/Ceylon+Sliders+Ahangama+Sri+Lanka",
      source: "catalog",
    },
    {
      id: "citra-ahangama",
      name: "Citra Artisanal Eatery",
      type: "Traditional Ceylon",
      icon: "🍛",
      specialty: "Locally-sourced seasonal curries & authentic wood-fired flatbreads",
      priceRange: "LKR 1,200 - 2,500",
      rating: 4.7,
      reviews: 410,
      badge: "Local Favorite",
      location: "Galle-Matara Highway, Ahangama",
      whyVisit: "Cozy local favorite blending traditional Ceylon ingredients with modern coastal culinary style.",
      googleMapsUrl: "https://www.google.com/maps/search/Citra+Ahangama+Sri+Lanka",
      source: "catalog",
    },
  ],
  ella: [
    {
      id: "matey-hut-ella",
      name: "Matey Hut",
      type: "Rice & Curry",
      icon: "🍛",
      specialty: "Traditional 10-curry claypot rice & curry with pumpkin, lotus root & pol sambol",
      priceRange: "LKR 1,000 - 2,000",
      rating: 4.9,
      reviews: 1650,
      badge: "Must-Try Legend",
      location: "Passara Road, Ella",
      whyVisit: "Universally hailed as the best home-style rice and curry experience in the Sri Lankan hill country.",
      googleMapsUrl: "https://www.google.com/maps/search/Matey+Hut+Ella+Sri+Lanka",
      source: "catalog",
    },
    {
      id: "cafe-chill-ella",
      name: "Cafe Chill",
      type: "Roti & Kottu",
      icon: "🥘",
      specialty: "Fiery devilled chicken kottu, handmade cheese kottu & mountain mocktails",
      priceRange: "LKR 1,500 - 3,000",
      rating: 4.6,
      reviews: 3200,
      badge: "Top Rated",
      location: "Main Street, Ella Town",
      whyVisit: "Famous two-story bamboo and wood pavilion with unmatched backpacker ambiance and hearty portions.",
      googleMapsUrl: "https://www.google.com/maps/search/Cafe+Chill+Ella+Sri+Lanka",
      source: "catalog",
    },
    {
      id: "downtown-roti-hut",
      name: "Downtown Roti Hut",
      type: "Street Food Legend",
      icon: "🍲",
      specialty: "Spicy chicken kottu and sweet banana-chocolate rotis on a sizzling tawa",
      priceRange: "LKR 700 - 1,400",
      rating: 4.7,
      reviews: 890,
      badge: "Best Value",
      location: "Station Road, Ella",
      whyVisit: "Quick, energetic open-air stall where you can hear the rhythmic metal beat of freshly chopped kottu.",
      googleMapsUrl: "https://www.google.com/maps/search/Downtown+Roti+Hut+Ella+Sri+Lanka",
      source: "catalog",
    },
  ],
  sigiriya: [
    {
      id: "wijesiri-sigiriya",
      name: "Wijesiri Family Restaurant",
      type: "Rice & Curry",
      icon: "🍛",
      specialty: "Home-cooked lotus root, polon dhal, jackfruit curry & freshwater fish",
      priceRange: "LKR 900 - 1,800",
      rating: 4.9,
      reviews: 940,
      badge: "Must-Try Legend",
      location: "Main Road, near Sigiriya Fortress entrance",
      whyVisit: "Warm village hospitality with secret family recipes harvested directly from surrounding home gardens.",
      googleMapsUrl: "https://www.google.com/maps/search/Wijesiri+Family+Restaurant+Sigiriya+Sri+Lanka",
      source: "catalog",
    },
    {
      id: "rithu-restaurant-sigiriya",
      name: "Rithu Restaurant",
      type: "Traditional Ceylon",
      icon: "🍲",
      specialty: "Claypot dum biryani, devilled prawns & fresh tropical fruit juices",
      priceRange: "LKR 1,200 - 2,500",
      rating: 4.7,
      reviews: 620,
      badge: "Top Rated",
      location: "Inamaluwa Road, Sigiriya",
      whyVisit: "Peaceful open-air dining surrounded by lush paddy fields right after climbing Pidurangala Rock.",
      googleMapsUrl: "https://www.google.com/maps/search/Rithu+Restaurant+Sigiriya+Sri+Lanka",
      source: "catalog",
    },
  ],
  kandy: [
    {
      id: "kandy-muslim-hotel",
      name: "Muslim Hotel",
      type: "Street Food Legend",
      icon: "🥘",
      specialty: "Authentic beef kottu, spicy mutton samosas, crispy parathas & falooda",
      priceRange: "LKR 500 - 1,200",
      rating: 4.7,
      reviews: 3400,
      badge: "Must-Try Legend",
      location: "D.S. Senanayake Veediya, Kandy",
      whyVisit: "An undeniable cultural icon since the 1960s with unbeatable street kottu energy and fast service.",
      googleMapsUrl: "https://www.google.com/maps/search/Muslim+Hotel+Kandy+Sri+Lanka",
      source: "catalog",
    },
    {
      id: "slightly-chilled-kandy",
      name: "Slightly Chilled Lounge (Bamboo Garden)",
      type: "Traditional Ceylon",
      icon: "🍛",
      specialty: "Lankan chicken curry set with breathtaking Kandy Lake panorama & evening cocktails",
      priceRange: "LKR 1,500 - 3,200",
      rating: 4.6,
      reviews: 1950,
      badge: "Top Rated",
      location: "Anagarika Dharmapala Mawatha, Kandy",
      whyVisit: "The premier hill terrace in Kandy for sunset views over the temple and serene lake.",
      googleMapsUrl: "https://www.google.com/maps/search/Slightly+Chilled+Lounge+Kandy+Sri+Lanka",
      source: "catalog",
    },
    {
      id: "devon-restaurant-kandy",
      name: "Devon Restaurant",
      type: "Rice & Curry",
      icon: "🍲",
      specialty: "Traditional Kandy rice & curry buffet with an array of fiery meat and vegetable sambols",
      priceRange: "LKR 800 - 1,600",
      rating: 4.6,
      reviews: 1450,
      badge: "Local Favorite",
      location: "Dalada Veediya, Kandy",
      whyVisit: "Visit during lunchtime to experience their legendary, bustling rice and curry spread loved by locals.",
      googleMapsUrl: "https://www.google.com/maps/search/Devon+Restaurant+Kandy+Sri+Lanka",
      source: "catalog",
    },
  ],
  "nuwara eliya": [
    {
      id: "grand-indian-nuwara-eliya",
      name: "Grand Indian",
      type: "Traditional Ceylon",
      icon: "🍛",
      specialty: "Tandoori chicken, rich butter naan & creamy spiced highland curries",
      priceRange: "LKR 2,000 - 4,000",
      rating: 4.8,
      reviews: 2800,
      badge: "Must-Try Legend",
      location: "Grand Hotel Road, Nuwara Eliya",
      whyVisit: "Consistently rated one of the finest Indian and Ceylon culinary experiences in all of Sri Lanka.",
      googleMapsUrl: "https://www.google.com/maps/search/Grand+Indian+Nuwara+Eliya+Sri+Lanka",
      source: "catalog",
    },
    {
      id: "de-silva-food-centre",
      name: "De Silva Food Centre",
      type: "Street Food Legend",
      icon: "🥘",
      specialty: "Sizzling cheese kottu, hot rotti & spiced milk tea in the cool mountain mist",
      priceRange: "LKR 600 - 1,200",
      rating: 4.6,
      reviews: 1100,
      badge: "Best Value",
      location: "New Bazaar Street, Nuwara Eliya",
      whyVisit: "The quintessential hill station street food stop to warm up with hot Ceylon tea and spicy kottu.",
      googleMapsUrl: "https://www.google.com/maps/search/De+Silva+Food+Centre+Nuwara+Eliya+Sri+Lanka",
      source: "catalog",
    },
  ],
  colombo: [
    {
      id: "ministry-of-crab-colombo",
      name: "Ministry of Crab",
      type: "Seafood Grill",
      icon: "🦀",
      specialty: "World-famous giant lagoon mud crabs in fiery pepper sauce or garlic chili",
      priceRange: "LKR 6,000 - 18,000",
      rating: 4.9,
      reviews: 4200,
      badge: "Must-Try Legend",
      location: "Old Dutch Hospital Complex, Colombo 01",
      whyVisit: "Asia's 50 Best Restaurants legend created by Mahela Jayawardene, Kumar Sangakkara & chef Dharshan Munidasa.",
      googleMapsUrl: "https://www.google.com/maps/search/Ministry+of+Crab+Colombo+Sri+Lanka",
      source: "catalog",
    },
    {
      id: "nanas-galle-face",
      name: "Nana's Galle Face Green",
      type: "Street Food Legend",
      icon: "🥘",
      specialty: "Night market beachfront cheese kottu, devilled cuttlefish & crispy isso wade",
      priceRange: "LKR 800 - 1,800",
      rating: 4.6,
      reviews: 3100,
      badge: "Local Favorite",
      location: "Galle Face Promenade, Colombo",
      whyVisit: "Eat with your feet in the ocean breeze under the stars amidst the festive energy of Galle Face Green.",
      googleMapsUrl: "https://www.google.com/maps/search/Nanas+Galle+Face+Green+Colombo+Sri+Lanka",
      source: "catalog",
    },
    {
      id: "upalis-by-nawaloka",
      name: "Upali's by Nawaloka",
      type: "Rice & Curry",
      icon: "🍛",
      specialty: "Authentic Ceylon claypot set with roast paan, mutton curry & lunumiris",
      priceRange: "LKR 1,500 - 3,500",
      rating: 4.7,
      reviews: 2400,
      badge: "Top Rated",
      location: "C.W.W. Kannangara Mawatha, Colombo 07",
      whyVisit: "Exquisite traditional dining capturing the purest home-cooked heritage flavors of old Ceylon.",
      googleMapsUrl: "https://www.google.com/maps/search/Upali's+by+Nawaloka+Colombo+Sri+Lanka",
      source: "catalog",
    },
  ],
  galle: [
    {
      id: "lucky-fort-galle",
      name: "Lucky Fort Restaurant",
      type: "Rice & Curry",
      icon: "🍛",
      specialty: "Famous 10-curry traditional set served with fresh pineapple, okra & eggplant",
      priceRange: "LKR 1,200 - 2,200",
      rating: 4.8,
      reviews: 1850,
      badge: "Must-Try Legend",
      location: "Prampa Road, Galle Fort",
      whyVisit: "A culinary pilgrimage in the fort showcasing ten distinct vegetarian and seafood curries.",
      googleMapsUrl: "https://www.google.com/maps/search/Lucky+Fort+Restaurant+Galle+Sri+Lanka",
      source: "catalog",
    },
    {
      id: "poonies-kitchen-galle",
      name: "Poonie's Kitchen",
      type: "Cafe & Bakery",
      icon: "☕",
      specialty: "Organic local salad bowls, passionfruit cheesecake & fresh Ceylon lime coolers",
      priceRange: "LKR 1,500 - 3,000",
      rating: 4.7,
      reviews: 1200,
      badge: "Top Rated",
      location: "Pedlar Street, Galle Fort",
      whyVisit: "A dreamy sunlit courtyard in the heart of Galle Fort with gorgeous farm-to-table creations.",
      googleMapsUrl: "https://www.google.com/maps/search/Poonie's+Kitchen+Galle+Sri+Lanka",
      source: "catalog",
    },
  ],
  trincomalee: [
    {
      id: "fernands-trinco",
      name: "Fernand's Beach Bar",
      type: "Seafood Grill",
      icon: "🦀",
      specialty: "Fresh jumbo tiger prawns & grilled barracuda with chili garlic sauce",
      priceRange: "LKR 2,000 - 4,000",
      rating: 4.8,
      reviews: 890,
      badge: "Top Rated",
      location: "Uppuveli Beach, Trincomalee",
      whyVisit: "Laidback beach vibes, cold drinks, and seafood freshly hauled in by local catamaran fishermen.",
      googleMapsUrl: "https://www.google.com/maps/search/Fernand's+Beach+Bar+Trincomalee+Sri+Lanka",
      source: "catalog",
    },
    {
      id: "green-garden-trinco",
      name: "Green Garden Restaurant",
      type: "Rice & Curry",
      icon: "🍛",
      specialty: "Authentic Jaffna-style crab curry, spicy mutton sambol & buffalo curd",
      priceRange: "LKR 1,000 - 2,500",
      rating: 4.7,
      reviews: 740,
      badge: "Must-Try Legend",
      location: "Main Street, Trincomalee",
      whyVisit: "Renowned for fiery Northern Sri Lankan Jaffna crab curry packed with aromatic roasted spices.",
      googleMapsUrl: "https://www.google.com/maps/search/Green+Garden+Restaurant+Trincomalee+Sri+Lanka",
      source: "catalog",
    },
  ],
  jaffna: [
    {
      id: "mangos-indian-veg-jaffna",
      name: "Mangos Indian Veg Restaurant",
      type: "Vegetarian & South Indian",
      icon: "🥘",
      specialty: "Crispy ghee paper roast dosas, paneer butter masala & traditional South Indian thali",
      priceRange: "LKR 800 - 1,800",
      rating: 4.8,
      reviews: 1850,
      badge: "Must-Try Legend",
      location: "Temple Road, Nallur, Jaffna",
      whyVisit: "The premier dining stop near Nallur Kovil, famous across Sri Lanka for authentic, mouthwatering vegetarian banquets.",
      googleMapsUrl: "https://www.google.com/maps/search/Mangos+Indian+Veg+Restaurant+Jaffna+Sri+Lanka",
      source: "catalog",
    },
    {
      id: "malayan-cafe-jaffna",
      name: "Malayan Cafe (1951)",
      type: "Traditional Breakfast & Tea",
      icon: "☕",
      specialty: "Ulundu vadai served on banana leaves with freshly ground coconut chutney and piping hot ginger tea",
      priceRange: "LKR 400 - 900",
      rating: 4.7,
      reviews: 1420,
      badge: "Historic Legend",
      location: "Grand Bazaar, Jaffna Town",
      whyVisit: "A historic heritage cafe operating since 1951 serving Jaffna's most beloved morning vadai, idli, and coffee on fresh banana leaves.",
      googleMapsUrl: "https://www.google.com/maps/search/Malayan+Cafe+Grand+Bazaar+Jaffna+Sri+Lanka",
      source: "catalog",
    },
    {
      id: "rio-ice-cream-jaffna",
      name: "Rio Ice Cream",
      type: "Dessert & Sundaes",
      icon: "🍨",
      specialty: "Signature Jaffna Special Sundae with homemade ice creams, candied fruit and jelly cubes",
      priceRange: "LKR 500 - 1,200",
      rating: 4.9,
      reviews: 3200,
      badge: "Iconic Landmark",
      location: "Point Pedro Road, Nallur, Jaffna",
      whyVisit: "An essential pilgrimage for any visitor to the north; renowned nationwide as Sri Lanka's greatest homegrown ice cream parlour.",
      googleMapsUrl: "https://www.google.com/maps/search/Rio+Ice+Cream+Nallur+Jaffna+Sri+Lanka",
      source: "catalog",
    },
    {
      id: "cosy-restaurant-jaffna",
      name: "Cosy Restaurant",
      type: "Jaffna Seafood & Curry",
      icon: "🦀",
      specialty: "World-famous spicy Jaffna Crab Curry, mutton fry & pattu pittu with coconut milk",
      priceRange: "LKR 1,500 - 3,500",
      rating: 4.6,
      reviews: 980,
      badge: "Local Favorite",
      location: "Hospital Road, Jaffna",
      whyVisit: "Celebrated for authentic Northern Tamil culinary flair and rich, slow-simmered Jaffna roasted spices.",
      googleMapsUrl: "https://www.google.com/maps/search/Cosy+Restaurant+Jaffna+Sri+Lanka",
      source: "catalog",
    },
  ],
};

function getFallbackFood(destination = "") {
  const cleanDest = destination.toLowerCase().trim();
  const key = Object.keys(curatedFoodCatalog).find(
    (k) => cleanDest.includes(k) || k.includes(cleanDest)
  );

  if (key && curatedFoodCatalog[key]) {
    return curatedFoodCatalog[key];
  }

  // Default fallback
  return [
    {
      id: "default-rice-curry",
      name: `${destination} Heritage Rice & Curry`,
      type: "Rice & Curry",
      icon: "🍛",
      specialty: "Authentic 10-curry claypot traditional banana leaf buffet",
      priceRange: "LKR 800 - 1,500",
      rating: 4.8,
      reviews: 320,
      badge: "Must-Try Legend",
      location: `Main Street, ${destination}`,
      whyVisit: "An authentic local feast celebrating fresh spices and traditional claypot cooking.",
      googleMapsUrl: `https://www.google.com/maps/search/Rice+and+Curry+${encodeURIComponent(destination)}+Sri+Lanka`,
      source: "catalog",
    },
    {
      id: "default-kottu-point",
      name: `${destination} Night Kottu & Roti Point`,
      type: "Roti & Kottu",
      icon: "🥘",
      specialty: "Fiery cheese kottu and spicy chicken rotis straight from the tawa",
      priceRange: "LKR 600 - 1,200",
      rating: 4.7,
      reviews: 210,
      badge: "Local Favorite",
      location: `Clock Tower Area, ${destination}`,
      whyVisit: "The best street food buzz in town with energetic chefs and mouthwatering aroma.",
      googleMapsUrl: `https://www.google.com/maps/search/Kottu+Roti+${encodeURIComponent(destination)}+Sri+Lanka`,
      source: "catalog",
    },
    {
      id: "default-seafood-grill",
      name: `${destination} Ocean & Coastal Grill`,
      type: "Seafood Grill",
      icon: "🦀",
      specialty: "Catch-of-the-day grilled fish with garlic butter and pol sambol",
      priceRange: "LKR 2,000 - 3,500",
      rating: 4.7,
      reviews: 180,
      badge: "Top Rated",
      location: `Beachfront / Promenade, ${destination}`,
      whyVisit: "Relaxed dining with wonderful breezes and authentic coastal seafood preparations.",
      googleMapsUrl: `https://www.google.com/maps/search/Seafood+Restaurant+${encodeURIComponent(destination)}+Sri+Lanka`,
      source: "catalog",
    },
  ];
}

// Master Food Retrieval Method
async function getFoodSpots({ destination, budget, exclude }) {
  const cacheKey = `${(destination || "").toLowerCase()}-${budget || "any"}`;

  // Check cache (30-minute validity)
  const cached = foodCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 30 * 60 * 1000) {
    return cached.data;
  }

  // 1. Query Gemini AI first
  if (process.env.GEMINI_API_KEY) {
    try {
      console.log(`[FoodService] Querying Gemini AI for authentic food spots in: ${destination}`);
      const geminiFood = await geminiFoodService.fetchFoodWithGemini({
        destination,
        budget,
        exclude,
      });

      if (geminiFood && geminiFood.length > 0) {
        console.log(`[FoodService] Successfully generated ${geminiFood.length} live food spots via Gemini AI`);
        const result = {
          provider: "gemini",
          foodSpots: geminiFood,
        };
        foodCache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
      }
    } catch (err) {
      console.warn(`[FoodService] Gemini AI fetch failed (${err.message}). Falling back to curated catalog.`);
    }
  }

  // 2. Fallback to Curated Catalog
  console.log(`[FoodService] Using curated Sri Lanka food catalog for: ${destination}`);
  const fallbackFood = getFallbackFood(destination);
  const result = {
    provider: "catalog",
    foodSpots: fallbackFood,
  };
  foodCache.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
}

module.exports = {
  getFoodSpots,
};
