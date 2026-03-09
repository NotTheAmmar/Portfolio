import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Hero from './sections/Hero';
import About from './sections/About';
import Projects from './sections/Projects';
import Experience from './sections/Experience';
import Education from './sections/Education';
import Achievements from './sections/Achievements';
import Interests from './sections/Interests';
import References from './sections/References';
import Dashboard from './components/Admin/Dashboard';
import Login from './components/Admin/Login';
import ProtectedRoute from './components/Admin/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { sortPortfolioData } from './utils/sorter';
import api from './api/client';

import NavigationArrows from './components/NavigationArrows';
import ParticleBackground from './components/ParticleBackground';
import ThemeToggle from './components/ThemeToggle';

function App() {
    const [data, setData] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const portfolioData = await api.getPortfolio();
                setData(portfolioData);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                color: 'white'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: '4px solid rgba(255,255,255,0.2)',
                        borderTop: '4px solid #f59e0b',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }} />
                    <p>Loading portfolio...</p>
                    <style>{`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                color: 'white',
                padding: '2rem'
            }}>
                <div style={{ textAlign: 'center', maxWidth: '500px' }}>
                    <h1 style={{ color: '#ef4444', marginBottom: '1rem' }}>Error Loading Portfolio</h1>
                    <p style={{ marginBottom: '1rem' }}>{error}</p>
                    <p style={{ fontSize: '0.875rem', color: '#888' }}>
                        Make sure the backend server is running: <code>npm run server</code>
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '1rem',
                            padding: '0.75rem 1.5rem',
                            background: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Sort data for Website Display
    const sortedData = sortPortfolioData(data);

    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <div className="app-wrapper">
                        <ThemeToggle />
                        <ParticleBackground />
                        <NavigationArrows />
                        <Routes>
                            <Route path="/" element={
                                <main>
                                    <Hero data={sortedData} />
                                    <About data={sortedData} />
                                    <Experience data={sortedData} />
                                    <Education data={sortedData} />
                                    <Projects data={sortedData} />
                                    <Achievements data={sortedData} />
                                    <Interests data={sortedData} />
                                    <References data={sortedData} />
                                </main>
                            } />
                            <Route path="/admin/login" element={<Login />} />
                            <Route path="/admin" element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            } />
                        </Routes>
                    </div>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
