import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, MapPin, Loader2, Search } from 'lucide-react';

// Custom Map Marker Icon
const customIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map clicks and marker movement
function LocationMarker({ position, setPosition, onLocationSelected }) {
  const map = useMap();

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationSelected(lat, lng);
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, 16);
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position} icon={customIcon} />
  );
}

export default function MapPicker({ onAddressResolved, initialCoordinates }) {
  // Default coordinates (Hyderabad, Telangana / India)
  const defaultPosition = initialCoordinates
    ? [initialCoordinates.lat, initialCoordinates.lng]
    : [17.3850, 78.4867];

  const [position, setPosition] = useState(defaultPosition);
  const [isLocating, setIsLocating] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Reverse geocode with OpenStreetMap Nominatim
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const details = {
          lat,
          lng,
          formattedAddress: data.display_name,
          street: addr.road || addr.suburb || '',
          area: addr.neighbourhood || addr.suburb || addr.residential || '',
          city: addr.city || addr.town || addr.county || 'Hyderabad',
          pincode: addr.postcode || '',
        };
        setResolvedAddress(data.display_name);
        if (onAddressResolved) {
          onAddressResolved(details);
        }
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
    }
  };

  // GPS Current Location Detection
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        reverseGeocode(latitude, longitude);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLocating(false);
        alert('Could not retrieve GPS location. Please select on the map or enter your address.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Search location on map
  const handleSearchLocation = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setPosition([lat, lon]);
        reverseGeocode(lat, lon);
      } else {
        alert('Location not found. Please try a different landmark or area.');
      }
    } catch (err) {
      console.warn('Search error:', err);
    }
  };

  return (
    <div className="space-y-3">
      {/* Top Controls: GPS & Search */}
      <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
        <form onSubmit={handleSearchLocation} className="flex-1 w-full relative">
          <input
            type="text"
            placeholder="Search area, landmark or street on map..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-[#FFF9F2] border border-[#EEDDC9] rounded-xl pl-8 pr-16 py-2.5 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
          />
          <Search className="w-3.5 h-3.5 text-[#7B4B29] absolute left-2.5 top-3 pointer-events-none" />
          <button
            type="submit"
            className="absolute right-1 top-1 bottom-1 px-3 bg-[#3D2314] text-white text-[10px] font-bold rounded-lg hover:bg-[#5C3419] transition-colors"
          >
            Locate
          </button>
        </form>

        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={isLocating}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-[#FFF3E7] hover:bg-[#FAD2E1]/60 text-[#3D2314] border border-[#EEDDC9] px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs"
        >
          {isLocating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#7B4B29]" />
              <span>Detecting GPS...</span>
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4 text-[#D68C98]" />
              <span>Use Current GPS Location</span>
            </>
          )}
        </button>
      </div>

      {/* Interactive Map */}
      <div className="h-64 sm:h-72 w-full rounded-2xl overflow-hidden border border-[#EEDDC9] relative shadow-inner">
        <MapContainer
          center={position}
          zoom={15}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            position={position}
            setPosition={setPosition}
            onLocationSelected={(lat, lng) => reverseGeocode(lat, lng)}
          />
        </MapContainer>

        {/* Pin instruction pill */}
        <div className="absolute top-2 left-2 z-20 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] font-semibold text-[#3D2314] shadow-md border border-[#EEDDC9] flex items-center gap-1.5 pointer-events-none">
          <MapPin className="w-3.5 h-3.5 text-red-500" />
          <span>Tap anywhere on the map to pin your exact delivery door</span>
        </div>
      </div>

      {/* Resolved Address feedback */}
      {resolvedAddress && (
        <div className="bg-[#FFF9F2] p-2.5 rounded-xl border border-[#EEDDC9] text-xs text-[#5C3419] flex items-start gap-2">
          <MapPin className="w-4 h-4 text-[#D68C98] flex-shrink-0 mt-0.5" />
          <p className="line-clamp-2">
            <strong>Pinned Location:</strong> {resolvedAddress}
          </p>
        </div>
      )}
    </div>
  );
}
