import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Satellite } from '../types';

interface OrbitVisualizerProps {
  satellites: Satellite[];
}

/**
 * Advanced 3D orbital visualization component
 * 
 * Features:
 * - Real Earth texture with proper lighting
 * - Animated satellite orbits with realistic physics
 * - Interactive camera controls
 * - Satellite labels and orbit paths
 * - Earth rotation animation
 */
export function OrbitVisualizer({ satellites }: OrbitVisualizerProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Clear previous renderer
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1e8);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(600, 600);
    mountRef.current.appendChild(renderer.domElement);

    // Camera controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;

    // Lighting setup
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 2, 3);
    scene.add(directionalLight);

    const earthRadius = 6371000; // Earth radius in meters

    // Earth mesh with texture
    const earthGeometry = new THREE.SphereGeometry(earthRadius, 64, 64);
    const fallbackMaterial = new THREE.MeshPhongMaterial({
      color: 0x2266dd,
      side: THREE.FrontSide,
    });
    const earth = new THREE.Mesh(earthGeometry, fallbackMaterial);
    earth.renderOrder = 1;
    scene.add(earth);

    // Load Earth texture
    new THREE.TextureLoader().load(
      '/EarthTexture.png',
      (earthTexture) => {
        earth.material = new THREE.MeshPhongMaterial({
          map: earthTexture,
          specular: new THREE.Color(0x333333),
          shininess: 10,
          side: THREE.FrontSide,
        });
        earth.material.needsUpdate = true;
      },
      undefined,
      (error) => {
        console.error('Error loading Earth texture:', error);
      }
    );

    // Orbit line material
    const orbitLineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      depthTest: true,
      depthWrite: true,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      side: THREE.FrontSide,
    });

    // Physics constants
    const G = 6.67430e-11;
    const M = 5.972e24;
    const omegaEarth = 2 * Math.PI / 86164; // Earth rotation speed
    const earthRotationSpeed = 0.0002;      // Visual rotation speed

    // Satellite groups and animation data
    const satelliteGroups: THREE.Group[] = [];
    const labelSprites: THREE.Sprite[] = [];
    const satelliteAngularSpeeds: number[] = [];
    const satelliteInitialAngles: number[] = [];

    // Create satellites with global staggered positioning
    satellites.forEach((satellite, satelliteIndex) => {
      const group = new THREE.Group();

      // Convert altitude to orbital radius
      const orbitalRadius = satellite.altitudeKm * 1000 + earthRadius;

      // Create orbit path
      const orbitPoints: THREE.Vector3[] = [];
      const segments = 360;
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * 2 * Math.PI;
        orbitPoints.push(new THREE.Vector3(
          orbitalRadius * Math.cos(angle),
          0,
          orbitalRadius * Math.sin(angle)
        ));
      }
      const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
      const orbitLine = new THREE.LineLoop(orbitGeometry, orbitLineMaterial);
      orbitLine.renderOrder = 2;
      group.add(orbitLine);

      // Satellite mesh
      const satGeometry = new THREE.SphereGeometry(300000, 16, 16);
      const satMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        depthTest: true,
        depthWrite: true,
      });
      const mesh = new THREE.Mesh(satGeometry, satMaterial);
      mesh.renderOrder = 3;
      group.add(mesh);

      // Satellite label
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const context = canvas.getContext('2d')!;
      context.font = 'Bold 32px Arial';
      context.fillStyle = 'white';
      context.fillText(satellite.name, 10, 40);
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(1000000, 250000, 1);
      group.add(sprite);
      labelSprites.push(sprite);

      // Apply inclination
      const inclination = satellite.inclinationDeg * (Math.PI / 180);
      group.rotation.x = inclination;

      // Calculate staggered initial angle for all satellites
      // This creates a more natural distribution across all orbits
      const initialAngle = (satelliteIndex / satellites.length) * 2 * Math.PI;
      satelliteInitialAngles.push(initialAngle);

      scene.add(group);
      satelliteGroups.push(group);

      // Calculate orbital speed
      const v = Math.sqrt(G * M / orbitalRadius);
      const omegaSat = v / orbitalRadius;
      const scaledOmega = omegaSat * (earthRotationSpeed / omegaEarth);
      satelliteAngularSpeeds.push(scaledOmega);
    });

    // Position camera
    const maxRadius = Math.max(...satellites.map(s => s.altitudeKm * 1000 + earthRadius));
    camera.position.set(0, maxRadius * 1.5, maxRadius * 1.5);
    camera.lookAt(0, 0, 0);

    // Animation loop
    let angle = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();

      // Rotate Earth
      earth.rotation.y += earthRotationSpeed;

      // Animate satellites with staggered positioning
      satelliteGroups.forEach((group, i) => {
        angle += satelliteAngularSpeeds[i];
        const orbitalRadius = satellites[i].altitudeKm * 1000 + earthRadius;
        const currentAngle = angle + satelliteInitialAngles[i];
        const x = orbitalRadius * Math.cos(currentAngle);
        const z = orbitalRadius * Math.sin(currentAngle);
        const mesh = group.children.find(obj => obj instanceof THREE.Mesh) as THREE.Mesh;
        const label = labelSprites[i];
        mesh.position.set(x, 0, z);
        label.position.set(x, -500000, z);
      });

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      if (mountRef.current?.firstChild) {
        mountRef.current.removeChild(mountRef.current.firstChild);
      }
    };
  }, [satellites]);

  return <div ref={mountRef} />;
}
