'use client';

import {useEffect, useRef, useState} from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {MapPin} from 'lucide-react';
import {Button} from '@/components/ui/button';

interface MapContainerProps {
    initialViewState?: {
        latitude: number;
        longitude: number;
        zoom?: number;
    };
    markers?: Array<{
        id: string;
        latitude: number;
        longitude: number;
        title?: string;
        color?: string;
    }>;
    onMapClick?: (e: maplibregl.MapLayerMouseEvent) => void;
    onMarkerClick?: (markerId: string) => void;
    className?: string;
    interactive?: boolean;
    showCurrentLocation?: boolean;
}

export function MapContainer({
                                 initialViewState = {
                                     latitude: 0,
                                     longitude: 0,
                                     zoom: 2,
                                 },
                                 markers = [],
                                 onMapClick,
                                 onMarkerClick,
                                 className = 'h-[400px] w-full rounded-lg border',
                                 interactive = true,
                                 showCurrentLocation = true,
                             }: MapContainerProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const [currentLocation, setCurrentLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initialize map
    useEffect(() => {
        if (!mapContainer.current) return;

        try {
            // Set default view if no initial view is provided
            const {latitude, longitude, zoom} = initialViewState;

            map.current = new maplibregl.Map({
                container: mapContainer.current,
                style: 'https://tiles.stadiamaps.com/styles/osm_bright.json',
                center: [longitude, latitude],
                zoom: zoom,
                interactive,
            });

            // Add navigation control
            map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

            // Add geolocate control if enabled
            if (showCurrentLocation) {
                const geolocate = new maplibregl.GeolocateControl({
                    positionOptions: {
                        enableHighAccuracy: true,
                    },
                    trackUserLocation: true,
                });

                map.current.addControl(geolocate);

                // Try to get current location
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            setCurrentLocation({
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude,
                            });

                            // Center map on user's location if no initial view is set
                            if (initialViewState.latitude === 0 && initialViewState.longitude === 0) {
                                map.current?.flyTo({
                                    center: [position.coords.longitude, position.coords.latitude],
                                    zoom: 14,
                                });
                            }
                        },
                        (err) => {
                            console.warn('Error getting location:', err);
                            setError('Unable to retrieve your location');
                        }
                    );
                }
            }

            // Add click handler if provided
            if (onMapClick) {
                map.current.on('click', onMapClick);
            }

            // Clean up on unmount
            return () => {
                if (map.current) {
                    if (onMapClick) {
                        map.current.off('click', onMapClick);
                    }
                    map.current.remove();
                    map.current = null;
                }
            };
        } catch (err) {
            console.error('Error initializing map:', err);
            setError('Failed to load map. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Add markers to the map
    useEffect(() => {
        if (!map.current || !markers.length) return;

        const markersList: maplibregl.Marker[] = [];

        markers.forEach((marker) => {
            const el = document.createElement('div');
            el.className = 'marker';
            el.innerHTML = `
        <div class="relative">
          <div class="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          ${marker.title ? `
            <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-white rounded shadow-md text-xs whitespace-nowrap">
              ${marker.title}
            </div>
          ` : ''}
        </div>
      `;

            const markerInstance = new maplibregl.Marker({
                element: el,
                anchor: 'bottom',
            })
                .setLngLat([marker.longitude, marker.latitude])
                .addTo(map.current!);

            if (onMarkerClick) {
                el.addEventListener('click', (e) => {
                    e.stopPropagation();
                    onMarkerClick(marker.id);
                });
            }

            markersList.push(markerInstance);
        });

        return () => {
            markersList.forEach((marker) => marker.remove());
        };
    }, [markers, onMarkerClick]);

    // Add current location marker
    useEffect(() => {
        if (!map.current || !currentLocation) return;

        const el = document.createElement('div');
        el.className = 'current-location-marker';
        el.innerHTML = `
      <div class="relative">
        <div class="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
        <div class="absolute -inset-1 bg-green-500 rounded-full opacity-40 animate-ping"></div>
      </div>
    `;

        const marker = new maplibregl.Marker({
            element: el,
            anchor: 'center',
        })
            .setLngLat([currentLocation.longitude, currentLocation.latitude])
            .addTo(map.current);

        return () => {
            marker.remove();
        };
    }, [currentLocation]);

    // Add fly-to-current-location button
    const flyToCurrentLocation = () => {
        if (currentLocation && map.current) {
            map.current.flyTo({
                center: [currentLocation.longitude, currentLocation.latitude],
                zoom: 14,
            });
        } else if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });

                    map.current?.flyTo({
                        center: [position.coords.longitude, position.coords.latitude],
                        zoom: 14,
                    });
                },
                (err) => {
                    console.warn('Error getting location:', err);
                    setError('Unable to retrieve your location');
                }
            );
        }
    };

    return (
        <div className={`relative ${className}`}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 z-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-50/90 z-10 p-4">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            <div ref={mapContainer} className="h-full w-full"/>

            {showCurrentLocation && (
                <Button
                    onClick={flyToCurrentLocation}
                    variant="outline"
                    size="icon"
                    className="absolute bottom-4 right-4 z-10 bg-white shadow-md hover:bg-gray-50"
                    aria-label="Center on my location"
                >
                    <MapPin className="h-5 w-5"/>
                </Button>
            )}
        </div>
    );
}
