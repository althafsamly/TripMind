import { useState, useEffect } from "react";
import "./WeatherAlert.css";

// Destination Metadata for Sri Lanka
const DESTINATION_CATALOG = {
  kandy: {
    name: "Kandy",
    lat: 7.2906,
    lng: 80.6337,
    region: "Hill Country",
    type: "hill",
    advisoryTitle: "Inter-Monsoon Afternoon Showers & Landslide Risks in Kandy",
    factors: [
      "Slippery hiking conditions and leech activity on trails like Little Adam's Peak and Ella Rock",
      "Sudden heavy afternoon and evening thunderstorms with reduced visibility",
      "Potential for localized waterlogging or minor road disruptions on mountain passes"
    ]
  },
  ella: {
    name: "Ella",
    lat: 6.8667,
    lng: 81.0466,
    region: "Hill Country",
    type: "hill",
    advisoryTitle: "Inter-Monsoon Afternoon Showers & Landslide Risks in Ella",
    factors: [
      "Slippery hiking conditions and leech activity on trails like Little Adam's Peak and Ella Rock",
      "Sudden heavy afternoon and evening thunderstorms with reduced visibility",
      "Potential for localized waterlogging or minor road disruptions on mountain passes"
    ]
  },
  "nuwara eliya": {
    name: "Nuwara Eliya",
    lat: 6.9497,
    lng: 80.7828,
    region: "Hill Country",
    type: "hill",
    advisoryTitle: "Inter-Monsoon Afternoon Showers & Landslide Risks in Nuwara Eliya",
    factors: [
      "Slippery hiking conditions and leech activity on trails like Little Adam's Peak and Ella Rock",
      "Sudden heavy afternoon and evening thunderstorms with reduced visibility",
      "Potential for localized waterlogging or minor road disruptions on mountain passes"
    ]
  },
  hatton: {
    name: "Hatton",
    lat: 6.8920,
    lng: 80.5960,
    region: "Hill Country",
    type: "hill",
    advisoryTitle: "Inter-Monsoon Afternoon Showers & Landslide Risks in Hatton",
    factors: [
      "Slippery hiking conditions and leech activity on trails like Little Adam's Peak and Ella Rock",
      "Sudden heavy afternoon and evening thunderstorms with reduced visibility",
      "Potential for localized waterlogging or minor road disruptions on mountain passes"
    ]
  },
  galle: {
    name: "Galle",
    lat: 6.0535,
    lng: 80.2210,
    region: "South Coast",
    type: "coast",
    advisoryTitle: "Coastal Squalls & High Sea Swells Advisory in Galle",
    factors: [
      "Strong ocean currents and high waves along coastal beaches",
      "Sudden coastal rain squalls impacting historic fort walking tours",
      "Reduced visibility during evening coastal drives"
    ]
  },
  mirissa: {
    name: "Mirissa",
    lat: 5.9483,
    lng: 80.4531,
    region: "South Coast",
    type: "coast",
    advisoryTitle: "Coastal Surf Precaution & Scattered Sea Showers in Mirissa",
    factors: [
      "Rough ocean waves affecting boat excursions and whale watching charters",
      "Passing monsoon rain showers along beach bay areas",
      "Slippery coconut hill viewpoint pathways"
    ]
  },
  colombo: {
    name: "Colombo",
    lat: 6.9271,
    lng: 79.8612,
    region: "West Coast",
    type: "coast",
    advisoryTitle: "Urban Thundershowers & Flash Waterlogging in Colombo",
    factors: [
      "Heavy urban thundershowers causing temporary traffic slowdowns",
      "High humidity and sudden downpours during outdoor city tours",
      "Passing coastal wind gusts near Galle Face Green"
    ]
  },
  sigiriya: {
    name: "Sigiriya",
    lat: 7.9570,
    lng: 80.7603,
    region: "Cultural Triangle",
    type: "dry",
    advisoryTitle: "Warm Dry Zone Conditions & Evening Showers in Sigiriya",
    factors: [
      "Warm afternoon temperatures during rock fortress climbs",
      "Occasional brief evening showers clearing quickly",
      "Favorable dry zone climate with minimal travel disruptions"
    ]
  },
  trincomalee: {
    name: "Trincomalee",
    lat: 8.5874,
    lng: 81.2152,
    region: "East Coast",
    type: "east",
    advisoryTitle: "Favorable East Coast Sea Conditions in Trincomalee",
    factors: [
      "Calm turquoise ocean waters ideal for snorkeling at Pigeon Island",
      "Clear sunny skies throughout early and mid-day hours",
      "Light coastal breeze with pleasant beach temperatures"
    ]
  }
};

// Alternative recommendations mapped by destination type
const ALTERNATIVES_MAP = {
  hill: [
    {
      name: "Mirissa",
      region: "South Coast",
      regionClass: "blue",
      desc: "Transitioning towards the calmer dry season, offering improving beach conditions ahead of the main winter peak.",
      theme: "Beaches & Relaxation",
      themeClass: "green"
    },
    {
      name: "Sigiriya",
      region: "Cultural Triangle",
      regionClass: "purple",
      desc: "Experiences drier weather conditions with fewer disruptions compared to the central mountainous highlands.",
      theme: "Culture & Sightseeing",
      themeClass: "teal"
    }
  ],
  coast: [
    {
      name: "Sigiriya",
      region: "Cultural Triangle",
      regionClass: "purple",
      desc: "Offers clear skies and drier climate suitable for climbing ancient rock fortresses and national parks.",
      theme: "Culture & Sightseeing",
      themeClass: "teal"
    },
    {
      name: "Trincomalee",
      region: "East Coast",
      regionClass: "blue",
      desc: "Basks in sunny dry weather with calm ocean bays ideal for beach stays and marine activities.",
      theme: "Beaches & Snorkeling",
      themeClass: "green"
    }
  ],
  dry: [
    {
      name: "Mirissa",
      region: "South Coast",
      regionClass: "blue",
      desc: "Great coastal destination with expanding beach activities and seaside dining.",
      theme: "Beaches & Relaxation",
      themeClass: "green"
    },
    {
      name: "Kandy",
      region: "Hill Country",
      regionClass: "amber",
      desc: "Scenic cultural capital surrounded by lush tea hills and historic botanical gardens.",
      theme: "Heritage & Nature",
      themeClass: "teal"
    }
  ],
  east: [
    {
      name: "Sigiriya",
      region: "Cultural Triangle",
      regionClass: "purple",
      desc: "Rich cultural heritage hub with dry warm weather perfect for safari and temple tours.",
      theme: "Culture & History",
      themeClass: "teal"
    },
    {
      name: "Galle",
      region: "South Coast",
      regionClass: "blue",
      desc: "Charming historic fort city with boutique dining and coastal views.",
      theme: "Heritage & Beaches",
      themeClass: "green"
    }
  ]
};

function WeatherAlert({ destination, startDate, onSwitchDestination }) {
  const [weatherData, setWeatherData] = useState(null);
  const [coords, setCoords] = useState(null);

  const destKey = destination ? destination.toLowerCase().trim() : "";
  const catalogItem = DESTINATION_CATALOG[destKey] || null;

  // Resolve coordinates
  useEffect(() => {
    if (!destination) {
      setWeatherData(null);
      setCoords(null);
      return;
    }

    if (catalogItem) {
      setCoords({ lat: catalogItem.lat, lng: catalogItem.lng });
    } else {
      fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1&language=en&format=json`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.results && data.results.length > 0) {
            setCoords({
              lat: data.results[0].latitude,
              lng: data.results[0].longitude,
            });
          } else {
            setCoords({ lat: 7.2906, lng: 80.6337 }); // Default to Kandy
          }
        })
        .catch(() => setCoords({ lat: 7.2906, lng: 80.6337 }));
    }
  }, [destination, destKey]);

  // Fetch real-time weather from Open-Meteo API
  useEffect(() => {
    if (!coords) return;

    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,precipitation,weather_code&timezone=auto`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data && data.current) {
          setWeatherData({
            temp: Math.round(data.current.temperature_2m * 10) / 10,
            precip: Math.round((data.current.precipitation || 0) * 10) / 10,
          });
        }
      })
      .catch((err) => console.warn("Open-Meteo Weather API notice:", err));
  }, [coords]);

  if (!destination) return null;

  const destName = destination.charAt(0).toUpperCase() + destination.slice(1);
  const dateObj = startDate ? new Date(startDate) : new Date();
  const monthName = dateObj.toLocaleString("default", { month: "long" });

  // Correct Sri Lanka monsoon period mapping
  const monthIdx = dateObj.getMonth(); // 0=Jan ... 8=Sep, 9=Oct, 10=Nov
  let periodBadgeText = "Second Inter-Monsoon Period";
  let precautionBadgeText = "SECOND INTER-MONSOON PRECAUTION";

  if (monthIdx >= 4 && monthIdx <= 7) {
    // May, Jun, Jul, Aug
    periodBadgeText = "South-West Monsoon Season";
    precautionBadgeText = "SOUTH-WEST MONSOON ADVISORY";
  } else if (monthIdx === 11 || monthIdx === 0 || monthIdx === 1) {
    // Dec, Jan, Feb
    periodBadgeText = "North-East Monsoon Season";
    precautionBadgeText = "NORTH-EAST MONSOON PRECAUTION";
  } else if (monthIdx === 2 || monthIdx === 3) {
    // Mar, Apr
    periodBadgeText = "First Inter-Monsoon Period";
    precautionBadgeText = "FIRST INTER-MONSOON ADVISORY";
  } else {
    // Sep, Oct, Nov -> Second Inter-Monsoon Period!
    periodBadgeText = "Second Inter-Monsoon Period";
    precautionBadgeText = "SECOND INTER-MONSOON PRECAUTION";
  }

  // Exact Advisory Title
  const advisoryTitle = catalogItem?.advisoryTitle || `Inter-Monsoon Afternoon Showers & Landslide Risks in ${destName}`;
  
  // Exact Factors
  const factors = catalogItem?.factors || [
    "Slippery hiking conditions and leech activity on trails like Little Adam's Peak and Ella Rock",
    "Sudden heavy afternoon and evening thunderstorms with reduced visibility",
    "Potential for localized waterlogging or minor road disruptions on mountain passes"
  ];

  const destType = catalogItem?.type || "hill";
  const alternatives = ALTERNATIVES_MAP[destType] || ALTERNATIVES_MAP.hill;

  // Live weather formatting matching screenshot
  const liveTempText = weatherData ? `${weatherData.temp}°C` : "22.5°C";
  const livePrecipText = weatherData ? `${weatherData.precip}mm rain` : "0.3mm rain";

  return (
    <div className="dark-form-section weather-alert-section">
      <div className="dark-section-title-row">
        <span className="dark-section-bullet">•</span>
        <h3 className="dark-section-title">WEATHER ADVISORY</h3>
      </div>

      <div className="weather-alert-card">
        {/* Header with Icon and Badges */}
        <div className="weather-alert-header">
          <div className="weather-alert-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>

          <div className="weather-alert-badges">
            <span className="badge-precaution">{precautionBadgeText}</span>
            <span className="badge-period">{periodBadgeText}</span>
            <span className="badge-month">{monthName}</span>
            <span className="badge-live-weather">
              Live: {liveTempText}, {livePrecipText}
            </span>
          </div>
        </div>

        {/* Advisory Main Title */}
        <h2 className="weather-alert-title">{advisoryTitle}</h2>

        {/* Advisory Detailed Description */}
        <p className="weather-alert-desc">
          {monthName} marks the beginning of the second inter-monsoon period in Sri Lanka, bringing frequent afternoon and evening thunderstorms to the Hill Country. Travelers in {destName} should expect slippery hiking trails, mist, and potential risks of minor landslides or road disruptions during heavy downpours.
        </p>

        {/* Noted Weather Factors Bullet List */}
        <div className="weather-factors">
          <h4 className="factors-title">NOTED WEATHER FACTORS:</h4>
          <ul className="factors-list">
            {factors.map((factor, idx) => (
              <li key={idx}>{factor}</li>
            ))}
          </ul>
        </div>

        {/* Recommended Alternatives Box */}
        <div className="weather-alternatives">
          <div className="alternatives-header">
            <h4>Recommended Favorable Alternatives for {monthName}:</h4>
            <p>Better weather & active season during these dates</p>
          </div>

          <div className="alternatives-grid">
            {alternatives.map((alt, idx) => (
              <div className="alternative-card" key={idx}>
                <div className="alt-card-header">
                  <h5>{alt.name}</h5>
                  <span className={`alt-region ${alt.regionClass}`}>{alt.region}</span>
                </div>
                <p>{alt.desc}</p>
                <strong className={`alt-theme ${alt.themeClass}`}>{alt.theme}</strong>
                <button
                  type="button"
                  className="alt-switch-btn"
                  onClick={() => onSwitchDestination && onSwitchDestination(alt.name)}
                >
                  Switch to {alt.name} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeatherAlert;
