import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Admin Login Component
 */
const Login = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/admin';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Small delay for UX
        await new Promise(resolve => setTimeout(resolve, 500));

        const success = await login(password);
        if (success) {
            navigate(from, { replace: true });
        } else {
            setError('Invalid password');
            setPassword('');
        }
        setIsLoading(false);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-bg)',
            padding: '2rem',
            position: 'relative',
            zIndex: 1
        }}>
            <div style={{
                background: 'var(--color-surface)',
                borderRadius: '16px',
                padding: '3rem',
                width: '100%',
                maxWidth: '400px',
                border: '1px solid var(--color-surface-hover)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                position: 'relative',
                zIndex: 2
            }}>
                <h1 style={{
                    fontSize: '1.75rem',
                    marginBottom: '0.5rem',
                    textAlign: 'center',
                    color: 'var(--color-text)',
                    background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-2) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                }}>
                    Admin Dashboard
                </h1>
                <p style={{
                    color: 'var(--color-text)',
                    opacity: 0.6,
                    textAlign: 'center',
                    marginBottom: '2rem'
                }}>
                    Enter your password to continue
                </p>

                <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 3 }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            autoFocus
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '8px',
                                border: error ? '1px solid #ef4444' : '1px solid var(--color-surface-hover)',
                                background: 'var(--color-bg)',
                                color: 'var(--color-text)',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'all 0.3s ease',
                                boxSizing: 'border-box',
                                position: 'relative',
                                zIndex: 4
                            }}
                        />
                        {error && (
                            <p style={{
                                color: '#ef4444',
                                fontSize: '0.875rem',
                                marginTop: '0.5rem'
                            }}>
                                {error}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !password}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: isLoading || !password
                                ? 'var(--color-surface-hover)'
                                : 'var(--color-accent)',
                            color: 'var(--color-bg)',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: isLoading || !password ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            zIndex: 4
                        }}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div style={{
                    marginTop: '2rem',
                    textAlign: 'center',
                    position: 'relative',
                    zIndex: 3
                }}>
                    <a
                        href="/"
                        style={{
                            color: 'var(--color-accent)',
                            textDecoration: 'none',
                            fontSize: '0.875rem'
                        }}
                    >
                        ← Back to Portfolio
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Login;
