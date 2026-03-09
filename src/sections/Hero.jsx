import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Preload } from '@react-three/drei';
import CanvasLoader from '../canvas/CanvasLoader';
import HeroObject from '../canvas/HeroObject';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Hero = ({ data }) => {
    // Safely access data
    const { name, label, image, summary, location, profiles } = data.profileInformation;
    const navigate = useNavigate();
    const [clickCount, setClickCount] = React.useState(0);
    const clickTimeoutRef = React.useRef(null);

    const handleNameClick = () => {
        setClickCount(prev => {
            const newCount = prev + 1;
            if (newCount >= 5) {
                navigate('/admin/login');
                return 0; // Reset after trigger
            }
            return newCount;
        });

        // Reset the counter if they don't click 5 times within 2 seconds
        if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = setTimeout(() => {
            setClickCount(0);
        }, 2000);
    };

    return (
        <section className="section" style={{ minHeight: '100vh', padding: 0 }}>
            {/* Background/Canvas */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
                <Canvas
                    camera={{ position: [0, 0, 5], fov: 45 }}
                    gl={{ preserveDrawingBuffer: true }}
                >
                    <Suspense fallback={<CanvasLoader />}>
                        <OrbitControls enableZoom={false} autoRotate />
                        <ambientLight intensity={0.5} />
                        <directionalLight position={[10, 10, 5]} intensity={2} />
                        <HeroObject />
                        <Preload all />
                    </Suspense>
                </Canvas>
            </div>

            {/* Content Overlay */}
            <div className="container" style={{
                position: 'absolute',
                bottom: '10%',
                left: '5%',
                zIndex: 1,
                pointerEvents: 'none'
            }}>
                <div style={{ pointerEvents: 'auto', maxWidth: '600px' }}>
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        {name && (
                            <h1 
                                className="text-gradient" 
                                style={{ fontSize: '4rem', lineHeight: 1.1, cursor: 'pointer', userSelect: 'none', display: 'inline-block' }}
                                onClick={handleNameClick}
                            >
                                {name.toUpperCase()}
                            </h1>
                        )}
                        {label && <h2 style={{ color: 'var(--color-text)', marginTop: '1rem' }}>{label}</h2>}

                        {/* Show admin notice if using default data */}
                        {name === 'Your Name' && (
                            <div style={{
                                marginTop: '2rem',
                                padding: '1rem',
                                background: 'rgba(245, 158, 11, 0.2)',
                                borderRadius: '8px',
                                border: '1px solid rgba(245, 158, 11, 0.5)'
                            }}>
                                <p style={{ color: '#f59e0b', margin: 0, fontSize: '1rem' }}>
                                    👋 <strong>Welcome!</strong> Your portfolio is empty. Go to <a href="/admin/login" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>/admin</a> to add your content.
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </section >
    );
};

export default Hero;
