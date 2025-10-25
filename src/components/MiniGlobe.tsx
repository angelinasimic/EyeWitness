import React, { useEffect, useRef } from 'react';
import { Satellite } from '../types';
import * as THREE from 'three';

interface MiniGlobeProps {
  satellites: Satellite[];
}

/**
 * Minimal Three.js globe with satellite points
 * Simplified positioning - no SGP4 propagation
 */
export function MiniGlobe({ satellites }: MiniGlobeProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();

  useEffect(() => {
    if (!mountRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(75, 400 / 300, 0.1, 1000);
    camera.position.z = 3;
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(400, 300);
    renderer.setClearColor(0x000011);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create Earth sphere
    const earthGeometry = new THREE.SphereGeometry(1, 32, 32);
    const earthMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x4a90e2,
      transparent: true,
      opacity: 0.8
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Add basic lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Simple animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      earth.rotation.y += 0.005;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;

    // Remove existing satellite points
    const existingPoints = sceneRef.current.children.filter(child => 
      child.userData.isSatellite
    );
    existingPoints.forEach(point => sceneRef.current!.remove(point));

    // Add satellite points (simplified positioning)
    satellites.forEach((sat, index) => {
      // Simple approximation: spread satellites around Earth
      const angle = (index / satellites.length) * Math.PI * 2;
      const radius = 1.2 + (sat.altitudeKm / 1000) * 0.1; // Scale altitude
      
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = Math.sin(index) * 0.3; // Add some height variation

      const geometry = new THREE.SphereGeometry(0.02, 8, 8);
      const material = new THREE.MeshBasicMaterial({ color: 0xff6b6b });
      const point = new THREE.Mesh(geometry, material);
      
      point.position.set(x, y, z);
      point.userData.isSatellite = true;
      point.userData.satellite = sat;
      
      sceneRef.current!.add(point);
    });
  }, [satellites]);

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '4px',
      overflow: 'hidden',
      backgroundColor: '#000'
    }}>
      <div ref={mountRef} style={{ width: '400px', height: '300px' }} />
      <div style={{ 
        padding: '10px', 
        backgroundColor: '#f8f9fa', 
        fontSize: '12px',
        color: '#666'
      }}>
        {satellites.length} satellites tracked • Simplified positioning
      </div>
    </div>
  );
}