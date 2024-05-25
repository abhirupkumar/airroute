// src/components/MapWithRoute.js
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, CircleMarker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issues with webpack
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadowUrl from 'leaflet/dist/images/marker-shadow.png';
import StepConnector from './StepConnector';
import { haversineDistance, travelTime } from '../lib/utils';
import airports from '../data/airports.json';

L.Marker.prototype.options.icon = L.icon({
    iconUrl,
    shadowUrl: iconShadowUrl,
});

const planeIcon = new L.Icon({
    iconUrl: './icons/airplane.png',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

const PLANE_SPEED_KMH = 903; // Plane speed in km/h
const REFRESH_INTERVAL_MS = 60000; // Refresh interval of 1 minute

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

const calculateTime = (distance, speed) => {
    return distance / speed; // Time in hours
};

const MapWithRoute = ({ routesData }) => {
    const [routes, setRoutes] = useState(routesData);
    const mapRef = useRef();
    const [planePosition, setPlanePosition] = useState([routes[0].Latitude, routes[0].Longitude]);
    const [currentRouteIndex, setCurrentRouteIndex] = useState(0);
    const [isDestReached, setIsDestReached] = useState(false);
    const airportsData = airports["airports"];
    const [departureTime, setDepartureTime] = useState(Date.now());

    useEffect(() => {
        setRoutes(routesData);
        setPlanePosition([routesData[0].Latitude, routesData[0].Longitude]);
    }, [routesData]);

    useEffect(() => {
        if (mapRef.current && routes.length > 0) {
            const firstRoute = routes[0];
            mapRef.current.setView([firstRoute.Latitude, firstRoute.Longitude], 3);
        }
    }, [routes]);

    useEffect(() => {
        let intervalId;

        const updatePlanePosition = async () => {
            if (routes.length > 1 && !isDestReached) {
                const currentRoute = routes[currentRouteIndex];
                const nextRoute = routes[currentRouteIndex + 1];
                const distance = calculateDistance(currentRoute.Latitude, currentRoute.Longitude, nextRoute.Latitude, nextRoute.Longitude);
                const timeInHours = calculateTime(distance, PLANE_SPEED_KMH);
                const timeInMinutes = timeInHours * 60;
                const elapsedMinutes = (Date.now() - departureTime) / 60000;
                if (timeInMinutes - elapsedMinutes <= 15) {
                    try {
                        const fetchedData = await fetch(`https://airnavigation.onrender.com/shortest_path?start=${nextRoute.id}&end=${routes[routes.length - 1].id}&prev=${routes[0].id}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                "Access-Control-Allow-Origin": "*"
                            },
                            body: JSON.stringify({ start: nextRoute.id, end: routes[routes.length - 1].id })
                        });
                        const response = await fetchedData.json();
                        const newRoutes = airportsData.filter((airport) => response.route.includes(airport.id));
                        const sortedRoutes = response.route.map((id) => newRoutes.find((route) => route.id === id));
                        setRoutes(sortedRoutes);
                        setCurrentRouteIndex(0); // Reset index to start from the new route
                        setPlanePosition([nextRoute.Latitude, nextRoute.Longitude]);
                        setDepartureTime(Date.now());
                    } catch (error) {
                        console.error('Failed to fetch new routes:', error);
                    }
                } else {
                    setTimeout(() => {
                        setCurrentRouteIndex(currentRouteIndex + 1);
                        setPlanePosition([nextRoute.Latitude, nextRoute.Longitude]);
                    }, timeInMinutes * 60000);
                }

                intervalId = setInterval(() => {
                    const currentTime = new Date().getTime();
                    const timeElapsed = (currentTime - intervalId) / 60000; // Time elapsed in minutes
                    if (timeElapsed >= timeInMinutes - 15) {
                        clearInterval(intervalId);
                        updatePlanePosition();
                    }
                }, REFRESH_INTERVAL_MS);
            }
        };

        updatePlanePosition();

        if (currentRouteIndex === routes.length - 1) {
            setIsDestReached(true);
            clearInterval(intervalId);
        }

        return () => clearInterval(intervalId);
    }, [routes, currentRouteIndex, isDestReached]);

    const routeLatLngs = routes.map(route => [route.Latitude, route.Longitude]);

    return (
        <div className="relative w-full h-96 z-30">
            <MapContainer
                center={routeLatLngs.length ? routeLatLngs[0] : [0, 0]}
                zoom={2}
                style={{ width: '100%', height: '100%' }}
                ref={mapRef}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />
                {routes.map((route) => (
                    <CircleMarker
                        key={route.id}
                        center={[route.Latitude, route.Longitude]}
                        radius={5}
                        fillColor="#00FFAB"
                        color="#00FF28"
                        fillOpacity={1}
                    >
                        <span>{route.name}</span>
                    </CircleMarker>
                ))}
                {routeLatLngs.length > 1 && (
                    <Polyline
                        positions={routeLatLngs}
                        color="#00FF28"
                        weight={3}
                    />
                )}
                {planePosition && (
                    <Marker position={planePosition} icon={planeIcon} />
                )}
            </MapContainer>
            {routes && <StepConnector steps={routes} />}
        </div>
    );
};

export default MapWithRoute;