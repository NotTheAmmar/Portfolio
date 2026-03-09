import React, { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const NavigationArrows = () => {
    const [showUp, setShowUp] = useState(false);
    const [showDown, setShowDown] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

            // Show Up button if we are not at the very top (allow some buffer)
            setShowUp(scrollY > 100);

            // Show Down button if we are not at the very bottom
            setShowDown(scrollY < maxScroll - 100);
        };

        window.addEventListener('scroll', handleScroll);
        // Trigger once on mount
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (direction) => {
        const sections = document.querySelectorAll('.section');
        const currentScroll = window.scrollY + 10; // offset slightly to avoid rounding issues

        let targetSection = null;
        let minDiff = Infinity;

        for (let section of sections) {
            const offset = section.offsetTop;
            if (direction === 'down') {
                // Find standard next section
                if (offset > currentScroll) {
                    if (offset - currentScroll < minDiff) {
                        minDiff = offset - currentScroll;
                        targetSection = section;
                    }
                }
            } else if (direction === 'up') {
                // Find prev section
                if (offset < currentScroll - 10) {
                    if (currentScroll - offset < minDiff) {
                        minDiff = currentScroll - offset;
                        targetSection = section;
                    }
                }
            }
        }

        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div style={{
            position: 'fixed',
            right: '2rem',
            bottom: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            zIndex: 100
        }}>
            {showUp && (
                <button
                    onClick={() => scrollToSection('up')}
                    className="btn btn-primary"
                    style={{ padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    aria-label="Scroll Up"
                >
                    <ArrowUp size={20} />
                </button>
            )}
            {showDown && (
                <button
                    onClick={() => scrollToSection('down')}
                    className="btn btn-primary"
                    style={{ padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    aria-label="Scroll Down"
                >
                    <ArrowDown size={20} />
                </button>
            )}
        </div>
    );
};

export default NavigationArrows;
