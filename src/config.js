// Portfolio Configuration
// Update these values for your deployment

export const config = {
    // Your portfolio website URL (will be shown on Resume/CV)
    PORTFOLIO_URL: 'https://your-portfolio-url.com',

    // Admin password hash check - set VITE_ADMIN_PASSWORD env variable
    // For development, you can use any password
    ADMIN_PASSWORD: import.meta.env.VITE_ADMIN_PASSWORD || 'admin123',

    // API URL for fetching images
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
};
