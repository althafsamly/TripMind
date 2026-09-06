import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, CloudSun, Wind, Droplets, Thermometer, X, AlertCircle, Loader2 } from 'lucide-react';

// Weather code mapping based on WMO standards used by Open-Meteo
const getWeatherDescription = (code) => {
  switch (code) {
    case 0:
      return { label: 'Clear Sky', icon: Sun, color: 'text-amber-400' };
    case 1:
    case 2:
      return { label: 'Partly Cloudy', icon: CloudSun, color: 'text-amber-200' };
    case 3:
      return { label: 'Overcast', icon: Cloud, color: 'text-gray-300' };
    case 45:
    case 48:
      return { label: 'Foggy', icon: Cloud, color: 'text-gray-400' };
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
      return { label: 'Drizzle', icon: CloudRain, color: 'text-blue-300' };
    case 61:
    case 63:
    case 65:
    case 66:
    case 67:
      return { label: 'Rain', icon: CloudRain, color: 'text-blue-400' };
    case 71:
    case 73:
    case 75:
    case 77:
      return { label: 'Snow', icon: CloudRain, color: 'text-indigo-200' };
    case 80:
    case 81:
    case 82:
      return { label: 'Rain Showers', icon: CloudRain, color: 'text-blue-400' };
    case 95:
    case 96:
    case 99:
      return { label: 'Thunderstorm', icon: CloudRain, color: 'text-purple-400' };
    default:
      return { label: 'Clear', icon: Sun, color: 'text-amber-400' };
  }
};

export default function WeatherModal({ isOpen, onClose, locationName }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    if (!isOpen || !locationName) return;

    let isMounted = true;
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);

      try {
        // Step 1: Geocode location to lat/lon using Open-Meteo Geocoding API or Nominatim
        const cleanName = locationName.split(',')[0].trim();
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanName)}&count=1&language=en&format=json`
        );
        const geoData = await geoRes.json();

        let lat, lon, resolvedName;
        if (geoData.results && geoData.results.length > 0) {
          lat = geoData.results[0].latitude;
          lon = geoData.results[0].longitude;
          resolvedName = `${geoData.results[0].name}${geoData.results[0].country ? `, ${geoData.results[0].country}` : ''}`;
        } else {
          // Fallback to nominatim if geocoding didn't find it
          const nomRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanName)}&limit=1`,
            { headers: { 'User-Agent': 'TripMind/1.0' } }
          );
          const nomData = await nomRes.json();
          if (nomData && nomData.length > 0) {
            lat = parseFloat(nomData[0].lat);
            lon = parseFloat(nomData[0].lon);
            resolvedName = cleanName;
          } else {
            throw new Error(`Coordinates could not be found for "${cleanName}".`);
          }
        }

        // Step 2: Fetch current weather + 5-day daily forecast
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
        );
        const data = await weatherRes.json();

        if (isMounted) {
          setWeatherData({
            location: resolvedName || cleanName,
            current: data.current,
            daily: data.daily
          });
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to fetch weather:", err);
          setError(err.message || 'Unable to retrieve weather at this time.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchWeather();

    return () => {
      isMounted = false;
    };
  }, [isOpen, locationName]);

  if (!isOpen) return null;

  const currentInfo = weatherData?.current ? getWeatherDescription(weatherData.current.weather_code) : null;
  const CurrentIcon = currentInfo?.icon || Sun;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-[#0c0c0c] border border-white/10 w-full max-w-lg rounded-[24px] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col text-white"
        role="dialog"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <CloudSun className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="font-urbanist font-bold text-[18px] text-white leading-tight">
                Current Weather & Forecast
              </h3>
              <p className="text-[11px] font-inter text-gray-400 truncate max-w-[260px] sm:max-w-xs">
                {locationName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
              <p className="font-inter text-sm text-gray-400">Fetching live weather data...</p>
            </div>
          ) : error ? (
            <div className="py-12 flex flex-col items-center justify-center text-center px-4">
              <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
              <h4 className="font-urbanist font-bold text-[16px] text-white mb-1">Weather Unavailable</h4>
              <p className="font-inter text-xs text-gray-400 max-w-xs mb-4">{error}</p>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          ) : weatherData ? (
            <div className="space-y-6">
              {/* Primary Current Card */}
              <div className="bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 rounded-[20px] p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                    <CurrentIcon className={`w-14 h-14 ${currentInfo.color}`} />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[44px] font-urbanist font-extrabold text-white leading-none">
                        {Math.round(weatherData.current.temperature_2m)}
                      </span>
                      <span className="text-[20px] font-urbanist font-bold text-gray-400">°C</span>
                    </div>
                    <p className="font-urbanist font-bold text-[16px] text-gray-200 mt-1">
                      {currentInfo.label}
                    </p>
                    <p className="text-[12px] font-inter text-gray-400">
                      Feels like {Math.round(weatherData.current.apparent_temperature)}°C
                    </p>
                  </div>
                </div>

                {/* Humidity & Wind metrics */}
                <div className="flex sm:flex-col gap-4 sm:gap-2 text-xs font-inter border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-6 w-full sm:w-auto justify-around">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Droplets className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Humidity: {weatherData.current.relative_humidity_2m}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Wind className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Wind: {weatherData.current.wind_speed_10m} km/h</span>
                  </div>
                </div>
              </div>

              {/* 5-Day Forecast Grid */}
              {weatherData.daily?.time && (
                <div>
                  <h4 className="text-[11px] font-inter font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
                    5-Day Forecast
                  </h4>
                  <div className="grid grid-cols-5 gap-2">
                    {weatherData.daily.time.slice(0, 5).map((dateStr, i) => {
                      const dayCode = weatherData.daily.weather_code[i];
                      const dayInfo = getWeatherDescription(dayCode);
                      const DayIcon = dayInfo.icon;
                      const dateObj = new Date(dateStr);
                      const dayName = i === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                      const maxTemp = Math.round(weatherData.daily.temperature_2m_max[i]);
                      const minTemp = Math.round(weatherData.daily.temperature_2m_min[i]);

                      return (
                        <div
                          key={dateStr}
                          className="bg-white/[0.02] border border-white/5 hover:border-white/20 rounded-xl p-2.5 flex flex-col items-center text-center transition-colors"
                        >
                          <span className="text-[11px] font-inter font-semibold text-gray-400 mb-1.5">
                            {dayName}
                          </span>
                          <DayIcon className={`w-5 h-5 mb-2 ${dayInfo.color}`} />
                          <span className="text-[12px] font-urbanist font-bold text-white">
                            {maxTemp}°
                          </span>
                          <span className="text-[10px] font-urbanist font-semibold text-gray-500">
                            {minTemp}°
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-white/[0.01] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white text-black hover:bg-gray-200 rounded-lg text-xs font-bold font-inter transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
