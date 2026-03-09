const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Resolves the image/file path.
 * If the path starts with http/https, it returns it as is.
 * If the path starts with /uploads, it prepends the backend API_URL.
 * If the path is a local static path, it resolves it normally.
 *
 * @param {string} src - The image source path or URL.
 * @returns {string} - The resolved image path.
 */
export const resolveImage = (src) => {
    if (!src) return '';
    if (src.startsWith('http')) {
        return src;
    }
    if (src.startsWith('/uploads')) {
        return `${API_URL}${src}`;
    }
    // Handle Artifacts path mapping to public/images
    if (src.startsWith('Artifacts/')) {
        return src.replace('Artifacts/', '/images/');
    }
    // If it doesn't start with / and is not a URL, prepend / so it's treated as absolute from public
    if (!src.startsWith('/') && !src.startsWith('./') && !src.startsWith('../')) {
        return `/${src}`;
    }
    return src;
};
