import { useQuery } from '@tanstack/react-query';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, Line } from '@react-three/drei';
import { useState } from 'react';
import { api } from '../services/api';

function Earth() {
  return (
    <Sphere args={[1, 32, 32]}>
      <meshStandardMaterial color="#4A90E2" />
    </Sphere>
  );
}

function SatelliteOrbit({ satellite }: { satellite: any }) {
  const [hovered, setHovered] = useState(false);
  
  if (!satellite.position) return null;

  // Scale down the position for visualization
  const scale = 0.001;
  const position: [number, number, number] = [
    satellite.position.x * scale,
    satellite.position.y * scale,
    satellite.position.z * scale,
  ];

  return (
    <mesh
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[0.01, 8, 8]} />
      <meshStandardMaterial 
        color={hovered ? "#ff6b6b" : "#ffd93d"} 
        emissive={hovered ? "#ff6b6b" : "#ffd93d"}
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

function SatelliteTrail({ satellite }: { satellite: any }) {
  if (!satellite.position || !satellite.velocity) return null;

  // Create a simple trail by extending the position in the velocity direction
  const scale = 0.001;
  const position: [number, number, number] = [
    satellite.position.x * scale,
    satellite.position.y * scale,
    satellite.position.z * scale,
  ];

  const velocity: [number, number, number] = [
    satellite.velocity.x * scale * 100,
    satellite.velocity.y * scale * 100,
    satellite.velocity.z * scale * 100,
  ];

  const endPosition: [number, number, number] = [
    position[0] + velocity[0],
    position[1] + velocity[1],
    position[2] + velocity[2],
  ];

  return (
    <Line
      points={[position, endPosition]}
      color="#ffd93d"
      lineWidth={2}
      transparent
      opacity={0.6}
    />
  );
}

export function SituationalPicture() {
  const { data: satellites, isLoading } = useQuery({
    queryKey: ['satellites'],
    queryFn: api.getSatellites,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-space-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Situational Picture</h1>
        <div className="text-sm text-gray-400">
          {satellites?.length || 0} satellites tracked
        </div>
      </div>

      <div className="card h-96">
        <Canvas camera={{ position: [0, 0, 3], fov: 75 }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Earth />
          {satellites?.map((satellite: any) => (
            <SatelliteOrbit key={satellite.id} satellite={satellite} />
          ))}
          {satellites?.map((satellite: any) => (
            <SatelliteTrail key={`trail-${satellite.id}`} satellite={satellite} />
          ))}
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        </Canvas>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {satellites?.map((satellite: any) => (
          <div key={satellite.id} className="card">
            <h3 className="font-semibold text-white">{satellite.name}</h3>
            <p className="text-sm text-gray-400">NORAD ID: {satellite.noradId || 'N/A'}</p>
            {satellite.position && (
              <div className="mt-2 text-xs text-gray-500">
                <p>Position: ({satellite.position.x.toFixed(2)}, {satellite.position.y.toFixed(2)}, {satellite.position.z.toFixed(2)}) km</p>
                <p>Last Updated: {new Date(satellite.lastUpdated).toLocaleString()}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
