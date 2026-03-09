import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

const ParticleField = ({ theme }) => {
    const count = 500;
    const mesh = useRef();

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.01 + Math.random() / 200;
            const x = (Math.random() - 0.5) * 50;
            const y = (Math.random() - 0.5) * 50;
            const z = (Math.random() - 0.5) * 50;

            temp.push({ t, factor, speed, x, y, z, mx: 0, my: 0 });
        }
        return temp;
    }, [count]);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame(() => {
        particles.forEach((particle, i) => {
            let { t, factor, speed, x, y, z } = particle;

            // Movement logic
            t = particle.t += speed / 2;
            const a = Math.cos(t) + Math.sin(t * 1) / 10;
            const b = Math.sin(t) + Math.cos(t * 2) / 10;
            const s = Math.cos(t);

            // Update position
            dummy.position.set(
                (particle.x += Math.cos(t) * 0.01) + (Math.sin(t) * factor) / 10,
                (particle.y += Math.sin(t) * 0.01) + (Math.cos(t) * factor) / 10,
                (particle.z += Math.cos(t) * 0.01) + (Math.sin(t) * factor) / 10
            );

            // Wrap around
            if (particle.y > 25) particle.y = -25;
            if (particle.y < -25) particle.y = 25;

            dummy.scale.set(s, s, s);
            dummy.rotation.set(s * 5, s * 5, s * 5);
            dummy.updateMatrix();

            mesh.current.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    const particleColor = theme === 'light' ? '#0284c7' : '#00f3ff';
    const particleOpacity = theme === 'light' ? 0.8 : 0.4;

    return (
        <instancedMesh ref={mesh} args={[null, null, count]}>
            <dodecahedronGeometry args={[0.05, 0]} />
            <meshBasicMaterial color={particleColor} transparent opacity={particleOpacity} />
        </instancedMesh>
    );
};

const ParticleBackground = () => {
    const { theme } = useTheme();

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            pointerEvents: 'none',
            background: 'transparent'
        }}>
            <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <ParticleField theme={theme} />
            </Canvas>
        </div>
    );
};

export default ParticleBackground;
