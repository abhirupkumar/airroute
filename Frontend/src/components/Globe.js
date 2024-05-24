// src/Globe.js
import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useTexture, Html, Line } from '@react-three/drei';
import * as THREE from 'three';

const cities = [
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
    { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
    { name: 'New York', lat: 40.7128, lng: -74.0060 },
    { name: 'London', lat: 51.5074, lng: -0.1278 },
    { name: 'Paris', lat: 48.8566, lng: 2.3522 },
    { name: 'Tokyo', lat: 35.6895, lng: 139.6917 },
    { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
    { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
    { name: 'Cairo', lat: 30.0444, lng: 31.2357 },
    { name: 'Moscow', lat: 55.7558, lng: 37.6173 },
    { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 },
    { name: 'Beijing', lat: 39.9042, lng: 116.4074 },
    { name: 'Delhi', lat: 28.7041, lng: 77.1025 },
    { name: 'Singapore', lat: 1.3521, lng: 103.8198 },
    { name: 'Dubai', lat: 25.2048, lng: 55.2708 },
];

const arcs = [
    { from: 'Kolkata', to: 'New York', scalar: 3.5 },
    { from: 'New York', to: 'Rio de Janeiro' },
    { from: 'Dubai', to: 'Mumbai' },
    { from: 'Delhi', to: 'Singapore' },
    { from: 'Singapore', to: 'Beijing' },
    { from: 'Los Angeles', to: 'Paris', scalar: 3.2 },
    { from: 'Paris', to: 'Tokyo', scalar: 3.2 },
    { from: 'Sydney', to: 'Los Angeles', scalar: 3.3 },
    { from: 'Cairo', to: 'Moscow' },
];

const convertLatLngToVector3 = (lat, lng, radius = 2) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
};

const Globe = () => {
    const globeRef = useRef();
    const texture = useTexture('./earth-day.jpg');

    useFrame(() => {
        globeRef.current.rotation.y += 0.001;
    });

    const getCityPosition = (cityName) => {
        const city = cities.find(c => c.name === cityName);
        if (!city) return new THREE.Vector3();
        return convertLatLngToVector3(city.lat, city.lng);
    };

    const CityLabel = ({ name, position }) => {
        const { camera } = useThree();
        const labelRef = useRef();

        useFrame(() => {
            const label = labelRef.current;
            if (!label) return;

            const distance = camera.position.distanceTo(position);
            const isVisible = distance < 5;

            label.style.display = isVisible ? 'block' : 'none';
        });

        return (
            <Html ref={labelRef} position={[0, 0.1, 0]} center>
                <div style={{ color: 'white', fontSize: '0.5em', textAlign: 'center' }}>{name}</div>
            </Html>
        );
    };

    return (
        <group ref={globeRef}>
            <mesh>
                <sphereGeometry args={[2, 32, 32]} />
                <meshStandardMaterial map={texture} />
            </mesh>
            {cities.map((city) => {
                const { name, lat, lng } = city;
                const pos = convertLatLngToVector3(lat, lng);
                return (
                    <group key={name} position={pos}>
                        <CityLabel name={name} position={pos} />
                        <mesh position={[0, -0.05, 0]}>
                            <sphereGeometry args={[0.03, 16, 16]} />
                            <meshStandardMaterial color="red" />
                        </mesh>
                    </group>
                );
            })}
            {arcs.map((arc, index) => {
                const start = getCityPosition(arc.from);
                const end = getCityPosition(arc.to);

                const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
                midPoint.normalize();
                midPoint.multiplyScalar(arc.scalar ?? 2.5); // Adjust the scalar value to lift the arc above the globe

                const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);
                const points = curve.getPoints(50);

                return (
                    <Line
                        key={index}
                        points={points}
                        color="white"
                        lineWidth={1}
                        dashed={false}
                    />
                );
            })}
        </group>
    );
};

const ResponsiveCanvas = ({ children }) => {
    return (
        <div className="lg:h-[100vh] h-[50vh]">
            <Canvas style={{ height: '100%' }}>
                {children}
            </Canvas>
        </div>
    );
};

const App = () => {
    return (
        <ResponsiveCanvas>
            <ambientLight intensity={1} />
            <pointLight position={[10, 10, 10]} />
            <Suspense fallback={<Html center>Loading The Globe...</Html>}>
                <Globe />
            </Suspense>
            <OrbitControls enableZoom={false} />
        </ResponsiveCanvas>
    );
};

export default App;