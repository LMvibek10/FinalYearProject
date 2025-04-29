import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, StandaloneSearchBox, DirectionsRenderer } from '@react-google-maps/api';

const libraries = ['places'];

const MapPicker = ({ onLocationSelect, initialLocation, showUserLocation = true }) => {
  const [map, setMap] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || {
    lat: 27.7172,
    lng: 85.3240,
    address: 'Kathmandu, Nepal'
  });
  const [userLocation, setUserLocation] = useState(null);
  const [searchBox, setSearchBox] = useState(null);
  const [directions, setDirections] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [activeMarker, setActiveMarker] = useState(null);
  const searchInputRef = useRef(null);

  const mapContainerStyle = {
    width: '100%',
    height: '300px',
    marginTop: '10px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  // Get user's current location only if showUserLocation is true
  const getUserLocation = useCallback(() => {
    if (showUserLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          
          if (isLoaded && window.google) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location }, (results, status) => {
              if (status === 'OK' && results[0]) {
                setUserLocation({
                  ...location,
                  address: results[0].formatted_address
                });
              }
            });
          }
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    }
  }, [isLoaded, showUserLocation]);

  useEffect(() => {
    if (isLoaded) {
      getUserLocation();
    }
  }, [isLoaded, getUserLocation]);

  const onLoad = useCallback((map) => {
    setMap(map);
    setIsLoaded(true);
  }, []);

  const onSearchBoxLoad = useCallback((ref) => {
    setSearchBox(ref);
  }, []);

  const calculateRoute = useCallback(() => {
    if (!userLocation || !selectedLocation || !window.google) return;

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
        if (map && places.length > 0) {
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
    if (!window.google) return;

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
      }
    });
  }, [onLocationSelect]);

  const handleMarkerDrag = useCallback((event) => {
    if (!window.google) return;

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
          center={selectedLocation}
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
          {isLoaded && (
            <>
              {/* Show all search result markers */}
              {searchResults.map((result) => (
                <Marker
                  key={result.id}
                  position={{ lat: result.lat, lng: result.lng }}
                  icon={{
                    url: activeMarker === result.id 
                      ? 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                      : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                    scaledSize: new window.google.maps.Size(40, 40)
                  }}
                  onClick={() => handleSearchResultClick(result)}
                  animation={activeMarker === result.id ? window.google.maps.Animation.BOUNCE : null}
                />
              ))}

              {/* Show selected location marker if no search results */}
              {searchResults.length === 0 && (
                <Marker
                  position={selectedLocation}
                  draggable={true}
                  onDragEnd={handleMarkerDrag}
                  icon={{
                    url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                    scaledSize: new window.google.maps.Size(40, 40)
                  }}
                />
              )}

              {/* Always show user location marker */}
              {showUserLocation && userLocation && (
                <Marker
                  position={userLocation}
                  icon={{
                    url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                    scaledSize: new window.google.maps.Size(40, 40)
                  }}
                />
              )}

              {directions && <DirectionsRenderer directions={directions} />}
            </>
          )}
        </GoogleMap>

        <div style={{ marginTop: '10px' }}>
          {showUserLocation && userLocation && (
            <button
              onClick={calculateRoute}
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
              {isNavigating ? 'Route Shown' : 'Navigate Me'}
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
            <p style={{ margin: '5px 0' }}>Your Location: {userLocation.address}</p>
            <p style={{ margin: '5px 0' }}>Latitude: {userLocation.lat.toFixed(6)}</p>
            <p style={{ margin: '5px 0' }}>Longitude: {userLocation.lng.toFixed(6)}</p>
          </div>
        )}
      </LoadScript>
    </div>
  );
};

export default React.memo(MapPicker); 