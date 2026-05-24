import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";

function StarField() {
  const ref = useRef();

  // Create 2000 random star points coordinates positioned in a sphere/cube region
  const [positions] = useMemo(() => {
    const arr = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      const idx = i * 3;
      arr[idx] = (Math.random() - 0.5) * 10;
      arr[idx + 1] = (Math.random() - 0.5) * 10;
      arr[idx + 2] = (Math.random() - 0.5) * 10;
    }
    return [arr];
  }, []);

  // Animating the stars rotation smoothly using useFrame
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta * 0.04;
      ref.current.rotation.y -= delta * 0.03;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#00f5ff"
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.6}
        />
      </Points>
    </group>
  );
}

export default function ThreeBackground() {
  return (
    <div
      id="three-canvas-container"
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: -1 }}
    >
      <Canvas camera={{ position: [0, 0, 1] }}>
        <Suspense fallback={null}>
          <StarField />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Ensure Suspense handles loading fallback gracefully
import { Suspense } from "react";
