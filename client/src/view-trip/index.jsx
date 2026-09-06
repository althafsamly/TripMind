import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, Star, Clock, Calendar, Navigation, Globe, Share2, Users, Shield, CheckCircle, Zap, Compass, Sparkles, UserX, Trash2, CloudSun, Wallet, TrendingUp, IndianRupee } from "lucide-react";
import TripCard from "../components/ui/TripCard";
import ItinerarySection from '../components/ItinerarySection';
import WeatherModal from '../components/WeatherModal';
import api from "../service/api";
import { useToast } from '../components/ui/toast';
import { useAuth } from '../context/AuthContext';
import AITravelAssistant from '../components/custom/AITravelAssistant';

export default function ViewTrip() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const { user } = useAuth();
  const [bookingStatus, setBookingStatus] = useState('none');
  const [showTripDetails, setShowTripDetails] = useState(false);
  const [userBooking, setUserBooking] = useState(null);
  const [members, setMembers] = useState([]);
  const [tripOwnerId, setTripOwnerId] = useState(null);
  const [weatherModalOpen, setWeatherModalOpen] = useState(false);
  const [weatherLocation, setWeatherLocation] = useState('');

  useEffect(() => {
    const fetchTrip = async () => {
      if (!id) return;
      try {
        const { data } = await api.get(`/trips/${id}`);
        if (data) {
          const normalizedItinerary = Array.isArray(data.tripData?.itinerary)
            ? data.tripData.itinerary.map(day => ({
              ...day,
              places: day.places || day.activities || day.plan || []
            }))
            : data.tripData?.itinerary
              ? Object.entries(data.tripData.itinerary)
                .sort((a, b) => parseInt(a[0].replace(/\D/g, '')) - parseInt(b[0].replace(/\D/g, '')))
                .map(([day, details]) => ({
                  day: parseInt(day.replace(/\D/g, '')) || 1,
                  ...details,
                  places: details.places || details.activities || details.plan || []
                }))
              : [];

          setTrip({
            ...data,
            ...(data.tripData || {}),
            itinerary: normalizedItinerary,
            destination: data.destination,
            price: data.price || 0,
            terms: data.terms || "",
            packageNotes: data.packageNotes || ""
          });
          setTripOwnerId(data.userId?._id || data.userId);
        }
      } catch (error) {
        console.error("Error fetching trip:", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load trip details.'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id, toast]);

  const fetchMembers = async () => {
    if (!id) return;
    try {
      const membersRes = await api.get(`/bookings/trip/${id}/members`);
      const tripRes = await api.get(`/trips/${id}`);
      const creator = tripRes.data?.userId;

      if (creator) {
        const ownerRes = await api.get(`/users/${creator}`);
        const owner = {
          userId: ownerRes.data,
          isOwner: true
        };
        const filteredMembers = membersRes.data.filter(m => m.userId?._id !== creator);
        setMembers([owner, ...filteredMembers]);
      } else {
        setMembers(membersRes.data);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [id]);

  useEffect(() => {
    if (trip && user) {
      checkBookingStatus();
    }
  }, [trip, user]);

  const checkBookingStatus = async () => {
    try {
      const { data } = await api.get(`/bookings/status/id/${id}`);
      if (data) {
        const tripRes = await api.get(`/trips/${id}`);
        if (tripRes.data?.userId === user.id) {
          setBookingStatus('approved');
        } else {
          setBookingStatus(data.status || 'none');
          setUserBooking(data._id ? data : null);
        }
      }
    } catch (error) {
      console.error("Failed to check status", error);
    }
  };

  const handleJoinTrip = async () => {
    try {
      await api.post('/bookings/join', {
        destination: trip.destination,
        tripId: id
      });
      setBookingStatus('pending');
      fetchMembers();
      toast({
        title: "Request Sent",
        description: "Your request has been sent to the Organiser.",
        className: "bg-emerald-600 text-white border-transparent"
      });
    } catch (error) {
      console.error("Join Trip Error FULL:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to join.";
      toast({
        title: "Error Joining",
        description: errorMsg,
        variant: "destructive"
      });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied!",
      description: "You can now share this trip with your friends.",
      className: "bg-[#0a0a0a] border border-white/20 text-white"
    });
  };

  if (loading) return (
    <div className='min-h-screen bg-[#050505] flex items-center justify-center'>
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
    </div>
  );

  if (!trip) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6">
      <div className="text-center max-w-md bg-[#0a0a0a] p-12 rounded-[24px] border border-white/10 flex flex-col items-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
          <Globe className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-[24px] font-urbanist font-bold text-white mb-3 tracking-tight">No Trip Found</h1>
        <p className="text-gray-400 font-inter text-[14px] mb-8 leading-relaxed">Please generate a trip first to view your itinerary.</p>
        <Link
          to="/create-trip"
          className="inline-flex items-center justify-center h-12 px-8 bg-white text-black font-inter font-bold rounded-lg hover:bg-gray-200 transition-colors w-full"
        >
          Create New Trip
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white/20">

      {/* Premium Dark Header */}
      <div className="relative overflow-hidden bg-[#050505] border-b border-white/10">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none transform translate-x-1/3 -translate-y-1/3" />

        <div className="px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32 py-20 relative z-10 max-w-[1400px] mx-auto">
          <div className="max-w-[1280px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span className="text-[10px] font-urbanist font-bold uppercase tracking-[0.2em] text-gray-300">
                    AI Optimized Intelligence
                  </span>
                </div>

                <h1 className="text-[24px] sm:text-[48px] md:text-[64px] font-urbanist font-bold text-white mb-4 sm:mb-6 tracking-tight leading-[1.2] sm:leading-[1.05]">
                  <span className="truncate block">{trip.destination?.split(',')[0] || trip.destination}</span>
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-gray-400 font-inter text-[14px]">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{trip.locationInfo?.displayName || trip.destination}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-white/20" />
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{trip.duration || '3'} Days Journey</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => {
                    setWeatherLocation(trip.destination);
                    setWeatherModalOpen(true);
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 h-12 bg-white hover:bg-gray-200 text-black rounded-lg font-inter font-bold transition-all shadow-lg hover:shadow-white/10 active:scale-95"
                >
                  <CloudSun className="w-5 h-5 text-amber-600" />
                  <span>Weather</span>
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Complexity', value: 'Highly Curated', icon: Compass },
                { label: 'Local Vibe', value: 'Authentic', icon: Globe },
                { label: 'Efficiency', value: '98%', icon: Zap },
                { label: 'Rating', value: '4.9/5', icon: Star }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col p-5 bg-[#0a0a0a] rounded-[16px] border border-white/10 hover:bg-white/[0.03] transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-white/5 mb-4 flex items-center justify-center border border-white/10">
                    <stat.icon className="w-4 h-4 text-gray-300" />
                  </div>
                  <div>
                    <p className="text-[10px] font-inter font-bold uppercase tracking-widest text-gray-500 mb-1">{stat.label}</p>
                    <p className="font-urbanist font-bold text-[18px] text-white tracking-tight">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="px-4 sm:px-10 md:px-16 lg:px-24 xl:px-32 py-10 sm:py-16">
        <div className="max-w-[1280px] mx-auto space-y-10 sm:space-y-16">

          {/* Estimated Budget Section */}
          {(() => {
            const days = parseInt(trip?.duration) || 3;
            const budgetTier = (trip?.budget || 'Standard').toLowerCase();
            
            // Tier-based daily estimates in INR (₹)
            let dailyStay = 3500;
            let dailyFood = 1200;
            let dailyActivities = 1000;
            let dailyTransport = 800;

            if (budgetTier.includes('budget') || budgetTier.includes('cheap')) {
              dailyStay = 1500;
              dailyFood = 700;
              dailyActivities = 500;
              dailyTransport = 400;
            } else if (budgetTier.includes('luxury')) {
              dailyStay = 10000;
              dailyFood = 3500;
              dailyActivities = 3000;
              dailyTransport = 2500;
            }

            const totalStay = dailyStay * days;
            const totalFood = dailyFood * days;
            const totalActivities = dailyActivities * days;
            const totalTransport = dailyTransport * days;
            const totalEstimated = totalStay + totalFood + totalActivities + totalTransport;

            return (
              <div className="bg-[#0a0a0a] border border-white/10 p-6 sm:p-8 rounded-[24px] relative overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                {/* Background glow */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/[0.04] rounded-full blur-[100px] pointer-events-none" />

                {/* Header row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <Wallet className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[20px] sm:text-[24px] font-urbanist font-bold text-white tracking-tight">
                          Estimated Budget
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-urbanist font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {trip?.budget || 'Standard'} Tier
                        </span>
                      </div>
                      <p className="text-[12px] sm:text-[13px] font-inter text-gray-400">
                        Calculated projection for {days} days stay in {trip?.destination?.split(',')[0] || 'destination'}
                      </p>
                    </div>
                  </div>

                  {/* Total Amount Pill */}
                  <div className="flex flex-col sm:items-end">
                    <span className="text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-gray-500 mb-1">
                      Total Estimated Cost
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[32px] sm:text-[40px] font-urbanist font-extrabold text-white tracking-tight leading-none">
                        ₹{totalEstimated.toLocaleString('en-IN')}
                      </span>
                      <span className="text-gray-500 font-inter text-xs">/ approx</span>
                    </div>
                  </div>
                </div>

                {/* Budget Breakdown Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 relative z-10">
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                    <span className="text-[10px] font-inter font-bold uppercase tracking-widest text-gray-500 block mb-1">🏨 Accommodation</span>
                    <p className="text-[18px] sm:text-[20px] font-urbanist font-bold text-white tracking-tight">
                      ₹{totalStay.toLocaleString('en-IN')}
                    </p>
                    <span className="text-[11px] font-inter text-gray-400">~₹{dailyStay.toLocaleString('en-IN')}/night</span>
                  </div>

                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                    <span className="text-[10px] font-inter font-bold uppercase tracking-widest text-gray-500 block mb-1">🍽️ Food & Dining</span>
                    <p className="text-[18px] sm:text-[20px] font-urbanist font-bold text-white tracking-tight">
                      ₹{totalFood.toLocaleString('en-IN')}
                    </p>
                    <span className="text-[11px] font-inter text-gray-400">~₹{dailyFood.toLocaleString('en-IN')}/day</span>
                  </div>

                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                    <span className="text-[10px] font-inter font-bold uppercase tracking-widest text-gray-500 block mb-1">🎟️ Attractions & Entry</span>
                    <p className="text-[18px] sm:text-[20px] font-urbanist font-bold text-white tracking-tight">
                      ₹{totalActivities.toLocaleString('en-IN')}
                    </p>
                    <span className="text-[11px] font-inter text-gray-400">~₹{dailyActivities.toLocaleString('en-IN')}/day</span>
                  </div>

                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                    <span className="text-[10px] font-inter font-bold uppercase tracking-widest text-gray-500 block mb-1">🚕 Local Travel</span>
                    <p className="text-[18px] sm:text-[20px] font-urbanist font-bold text-white tracking-tight">
                      ₹{totalTransport.toLocaleString('en-IN')}
                    </p>
                    <span className="text-[11px] font-inter text-gray-400">~₹{dailyTransport.toLocaleString('en-IN')}/day</span>
                  </div>
                </div>
              </div>
            );
          })()}



          {/* Hotels Section */}
          <section className="pt-8">
            <div className="flex items-center gap-4 mb-6 sm:mb-10">
              <h2 className="font-urbanist font-bold text-[28px] sm:text-[36px] tracking-tight text-white">
                🏨 {user?.id === tripOwnerId ? "Select Booked Hotel" : "Accommodations"}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(user?.id === tripOwnerId ? trip?.hotels : (trip?.selectedHotel ? [trip.selectedHotel] : trip?.hotels))?.map((hotel, index) => (
                <TripCard
                  key={index}
                  hotel={hotel}
                  isHotel={true}
                  tripId={id}
                  tripHotelName={trip.hotels?.[0]?.hotelName}
                  isSelected={trip?.selectedHotel?.hotelName === hotel.hotelName}
                  onSelect={async (h) => {
                    try {
                      const isDeselect = trip?.selectedHotel?.hotelName === h.hotelName;
                      const response = await api.put(`/trips/${id}`, {
                        selectedHotel: isDeselect ? null : h
                      });
                      setTrip(prev => ({ ...prev, selectedHotel: response.data.selectedHotel }));
                      toast({
                        title: isDeselect ? "Hotel Removed" : "Hotel Booked",
                        description: isDeselect ? "Removed from itinerary highlight." : "This hotel is now marked as booked for all users.",
                        className: "bg-[#0a0a0a] text-white border-white/20"
                      });
                    } catch (err) {
                      toast({ title: "Error", description: "Failed to update hotel selection.", variant: "destructive" });
                    }
                  }}
                />
              ))}
            </div>
          </section>

          {/* Itinerary Section */}
          <section className="pt-8">
            <div className="mb-8 sm:mb-10">
              <h2 className="font-urbanist font-bold text-[28px] sm:text-[36px] tracking-tight text-white mb-2">
                🗓 Daily Itinerary Plan
              </h2>
              <p className="text-gray-400 font-inter text-[13px] sm:text-[15px]">
                Your personalized day-by-day adventure schedule
              </p>
            </div>

            <ItinerarySection 
              itinerary={trip.itinerary} 
              tripHotelName={trip.hotels?.[0]?.hotelName} 
              onCheckWeather={(placeName) => {
                const combined = `${placeName}, ${trip.destination?.split(',')[0] || ''}`;
                setWeatherLocation(combined);
                setWeatherModalOpen(true);
              }}
            />
          </section>



          {/* Weather Modal */}
          <WeatherModal
            isOpen={weatherModalOpen}
            onClose={() => setWeatherModalOpen(false)}
            locationName={weatherLocation}
          />

          {/* Floating AI Travel Assistant Widget */}
          <AITravelAssistant trip={trip} />
        </div>
      </div>
    </div>
  );
}
