import React, { createContext, useContext, useState, useEffect } from 'react';
import { config } from '../config';
import api from '../api/client';

const AuthContext = createContext(null);

/**
 * Authentication Provider
 * Simple password-based auth for admin dashboard
 */
export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if already authenticated via localStorage
        const authToken = localStorage.getItem('portfolio_admin_auth');
        if (authToken === 'authenticated') {
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const login = async (password) => {
        try {
            await api.login(password);
            localStorage.setItem('portfolio_admin_auth', 'authenticated');
            localStorage.setItem('admin_password', password);
            setIsAuthenticated(true);
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('portfolio_admin_auth');
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
