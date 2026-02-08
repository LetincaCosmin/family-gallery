"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useMemo } from "react";

/* Floating particle field */
function Particles() {
  const ref = useRef();

  const positions = useMemo(() => {
    const arr = new Float32Array(4000 * 3);
    for (let i = 0; i < arr.length; i++) {
      arr[i] = (Math.random() - 0.5) * 25;
    }
    return arr;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    ref.current.rotation.y = t * 0.02;
    ref.current.rotation.x = Math.sin(t * 0.15) * 0.1;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial
  transparent
  color="#ffffff"
  size={0.03}
  sizeAttenuation
  depthWrite={false}
  opacity={0.20}
/>
    </Points>
  );
}

export default function ThreeBackground() {
  return (
    <div className="bg-3d-canvas">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.25} />
        <pointLight position={[5, 5, 5]} intensity={0.35} color="#ffffff" />
        <Particles />
      </Canvas>
    </div>
  );
}

