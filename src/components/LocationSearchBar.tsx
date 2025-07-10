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
    <div className="relative w-full min-h-[48px] bg-gradient-hero overflow-hidden">
      {/* Animated Background Elements (copied from HeroSection) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-mesh opacity-30"></div>
        <div className="absolute top-4 left-4 w-24 h-24 bg-gradient-to-br from-[#E17726]/20 to-transparent rounded-full blur-2xl animate-float"></div>
        <div className="absolute top-10 right-4 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-transparent rounded-full blur-2xl animate-float animation-delay-300"></div>
      </div>
      <div className="relative flex flex-col sm:flex-row items-center gap-3 w-full max-w-3xl px-2 mx-auto py-1 z-10">
        <div className="flex items-center bg-white/80 backdrop-blur-md rounded-full px-3 py-1 gap-2 min-w-[120px]">
          <MapPin className="w-5 h-5 text-[#E17726]" />
          {locationDetected ? (
            <button
              className="font-semibold text-midnight focus:outline-none hover:underline"
              onClick={() => setUserPincode('')}
              title="Change location"
            >
              {userPincode}
            </button>
          ) : (
            <span className="text-gray-500 text-sm flex items-center">
              {isDetectingLocation ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Detecting...
            </span>
          )}
        </div>
        <form
          onSubmit={handleSearch}
          className="flex flex-1 items-center bg-white/80 backdrop-blur-md rounded-full px-3 py-1 gap-2 min-w-[200px]"
        >
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for doctors, specialties, e-centers..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent outline-none text-midnight placeholder-gray-400 text-base"
          />
          <button type="submit" className="focus:outline-none">
            <span className="sr-only">Search</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default LocationSearchBar; 