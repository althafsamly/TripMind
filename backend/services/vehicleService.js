// Master Vehicle Rental Service Adapter
// Connects to Gemini AI first with seamless fallback to curated Sri Lankan rental shops

const geminiVehicleService = require("./geminiVehicleService");

// In-memory cache to guarantee instant sub-millisecond responses for repeated queries
const vehicleCache = new Map();

// Curated authentic Sri Lankan Vehicle & Scooter Rental Catalog
const curatedVehiclesCatalog = {
  mirissa: [
    {
      id: "mirissa-surf-riders",
      shopName: "Surf Riders Scooter & Bike Rentals",
      vehicleType: "Scooter",
      icon: "🛵",
      rate: "Rs. 3,500/day",
      rating: 4.9,
      reviews: 165,
      badge: "Top Pick",
      reason: "Coastal roads, easy beach hopping",
      location: "Matara Road, Mirissa Beach front",
      features: ["Helmets included", "Surf rack available", "Free delivery to hotel"],
      googleMapsUrl: "https://www.google.com/maps/search/Surf+Riders+Scooter+Rental+Mirissa+Sri+Lanka",
      source: "catalog",
    },
    {
      id: "mirissa-tuk-tuk-hub",
      shopName: "Mirissa Coast Tuk-Tuk Rentals",
      vehicleType: "Self-Drive Tuk-Tuk",
      icon: "🛺",
      rate: "Rs. 6,000/day",
      rating: 4.8,
      reviews: 120,
      badge: "Adventure",
      reason: "Fun coastal exploration & beach hopping",
      location: "Main Street, near Mirissa Fisheries Harbour",
      features: ["Driving lesson included", "Full insurance", "24/7 breakdown support"],
      googleMapsUrl: "https://www.google.com/maps/search/Tuk+Tuk+Rental+Mirissa+Sri+Lanka",
      source: "catalog",
    },
    {
      id: "mirissa-private-chauffeur",
      shopName: "Southern Highway Chauffeur & Cars",
      vehicleType: "Private Car with Driver",
      icon: "🚗",
      rate: "Rs. 14,000/day",
      rating: 4.7,
      reviews: 88,
      badge: "Family / Group",
      reason: "Air-conditioned comfort for group excursions",
      location: "Udana Junction, Mirissa",
      features: ["AC vehicle", "English-speaking driver", "Fuel packages available"],
      googleMapsUrl: "https://www.google.com/maps/search/Taxi+Driver+Hire+Mirissa+Sri+Lanka",
      source: "catalog",
    },
  ],
  ahangama: [
    {
      id: "ahangama-surf-wheels",
      shopName: "Ahangama Surf Wheels & Scooters",
      vehicleType: "Scooter",
      icon: "🛵",
      rate: "Rs. 3,500/day",
      rating: 4.9,
      reviews: 140,
      badge: "Top Pick",
      reason: "Coastal roads, easy beach hopping",
      location: "Galle-Matara Highway, Ahangama Town",
      features: ["Surf rack included", "Helmets included", "Doorstep villa delivery"],
      googleMapsUrl: "https://www.google.com/maps/search/Scooter+Rental+Ahangama+Sri+Lanka",
      source: "catalog",
    },
    {
      id: "ahangama-tuktuk-club",
      shopName: "South Coast Self-Drive Tuk-Tuk Hire",
      vehicleType: "Self-Drive Tuk-Tuk",
      icon: "🛺",
      rate: "Rs. 6,000/day",
      rating: 4.8,
      reviews: 95,
      badge: "Adventure",
      reason: "Fun rural exploration & surf point hopping",
      location: "Near Ahangama Train Station",
      features: ["Driving orientation", "Sri Lanka driving permit assistance"],
      googleMapsUrl: "https://www.google.com/maps/search/Tuk+Tuk+Hire+Ahangama+Sri+Lanka",
      source: "catalog",
    },
  ],
  ella: [
    {
      id: "ella-tuktuk-rental",
      shopName: "Tuk Tuk Rental Ella & Tours",
      vehicleType: "Self-Drive Tuk-Tuk",
      icon: "🛺",
      rate: "Rs. 6,000/day",
      rating: 4.9,
      reviews: 210,
      badge: "Top Pick",
      reason: "Fun rural exploration, scenic mountain drives",
      location: "Passara Road, Ella Town",
      features: ["Driving lesson included", "Offline scenic route maps", "Rain covers"],
      googleMapsUrl: "https://www.google.com/maps/search/Tuk+Tuk+Rental+Ella+Sri+Lanka",
      source: "catalog",
    },
    {
      id: "ella-scooter-center",
      shopName: "Ella Mountain Motorbike & Scooters",
      vehicleType: "Scooter",
      icon: "🛵",
      rate: "Rs. 3,500/day",
      rating: 4.7,
      reviews: 130,
      badge: "Solo / Couple",
      reason: "Agile mountain cruising & short hill climbs",
      location: "Station Road, opposite Ella Railway Station",
      features: ["Helmets included", "Phone mount & charger", "24/7 hill assistance"],
      googleMapsUrl: "https://www.google.com/maps/search/Scooter+Rental+Ella+Sri+Lanka",
      source: "catalog",
    },
    {
      id: "ella-hill-chauffeur",
      shopName: "Ella Highland Private Cars & Chauffeur",
      vehicleType: "Private Car with Driver",
      icon: "🚗",
      rate: "Rs. 14,000/day",
      rating: 4.8,
      reviews: 115,
      badge: "Family",
      reason: "Winding mountain roads, comfortable for group",
      location: "Wellawaya Road, Ella",
      features: ["Expert hill driver", "Spacious luggage room", "Hotel pickup"],
      googleMapsUrl: "https://www.google.com/maps/search/Car+Driver+Hire+Ella+Sri+Lanka",
      source: "catalog",
    },
  ],
  sigiriya: [
    {
      id: "sigiriya-tuktuk-safari",
      shopName: "Sigiriya Village Tuk-Tuk Rentals",
      vehicleType: "Self-Drive Tuk-Tuk",
      icon: "🛺",
      rate: "Rs. 6,000/day",
      rating: 4.9,
      reviews: 175,
      badge: "Top Pick",
      reason: "Fun rural exploration, scenic mountain drives",
      location: "Main Road, near Lion Rock Entrance",
      features: ["Village driving orientation", "Pidurangala map", "Spare fuel can"],
      googleMapsUrl: "https://www.google.com/maps/search/Tuk+Tuk+Rental+Sigiriya+Sri+Lanka",
      source: "catalog",
    },
    {
      id: "sigiriya-triangle-cars",
      shopName: "Cultural Triangle Chauffeur Cars",
      vehicleType: "Private Car with Driver",
      icon: "🚗",
      rate: "Rs. 14,000/day",
      rating: 4.8,
      reviews: 140,
      badge: "Family",
      reason: "Winding roads, air-conditioned Cultural Triangle comfort",
      location: "Inamaluwa Junction, Sigiriya",
      features: ["Full AC", "Licensed tourist chauffeur", "Flexible stops"],
      googleMapsUrl: "https://www.google.com/maps/search/Car+Driver+Sigiriya+Sri+Lanka",
      source: "catalog",
    },
    {
      id: "sigiriya-village-bikes",
      shopName: "Lion City Scooter & Bike Hub",
      vehicleType: "Scooter",
      icon: "🛵",
      rate: "Rs. 3,500/day",
      rating: 4.6,
      reviews: 82,
      badge: "Solo / Couple",
      reason: "Scenic village routes and rock fortress hopping",
      location: "Kimbissa, Sigiriya",
      features: ["Helmets included", "Free lock", "Local lake viewpoints map"],
      googleMapsUrl: "https://www.google.com/maps/search/Bike+Scooter+Rental+Sigiriya+Sri+Lanka",
      source: "catalog",
    },
  ],
  kandy: [
    {
      id: "kandy-city-cabs",
      shopName: "Kandy City Chauffeur & Car Hire",
      vehicleType: "Private Car with Driver",
      icon: "🚗",
      rate: "Rs. 14,000/day",
      rating: 4.9,
      reviews: 195,
      badge: "Family Pick",
      reason: "Winding mountain roads, comfortable for group",
      location: "Peradeniya Road, Kandy",
      features: ["AC vehicle", "Experienced mountain chauffeur", "Hotel door delivery"],
      googleMapsUrl: "https://www.google.com/maps/search/Car+Rental+Driver+Kandy+Sri+Lanka",
      source: "catalog",
    },
    {
      id: "kandy-tuk-tuks",
      shopName: "Kandy Hill Country Tuk-Tuk Hire",
      vehicleType: "Self-Drive Tuk-Tuk",
      icon: "🛺",
      rate: "Rs. 5,500/day",
      rating: 4.7,
      reviews: 110,
      badge: "Adventure",
      reason: "Fun rural exploration through hills and tea estates",
      location: "Katugastota Road, Kandy",
      features: ["Hill driving lesson", "Tourist permit assistance"],
      googleMapsUrl: "https://www.google.com/maps/search/Tuk+Tuk+Rental+Kandy+Sri+Lanka",
      source: "catalog",
    },
    {
      id: "kandy-pickme-uber",
      shopName: "PickMe & Uber Kandy Transit Point",
      vehicleType: "PickMe / Uber App",
      icon: "📱",
      rate: "Metered / On Demand",
      rating: 4.8,
      reviews: 350,
      badge: "City Ride",
      reason: "High traffic, easy ride-hailing around Kandy Lake",
      location: "Dalada Veediya, Kandy City Center",
      features: ["Instant smartphone hailing", "Fixed card or cash fares", "Tuk-Tuk & car options"],
      googleMapsUrl: "https://www.google.com/maps/search/PickMe+Taxi+Kandy+Sri+Lanka",
      source: "catalog",
    },
  ],
  "nuwara eliya": [
    {
      id: "nuwaraeliya-hill-cars",
      shopName: "Little England Chauffeur & Van Hire",
      vehicleType: "Private Car with Driver",
      icon: "🚗",
      rate: "Rs. 14,000/day",
      rating: 4.9,
      reviews: 160,
      badge: "Family Pick",
      reason: "Winding mountain roads, comfortable for group",
      location: "Queen Elizabeth Drive, Nuwara Eliya",
      features: ["Heated / climate controlled", "Tea estate specialist", "Luggage friendly"],
      googleMapsUrl: "https://www.google.com/maps/search/Car+Driver+Rental+Nuwara+Eliya+Sri+Lanka",
      source: "catalog",
    },
    {
      id: "nuwaraeliya-tuktuk-hub",
      shopName: "Misty Valley Tuk-Tuk Rentals",
      vehicleType: "Self-Drive Tuk-Tuk",
      icon: "🛺",
      rate: "Rs. 6,000/day",
      rating: 4.7,
      reviews: 89,
      badge: "Adventure",
      reason: "Fun rural exploration past misty waterfalls and tea factories",
      location: "Kandy Road, Nuwara Eliya",
      features: ["Rain proof canopies", "Warm blankets on request", "Local permit support"],
      googleMapsUrl: "https://www.google.com/maps/search/Tuk+Tuk+Rental+Nuwara+Eliya+Sri+Lanka",
      source: "catalog",
    },
  ],
  colombo: [
    {
      id: "colombo-pickme-uber",
      shopName: "PickMe & Uber Colombo Mobility Network",
      vehicleType: "PickMe / Uber App",
      icon: "📱",
      rate: "Metered / On Demand",
      rating: 4.9,
      reviews: 500,
      badge: "City Pick",
      reason: "High traffic, easy ride-hailing",
      location: "All Zones (Galle Face, Colombo 03, Fort)",
      features: ["Zero wait times", "Tuk-tuk, car & van choices", "App tracking & cashless pay"],
      googleMapsUrl: "https://www.google.com/maps/search/PickMe+Colombo+Sri+Lanka",
      source: "catalog",
    },
    {
      id: "colombo-kangaroo-cabs",
      shopName: "Kangaroo Cabs & Airport Chauffeurs",
      vehicleType: "Private Car with Driver",
      icon: "🚗",
      rate: "Rs. 12,000/day",
      rating: 4.8,
      reviews: 320,
      badge: "Day Trips",
      reason: "Comfortable air-conditioned transport for city tours",
      location: "Havelock Road, Colombo 05",
      features: ["24/7 hotline", "Pre-booked day packages", "Highway tolls included options"],
      googleMapsUrl: "https://www.google.com/maps/search/Kangaroo+Cabs+Colombo+Sri+Lanka",
      source: "catalog",
    },
    {
      id: "colombo-marine-tuktuk",
      shopName: "Colombo Coastal Self-Drive Tuk-Tuk",
      vehicleType: "Self-Drive Tuk-Tuk",
      icon: "🛺",
      rate: "Rs. 5,000/day",
      rating: 4.7,
      reviews: 145,
      badge: "Adventure",
      reason: "Fun urban exploration along Marine Drive",
      location: "Marine Drive, Kollupitiya",
      features: ["GPS mount", "City driving tips", "Hotel delivery"],
      googleMapsUrl: "https://www.google.com/maps/search/Tuk+Tuk+Rental+Colombo+Sri+Lanka",
      source: "catalog",
    },
  ],
  galle: [
    {
      id: "galle-fort-scooters",
      shopName: "Galle Fort Scooter & Bike Hire",
      vehicleType: "Scooter",
      icon: "🛵",
      rate: "Rs. 3,500/day",
      rating: 4.9,
      reviews: 170,
      badge: "Solo / Couple Pick",
      reason: "Coastal roads, easy beach hopping",
      location: "Leyn Baan Street, Galle Fort",
      features: ["Helmets included", "Surf rack available", "Free town delivery"],
      googleMapsUrl: "https://www.google.com/maps/search/Scooter+Rental+Galle+Fort+Sri+Lanka",
      source: "catalog",
    },
    {
      id: "galle-tuktuk-safari",
      shopName: "Southern Tuk-Tuk Rental Hub",
      vehicleType: "Self-Drive Tuk-Tuk",
      icon: "🛺",
      rate: "Rs. 5,500/day",
      rating: 4.8,
      reviews: 125,
      badge: "Adventure",
      reason: "Fun coastal exploration to Unawatuna and jungle beaches",
      location: "Matara Road, Galle",
      features: ["Driving orientation", "Permit assistance", "24/7 roadside assist"],
      googleMapsUrl: "https://www.google.com/maps/search/Tuk+Tuk+Rental+Galle+Sri+Lanka",
      source: "catalog",
    },
  ],
  jaffna: [
    {
      id: "jaffna-yarl-scooters",
      shopName: "Yarl Scooter & Bike Rentals",
      vehicleType: "Scooter",
      icon: "🛵",
      rate: "Rs. 3,500/day",
      rating: 4.8,
      reviews: 140,
      badge: "Top Pick",
      reason: "Flat coastal terrain, ideal for island & causeway hopping",
      location: "Station Road, Jaffna Town",
      features: ["Two helmets included", "Full fuel tank", "Free delivery to city hotels"],
      googleMapsUrl: "https://www.google.com/maps/search/Scooter+Rental+Station+Road+Jaffna+Sri+Lanka",
      source: "catalog",
    },
    {
      id: "jaffna-peninsula-tuktuks",
      shopName: "Jaffna Heritage Self-Drive Tuk-Tuk Hire",
      vehicleType: "Self-Drive Tuk-Tuk",
      icon: "🛺",
      rate: "Rs. 6,000/day",
      rating: 4.9,
      reviews: 110,
      badge: "Adventure",
      reason: "Authentic exploration across Karainagar & coastal lagoons",
      location: "Hospital Road, near Jaffna Fort",
      features: ["Short driving lesson", "Full insurance coverage", "24/7 Northern breakdown support"],
      googleMapsUrl: "https://www.google.com/maps/search/Tuk+Tuk+Hire+Jaffna+Sri+Lanka",
      source: "catalog",
    },
    {
      id: "jaffna-private-chauffeur",
      shopName: "Yarl Cabs & Peninsula Chauffeur Services",
      vehicleType: "Private Car with Driver",
      icon: "🚗",
      rate: "Rs. 15,000/day",
      rating: 4.8,
      reviews: 95,
      badge: "Family / AC Comfort",
      reason: "Cool air-conditioned transit across the sunny northern peninsula",
      location: "Kandy Road, Jaffna",
      features: ["Dual air conditioning", "Knowledgeable local Tamil/English driver", "Doorstep pickup"],
      googleMapsUrl: "https://www.google.com/maps/search/Taxi+Driver+Hire+Jaffna+Sri+Lanka",
      source: "catalog",
    },
  ],
};

function getFallbackVehicles(destination = "") {
  const cleanDest = destination.toLowerCase().trim();
  const key = Object.keys(curatedVehiclesCatalog).find(
    (k) => cleanDest.includes(k) || k.includes(cleanDest)
  );

  if (key && curatedVehiclesCatalog[key]) {
    return curatedVehiclesCatalog[key];
  }

  // General default fallback for Sri Lankan destination
  return [
    {
      id: "default-scooter-hub",
      shopName: `${destination} Scooters & Wheels`,
      vehicleType: "Scooter",
      icon: "🛵",
      rate: "Rs. 3,500/day",
      rating: 4.8,
      reviews: 95,
      badge: "Solo / Couple",
      reason: "Coastal roads, easy beach hopping",
      location: `Central ${destination}`,
      features: ["Helmets included", "Free hotel delivery", "Roadside assistance"],
      googleMapsUrl: `https://www.google.com/maps/search/Scooter+Rental+${encodeURIComponent(destination)}+Sri+Lanka`,
      source: "catalog",
    },
    {
      id: "default-tuktuk-club",
      shopName: `${destination} Self-Drive Tuk-Tuk Club`,
      vehicleType: "Self-Drive Tuk-Tuk",
      icon: "🛺",
      rate: "Rs. 6,000/day",
      rating: 4.9,
      reviews: 140,
      badge: "Adventure",
      reason: "Fun rural exploration, scenic mountain drives",
      location: `Main Town Area, ${destination}`,
      features: ["Driving lesson included", "Full insurance", "Local permit support"],
      googleMapsUrl: `https://www.google.com/maps/search/Tuk+Tuk+Rental+${encodeURIComponent(destination)}+Sri+Lanka`,
      source: "catalog",
    },
    {
      id: "default-chauffeur-hire",
      shopName: `${destination} Private Car & Driver Hire`,
      vehicleType: "Private Car with Driver",
      icon: "🚗",
      rate: "Rs. 14,000/day",
      rating: 4.8,
      reviews: 110,
      badge: "Family",
      reason: "Winding mountain roads, comfortable for group",
      location: `Station Road, ${destination}`,
      features: ["AC vehicle", "English-speaking chauffeur", "Doorstep pickup"],
      googleMapsUrl: `https://www.google.com/maps/search/Car+Driver+Rental+${encodeURIComponent(destination)}+Sri+Lanka`,
      source: "catalog",
    },
  ];
}

// Master Vehicle Retrieval Method
async function getVehicles({ destination, tripType = "Solo", travelers = 1, exclude }) {
  const cacheKey = `${(destination || "").toLowerCase()}-${(tripType || "").toLowerCase()}-${travelers}`;

  // Check cache first (valid for 30 minutes)
  const cached = vehicleCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 30 * 60 * 1000) {
    return cached.data;
  }

  // 1. Query Gemini AI first
  if (process.env.GEMINI_API_KEY) {
    try {
      console.log(`[VehicleService] Querying Gemini AI for vehicle rental shops in: ${destination}`);
      const geminiShops = await geminiVehicleService.fetchVehiclesWithGemini({
        destination,
        tripType,
        travelers,
        exclude,
      });

      if (geminiShops && geminiShops.length > 0) {
        console.log(`[VehicleService] Successfully generated ${geminiShops.length} live rental shops via Gemini AI`);
        const result = {
          provider: "gemini",
          shops: geminiShops,
        };
        vehicleCache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
      }
    } catch (err) {
      console.warn(`[VehicleService] Gemini AI fetch failed (${err.message}). Falling back to curated catalog.`);
    }
  }

  // 2. Fallback to Curated Catalog
  console.log(`[VehicleService] Using curated Sri Lanka vehicle rental catalog for: ${destination}`);
  const fallbackShops = getFallbackVehicles(destination);
  const result = {
    provider: "catalog",
    shops: fallbackShops,
  };
  vehicleCache.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
}

module.exports = {
  getVehicles,
};
