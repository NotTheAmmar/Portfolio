import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';

const HeroObject = (props) => {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;

            // Pulse effect
            const scale = 2 + Math.sin(state.clock.getElapsedTime() * 2) * 0.2;
            meshRef.current.scale.set(scale, scale, scale);
        }
    });

    return (
        <Float floatIntensity={2} speed={2}>
            <mesh
                {...props}
                ref={meshRef}
                scale={2}
            >
                <icosahedronGeometry args={[1, 15]} />
                <MeshDistortMaterial
                    color="#00f3ff"
                    speed={2}
                    distort={0.4}
                    radius={1}
                    wireframe={true}
                />
            </mesh>
        </Float>
    );
};

export default HeroObject;
