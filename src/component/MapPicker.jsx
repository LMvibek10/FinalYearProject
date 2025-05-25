import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, StandaloneSearchBox, DirectionsRenderer, InfoWindow } from '@react-google-maps/api';

const libraries = ['places'];

// Define garage locations around Nepal
const garageLocations = [
  {
    id: 'garage-1',
    name: 'RentEase Service Center - Baneshwor',
    lat: 27.6915,
    lng: 85.3436,
    address: 'Baneshwor, Kathmandu',
    services: ['Vehicle Maintenance', 'Emergency Repair', 'Fuel Service'],
    contact: '+977-1-4567890',
    hours: '24/7 Available'
  },
  {
    id: 'garage-2',
    name: 'RentEase Hub - Thamel',
    lat: 27.7151,
    lng: 85.3124,
    address: 'Thamel, Kathmandu',
    services: ['Vehicle Pickup/Drop', 'Quick Service', 'Customer Support'],
    contact: '+977-1-4567891',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'garage-3',
    name: 'RentEase Station - Lalitpur',
    lat: 27.6588,
    lng: 85.3247,
    address: 'Pulchowk, Lalitpur',
    services: ['Full Service Center', 'Vehicle Inspection', 'Parts Replacement'],
    contact: '+977-1-4567892',
    hours: '7:00 AM - 9:00 PM'
  },
  {
    id: 'garage-4',
    name: 'RentEase Point - Bhaktapur',
    lat: 27.6710,
    lng: 85.4298,
    address: 'Bhaktapur Durbar Square Area',
    services: ['Tourist Support', 'Vehicle Exchange', 'Local Assistance'],
    contact: '+977-1-4567893',
    hours: '8:00 AM - 8:00 PM'
  },
  {
    id: 'garage-5',
    name: 'RentEase Express - Ring Road',
    lat: 27.7000,
    lng: 85.3000,
    address: 'Ring Road, Kathmandu',
    services: ['Express Service', 'Highway Support', 'Emergency Response'],
    contact: '+977-1-4567894',
    hours: '24/7 Available'
  },
  {
    id: 'garage-6',
    name: 'RentEase Center - Damauli',
    lat: 27.9667,
    lng: 84.2833,
    address: 'Damauli, Tanahun',
    services: ['Regional Service Hub', 'Vehicle Maintenance', 'Tourist Support'],
    contact: '+977-65-560123',
    hours: '7:00 AM - 8:00 PM'
  },
  {
    id: 'garage-7',
    name: 'RentEase Station - Naubise',
    lat: 27.7333,
    lng: 85.1167,
    address: 'Naubise, Dhading',
    services: ['Highway Service', 'Emergency Repair', 'Fuel Service'],
    contact: '+977-10-560124',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'garage-8',
    name: 'RentEase Hub - Dudhauli',
    lat: 27.2833,
    lng: 85.1333,
    address: 'Dudhauli, Sindhuli',
    services: ['Regional Support', 'Vehicle Service', 'Parts Supply'],
    contact: '+977-47-560125',
    hours: '8:00 AM - 7:00 PM'
  },
  {
    id: 'garage-9',
    name: 'RentEase Point - Morang',
    lat: 26.6500,
    lng: 87.2833,
    address: 'Biratnagar, Morang',
    services: ['Eastern Regional Hub', 'Full Service Center', 'Customer Support'],
    contact: '+977-21-560126',
    hours: '6:00 AM - 9:00 PM'
  }
];

const MapPicker = ({ onLocationSelect, initialLocation, showUserLocation = true }) => {
  const [map, setMap] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userLocation] = useState({
    lat: 27.7041,
    lng: 85.3405,
    address: 'Old Baneshwor, Kathmandu, Nepal'
  });
  const [searchBox, setSearchBox] = useState(null);
  const [directions, setDirections] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [activeMarker, setActiveMarker] = useState(null);
  const [selectedGarage, setSelectedGarage] = useState(null);
  const [showGarages, setShowGarages] = useState(true);
  const searchInputRef = useRef(null);

  // Get current location on component mount
  useEffect(() => {
    if (navigator.geolocation && isLoaded) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          if (window.google && window.google.maps && !selectedLocation) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location }, (results, status) => {
              if (status === 'OK' && results[0]) {
                const newLocation = {
                  ...location,
                  address: results[0].formatted_address
                };
                setSelectedLocation(newLocation);
                onLocationSelect(newLocation);
              }
            });
          }
        },
        (error) => {
          console.error('Error getting current location:', error);
          // Fallback to Kathmandu if geolocation fails
          const defaultLocation = {
            lat: 27.7172,
            lng: 85.3240,
            address: 'Kathmandu, Nepal'
          };
          setSelectedLocation(defaultLocation);
          onLocationSelect(defaultLocation);
        }
      );
    }
  }, [isLoaded, onLocationSelect, selectedLocation]);

  const mapContainerStyle = {
    width: '100%',
    height: '300px',
    marginTop: '10px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const onLoad = useCallback((map) => {
    setMap(map);
    setIsLoaded(true);
  }, []);

  const onSearchBoxLoad = useCallback((ref) => {
    setSearchBox(ref);
  }, []);

  const calculateRoute = useCallback(() => {
    if (!userLocation || !selectedLocation || !window.google || !window.google.maps) return;

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: userLocation,
        destination: selectedLocation,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK') {
          setDirections(result);
          setIsNavigating(true);
        }
      }
    );
  }, [userLocation, selectedLocation]);

  const calculateRouteToGarage = useCallback((garage) => {
    if (!selectedLocation || !window.google || !window.google.maps) return;

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: selectedLocation,
        destination: { lat: garage.lat, lng: garage.lng },
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK') {
          setDirections(result);
          setIsNavigating(true);
        }
      }
    );
  }, [selectedLocation]);

  const onPlacesChanged = useCallback(() => {
    if (searchBox) {
      const places = searchBox.getPlaces();
      if (places && places.length > 0) {
        // Clear previous search results
        setSearchResults([]);
        
        // Process all search results
        const newSearchResults = places.map(place => ({
          id: place.place_id,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.formatted_address || place.name,
          name: place.name
        }));

        setSearchResults(newSearchResults);

        // Set the first result as selected location
        const firstResult = newSearchResults[0];
        setSelectedLocation(firstResult);
        onLocationSelect(firstResult);

        // Adjust map to show all results
        if (map && places.length > 0 && window.google && window.google.maps) {
          const bounds = new window.google.maps.LatLngBounds();
          places.forEach((place) => {
            if (place.geometry.viewport) {
              bounds.union(place.geometry.viewport);
            } else {
              bounds.extend(place.geometry.location);
            }
          });
          map.fitBounds(bounds);
          
          if (places.length === 1) {
            map.setZoom(15);
          }
        }

        setDirections(null);
        setIsNavigating(false);
      }
    }
  }, [searchBox, map, onLocationSelect]);

  const handleMapClick = useCallback((event) => {
    if (!window.google || !window.google.maps) return;

    const geocoder = new window.google.maps.Geocoder();
    const location = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };

    geocoder.geocode({ location }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const newLocation = {
          ...location,
          address: results[0].formatted_address
        };
        setSelectedLocation(newLocation);
        onLocationSelect(newLocation);
        setSearchResults([]); // Clear search results when clicking on map
        setDirections(null);
        setIsNavigating(false);
        setSelectedGarage(null); // Close garage info window
      }
    });
  }, [onLocationSelect]);

  const handleMarkerDrag = useCallback((event) => {
    if (!window.google || !window.google.maps) return;

    const geocoder = new window.google.maps.Geocoder();
    const location = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };

    geocoder.geocode({ location }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const newLocation = {
          ...location,
          address: results[0].formatted_address
        };
        setSelectedLocation(newLocation);
        onLocationSelect(newLocation);
        setSearchResults([]); // Clear search results when dragging marker
        setDirections(null);
        setIsNavigating(false);
      }
    });
  }, [onLocationSelect]);

  const handleSearchResultClick = useCallback((result) => {
    setSelectedLocation(result);
    onLocationSelect(result);
    setActiveMarker(result.id);
    
    if (map) {
      map.panTo({ lat: result.lat, lng: result.lng });
      map.setZoom(15);
    }
  }, [map, onLocationSelect]);

  const handleGarageClick = useCallback((garage) => {
    setSelectedGarage(garage);
    if (map) {
      map.panTo({ lat: garage.lat, lng: garage.lng });
      map.setZoom(16);
    }
  }, [map]);

  const handleGarageToggle = useCallback((e) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Stop event bubbling
    setShowGarages(!showGarages);
  }, [showGarages]);

  // Create garage icon only when Google Maps is loaded
  const getGarageIcon = useCallback(() => {
    if (!window.google || !window.google.maps) return null;
    
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="#FF6B35" stroke="#fff" stroke-width="2"/>
          <path d="M12 16h16v12H12V16z" fill="#fff"/>
          <path d="M14 18h12v2H14v-2z" fill="#FF6B35"/>
          <path d="M14 22h12v2H14v-2z" fill="#FF6B35"/>
          <path d="M16 26h8v2h-8v-2z" fill="#FF6B35"/>
          <circle cx="16" cy="14" r="2" fill="#fff"/>
          <circle cx="24" cy="14" r="2" fill="#fff"/>
        </svg>
      `),
      scaledSize: new window.google.maps.Size(40, 40),
      anchor: new window.google.maps.Point(20, 40)
    };
  }, []);

  // Create standard marker icons only when Google Maps is loaded
  const getMarkerIcon = useCallback((color, size = 40) => {
    if (!window.google || !window.google.maps) return null;
    
    return {
      url: `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
      scaledSize: new window.google.maps.Size(size, size)
    };
  }, []);

  return (
    <div className="map-picker-container">
      <LoadScript
        googleMapsApiKey="AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg"
        libraries={libraries}
      >
        <div className="search-box-container">
          <StandaloneSearchBox
            onLoad={onSearchBoxLoad}
            onPlacesChanged={onPlacesChanged}
          >
            <input
              type="text"
              placeholder="Search location..."
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                marginBottom: '10px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              ref={searchInputRef}
            />
          </StandaloneSearchBox>

          {/* Garage Toggle Button */}
          <div style={{ marginBottom: '10px' }}>
            <button
              type="button"
              onClick={handleGarageToggle}
              style={{
                padding: '8px 16px',
                backgroundColor: showGarages ? '#FF6B35' : '#6B7280',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {showGarages ? '🏢 Hide Service Centers' : '🏢 Show Service Centers'}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div style={{
              maxHeight: '200px',
              overflowY: 'auto',
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
              marginBottom: '10px'
            }}>
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleSearchResultClick(result)}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #eee',
                    backgroundColor: activeMarker === result.id ? '#e3f2fd' : 'white',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={() => setActiveMarker(result.id)}
                  onMouseLeave={() => setActiveMarker(null)}
                >
                  <div style={{ fontWeight: 'bold' }}>{result.name}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{result.address}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={selectedLocation || userLocation}
          zoom={15}
          onLoad={onLoad}
          onClick={handleMapClick}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: true,
          }}
        >
          {isLoaded && window.google && window.google.maps && (
            <>
              {/* Show all search result markers */}
              {searchResults.map((result) => (
                <Marker
                  key={result.id}
                  position={{ lat: result.lat, lng: result.lng }}
                  icon={getMarkerIcon(activeMarker === result.id ? 'blue' : 'red')}
                  onClick={() => handleSearchResultClick(result)}
                  animation={activeMarker === result.id ? window.google.maps.Animation.BOUNCE : null}
                />
              ))}

              {/* Show selected location marker if no search results */}
              {searchResults.length === 0 && selectedLocation && (
                <Marker
                  position={selectedLocation}
                  draggable={true}
                  onDragEnd={handleMarkerDrag}
                  icon={getMarkerIcon('red')}
                />
              )}

              {/* Always show base location marker */}
              {showUserLocation && userLocation && (
                <Marker
                  position={userLocation}
                  icon={getMarkerIcon('green')}
                />
              )}

              {/* Show garage markers */}
              {showGarages && garageLocations.map((garage) => (
                <Marker
                  key={garage.id}
                  position={{ lat: garage.lat, lng: garage.lng }}
                  icon={getGarageIcon()}
                  onClick={() => handleGarageClick(garage)}
                  title={garage.name}
                />
              ))}

              {/* Show garage info window */}
              {selectedGarage && (
                <InfoWindow
                  position={{ lat: selectedGarage.lat, lng: selectedGarage.lng }}
                  onCloseClick={() => setSelectedGarage(null)}
                >
                  <div style={{ maxWidth: '250px', padding: '10px' }}>
                    <h3 style={{ margin: '0 0 8px 0', color: '#FF6B35', fontSize: '16px' }}>
                      {selectedGarage.name}
                    </h3>
                    <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                      📍 {selectedGarage.address}
                    </p>
                    <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                      📞 {selectedGarage.contact}
                    </p>
                    <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                      🕒 {selectedGarage.hours}
                    </p>
                    <div style={{ marginTop: '8px' }}>
                      <strong style={{ fontSize: '14px', color: '#333' }}>Services:</strong>
                      <ul style={{ margin: '4px 0', paddingLeft: '16px', fontSize: '12px' }}>
                        {selectedGarage.services.map((service, index) => (
                          <li key={index} style={{ color: '#666' }}>{service}</li>
                        ))}
                      </ul>
                    </div>
                    {selectedLocation && (
                      <button
                        onClick={() => calculateRouteToGarage(selectedGarage)}
                        style={{
                          marginTop: '8px',
                          padding: '6px 12px',
                          backgroundColor: '#FF6B35',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          width: '100%'
                        }}
                      >
                        Get Directions
                      </button>
                    )}
                  </div>
                </InfoWindow>
              )}

              {directions && <DirectionsRenderer directions={directions} />}
            </>
          )}
        </GoogleMap>

        <div style={{ marginTop: '10px' }}>
          {showUserLocation && userLocation && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault(); // Prevent form submission
                calculateRoute();
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: isNavigating ? '#4CAF50' : '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              {isNavigating ? 'Route Shown' : 'Show Route'}
            </button>
          )}
        </div>

        {selectedLocation && (
          <div className="selected-location" style={{
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            <p style={{ margin: '5px 0' }}>Selected Location: {selectedLocation.address}</p>
            <p style={{ margin: '5px 0' }}>Latitude: {selectedLocation.lat.toFixed(6)}</p>
            <p style={{ margin: '5px 0' }}>Longitude: {selectedLocation.lng.toFixed(6)}</p>
          </div>
        )}

        {showUserLocation && userLocation && (
          <div className="user-location" style={{
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#e3f2fd',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            <p style={{ margin: '5px 0' }}>Base Location: {userLocation.address}</p>
            <p style={{ margin: '5px 0' }}>Latitude: {userLocation.lat.toFixed(6)}</p>
            <p style={{ margin: '5px 0' }}>Longitude: {userLocation.lng.toFixed(6)}</p>
          </div>
        )}

        {/* Garage Legend */}
        {showGarages && (
          <div style={{
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#fff3e0',
            borderRadius: '4px',
            fontSize: '14px',
            border: '1px solid #FF6B35'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
              <span style={{ marginRight: '8px', fontSize: '16px' }}>🏢</span>
              <strong style={{ color: '#FF6B35' }}>RentEase Service Centers ({garageLocations.length} locations)</strong>
            </div>
            <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
              Click on any service center marker to view details and get directions. Now covering Kathmandu Valley, Damauli, Naubise, Dudhauli, and Morang.
            </p>
          </div>
        )}
      </LoadScript>
    </div>
  );
};

export default React.memo(MapPicker); 