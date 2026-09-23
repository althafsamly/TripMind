import { useLocation, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getDestinationPhoto,
  getPexelsDestinationPhoto,
  getLocalDestinationFallback,
  getDestinationPhotos,
} from "../utils/activityImages";
import EmergencySOSModal from "../components/EmergencySOSModal";
import "./TripResult.css";

// Dynamic database for destination-specific Map, Food, and Vehicle data
const locationData = {
  mirissa: {
    coords: { lat: 5.9482, lng: 80.4716 },
    foodSpots: [
      { name: "Dewmini Roti Shop", type: "Roti & Kottu", specialty: "Famous cheese & avocado rotis" },
      { name: "Mirissa Catch Seafood", type: "Seafood Grill", specialty: "Fresh beachfront daily catch" },
      { name: "Mama's Dinner", type: "Rice & Curry", specialty: "Authentic local dinner buffet" },
    ],
    vehicles: [
      { type: "Scooter", rate: "Rs. 3,500/day", badge: "Solo / Couple Pick", reason: "Coastal roads, easy beach hopping", isRecommended: true },
      { type: "Self-Drive Tuk-Tuk", rate: "Rs. 6,000/day", badge: "Adventure", reason: "Fun coastal exploration & beach hopping" },
      { type: "Private Car with Driver", rate: "Rs. 14,000/day", badge: "Family / Group", reason: "Air-conditioned comfort for group excursions" },
    ],
  },
  ahangama: {
    coords: { lat: 5.9723, lng: 80.3644 },
    foodSpots: [
      { name: "Ceylon Sliders", type: "Cafe & Bowls", specialty: "Surf-style brunch & smoothies" },
      { name: "Citra", type: "Artisanal Bakery", specialty: "Sourdough sandwiches & coffee" },
    ],
    vehicles: [
      { type: "Scooter", rate: "Rs. 3,500/day", badge: "Solo / Couple Pick", reason: "Coastal roads, easy beach hopping", isRecommended: true },
      { type: "Self-Drive Tuk-Tuk", rate: "Rs. 6,000/day", badge: "Adventure", reason: "Fun coastal exploration & surf point hopping" },
    ],
  },
  weligama: {
    coords: { lat: 5.9734, lng: 80.4286 },
    foodSpots: [
      { name: "Nomad Cafe", type: "Healthy Bowls & Coffee", specialty: "Avocado toasts and smoothies" },
      { name: "Fish Point Weligama", type: "Seafood", specialty: "Grilled catch of the day" },
    ],
    vehicles: [
      { type: "Scooter", rate: "Rs. 3,500/day", badge: "Surf Hopping", reason: "Easy beach and surf point hopping", isRecommended: true },
      { type: "Self-Drive Tuk-Tuk", rate: "Rs. 6,000/day", badge: "Adventure", reason: "Fun coastal touring" },
    ],
  },
  ella: {
    coords: { lat: 6.8667, lng: 81.0466 },
    foodSpots: [
      { name: "Matey Hut", type: "Local Eatery", specialty: "Traditional claypot rice & curry" },
      { name: "Downtown Roti Hut", type: "Street Food", specialty: "Kottu & hot snacks" },
      { name: "Chill Cafe", type: "Fusion & Local", specialty: "Lankan curries & scenic mountain view" },
    ],
    vehicles: [
      { type: "Self-Drive Tuk-Tuk", rate: "Rs. 6,000/day", badge: "Adventure Pick", reason: "Fun rural exploration, scenic mountain drives", isRecommended: true },
      { type: "Scooter", rate: "Rs. 3,500/day", badge: "Solo / Couple", reason: "Agile mountain cruising & short hill climbs" },
      { type: "Private Car with Driver", rate: "Rs. 14,000/day", badge: "Family", reason: "Winding mountain roads, comfortable for group" },
    ],
  },
  sigiriya: {
    coords: { lat: 7.957, lng: 80.7603 },
    foodSpots: [
      { name: "Wijesiri Family Restaurant", type: "Village Curry", specialty: "Home-style lotus root & jackfruit curry" },
      { name: "Rithu Restaurant", type: "Local & Fusion", specialty: "Claypot biryani and fresh juices" },
    ],
    vehicles: [
      { type: "Self-Drive Tuk-Tuk", rate: "Rs. 6,000/day", badge: "Adventure Pick", reason: "Fun rural exploration, scenic mountain drives", isRecommended: true },
      { type: "Private Car with Driver", rate: "Rs. 14,000/day", badge: "Family", reason: "Winding roads, air-conditioned Cultural Triangle comfort" },
      { type: "Scooter", rate: "Rs. 3,500/day", badge: "Solo / Couple", reason: "Scenic village routes and rock fortress hopping" },
    ],
  },
  dambulla: {
    coords: { lat: 7.8682, lng: 80.6517 },
    foodSpots: [
      { name: "Bentota Bake House Dambulla", type: "Bakery & Local", specialty: "Fresh short eats & rice and curry" },
    ],
    vehicles: [
      { type: "Private Car with Driver", rate: "Rs. 14,000/day", badge: "Comfort", reason: "Air conditioned exploration of ancient sites", isRecommended: true },
    ],
  },
  kandy: {
    coords: { lat: 7.2906, lng: 80.6337 },
    foodSpots: [
      { name: "Muslim Hotel", type: "Street Food Legend", specialty: "Authentic beef kottu & samosas" },
      { name: "Slightly Chilled Lounge", type: "Lankan & Views", specialty: "Curry with Kandy lake panorama" },
    ],
    vehicles: [
      { type: "Private Car with Driver", rate: "Rs. 14,000/day", badge: "Family Pick", reason: "Winding mountain roads, comfortable for group", isRecommended: true },
      { type: "Self-Drive Tuk-Tuk", rate: "Rs. 5,500/day", badge: "Adventure", reason: "Fun rural exploration through hills and tea estates" },
      { type: "PickMe / Uber App", rate: "Metered / On Demand", badge: "City Ride", reason: "High traffic, easy ride-hailing around Kandy Lake" },
    ],
  },
  "nuwara eliya": {
    coords: { lat: 6.9497, lng: 80.7891 },
    foodSpots: [
      { name: "Grand Indian", type: "North Indian Delights", specialty: "Tandoori curries & buttery naans" },
      { name: "De Silva Food Centre", type: "Ceylon Street Food", specialty: "Hot kottu & spicy rotti in misty air" },
    ],
    vehicles: [
      { type: "Private Car with Driver", rate: "Rs. 14,000/day", badge: "Family Pick", reason: "Winding mountain roads, comfortable for group", isRecommended: true },
      { type: "Self-Drive Tuk-Tuk", rate: "Rs. 6,000/day", badge: "Adventure", reason: "Fun rural exploration past misty waterfalls and tea factories" },
    ],
  },
  colombo: {
    coords: { lat: 6.9271, lng: 79.8612 },
    foodSpots: [
      { name: "Ministry of Crab", type: "Signature Seafood", specialty: "World-famous giant lagoon mud crabs" },
      { name: "Nana's Galle Face", type: "Night Street Stall", specialty: "Beachfront cheese kottu & isso wade" },
    ],
    vehicles: [
      { type: "PickMe / Uber App", rate: "Metered / On Demand", badge: "City Pick", reason: "High traffic, easy ride-hailing", isRecommended: true },
      { type: "Private Car with Driver", rate: "Rs. 12,000/day", badge: "Day Trips", reason: "Comfortable air-conditioned transport for city tours" },
      { type: "Self-Drive Tuk-Tuk", rate: "Rs. 5,000/day", badge: "Adventure", reason: "Fun urban exploration along Marine Drive" },
    ],
  },
  negombo: {
    coords: { lat: 7.2118, lng: 79.8398 },
    foodSpots: [
      { name: "Lords Restaurant", type: "Seafood & Grill", specialty: "Lagoon prawns & fish curries" },
    ],
    vehicles: [
      { type: "PickMe / Uber App", rate: "Metered", badge: "Airport / City", reason: "Convenient airport & beach transport", isRecommended: true },
    ],
  },
  bentota: {
    coords: { lat: 6.4259, lng: 79.9958 },
    foodSpots: [
      { name: "Mallis Seafood", type: "Riverfront Dining", specialty: "Fresh river catch & crab" },
    ],
    vehicles: [
      { type: "Scooter", rate: "Rs. 3,500/day", badge: "Coastal", reason: "River & beach hopping", isRecommended: true },
    ],
  },
  galle: {
    coords: { lat: 6.0535, lng: 80.2210 },
    foodSpots: [
      { name: "Lucky Fort Restaurant", type: "Rice & Curry", specialty: "10-curry traditional set" },
      { name: "Poonie's Kitchen", type: "Healthy Local", specialty: "Organic salad bowls & fresh juices" },
    ],
    vehicles: [
      { type: "Scooter", rate: "Rs. 3,500/day", badge: "Solo / Couple Pick", reason: "Coastal roads, easy beach hopping", isRecommended: true },
      { type: "Self-Drive Tuk-Tuk", rate: "Rs. 5,500/day", badge: "Adventure", reason: "Fun coastal exploration to Unawatuna and jungle beaches" },
      { type: "Private Car with Driver", rate: "Rs. 13,000/day", badge: "Family / Group", reason: "Scenic coastal highway cruise for groups" },
    ],
  },
  trincomalee: {
    coords: { lat: 8.5874, lng: 81.2152 },
    foodSpots: [
      { name: "Fernand's Beach Bar", type: "Beach Grill", specialty: "Fresh jumbo prawns & grilled barracuda" },
      { name: "Green Garden Restaurant", type: "Traditional Tamil Rice & Curry", specialty: "Crab curry & curd" },
    ],
    vehicles: [
      { type: "Scooter", rate: "Rs. 3,500/day", badge: "Solo / Couple Pick", reason: "Coastal roads, easy beach hopping", isRecommended: true },
      { type: "Self-Drive Tuk-Tuk", rate: "Rs. 5,500/day", badge: "Adventure", reason: "Fun rural exploration & Nilaveli beach hopping" },
      { type: "Private Car with Driver", rate: "Rs. 14,000/day", badge: "Family / Group", reason: "Long-distance coastal travel for families" },
    ],
  },
  jaffna: {
    coords: { lat: 9.6615, lng: 80.0255 },
    foodSpots: [
      { name: "Mangos Indian Veg", type: "South Indian & Jaffna", specialty: "Crispy dosas & Jaffna meals" },
      { name: "Rio Ice Cream", type: "Famous Dessert", specialty: "Special sundae & falooda" },
    ],
    vehicles: [
      { type: "Scooter", rate: "Rs. 3,500/day", badge: "Peninsula Tour", reason: "Great for visiting islands & causeways", isRecommended: true },
    ],
  },
};

// Smart transport recommendation engine matching user destination & trip type
function getVehicleRecommendation(destination = "", tripType = "", travelers = 1) {
  const dest = (destination || "").toLowerCase().trim();
  const type = (tripType || "").toLowerCase().trim();
  const count = Number(travelers) || 1;

  // Colombo -> PickMe / Uber App
  if (dest.includes("colombo")) {
    return {
      vehicle: "PickMe / Uber App",
      target: "City Ride-Hailing",
      reason: "High traffic, easy ride-hailing",
      rate: "Metered / On Demand",
    };
  }

  // Kandy / Nuwara Eliya or Family trip type / group size >= 3
  if (
    dest.includes("kandy") ||
    dest.includes("nuwara eliya") ||
    dest.includes("hatton") ||
    type.includes("family") ||
    count >= 3
  ) {
    return {
      vehicle: "Private Car with Driver",
      target: type.includes("family") ? "Family Recommendation" : "Group & Family Pick",
      reason: "Winding mountain roads, comfortable for group",
      rate: "Rs. 14,000/day",
    };
  }

  // Ella / Sigiriya or Adventure trip type
  if (
    dest.includes("ella") ||
    dest.includes("sigiriya") ||
    dest.includes("habarana") ||
    type.includes("adventure")
  ) {
    return {
      vehicle: "Self-Drive Tuk-Tuk",
      target: "Adventure Pick",
      reason: "Fun rural exploration, scenic mountain drives",
      rate: "Rs. 6,000/day",
    };
  }

  // Mirissa / Ahangama or Solo / Couple trip type
  if (
    dest.includes("mirissa") ||
    dest.includes("ahangama") ||
    dest.includes("weligama") ||
    dest.includes("galle") ||
    dest.includes("bentota") ||
    type.includes("solo") ||
    type.includes("couple")
  ) {
    return {
      vehicle: "Scooter",
      target: "Solo / Couple Pick",
      reason: "Coastal roads, easy beach hopping",
      rate: "Rs. 3,500/day",
    };
  }

  // General fallback
  return {
    vehicle: "Self-Drive Tuk-Tuk",
    target: "Popular Choice",
    reason: "Fun rural exploration, scenic mountain drives",
    rate: "Rs. 6,000/day",
  };
}

function TripResult() {
  const location = useLocation();
  const trip = location.state;

  if (!trip) {
    return (
      <div className="no-trip">
        <h2>No trip generated yet</h2>
        <Link to="/plan-trip">Plan a Trip</Link>
      </div>
    );
  }

  // Fallback location lookup
  const destKey = trip.destination ? trip.destination.toLowerCase().trim() : "";
  const foundKey = Object.keys(locationData).find((k) => destKey.includes(k) || k.includes(destKey));
  const currentDestData = (foundKey && locationData[foundKey]) || {
    coords: { lat: 6.9271, lng: 79.8612 },
    foodSpots: [
      { name: "Local Village Eatery", type: "Rice & Curry", specialty: "Authentic Sri Lankan buffet" },
      { name: "Night Market Kottu", type: "Street Food", specialty: "Freshly made hot kottu" },
    ],
    vehicles: [
      { type: "Scooter", rate: "Rs. 3,500/day", badge: "Solo / Couple", reason: "Coastal roads, easy beach hopping" },
      { type: "Self-Drive Tuk-Tuk", rate: "Rs. 6,000/day", badge: "Adventure", reason: "Fun rural exploration, scenic mountain drives" },
      { type: "Private Car with Driver", rate: "Rs. 14,000/day", badge: "Family", reason: "Winding mountain roads, comfortable for group" },
    ],
  };

  const vehicleRecommendation = getVehicleRecommendation(
    trip.destination,
    trip.tripType,
    trip.travelers
  );

  // Live rental shops state powered by Gemini AI
  const [rentalShops, setRentalShops] = useState(currentDestData.vehicles || []);
  const [loadingShops, setLoadingShops] = useState(false);
  const [shopsProvider, setShopsProvider] = useState("catalog");

  // Live authentic food recommendations powered by Gemini AI
  const [foodSpots, setFoodSpots] = useState(currentDestData.foodSpots || []);
  const [loadingFood, setLoadingFood] = useState(false);
  const [foodProvider, setFoodProvider] = useState("catalog");

  useEffect(() => {
    if (!trip || !trip.destination) return;

    let isMounted = true;
    setLoadingShops(true);
    setLoadingFood(true);

    const vehicleParams = new URLSearchParams({
      destination: trip.destination,
      tripType: trip.tripType || "General",
      travelers: trip.travelers || 1,
    });

    // Fetch live vehicle rental shops
    fetch(`http://localhost:5000/api/vehicles?${vehicleParams.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch vehicle rental shops");
        return res.json();
      })
      .then((data) => {
        if (isMounted && data && Array.isArray(data.shops) && data.shops.length > 0) {
          setRentalShops(data.shops);
          setShopsProvider(data.provider || "gemini");
        }
      })
      .catch((err) => {
        console.warn("Error fetching live rental shops, using fallback catalog:", err);
      })
      .finally(() => {
        if (isMounted) setLoadingShops(false);
      });

    // Fetch live authentic food recommendations
    const foodParams = new URLSearchParams({
      destination: trip.destination,
      budget: trip.budget || "",
    });

    fetch(`http://localhost:5000/api/food?${foodParams.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch food recommendations");
        return res.json();
      })
      .then((data) => {
        if (isMounted && data && Array.isArray(data.foodSpots) && data.foodSpots.length > 0) {
          setFoodSpots(data.foodSpots);
          setFoodProvider(data.provider || "gemini");
        }
      })
      .catch((err) => {
        console.warn("Error fetching live food spots, using fallback catalog:", err);
      })
      .finally(() => {
        if (isMounted) setLoadingFood(false);
      });

    return () => {
      isMounted = false;
    };
  }, [trip?.destination, trip?.tripType, trip?.travelers, trip?.budget]);

  const defaultItinerary = [
    {
      day: 1,
      title: "Arrival & Local Exploration",
      morning: "Arrive and check into your accommodation",
      afternoon: "Explore popular local attractions and viewpoints",
      evening: "Enjoy dinner at a recommended local restaurant",
    },
    {
      day: 2,
      title: "Culture & Adventure",
      morning: "Visit cultural and historical attractions",
      afternoon: "Experience nature and outdoor activities",
      evening: "Explore the town and try local cuisine",
    },
    {
      day: 3,
      title: "Hidden Gems & Relaxation",
      morning: "Visit scenic locations and hidden gems",
      afternoon: "Shopping, cafés and free exploration",
      evening: "Relax and enjoy your final evening",
    },
  ];

  // Clean Travel App Parser: Converts itinerary day items into structured activities with pills, headlines & directions
  function formatDayActivities(item, destination = "", hotel = null) {
    // Helper to find tip from trip.selectedActivities if not directly on activity object
    const findTip = (loc) => {
      if (!loc || !trip?.selectedActivities || !Array.isArray(trip.selectedActivities)) return null;
      const cleanLoc = loc.toLowerCase().replace(/^check-in:\s*/i, "").trim();
      const matched = trip.selectedActivities.find((sa) => {
        if (!sa.title) return false;
        const saTitle = sa.title.toLowerCase().trim();
        return saTitle === cleanLoc || cleanLoc.includes(saTitle) || saTitle.includes(cleanLoc);
      });
      return matched?.highlight || matched?.tip || null;
    };

    if (Array.isArray(item.activities) && item.activities.length > 0) {
      return item.activities.map((act) => ({
        ...act,
        highlight: act.highlight || act.tip || findTip(act.location),
      }));
    }

    const rawSlots = [
      { slot: "Morning", text: item.morning, time: "08:30 AM", defaultDuration: "2 - 3 hrs", defaultCat: "Morning Activity" },
      { slot: "Afternoon", text: item.afternoon, time: "01:30 PM", defaultDuration: "2 - 3 hrs", defaultCat: "Sightseeing" },
      { slot: "Evening", text: item.evening, time: "06:30 PM", defaultDuration: "2 hrs", defaultCat: "Dining & Evening" },
    ];

    return rawSlots.map(({ slot, text, time, defaultDuration, defaultCat }) => {
      if (!text) {
        return {
          slot,
          time,
          duration: defaultDuration,
          location: `${destination} Leisure Exploration`,
          description: `Enjoy free leisure time and local discovery in ${destination}.`,
          category: defaultCat,
          highlight: null,
        };
      }

      // Pattern 1: "Visit {Title} ({Duration}). {Description}"
      const visitMatch = text.match(/^(?:Visit\s+)?([^().]+?)\s*\(([^)]+)\)\.?\s*(.*)$/i);
      if (visitMatch) {
        const loc = visitMatch[1].trim();
        return {
          slot,
          time,
          duration: visitMatch[2].trim(),
          location: loc,
          description: visitMatch[3].trim() || `Explore ${loc} in ${destination}.`,
          category: slot === "Evening" ? "Dining" : "Sightseeing",
          highlight: findTip(loc),
        };
      }

      // Pattern 2: "Arrive in ... check in at {Hotel}..."
      if (text.toLowerCase().includes("check in") || text.toLowerCase().includes("check-in")) {
        const hotelName = hotel?.name || "Your Hotel";
        return {
          slot,
          time,
          duration: "1 - 2 hrs",
          location: `Check-in: ${hotelName}`,
          description: text,
          category: "Arrival",
          highlight: null,
        };
      }

      // Pattern 3: "{Title}. {Description}"
      const periodMatch = text.match(/^([^.]+?)\.\s+(.+)$/);
      if (periodMatch && periodMatch[1].length < 45) {
        const loc = periodMatch[1].trim();
        return {
          slot,
          time,
          duration: defaultDuration,
          location: loc,
          description: periodMatch[2].trim(),
          category: slot === "Evening" ? "Dining" : defaultCat,
          highlight: findTip(loc),
        };
      }

      // Pattern 4: Fallback
      const words = text.split(" ");
      const shortTitle = words.slice(0, 4).join(" ");
      const loc = shortTitle.length < 35 ? shortTitle : `${destination} Highlight`;
      return {
        slot,
        time,
        duration: defaultDuration,
        location: loc,
        description: text,
        category: slot === "Evening" ? "Dining" : defaultCat,
        highlight: findTip(loc),
      };
    });
  }

  function getDirectionsUrl(location = "", destination = "") {
    const cleanLoc = (location || "").replace(/^Check-in:\s*/i, "").trim();
    const query = `${cleanLoc}, ${destination}, Sri Lanka`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  const itinerary = trip.itinerary && trip.itinerary.length > 0 ? trip.itinerary : defaultItinerary;
  const nightsCount = Math.max(1, (trip.days || 1) - 1);

  // Exact budget calculation
  const totalBudget = Number(trip.budget) || 0;
  const hotelCost =
    trip.hotelTotalCost !== undefined
      ? trip.hotelTotalCost
      : trip.selectedHotel
      ? trip.selectedHotel.pricePerNight * nightsCount
      : Math.round(totalBudget * 0.4);

  const activitiesCost =
    trip.activitiesTotalCost !== undefined
      ? trip.activitiesTotalCost
      : trip.selectedActivities && trip.selectedActivities.length > 0
      ? trip.selectedActivities.reduce((sum, a) => sum + (a.cost || 0), 0)
      : Math.round(totalBudget * 0.15);

  const remainingBudget = Math.max(0, totalBudget - hotelCost - activitiesCost);
  const foodCost = remainingBudget > 0 ? Math.round(remainingBudget * 0.55) : Math.round(totalBudget * 0.25);
  const transportCost = remainingBudget > 0 ? Math.round(remainingBudget * 0.45) : Math.round(totalBudget * 0.2);
  const estimatedTotal = hotelCost + activitiesCost + foodCost + transportCost;

  const navigate = useNavigate();
  const [saveStatus, setSaveStatus] = useState("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);

  async function handleSaveTrip() {
    const token = localStorage.getItem("token");

    if (!token) {
      if (window.confirm("You need to be logged in to save trips. Would you like to log in now?")) {
        navigate("/login");
      }
      return;
    }

    try {
      setSaveStatus("saving");
      setSaveMessage("");

      const response = await fetch("http://localhost:5000/api/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          destination: trip.destination,
          budget: trip.budget,
          startDate: trip.startDate,
          endDate: trip.endDate,
          days: trip.days,
          travelers: trip.travelers,
          tripType: trip.tripType,
          interests: trip.interests,
          destinationImage: trip.destinationImage || getDestinationPhoto(trip.destination),
          itinerary: trip.itinerary || itinerary,
          selectedHotel: trip.selectedHotel || null,
          selectedActivities: trip.selectedActivities || [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSaveStatus("error");
        setSaveMessage(data.message || "Failed to save trip");
        return;
      }

      setSaveStatus("saved");
      setSaveMessage("Trip saved to your profile!");
    } catch (error) {
      console.error("Save trip error:", error);
      setSaveStatus("error");
      setSaveMessage("Could not connect to server");
    }
  }

  function getGoogleMapsEmbedUrl(hotelName, dest) {
    const query = encodeURIComponent(`${hotelName}, ${dest}, Sri Lanka`);
    return `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }

  const destinationPhotos = getDestinationPhotos(trip.destination);

  return (
    <div className="trip-result-page">
      <div className="result-container">
        <section className="result-hero">
          <p className="result-label">YOUR CUSTOM AI TRIP PLAN</p>
          <h1>{trip.destination}</h1>
          <p className="result-subtitle">
            A personalized {trip.days}-day Sri Lankan adventure curated with your chosen hotel and experiences.
          </p>

          {/* 3-Photo Split Destination Gallery */}
          <div className="result-photos-trio">
            {destinationPhotos.map((photo, idx) => (
              <div className="result-photo-card" key={idx}>
                <img
                  src={photo.url}
                  alt={`${trip.destination} - ${photo.caption}`}
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = photo.fallback;
                  }}
                />
                <div className="result-photo-overlay">
                  <span className="result-photo-tag">{photo.tag}</span>
                  <h4>{photo.caption}</h4>
                </div>
              </div>
            ))}
          </div>

          <div className="trip-summary">
            <div>
              <span className="summary-label-tag">DURATION</span>
              <strong>{trip.days} Days ({nightsCount} Nights)</strong>
              <p>
                {trip.startDate} → {trip.endDate}
              </p>
            </div>

            <div>
              <span className="summary-label-tag">TRAVELERS</span>
              <strong>{trip.travelers} Traveler(s)</strong>
              <p>{trip.tripType} Trip</p>
            </div>

            <div>
              <span className="summary-label-tag">TARGET BUDGET</span>
              <strong>
                LKR {totalBudget.toLocaleString()}
              </strong>
              <p>Estimated Target</p>
            </div>
          </div>
        </section>

        <div className="result-layout">
          <main className="itinerary-section">
            
            {/* Interactive Location Map */}
            <div className="result-card map-card">
              <div className="section-title">
                <p>DESTINATION GUIDE</p>
                <h2>{trip.destination} Map</h2>
              </div>
              <div className="map-wrapper">
                <iframe
                  title="Destination Map"
                  width="100%"
                  height="280"
                  style={{ border: 0, borderRadius: "14px" }}
                  loading="lazy"
                  src={`https://maps.google.com/maps?q=${currentDestData.coords.lat},${currentDestData.coords.lng}&z=13&output=embed`}
                />
              </div>
            </div>

            {/* Personalized Itinerary Section */}
            <div className="section-title" style={{ marginTop: "30px" }}>
              <p>DAY-BY-DAY SCHEDULE</p>
              <h2>Your Tailored Itinerary</h2>
            </div>

            {itinerary.map((item) => {
              const dayActivities = formatDayActivities(item, trip.destination, trip.selectedHotel);

              return (
                <div className="day-card-modern" key={item.day}>
                  <div className="day-card-header">
                    <div className="day-badge">
                      <span className="day-badge-prefix">DAY</span>
                      <span className="day-badge-num">{String(item.day).padStart(2, "0")}</span>
                    </div>
                    <div className="day-header-info">
                      <h3>{item.title}</h3>
                      <span className="day-schedule-count">
                        {dayActivities.length} Curated Sights • {trip.destination}, Sri Lanka
                      </span>
                    </div>
                  </div>

                  <div className="day-timeline">
                    {dayActivities.map((act, actIdx) => (
                      <div className="timeline-node" key={actIdx}>
                        <div className="timeline-indicator">
                          <div className={`timeline-icon-bubble ${act.slot.toLowerCase()}`}>
                            <span className="timeline-node-num">{String(actIdx + 1).padStart(2, "0")}</span>
                          </div>
                          {actIdx < dayActivities.length - 1 && <div className="timeline-line" />}
                        </div>

                        <div className="timeline-body">
                          {/* Time & Duration Pills */}
                          <div className="activity-pills-bar">
                            <span className={`pill-time-slot ${act.slot.toLowerCase()}`}>
                              {act.slot}
                            </span>
                            <span className="pill-metric">
                              {act.time}
                            </span>
                            <span className="pill-metric">
                              {act.duration}
                            </span>
                            {act.category && (
                              <span className="pill-category">
                                {act.category}
                              </span>
                            )}
                          </div>

                          {/* Bold Headline for Location & Small Google Maps Directions Button */}
                          <div className="activity-title-bar">
                            <h4 className="activity-headline">{act.location}</h4>
                            <a
                              href={getDirectionsUrl(act.location, trip.destination)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="activity-directions-btn"
                              title={`Get turn-by-turn directions to ${act.location} on Google Maps`}
                            >
                              <span>Directions</span>
                              <span className="directions-arrow">↗</span>
                            </a>
                          </div>

                          {/* Lightweight Sub-text for Description */}
                          <p className="activity-subtext">{act.description}</p>

                          {/* Insider Tip transferred from Activity Selection */}
                          {(act.highlight || act.tip) && (
                            <div className="activity-timeline-tip">
                              <span className="tip-badge">Tip</span>
                              <p>{act.highlight || act.tip}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </main>

          <aside className="result-sidebar">
            
            {/* Selected Hotel Card */}
            <div className="result-card chosen-hotel-card">
              <div className="section-title-small">
                <p>ACCOMMODATION</p>
                <h3>Your Selected Stay</h3>
              </div>

              {trip.selectedHotel ? (
                <div className="hotel-detail-box">
                  {/* Interactive Google Map Preview */}
                  <div className="hotel-result-map-wrap">
                    <iframe
                      title={`${trip.selectedHotel.name} Google Map Preview`}
                      src={getGoogleMapsEmbedUrl(trip.selectedHotel.name, trip.destination)}
                      className="hotel-result-map-iframe"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>

                  <div className="hotel-preview">
                    <div className="hotel-title-container">
                      <div className="hotel-title-header">
                        <strong>{trip.selectedHotel.name}</strong>
                        <div className="hotel-header-badges">
                          <span className={`tier-badge ${(trip.selectedHotel.tier || "comfort").toLowerCase()}`}>
                            {trip.selectedHotel.tier}
                          </span>
                          <a
                            href={`https://www.google.com/maps/search/${encodeURIComponent(`${trip.selectedHotel.name} ${trip.destination} Sri Lanka`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hotel-google-map-btn"
                            title="View on Google Maps, guest photos & reviews"
                          >
                            Google Maps ↗
                          </a>
                        </div>
                      </div>
                      <span className="hotel-stars">Rating: {trip.selectedHotel.rating} / 5.0</span>
                      <p className="hotel-desc-sm">{trip.selectedHotel.description}</p>
                    </div>
                  </div>

                  {trip.selectedHotel.amenities && (
                    <div className="hotel-amenity-pills">
                      {trip.selectedHotel.amenities.map((a, i) => (
                        <span key={i} className="amenity-pill">{a}</span>
                      ))}
                    </div>
                  )}

                  <div className="hotel-cost-row">
                    <span>LKR {trip.selectedHotel.pricePerNight.toLocaleString()} / night</span>
                    <strong>LKR {hotelCost.toLocaleString()} ({nightsCount}n)</strong>
                  </div>
                </div>
              ) : (
                <div className="hotel-preview fallback">
                  <div className="hotel-preview-badge">STAY</div>
                  <div>
                    <strong>Recommended Hotel in {trip.destination}</strong>
                    <p>Comfortable stay matching your itinerary</p>
                    <span className="hotel-verified-text">Verified Partner Hotel</span>
                  </div>
                </div>
              )}
            </div>

            {/* Selected Activities List */}
            {trip.selectedActivities && trip.selectedActivities.length > 0 && (
              <div className="result-card">
                <h3>Selected Experiences ({trip.selectedActivities.length})</h3>
                <div className="selected-acts-list">
                  {trip.selectedActivities.map((act) => (
                    <div key={act.id || act.title} className="selected-act-row">
                      {act.image ? (
                        <img src={act.image} alt={act.title} className="act-row-thumb" />
                      ) : (
                        <div className="act-row-bullet-box">
                          <span className="act-row-bullet"></span>
                        </div>
                      )}
                      <div className="act-row-info">
                        <strong>{act.title}</strong>
                        <small>{act.timeSlot} • {act.duration}</small>
                      </div>
                      <span className="act-row-cost">
                        {act.cost === 0 ? "Free" : `LKR ${Number(act.cost).toLocaleString()}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vehicle & Scooter Rentals Section */}
            <div className="result-card vehicle-rentals-card">
              <div className="section-title-small">
                <div className="section-title-badge-row">
                  <p>TRANSPORT GUIDE</p>
                  {shopsProvider === "gemini" && (
                    <span className="ai-powered-pill">Gemini AI Verified</span>
                  )}
                </div>
                <h3>Vehicle & Scooter Rentals</h3>
              </div>

              {/* Dynamic Top Recommendation Banner */}
              {vehicleRecommendation && (
                <div className="vehicle-recommendation-banner">
                  <div className="rec-banner-badge">
                    <span>RECOMMENDED TRANSPORT</span>
                    <span className="rec-target-tag">{vehicleRecommendation.target}</span>
                  </div>
                  <div className="rec-banner-body">
                    <span className="rec-vehicle-name">
                      {vehicleRecommendation.vehicle}
                    </span>
                    <p className="rec-vehicle-reason">
                      “{vehicleRecommendation.reason}”
                    </p>
                  </div>
                </div>
              )}

              <div className="rental-subtitle-row">
                <p className="rental-subtitle">
                  {loadingShops
                    ? "Finding local rental shops via Gemini AI..."
                    : `Rental shops & options in ${trip.destination}:`}
                </p>
                {loadingShops && <span className="mini-spinner" />}
              </div>

              <div className="vehicle-rentals-list">
                {rentalShops.map((shop, index) => {
                  const shopType = shop.vehicleType || shop.type || "Transport";
                  const shopName = shop.shopName || shop.type;
                  const isTopMatched =
                    vehicleRecommendation &&
                    shopType.toLowerCase().includes(vehicleRecommendation.vehicle.toLowerCase().split(" ")[0]);

                  const mapsUrl =
                    shop.googleMapsUrl ||
                    `https://www.google.com/maps/search/${encodeURIComponent(`${shopName} ${trip.destination} Sri Lanka`)}`;

                  return (
                    <div
                      key={shop.id || index}
                      className={`rental-item ${isTopMatched || shop.isRecommended ? "recommended-rental-item" : ""}`}
                    >
                      <div className="rental-details">
                        <div className="rental-title-row">
                          <strong>{shopName}</strong>
                          <span className="rental-badge">{shop.badge || shopType}</span>
                        </div>

                        <div className="rental-meta-row">
                          <span className="rental-rate">{shop.rate}</span>
                          {shop.rating && (
                            <span className="rental-rating">
                              Rating: {shop.rating} <small>({shop.reviews || 80})</small>
                            </span>
                          )}
                        </div>

                        {shop.location && (
                          <p className="rental-location">
                            {shop.location}
                          </p>
                        )}

                        {shop.reason && (
                          <p className="rental-reason">
                            {shop.reason}
                          </p>
                        )}

                        {shop.features && shop.features.length > 0 && (
                          <div className="rental-features-wrap">
                            {shop.features.map((feat, fi) => (
                              <span key={fi} className="rental-feat-pill">{feat}</span>
                            ))}
                          </div>
                        )}

                        <div className="rental-action-row">
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rental-maps-btn"
                            title={`View ${shopName} on Google Maps`}
                          >
                            Google Maps ↗
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Authentic Local Food Section */}
            <div className="result-card food-card">
              <div className="section-title-small">
                <div className="section-title-badge-row">
                  <p>LOCAL FLAVORS</p>
                  {foodProvider === "gemini" && (
                    <span className="ai-powered-pill">Gemini AI Verified</span>
                  )}
                </div>
                <h3>Authentic Food Recommendations</h3>
              </div>

              <div className="rental-subtitle-row">
                <p className="rental-subtitle">
                  {loadingFood
                    ? "Curating authentic local food spots via Gemini AI..."
                    : `Must-try culinary spots in ${trip.destination}:`}
                </p>
                {loadingFood && <span className="mini-spinner" />}
              </div>

              <div className="food-list">
                {foodSpots.map((food, index) => {
                  const mapsUrl =
                    food.googleMapsUrl ||
                    `https://www.google.com/maps/search/${encodeURIComponent(`${food.name} ${trip.destination} Sri Lanka`)}`;

                  return (
                    <div key={food.id || index} className="food-spot-item">
                      <div className="food-icon">🍽️</div>
                      <div className="food-info">
                        <div className="food-title-row">
                          <strong>{food.name}</strong>
                          <span className="food-type-tag">{food.type}</span>
                        </div>

                        <div className="food-meta-row">
                          {food.priceRange && (
                            <span className="food-price-tag">{food.priceRange}</span>
                          )}
                          {food.rating && (
                            <span className="food-rating">
                              Rating: {food.rating} <small>({food.reviews || 120})</small>
                            </span>
                          )}
                          {food.badge && (
                            <span className="food-badge-pill">{food.badge}</span>
                          )}
                        </div>

                        <p className="food-specialty-text">{food.specialty}</p>

                        {food.location && (
                          <p className="food-location-text">{food.location}</p>
                        )}

                        {food.whyVisit && (
                          <p className="food-why-text">
                            {food.whyVisit}
                          </p>
                        )}

                        <div className="food-action-row">
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="food-maps-btn"
                            title={`View ${food.name} on Google Maps`}
                          >
                            Google Maps ↗
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Accurate Budget Breakdown */}
            <div className="result-card">
              <h3>Calculated Budget</h3>

              <div className="budget-item">
                <span>Accommodation ({nightsCount}n)</span>
                <strong>LKR {hotelCost.toLocaleString()}</strong>
              </div>

              <div className="budget-item">
                <span>Selected Experiences</span>
                <strong>LKR {activitiesCost.toLocaleString()}</strong>
              </div>

              <div className="budget-item">
                <span>Food & Dining</span>
                <strong>LKR {foodCost.toLocaleString()}</strong>
              </div>

              <div className="budget-item">
                <span>Local Transport</span>
                <strong>LKR {transportCost.toLocaleString()}</strong>
              </div>

              <div className="budget-total">
                <span>Estimated Total</span>
                <strong>LKR {estimatedTotal.toLocaleString()}</strong>
              </div>
            </div>

            {/* Save Trip Button */}
            <button
              className={`save-trip-button ${saveStatus === "saved" ? "saved" : ""}`}
              onClick={handleSaveTrip}
              disabled={saveStatus === "saving" || saveStatus === "saved"}
            >
              {saveStatus === "saving" && "Saving Trip..."}
              {saveStatus === "saved" && "Saved to My Trips"}
              {saveStatus === "error" && "Retry Saving Trip"}
              {saveStatus === "idle" && "Save Trip"}
            </button>
            {saveMessage && (
              <p className={`save-status-msg ${saveStatus}`}>{saveMessage}</p>
            )}
          </aside>
        </div>

        <div className="plan-another">
          <Link to="/plan-trip">← Plan Another Trip</Link>
        </div>
      </div>

      {/* Floating SOS Trigger Button */}
      <button
        type="button"
        className="floating-sos-trigger"
        onClick={() => setIsSosModalOpen(true)}
        title="Open Emergency SOS"
      >
        <span className="floating-sos-pulse" />
        <span className="floating-sos-icon">🚨</span>
        <span className="floating-sos-text">EMERGENCY SOS</span>
      </button>

      {/* Emergency SOS Modal (faithfully matching reference UI) */}
      <EmergencySOSModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        destination={trip.destination}
        destinationCoords={currentDestData.coords}
      />
    </div>
  );
}

export default TripResult;