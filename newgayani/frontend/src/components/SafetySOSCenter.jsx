import { useState, useEffect, useCallback } from "react";
import "./SafetySOSCenter.css";

// Comprehensive fallback database of verified Sri Lankan hospitals across major travel hubs
const SRI_LANKA_HOSPITAL_FALLBACK = [
  // Colombo & Western Province
  {
    name: "National Hospital of Sri Lanka (NHSL)",
    sinhalaName: "කොළඹ ජාතික රෝහල",
    type: "National Teaching Hospital (24/7 Trauma)",
    phone: "0112691111",
    lat: 6.9189,
    lng: 79.8687,
    city: "Colombo",
    address: "E W Perera Mawatha, Colombo 10",
    emergency: true,
  },
  {
    name: "Lanka Hospitals",
    sinhalaName: "ලංකා හොස්පිටල්ස්",
    type: "Private Super Specialty (24/7 Emergency)",
    phone: "0115430000",
    lat: 6.8953,
    lng: 79.8821,
    city: "Colombo",
    address: "578 Elvitigala Mawatha, Colombo 05",
    emergency: true,
  },
  {
    name: "Colombo South Teaching Hospital (Kalubowila)",
    sinhalaName: "කළුබෝවිල ශික්ෂණ රෝහල",
    type: "Government Teaching Hospital",
    phone: "0112763066",
    lat: 6.8732,
    lng: 79.8804,
    city: "Colombo / Dehiwala",
    address: "Hospital Road, Kalubowila",
    emergency: true,
  },
  {
    name: "Negombo District General Hospital",
    sinhalaName: "මීගමුව දිස්ත්‍රික් මහා රෝහල",
    type: "District General Hospital",
    phone: "0312222261",
    lat: 7.2118,
    lng: 79.8398,
    city: "Negombo",
    address: "Colombo Road, Negombo",
    emergency: true,
  },

  // Southern Coast (Mirissa, Galle, Matara, Weligama)
  {
    name: "Karapitiya National Teaching Hospital",
    sinhalaName: "කරාපිටිය ජාතික ශික්ෂණ රෝහල",
    type: "National Teaching Hospital (Southern Main)",
    phone: "0912232176",
    lat: 6.0664,
    lng: 80.2246,
    city: "Galle",
    address: "Karapitiya, Galle",
    emergency: true,
  },
  {
    name: "Matara District General Hospital",
    sinhalaName: "මාතර දිස්ත්‍රික් මහා රෝහල",
    type: "General Hospital (24/7 Emergency)",
    phone: "0412222261",
    lat: 5.9496,
    lng: 80.5469,
    city: "Matara",
    address: "Hospital Road, Matara",
    emergency: true,
  },
  {
    name: "Weligama Base Hospital",
    sinhalaName: "වැලිගම මූලික රෝහල",
    type: "Base Hospital (Closest to Mirissa)",
    phone: "0412250261",
    lat: 5.9734,
    lng: 80.4286,
    city: "Weligama / Mirissa",
    address: "Weligama By-pass Rd, Weligama",
    emergency: true,
  },
  {
    name: "Asiri Hospital Galle",
    sinhalaName: "ආසිරි රෝහල ගාල්ල",
    type: "Private Emergency Hospital",
    phone: "0914640640",
    lat: 6.0416,
    lng: 80.2185,
    city: "Galle",
    address: "Wakwella Road, Galle",
    emergency: true,
  },

  // Central Highlands (Kandy, Ella, Nuwara Eliya, Hatton)
  {
    name: "National Hospital Kandy",
    sinhalaName: "මහනුවර ජාතික රෝහල",
    type: "National Teaching Hospital (Central Main)",
    phone: "0812233337",
    lat: 7.2889,
    lng: 80.6288,
    city: "Kandy",
    address: "Hospital Square, William Gopallawa Mawatha, Kandy",
    emergency: true,
  },
  {
    name: "Badulla Provincial General Hospital",
    sinhalaName: "බදුල්ල පළාත් මහා රෝහල",
    type: "Provincial General Hospital (Main for Ella)",
    phone: "0552222261",
    lat: 6.9934,
    lng: 81.055,
    city: "Badulla / Ella",
    address: "Hospital Road, Badulla",
    emergency: true,
  },
  {
    name: "Bandarawela District Base Hospital",
    sinhalaName: "බණ්ඩාරවෙල මූලික රෝහල",
    type: "District Base Hospital (10km from Ella)",
    phone: "0572222261",
    lat: 6.8295,
    lng: 80.9882,
    city: "Bandarawela / Ella",
    address: "Welagedara Rd, Bandarawela",
    emergency: true,
  },
  {
    name: "Demodara Rural Hospital",
    sinhalaName: "දෙමෝදර ග්‍රාමීය රෝහල",
    type: "Primary Care / Clinic (Near Ella)",
    phone: "0572228261",
    lat: 6.8967,
    lng: 81.0638,
    city: "Ella / Demodara",
    address: "Demodara, Ella",
    emergency: false,
  },
  {
    name: "Nuwara Eliya District General Hospital",
    sinhalaName: "නුවරඑළිය දිස්ත්‍රික් මහා රෝහල",
    type: "District General Hospital (24/7)",
    phone: "0522222261",
    lat: 6.9697,
    lng: 80.7712,
    city: "Nuwara Eliya",
    address: "Hospital Road, Nuwara Eliya",
    emergency: true,
  },

  // Cultural Triangle & North (Sigiriya, Dambulla, Anuradhapura, Trincomalee)
  {
    name: "Dambulla Base Hospital",
    sinhalaName: "දඹුල්ල මූලික රෝහල",
    type: "Base Hospital (Closest to Sigiriya)",
    phone: "0662284761",
    lat: 7.8682,
    lng: 80.6517,
    city: "Dambulla / Sigiriya",
    address: "Kurunegala-Dambulla Rd, Dambulla",
    emergency: true,
  },
  {
    name: "Inamaluwa Primary Medical Care Unit",
    sinhalaName: "ඉනාමලුව ප්‍රාථමික වෛද්‍ය ඒකකය",
    type: "Local Medical Clinic (Near Sigiriya Rock)",
    phone: "0662286100",
    lat: 7.9152,
    lng: 80.7093,
    city: "Sigiriya",
    address: "Sigiriya Road, Inamaluwa",
    emergency: false,
  },
  {
    name: "Trincomalee District General Hospital",
    sinhalaName: "ත්‍රිකුණාමලය දිස්ත්‍රික් මහා රෝහල",
    type: "District General Hospital",
    phone: "0262222261",
    lat: 8.5772,
    lng: 81.2335,
    city: "Trincomalee",
    address: "Dockyard Road, Trincomalee",
    emergency: true,
  },
];

// Haversine formula to compute great-circle distance in kilometers
function calculateHaversineKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 9999;
  const R = 6371; // Earth's radius in km
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

export default function SafetySOSCenter({ destination = "Sri Lanka", destinationCoords = null }) {
  // Emergency Contacts configuration
  const emergencyNumbers = [
    {
      number: "1912",
      title: "Tourist Police",
      sinhalaTitle: "සංචාරක පොලිසිය",
      badge: "24/7 Tourist Support",
      description: "Dedicated tourist hotline for complaints, emergency protection & traveler assistance across Sri Lanka.",
      color: "#0284c7",
      bgGradient: "linear-gradient(135deg, #0369a1, #0284c7)",
      isPrimary: false,
    },
    {
      number: "1990",
      title: "1990 Suwa Seriya Ambulance",
      sinhalaTitle: "සුවසැරිය නොමිලේ ගිලන්රථ සේවාව",
      badge: "24/7 Free National Ambulance",
      description: "Fast medical emergency response with pre-hospital care and life support anywhere in Sri Lanka.",
      color: "#dc2626",
      bgGradient: "linear-gradient(135deg, #b91c1c, #dc2626)",
      isPrimary: true,
    },
    {
      number: "119",
      title: "Police Emergency",
      sinhalaTitle: "හදිසි පොලිස් සේවය",
      badge: "24/7 Emergency Dispatch",
      description: "National emergency police dispatch for immediate law enforcement, accidents & distress.",
      color: "#4338ca",
      bgGradient: "linear-gradient(135deg, #3730a3, #4338ca)",
      isPrimary: false,
    },
    {
      number: "110",
      title: "Fire & Rescue Service",
      sinhalaTitle: "ගිනි නිවන හා මුදාගැනීමේ සේවය",
      badge: "24/7 Disaster Rescue",
      description: "Emergency fire fighting, cliff rescue, accident extrication and flood hazard response.",
      color: "#ea580c",
      bgGradient: "linear-gradient(135deg, #c2410c, #ea580c)",
      isPrimary: false,
    },
  ];

  // GPS & Hospital state
  const [activeLocationType, setActiveLocationType] = useState("destination"); // "live" | "destination"
  const [userCoords, setUserCoords] = useState(null);
  const [activeCoords, setActiveCoords] = useState(destinationCoords || { lat: 6.9271, lng: 79.8612 });
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState("osm"); // "osm" | "fallback"
  const [gpsStatusText, setGpsStatusText] = useState("");
  const [gpsError, setGpsError] = useState("");
  const [copiedNumber, setCopiedNumber] = useState(null);

  // Sync activeCoords when destinationCoords prop updates
  useEffect(() => {
    if (activeLocationType === "destination" && destinationCoords) {
      setActiveCoords(destinationCoords);
    }
  }, [destinationCoords, activeLocationType]);

  // Request browser live GPS
  const handleRequestLiveGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setGpsStatusText("Acquiring high-accuracy live GPS...");
    setGpsError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserCoords(coords);
        setActiveCoords(coords);
        setActiveLocationType("live");
        setGpsStatusText(`Live GPS locked (±${Math.round(position.coords.accuracy || 10)}m)`);
      },
      (error) => {
        console.warn("Geolocation error:", error);
        setGpsError("Location permission denied or unavailable. Switched to destination coordinates.");
        setActiveLocationType("destination");
        if (destinationCoords) {
          setActiveCoords(destinationCoords);
        }
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, [destinationCoords]);

  // Fetch hospitals via OpenStreetMap Overpass API (around 15,000m / 15km)
  const fetchNearbyHospitals = useCallback(async (coords) => {
    if (!coords || !coords.lat || !coords.lng) return;

    setLoading(true);
    setGpsError("");

    const { lat, lng } = coords;
    // Overpass QL query: hospitals, clinics, emergency centers within 15km radius
    const overpassQuery = `
      [out:json][timeout:12];
      (
        node["amenity"="hospital"](around:15000,${lat},${lng});
        way["amenity"="hospital"](around:15000,${lat},${lng});
        node["amenity"="clinic"](around:15000,${lat},${lng});
        way["amenity"="clinic"](around:15000,${lat},${lng});
      );
      out center 15;
    `.trim();

    const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 11000); // 11s timeout

      const res = await fetch(overpassUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Overpass API responded with HTTP ${res.status}`);
      }

      const data = await res.json();
      const elements = data.elements || [];

      if (elements.length > 0) {
        // Map elements into clean hospital records
        const parsed = elements
          .map((item) => {
            const itemLat = item.lat || item.center?.lat;
            const itemLng = item.lon || item.center?.lon;
            const tags = item.tags || {};
            const name = tags.name || tags["name:en"] || tags["name:si"] || "Medical Center / Clinic";
            const dist = calculateHaversineKm(lat, lng, itemLat, itemLng);

            return {
              id: item.id,
              name,
              sinhalaName: tags["name:si"] || null,
              type: tags.healthcare || (tags.amenity === "hospital" ? "Hospital" : "Medical Clinic"),
              operator: tags.operator || tags["operator:type"] || "Health Authority",
              emergency: tags.emergency === "yes" || tags.amenity === "hospital",
              phone: tags.phone || tags["contact:phone"] || null,
              city: tags["addr:city"] || tags["addr:suburb"] || tags["addr:street"] || destination,
              distance: dist,
              lat: itemLat,
              lng: itemLng,
            };
          })
          .filter((h) => h.lat && h.lng)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 10);

        setHospitals(parsed);
        setDataSource("osm");
      } else {
        // No results within 15km in OSM, use sorted fallback database
        useFallbackDatabase(coords);
      }
    } catch (err) {
      console.warn("Overpass API unavailable or timed out, loading Sri Lanka Hospital Fallback DB:", err);
      useFallbackDatabase(coords);
    } finally {
      setLoading(false);
    }
  }, [destination]);

  // Fallback database processor: calculates distance from current coords and sorts
  const useFallbackDatabase = useCallback((coords) => {
    const sorted = SRI_LANKA_HOSPITAL_FALLBACK.map((h) => {
      const dist = calculateHaversineKm(coords.lat, coords.lng, h.lat, h.lng);
      return {
        ...h,
        id: h.name,
        distance: dist,
      };
    })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 6);

    setHospitals(sorted);
    setDataSource("fallback");
  }, []);

  // Trigger hospital search whenever activeCoords change
  useEffect(() => {
    if (activeCoords && activeCoords.lat && activeCoords.lng) {
      fetchNearbyHospitals(activeCoords);
    }
  }, [activeCoords, fetchNearbyHospitals]);

  // Copy phone number helper
  const handleCopy = (num) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  return (
    <section className="safety-sos-center" id="safety-sos-center">
      {/* Center Header */}
      <div className="sos-header-banner">
        <div className="sos-header-left">
          <div className="sos-alert-badge">
            <span className="sos-pulse-dot" />
            <span>SAFETY & SOS EMERGENCY CENTER</span>
          </div>
          <h2>හදිසි ඇමතුම් සහ සජීවී රෝහල් සෙවුම</h2>
          <p className="sos-subtitle">
            Sri Lanka Emergency SOS & Live GPS OpenStreetMap Hospital Navigator for {destination}.
          </p>
        </div>

        <div className="sos-quick-actions">
          <a href="tel:1990" className="sos-hero-dial-btn ambulance" title="Call 1990 Suwa Seriya Free Ambulance">
            <span className="sos-dial-icon">🚑</span>
            <span className="sos-dial-text">
              <strong>CALL 1990</strong>
              <small>Suwa Seriya Ambulance</small>
            </span>
          </a>
          <a href="tel:1912" className="sos-hero-dial-btn tourist-police" title="Call 1912 Tourist Police">
            <span className="sos-dial-icon">🛡️</span>
            <span className="sos-dial-text">
              <strong>CALL 1912</strong>
              <small>Tourist Police (24/7)</small>
            </span>
          </a>
        </div>
      </div>

      {/* 1. Emergency SOS Quick Dialer Grid */}
      <div className="sos-section-container">
        <div className="sos-section-title-row">
          <div>
            <span className="sos-subheading-tag">EMERGENCY SOS DIALER</span>
            <h3>හදිසි ඇමතුම් සේවා (Instant One-Click Direct Calling)</h3>
          </div>
          <span className="sos-status-tag-active">● 24/7 All-Island Active</span>
        </div>

        <div className="sos-cards-grid">
          {emergencyNumbers.map((sos) => (
            <div
              key={sos.number}
              className={`sos-card ${sos.isPrimary ? "primary-sos-card" : ""}`}
            >
              <div className="sos-card-header">
                <span className="sos-badge-pill">{sos.badge}</span>
                <button
                  type="button"
                  className="sos-copy-btn"
                  onClick={() => handleCopy(sos.number)}
                  title="Copy number"
                >
                  {copiedNumber === sos.number ? "Copied ✓" : "Copy"}
                </button>
              </div>

              <div className="sos-number-display">
                <span className="sos-num-symbol">📞</span>
                <span className="sos-num-digits">{sos.number}</span>
              </div>

              <div className="sos-card-titles">
                <h4>{sos.title}</h4>
                <p className="sos-sinhala-name">{sos.sinhalaTitle}</p>
              </div>

              <p className="sos-card-desc">{sos.description}</p>

              <a
                href={`tel:${sos.number}`}
                className="sos-call-action-btn"
                style={{ background: sos.bgGradient }}
              >
                <span>Call {sos.number} Now</span>
                <span className="call-arrow">↗</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Live GPS Hospital Locator (OpenStreetMap Overpass API) */}
      <div className="sos-section-container hospitals-locator-section">
        <div className="sos-section-title-row">
          <div>
            <span className="sos-subheading-tag">LIVE GPS & OPENSTREETMAP OVERPASS API</span>
            <h3>සජීවී GPS හරහා ළඟම රෝහල් සෙවීම (Nearby Hospitals & Clinics)</h3>
          </div>
          <div className="osm-provider-badge">
            <span className="osm-logo">🌐</span>
            <span>{dataSource === "osm" ? "OpenStreetMap Overpass Live API" : "Verified SL Hospital Database"}</span>
          </div>
        </div>

        {/* GPS Control Bar */}
        <div className="sos-gps-control-bar">
          <div className="gps-mode-toggle">
            <button
              type="button"
              className={`gps-toggle-btn ${activeLocationType === "live" ? "active" : ""}`}
              onClick={handleRequestLiveGPS}
            >
              <span className="gps-dot-icon">📍</span>
              <span>Use My Live GPS (මගේ සජීවී ස්ථානය)</span>
            </button>

            <button
              type="button"
              className={`gps-toggle-btn ${activeLocationType === "destination" ? "active" : ""}`}
              onClick={() => {
                setActiveLocationType("destination");
                if (destinationCoords) {
                  setActiveCoords(destinationCoords);
                }
              }}
            >
              <span className="gps-dot-icon">🎯</span>
              <span>Near Destination ({destination})</span>
            </button>
          </div>

          <div className="gps-status-indicator">
            {gpsStatusText && <span className="gps-status-msg">{gpsStatusText}</span>}
            {gpsError && <span className="gps-error-msg">{gpsError}</span>}
            <span className="gps-coords-display">
              Lat: {activeCoords?.lat?.toFixed(4)}, Lng: {activeCoords?.lng?.toFixed(4)} (15 km Radius)
            </span>
          </div>
        </div>

        {/* Hospitals List */}
        {loading ? (
          <div className="sos-loading-box">
            <div className="sos-spinner" />
            <p>Searching OpenStreetMap Overpass API for hospitals within 15 km...</p>
          </div>
        ) : hospitals.length === 0 ? (
          <div className="sos-empty-box">
            <p>No medical centers detected nearby in OpenStreetMap. Please dial <strong>1990</strong> for immediate emergency ambulance response.</p>
            <a href="tel:1990" className="sos-empty-call-btn">Call 1990 Suwa Seriya</a>
          </div>
        ) : (
          <div className="sos-hospitals-grid">
            {hospitals.map((hospital, index) => {
              const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`;
              const isFirst = index === 0;

              return (
                <div
                  key={hospital.id || index}
                  className={`hospital-card ${isFirst ? "closest-hospital" : ""}`}
                >
                  <div className="hospital-header-row">
                    <div className="hospital-name-block">
                      {isFirst && <span className="closest-badge">⚡ CLOSEST TO YOU</span>}
                      <h4>{hospital.name}</h4>
                      {hospital.sinhalaName && (
                        <p className="hospital-sinhala">{hospital.sinhalaName}</p>
                      )}
                    </div>
                    <div className="hospital-distance-pill">
                      <strong>{hospital.distance} km</strong>
                      <small>Distance</small>
                    </div>
                  </div>

                  <div className="hospital-meta-row">
                    <span className="hospital-type-badge">{hospital.type}</span>
                    {hospital.emergency && (
                      <span className="hospital-emergency-badge">24/7 Emergency</span>
                    )}
                    {hospital.city && (
                      <span className="hospital-city-badge">📍 {hospital.city}</span>
                    )}
                  </div>

                  {hospital.address && (
                    <p className="hospital-address">{hospital.address}</p>
                  )}

                  <div className="hospital-actions-row">
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hospital-navigate-btn"
                      title="Open turn-by-turn navigation in Google Maps"
                    >
                      <span>Get Directions</span>
                      <span className="nav-arrow">🧭</span>
                    </a>

                    {hospital.phone ? (
                      <a
                        href={`tel:${hospital.phone.replace(/\s+/g, "")}`}
                        className="hospital-call-btn"
                        title={`Call ${hospital.phone}`}
                      >
                        <span>📞 {hospital.phone}</span>
                      </a>
                    ) : (
                      <a
                        href="tel:1990"
                        className="hospital-call-btn emergency-fallback"
                        title="Call 1990 Ambulance"
                      >
                        <span>📞 Call 1990</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
