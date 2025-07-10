import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, Loader2 } from 'lucide-react';

const LocationSearchBar = () => {
  const [userPincode, setUserPincode] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    detectUserLocation();
  }, []);

  const detectUserLocation = async () => {
    setIsDetectingLocation(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            await getPincodeFromCoordinates(latitude, longitude);
          },
          async () => {
            await detectLocationByIP();
          }
        );
      } else {
        await detectLocationByIP();
      }
    } catch (error) {
      setIsDetectingLocation(false);
    }
  };

  const detectLocationByIP = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      if (data.postal) {
        setUserPincode(data.postal);
        setLocationDetected(true);
      }
    } catch (error) {
      // fallback: do nothing
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const getPincodeFromCoordinates = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=YOUR_API_KEY&countrycode=in`
      );
      const data = await response.json();
      if (data.results && data.results[0]) {
        const components = data.results[0].components;
        const pincode = components.postcode || components.pincode;
        if (pincode) {
          setUserPincode(pincode);
          setLocationDetected(true);
        }
      }
    } catch (error) {
      await detectLocationByIP();
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim() || userPincode) {
      navigate(`/find-doctors?search=${encodeURIComponent(searchTerm)}&pincode=${encodeURIComponent(userPincode)}`);
    }
  };

  return (
    <div className="relative w-full bg-gradient-hero overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-mesh opacity-30"></div>
        <div className="absolute top-2 left-2 w-20 h-20 bg-gradient-to-br from-[#E17726]/20 to-transparent rounded-full blur-2xl animate-float"></div>
        <div className="absolute top-6 right-2 w-28 h-28 bg-gradient-to-br from-cyan-400/20 to-transparent rounded-full blur-2xl animate-float animation-delay-300"></div>
      </div>
      
      <div className="relative max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3 z-10">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
          {/* Location Pincode */}
          <div className="flex items-center bg-white/90 backdrop-blur-md rounded-full px-3 py-2 gap-2 min-w-[140px] sm:min-w-[160px] border border-white/20">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#E17726] flex-shrink-0" />
            {locationDetected ? (
              <button
                className="font-semibold text-midnight focus:outline-none hover:underline text-sm sm:text-base truncate"
                onClick={() => setUserPincode('')}
                title="Change location"
              >
                {userPincode}
              </button>
            ) : (
              <span className="text-gray-500 text-sm sm:text-base flex items-center truncate">
                {isDetectingLocation ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin mr-1 flex-shrink-0" /> : null}
                Detecting...
              </span>
            )}
          </div>
          
          {/* Search Form */}
          <form
            onSubmit={handleSearch}
            className="flex flex-1 items-center bg-white/90 backdrop-blur-md rounded-full px-3 py-2 gap-2 min-w-0 w-full sm:w-auto border border-white/20"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search for doctors, specialties, e-centers..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-midnight placeholder-gray-400 text-sm sm:text-base min-w-0"
            />
            <button 
              type="submit" 
              className="bg-gradient-orange text-white p-1.5 sm:p-2 rounded-full hover:scale-105 transition-transform duration-200 flex-shrink-0"
              aria-label="Search"
            >
              <Search className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LocationSearchBar; 