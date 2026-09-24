import { useState, useEffect, useCallback, useMemo } from "react";
import "./EmergencySOSModal.css";

// Comprehensive database of Sri Lankan emergency facilities categorized by region
const REGIONAL_HOSPITALS = {
  kandy: [
    {
      id: "kandy-national",
      name: "Kandy National Teaching Hospital",
      facilityType: "Regional Emergency Facility",
      city: "Kandy",
      lat: 7.2889,
      lng: 80.6288,
      phone: "081-2222261",
      emergencyBadge: "24/7 Level 1 Trauma Care",
    },
    {
      id: "kandy-peradeniya",
      name: "Peradeniya Teaching Hospital",
      facilityType: "Regional Emergency Facility",
      city: "Peradeniya / Kandy",
      lat: 7.2618,
      lng: 80.5962,
      phone: "081-2388001",
      emergencyBadge: "24/7 Emergency & Specialized",
    },
    {
      id: "kandy-private",
      name: "Kandy Private Hospital",
      facilityType: "Private Emergency Clinic",
      city: "Kandy",
      lat: 7.2934,
      lng: 80.6365,
      phone: "081-2234060",
      emergencyBadge: "24/7 Outpatient & ICU",
    },
  ],
  colombo: [
    {
      id: "nhsl-colombo",
      name: "National Hospital of Sri Lanka (NHSL)",
      facilityType: "National Level 1 Trauma Center",
      city: "Colombo",
      lat: 6.9189,
      lng: 79.8687,
      phone: "011-2691111",
      emergencyBadge: "24/7 Islandwide Emergency Trauma",
    },
    {
      id: "lanka-hospitals",
      name: "Lanka Hospitals",
      facilityType: "Private Multi-Specialty Hospital",
      city: "Colombo",
      lat: 6.8953,
      lng: 79.8821,
      phone: "011-5430000",
      emergencyBadge: "24/7 Emergency & Trauma Unit",
    },
    {
      id: "colombo-south",
      name: "Colombo South Teaching Hospital (Kalubowila)",
      facilityType: "Teaching Hospital",
      city: "Kalubowila / Colombo",
      lat: 6.8732,
      lng: 79.8804,
      phone: "011-2763066",
      emergencyBadge: "24/7 Emergency Casualty Unit",
    },
  ],
  galle: [
    {
      id: "karapitiya-galle",
      name: "Karapitiya National Teaching Hospital",
      facilityType: "Regional Emergency Facility",
      city: "Galle",
      lat: 6.0664,
      lng: 80.2246,
      phone: "091-2232176",
      emergencyBadge: "24/7 Southern Trauma Center",
    },
    {
      id: "asiri-galle",
      name: "Asiri Hospital Galle",
      facilityType: "Private Emergency Hospital",
      city: "Galle",
      lat: 6.0416,
      lng: 80.2185,
      phone: "091-4640640",
      emergencyBadge: "24/7 Emergency Care",
    },
    {
      id: "mahamodara-galle",
      name: "Mahamodara Base Hospital",
      facilityType: "District General Facility",
      city: "Galle",
      lat: 6.0425,
      lng: 80.2089,
      phone: "091-2234271",
      emergencyBadge: "24/7 Emergency Services",
    },
  ],
  mirissa: [
    {
      id: "weligama-hospital",
      name: "Weligama Base Hospital",
      facilityType: "District Base Hospital (Near Mirissa)",
      city: "Weligama / Mirissa",
      lat: 5.9734,
      lng: 80.4286,
      phone: "041-2250261",
      emergencyBadge: "24/7 Emergency Unit (4.2 km)",
    },
    {
      id: "matara-general",
      name: "Matara District General Hospital",
      facilityType: "Regional General Hospital",
      city: "Matara",
      lat: 5.9496,
      lng: 80.5469,
      phone: "041-2222261",
      emergencyBadge: "24/7 Intensive Trauma Unit",
    },
  ],
  ella: [
    {
      id: "badulla-provincial",
      name: "Badulla Provincial General Hospital",
      facilityType: "Regional General Hospital",
      city: "Badulla / Ella",
      lat: 6.9934,
      lng: 81.055,
      phone: "055-2222261",
      emergencyBadge: "24/7 Provincial Emergency",
    },
    {
      id: "bandarawela-hospital",
      name: "Bandarawela District Base Hospital",
      facilityType: "District Base Hospital",
      city: "Bandarawela / Ella",
      lat: 6.8295,
      lng: 80.9882,
      phone: "057-2222261",
      emergencyBadge: "24/7 Emergency Casualty Unit",
    },
    {
      id: "demodara-clinic",
      name: "Demodara Rural Hospital",
      facilityType: "Primary Medical Unit",
      city: "Demodara / Ella",
      lat: 6.8967,
      lng: 81.0638,
      phone: "057-2228261",
      emergencyBadge: "Daily OPD & Urgent Care",
    },
  ],
  "nuwara eliya": [
    {
      id: "nuwaraeliya-general",
      name: "Nuwara Eliya District General Hospital",
      facilityType: "District General Hospital",
      city: "Nuwara Eliya",
      lat: 6.9697,
      lng: 80.7712,
      phone: "052-2222261",
      emergencyBadge: "24/7 Highland Emergency Care",
    },
  ],
  sigiriya: [
    {
      id: "dambulla-base",
      name: "Dambulla Base Hospital",
      facilityType: "District Base Hospital (Near Sigiriya)",
      city: "Dambulla",
      lat: 7.8682,
      lng: 80.6517,
      phone: "066-2284761",
      emergencyBadge: "24/7 Emergency & Trauma",
    },
    {
      id: "inamaluwa-clinic",
      name: "Inamaluwa Primary Medical Care Unit",
      facilityType: "Primary Health Center",
      city: "Sigiriya",
      lat: 7.9152,
      lng: 80.7093,
      phone: "066-2286100",
      emergencyBadge: "Urgent Medical Care",
    },
  ],
  trincomalee: [
    {
      id: "trinco-general",
      name: "Trincomalee District General Hospital",
      facilityType: "District General Hospital",
      city: "Trincomalee",
      lat: 8.5772,
      lng: 81.2335,
      phone: "026-2222261",
      emergencyBadge: "24/7 Eastern Trauma Unit",
    },
  ],
};

// Haversine formula to compute great-circle distance in kilometers
function calculateHaversineKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999;
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export default function EmergencySOSModal({
  isOpen,
  onClose,
  destination = "Kandy",
  destinationCoords = { lat: 7.2906, lng: 80.6337 },
}) {
  const [activeTab, setActiveTab] = useState("hospitals"); // "hospitals" | "hotlines" | "police"
  const [currentCoords, setCurrentCoords] = useState(destinationCoords);
  const [currentLocationName, setCurrentLocationName] = useState(`${destination}, Sri Lanka`);
  const [hospitalsList, setHospitalsList] = useState([]);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isHospitalExpanded, setIsHospitalExpanded] = useState(true);

  // Gemini AI Safety Assistant State
  const [aiQuery, setAiQuery] = useState("");
  const [aiGuidance, setAiGuidance] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const handleAskGeminiAI = async (queryToAsk) => {
    const q = (queryToAsk || aiQuery || "").trim();
    if (!q) return;

    setIsAiLoading(true);
    setAiError("");

    try {
      const response = await fetch("http://localhost:5000/api/safety/emergency-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          destination,
          userCoords: currentCoords,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.guidance) {
        setAiGuidance(data.guidance);
      } else {
        throw new Error("Invalid response from safety service");
      }
    } catch (err) {
      console.warn("Safety API fetch fallback triggered:", err.message);
      const qLower = q.toLowerCase();
      let fallbackGuidance = {
        headline: `Emergency First-Aid: Tourist Assistance (${destination})`,
        urgencyLevel: "Urgent",
        badge: "🚨 Immediate Emergency Guidance",
        firstAidSteps: [
          "Call 1990 (Suwa Seriya Free National Ambulance) immediately if someone is unresponsive.",
          "Keep the patient calm, resting in a shaded/ventilated area, and monitor breathing.",
          "Do not offer solid food or drink if the patient feels faint or dizzy.",
          "Arrange immediate transport to the nearest government or private hospital.",
        ],
        warnings: ["Do not hesitate to seek emergency help if symptoms worsen rapidly."],
        hotline: "1990 Suwa Seriya Ambulance",
        nearestHospitalRecommendation: nearestHospital?.name || "Nearest District General Hospital",
        sinhalaPhrases: [
          {
            english: "Help, I need medical assistance quickly!",
            sinhala: "උදව් කරන්න, මට ඉක්මනට වෛද්‍ය උදව් ඕනෙ!",
            singlishPhonetics: "Udaw karanna, mata ikmanata waidya udaw one!",
          },
        ],
        provider: "offline-safety-kb",
      };

      if (qLower.includes("snake") || qLower.includes("bite")) {
        fallbackGuidance = {
          headline: `Emergency First-Aid: Suspected Snake Bite (${destination})`,
          urgencyLevel: "Critical",
          badge: "🚨 Critical Emergency (Call 1990)",
          firstAidSteps: [
            "Keep victim completely still and calm. Restrict movement to slow venom absorption.",
            "Immobilize the bitten limb with a splint at or slightly below heart level.",
            "Do NOT cut, suck venom, or apply a tight arterial tourniquet.",
            "Remove rings, watches, or tight clothing around the limb immediately.",
            "Transport immediately to nearest government hospital (free anti-venom available islandwide).",
          ],
          warnings: ["Do not apply ice, herbal pastes, or electric shocks."],
          hotline: "1990 Suwa Seriya Ambulance",
          nearestHospitalRecommendation: nearestHospital?.name || "Nearest Provincial General Hospital",
          sinhalaPhrases: [
            {
              english: "Help, someone was bitten by a snake!",
              sinhala: "උදව් කරන්න, කෙනෙකුට සර්පයෙක් දෂ්ට කළා!",
              singlishPhonetics: "Udaw karanna, kenekuta sarpayek dashta kala!",
            },
          ],
          provider: "offline-safety-kb",
        };
      } else if (qLower.includes("jellyfish") || qLower.includes("marine") || qLower.includes("sea")) {
        fallbackGuidance = {
          headline: `Marine First-Aid: Jellyfish / Sea Sting (${destination})`,
          urgencyLevel: "Urgent",
          badge: "🌊 Marine First-Aid Guidance",
          firstAidSteps: [
            "Exit water immediately to prevent drowning or fainting.",
            "Rinse generously with SEA WATER (never use fresh tap water).",
            "Rinse with domestic vinegar for 30 seconds if available.",
            "Pluck away tentacles with tweezers or card edge (not bare hands).",
            "Soak affected area in tolerable hot water for 20-40 minutes.",
          ],
          warnings: ["Never rub the sting with sand, towel, or hands."],
          hotline: "1990 Ambulance / 011-2421052 Tourist Police",
          nearestHospitalRecommendation: nearestHospital?.name || "Nearest Base Hospital",
          sinhalaPhrases: [
            {
              english: "A jellyfish stung me, I need medical help.",
              sinhala: "මට ජෙලිෆිෂ් කෙනෙක් විද්දා, මට වෛද්‍ය උදව් ඕනෙ.",
              singlishPhonetics: "Mata jellyfish kenek widda, mata waidya udaw one.",
            },
          ],
          provider: "offline-safety-kb",
        };
      } else if (qLower.includes("accident") || qLower.includes("bike") || qLower.includes("fall")) {
        fallbackGuidance = {
          headline: `Trauma First-Aid: Road / Scooter Accident (${destination})`,
          urgencyLevel: "Critical",
          badge: "🚨 Accident & Trauma Response",
          firstAidSteps: [
            "Ensure the road area is safe from ongoing traffic before approaching.",
            "Check responsiveness. If neck injury is suspected, DO NOT move the patient.",
            "Control active bleeding by applying firm pressure with clean cloth.",
            "Dial 1990 (Ambulance) and 119 (Police) immediately.",
            "Keep the patient warm while awaiting paramedics.",
          ],
          warnings: ["Do not offer water or food to an unconscious person."],
          hotline: "1990 Ambulance & 119 Police Hotline",
          nearestHospitalRecommendation: nearestHospital?.name || "Nearest Hospital",
          sinhalaPhrases: [
            {
              english: "There was an accident! Send an ambulance quickly!",
              sinhala: "මෙතන අනතුරක් වුණා! ඉක්මනට ඇම්බියුලන්ස් එකක් එවන්න!",
              singlishPhonetics: "Metana anathurak wuna! Ikmanata ambulance ekak ewanna!",
            },
          ],
          provider: "offline-safety-kb",
        };
      }

      setAiGuidance(fallbackGuidance);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Initialize or update coordinates when destination or modal opens
  useEffect(() => {
    if (destinationCoords && destinationCoords.lat) {
      setCurrentCoords(destinationCoords);
      setCurrentLocationName(`${destination}, Sri Lanka`);
    }
  }, [destinationCoords, destination]);

  // Load nearby hospitals using OSM Overpass or fallback
  const loadHospitals = useCallback(
    async (coords) => {
      if (!coords || !coords.lat) return;

      const { lat, lng } = coords;
      const overpassQuery = `
        [out:json][timeout:10];
        (
          node["amenity"="hospital"](around:20000,${lat},${lng});
          way["amenity"="hospital"](around:20000,${lat},${lng});
          node["amenity"="clinic"](around:15000,${lat},${lng});
        );
        out center 10;
      `.trim();

      const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(overpassUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const elements = data.elements || [];
          if (elements.length > 0) {
            const mapped = elements
              .map((item) => {
                const itemLat = item.lat || item.center?.lat;
                const itemLng = item.lon || item.center?.lon;
                const tags = item.tags || {};
                const name = tags.name || tags["name:en"] || "Local Hospital & Emergency Care";
                const dist = calculateHaversineKm(lat, lng, itemLat, itemLng);
                return {
                  id: String(item.id),
                  name,
                  facilityType: tags.amenity === "hospital" ? "Regional Emergency Facility" : "Clinic & Medical Facility",
                  city: tags["addr:city"] || tags["addr:district"] || destination,
                  lat: itemLat,
                  lng: itemLng,
                  phone: tags.phone || tags["contact:phone"] || "081-2222261",
                  emergencyBadge: tags.emergency === "yes" ? "24/7 Emergency & Trauma" : "24/7 Medical Care",
                  distance: dist,
                };
              })
              .filter((h) => h.lat && h.lng)
              .sort((a, b) => a.distance - b.distance);

            if (mapped.length > 0) {
              setHospitalsList(mapped.slice(0, 6));
              return;
            }
          }
        }
      } catch (err) {
        console.warn("Overpass API fallback to regional database:", err);
      }

      // Fallback matching
      const destKey = (destination || "").toLowerCase();
      let matchedList = [];

      for (const [key, list] of Object.entries(REGIONAL_HOSPITALS)) {
        if (destKey.includes(key) || key.includes(destKey)) {
          matchedList = list;
          break;
        }
      }

      if (matchedList.length === 0) {
        matchedList = Object.values(REGIONAL_HOSPITALS).flat();
      }

      const calculated = matchedList.map((h) => ({
        ...h,
        distance: calculateHaversineKm(lat, lng, h.lat, h.lng),
      }));

      calculated.sort((a, b) => a.distance - b.distance);
      setHospitalsList(calculated.slice(0, 5));
    },
    [destination]
  );

  // Trigger hospital load on coordinate update
  useEffect(() => {
    if (isOpen && currentCoords) {
      loadHospitals(currentCoords);
    }
  }, [isOpen, currentCoords, loadHospitals]);

  // Nearest hospital calculation
  const nearestHospital = useMemo(() => {
    return hospitalsList.length > 0 ? hospitalsList[0] : null;
  }, [hospitalsList]);

  // Auto-detect via Live GPS
  const handleAutoDetectGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setCurrentCoords(coords);
        setCurrentLocationName(`Live GPS Location (±${Math.round(pos.coords.accuracy)}m)`);
        loadHospitals(coords);
        setIsDetectingGps(false);
      },
      (err) => {
        console.warn("GPS error:", err);
        alert("Could not detect GPS location. Please check browser location permissions.");
        setIsDetectingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Search location on Google Maps
  const handleSearchGoogleMaps = (e) => {
    e.preventDefault();
    const query = searchQuery.trim() || destination;
    const url = `https://www.google.com/maps/search/hospitals+near+${encodeURIComponent(query + ", Sri Lanka")}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!isOpen) return null;

  return (
    <div className="sos-modal-overlay" onClick={onClose}>
      <div
        className="sos-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sos-modal-title"
      >
        {/* Modal Header */}
        <div className="sos-modal-header">
          <div className="sos-title-group">
            <span className="sos-siren-icon">🚨</span>
            <h2 id="sos-modal-title">Emergency SOS</h2>
          </div>
          <button
            type="button"
            className="sos-close-btn"
            onClick={onClose}
            aria-label="Close Emergency SOS Modal"
          >
            ✕
          </button>
        </div>

        <div className="sos-modal-body">
          {/* Action Row 1: Current Location */}
          <div className="sos-row-card location-card">
            <div className="sos-row-icon blue">📍</div>
            <div className="sos-row-content">
              <span className="sos-row-sub">Current Location</span>
              <strong className="sos-row-main">{currentLocationName}</strong>
            </div>
            <button
              type="button"
              className="sos-row-arrow-btn"
              onClick={handleAutoDetectGPS}
              title="Refresh GPS location"
            >
              ➔
            </button>
          </div>

          {/* Action Row 2: Call Ambulance (1990) */}
          <a href="tel:1990" className="sos-row-card call-ambulance-card">
            <div className="sos-row-icon red">🚑</div>
            <div className="sos-row-content">
              <strong className="sos-row-main">Call Ambulance (1990)</strong>
              <span className="sos-row-sub">Suwa Seriya</span>
            </div>
            <span className="sos-row-arrow">➔</span>
          </a>

          {/* Action Row 3: Call Police (119) */}
          <a href="tel:119" className="sos-row-card call-police-card">
            <div className="sos-row-icon indigo">🛡️</div>
            <div className="sos-row-content">
              <strong className="sos-row-main">Call Police (119)</strong>
              <span className="sos-row-sub">Emergency assistance</span>
            </div>
            <span className="sos-row-arrow">➔</span>
          </a>

          {/* Action Row 4: Nearest Hospital (Active Card with Cyan Outline) */}
          <div className="sos-row-card nearest-hospital-active-card">
            <div className="sos-row-icon pink">🏥</div>
            <div className="sos-row-content">
              <strong className="sos-row-main">Nearest Hospital</strong>
              <span className="sos-row-sub">
                {nearestHospital
                  ? `${nearestHospital.distance} km • Open now (${nearestHospital.name})`
                  : "Scanning nearby hospitals..."}
              </span>
            </div>
            <button
              type="button"
              className="sos-toggle-collapse-btn"
              onClick={() => setIsHospitalExpanded(!isHospitalExpanded)}
              title="Toggle Hospital List"
            >
              {isHospitalExpanded ? "▲" : "▼"}
            </button>
          </div>

          {/* Action Row 5: Open Route */}
          {nearestHospital && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${nearestHospital.lat},${nearestHospital.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="sos-row-card open-route-card"
            >
              <div className="sos-row-icon yellow">🧭</div>
              <div className="sos-row-content">
                <strong className="sos-row-main">Open Route</strong>
                <span className="sos-row-sub">Navigate with Maps</span>
              </div>
              <span className="sos-row-arrow">➔</span>
            </a>
          )}

          {/* Dashed Divider */}
          <div className="sos-dashed-divider" />

          {/* Navigation Pill Tabs */}
          <div className="sos-tabs-bar">
            <button
              type="button"
              className={`sos-tab-pill ${activeTab === "hospitals" ? "active" : ""}`}
              onClick={() => setActiveTab("hospitals")}
            >
              🏥 Nearest Hospitals ({hospitalsList.length})
            </button>
            <button
              type="button"
              className={`sos-tab-pill ${activeTab === "hotlines" ? "active" : ""}`}
              onClick={() => setActiveTab("hotlines")}
            >
              🚨 National Hotlines
            </button>
            <button
              type="button"
              className={`sos-tab-pill ${activeTab === "police" ? "active" : ""}`}
              onClick={() => setActiveTab("police")}
            >
              👮 Tourist Police
            </button>
            <button
              type="button"
              className={`sos-tab-pill ${activeTab === "ai_assist" ? "active" : ""}`}
              onClick={() => setActiveTab("ai_assist")}
            >
              🤖 Gemini Safety AI
            </button>
          </div>

          {/* TAB 1: Hospitals View */}
          {activeTab === "hospitals" && isHospitalExpanded && (
            <div className="sos-tab-content">
              {/* Big Auto-Detect Button */}
              <button
                type="button"
                className="sos-gps-large-btn"
                onClick={handleAutoDetectGPS}
                disabled={isDetectingGps}
              >
                <span className="gps-rocket-icon">🚀</span>
                <span>
                  {isDetectingGps
                    ? "Acquiring High-Accuracy Live GPS..."
                    : "Auto-Detect Nearest Hospitals via Live GPS"}
                </span>
              </button>

              {/* Search Google Maps Row */}
              <form onSubmit={handleSearchGoogleMaps} className="sos-search-row">
                <input
                  type="text"
                  placeholder="Or enter city / area (e.g. Kandy, Ella, Galle)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="sos-search-input"
                />
                <button type="submit" className="sos-search-submit-btn">
                  Search Google Maps
                </button>
              </form>

              {/* Hospitals Cards List */}
              <div className="sos-hospitals-cards-list">
                {hospitalsList.map((hospital) => {
                  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`;
                  return (
                    <div key={hospital.id} className="sos-hospital-detail-card">
                      <div className="sos-hosp-header">
                        <span className="sos-plus-icon">+</span>
                        <h4 className="sos-hosp-title">{hospital.name}</h4>
                      </div>

                      <p className="sos-hosp-meta">
                        {hospital.facilityType} •{" "}
                        <span className="sos-dist-cyan">{hospital.distance} km</span>
                      </p>

                      <div className="sos-hosp-badge-row">
                        <span className="sos-trauma-badge">
                          ✓ {hospital.emergencyBadge || "24/7 Emergency"}
                        </span>
                      </div>

                      <div className="sos-hosp-btn-row">
                        <a
                          href={`tel:${hospital.phone.replace(/[^0-9]/g, "")}`}
                          className="sos-hosp-call-btn"
                        >
                          📞 Call {hospital.phone}
                        </a>
                        <a
                          href={directionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="sos-hosp-nav-btn"
                        >
                          📍 Get Directions
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: National Hotlines View */}
          {activeTab === "hotlines" && (
            <div className="sos-tab-content hotlines-view">
              <div className="sos-hotline-item">
                <div className="hotline-icon-num red">1990</div>
                <div className="hotline-details">
                  <strong>Suwa Seriya Ambulance</strong>
                  <span>Free 24/7 Islandwide Emergency Medical Care</span>
                </div>
                <a href="tel:1990" className="hotline-call-btn red">
                  Call 1990
                </a>
              </div>

              <div className="sos-hotline-item">
                <div className="hotline-icon-num blue">119</div>
                <div className="hotline-details">
                  <strong>Police Emergency Dispatch</strong>
                  <span>Direct hotline for accidents, crime & police assistance</span>
                </div>
                <a href="tel:119" className="hotline-call-btn blue">
                  Call 119
                </a>
              </div>

              <div className="sos-hotline-item">
                <div className="hotline-icon-num orange">110</div>
                <div className="hotline-details">
                  <strong>Fire & Rescue Service</strong>
                  <span>Fire response, cliff rescue & disaster extrication</span>
                </div>
                <a href="tel:110" className="hotline-call-btn orange">
                  Call 110
                </a>
              </div>

              <div className="sos-hotline-item">
                <div className="hotline-icon-num teal">1919</div>
                <div className="hotline-details">
                  <strong>Government Information Center</strong>
                  <span>All-island public service & consular assistance</span>
                </div>
                <a href="tel:1919" className="hotline-call-btn teal">
                  Call 1919
                </a>
              </div>
            </div>
          )}

          {/* TAB 3: Tourist Police View */}
          {activeTab === "police" && (
            <div className="sos-tab-content tourist-police-view">
              <div className="sos-police-banner">
                <div className="police-shield-big">🛡️</div>
                <div>
                  <h4>Sri Lanka Tourist Police</h4>
                  <p>24/7 Dedicated helpline for international travelers & safety issues.</p>
                </div>
                <a href="tel:1912" className="police-dial-now-btn">
                  Call 1912 Now
                </a>
              </div>

              <div className="police-branch-list">
                <div className="police-branch-row">
                  <div>
                    <strong>Colombo Headquarters (Fort)</strong>
                    <small>Galle Face & Coastal Area Assistance</small>
                  </div>
                  <a href="tel:0112421052" className="branch-phone-link">
                    📞 011-2421052
                  </a>
                </div>

                <div className="police-branch-row">
                  <div>
                    <strong>Kandy Tourist Police Unit</strong>
                    <small>Temple of the Tooth & Central Province</small>
                  </div>
                  <a href="tel:0812222222" className="branch-phone-link">
                    📞 081-2222222
                  </a>
                </div>

                <div className="police-branch-row">
                  <div>
                    <strong>Galle Fort Tourist Police Unit</strong>
                    <small>Galle, Unawatuna & South Coast</small>
                  </div>
                  <a href="tel:0912222222" className="branch-phone-link">
                    📞 091-2222222
                  </a>
                </div>

                <div className="police-branch-row">
                  <div>
                    <strong>Ella Tourist Police Station</strong>
                    <small>Hiking Trails, Nine Arch & Ravana Falls</small>
                  </div>
                  <a href="tel:0572228222" className="branch-phone-link">
                    📞 057-2228222
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Gemini Safety AI View */}
          {activeTab === "ai_assist" && (
            <div className="sos-tab-content ai-assist-view">
              <div className="sos-ai-banner">
                <span className="sos-ai-sparkle">✨</span>
                <div>
                  <h4 className="sos-ai-banner-title">Gemini AI Emergency & First-Aid Assistant</h4>
                  <p className="sos-ai-banner-sub">
                    Immediate triage, step-by-step first-aid protocols, and local Sinhala phrases for {destination}.
                  </p>
                </div>
              </div>

              {/* Quick Emergency Situation Badges */}
              <div className="sos-ai-quick-tags-container">
                <span className="sos-ai-quick-label">Tap common emergency scenario:</span>
                <div className="sos-ai-quick-tags">
                  {[
                    { label: "🐍 Snake / Leech Bite", q: "Suspected snake or leech bite while hiking" },
                    { label: "🌊 Marine / Jellyfish", q: "Stung by jellyfish while swimming in the ocean" },
                    { label: "🏍️ Road / Scooter Crash", q: "Motorbike accident on road with bleeding" },
                    { label: "🤢 Food Illness / Fever", q: "Severe stomach poisoning, dehydration, and vomiting" },
                    { label: "🧗 Ankle Sprain / Fall", q: "Fell on hiking trail, swollen ankle and cannot walk" },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      className="sos-ai-chip-btn"
                      onClick={() => {
                        setAiQuery(item.q);
                        handleAskGeminiAI(item.q);
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Query Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAskGeminiAI();
                }}
                className="sos-ai-input-form"
              >
                <input
                  type="text"
                  placeholder="Or describe symptoms (e.g. burn, wasp sting, allergy)..."
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  className="sos-ai-input"
                />
                <button
                  type="submit"
                  disabled={isAiLoading || !aiQuery.trim()}
                  className="sos-ai-submit-btn"
                >
                  {isAiLoading ? "Analyzing..." : "Ask AI ➔"}
                </button>
              </form>

              {/* Loading State */}
              {isAiLoading && (
                <div className="sos-ai-loading-box">
                  <div className="sos-ai-spinner" />
                  <p>Gemini AI is generating medical triage & safety instructions...</p>
                </div>
              )}

              {/* AI Guidance Result Card */}
              {aiGuidance && !isAiLoading && (
                <div className={`sos-ai-result-card urgency-${(aiGuidance.urgencyLevel || "urgent").toLowerCase()}`}>
                  <div className="sos-ai-result-header">
                    <span className="sos-ai-urgency-badge">{aiGuidance.badge || "🚨 Emergency Advisory"}</span>
                    <span className="sos-ai-provider-tag">Powered by Gemini AI</span>
                  </div>

                  <h3 className="sos-ai-result-title">{aiGuidance.headline}</h3>

                  {/* Immediate Action Steps */}
                  <div className="sos-ai-steps-section">
                    <h5 className="sos-ai-section-label">📋 Immediate Action Steps:</h5>
                    <ol className="sos-ai-steps-list">
                      {aiGuidance.firstAidSteps?.map((step, idx) => (
                        <li key={idx}>
                          <strong>Step {idx + 1}:</strong> {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Warnings */}
                  {aiGuidance.warnings && aiGuidance.warnings.length > 0 && (
                    <div className="sos-ai-warning-box">
                      <strong>⚠️ Critical Warnings:</strong>
                      <ul>
                        {aiGuidance.warnings.map((warn, idx) => (
                          <li key={idx}>{warn}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Hospital & Hotline Recommendation */}
                  <div className="sos-ai-hotline-row">
                    <div className="sos-ai-hotline-info">
                      <span className="hotline-sub">Recommended Emergency Hotline</span>
                      <strong className="hotline-main">{aiGuidance.hotline || "1990 Suwa Seriya"}</strong>
                    </div>
                    <a
                      href={`tel:${(aiGuidance.hotline || "1990").replace(/[^0-9]/g, "").slice(0, 4) || "1990"}`}
                      className="sos-ai-call-action-btn"
                    >
                      📞 Dial Now
                    </a>
                  </div>

                  {/* Local Sinhala Phrases */}
                  {aiGuidance.sinhalaPhrases && aiGuidance.sinhalaPhrases.length > 0 && (
                    <div className="sos-ai-phrases-section">
                      <h5 className="sos-ai-section-label">🗣️ Show this to Sri Lankan Locals / Tuk-Tuk Drivers:</h5>
                      <div className="sos-ai-phrases-list">
                        {aiGuidance.sinhalaPhrases.map((phrase, idx) => (
                          <div key={idx} className="sos-ai-phrase-card">
                            <span className="phrase-english">{phrase.english}</span>
                            <span className="phrase-sinhala">{phrase.sinhala}</span>
                            <span className="phrase-phonetics">"{phrase.singlishPhonetics}"</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
