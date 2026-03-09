/**
 * Data Filter Utility
 * Filters data.json based on selection.json for Resume or CV
 */

/**
 * Filter portfolio data based on selection configuration
 * @param {Object} data - The full data.json object
 * @param {Object} selection - The selection config for resume or cv
 * @returns {Object} Filtered data object
 */
export const PROFILE_FIELDS = ['name', 'label', 'image', 'email', 'phone', 'url', 'summary', 'location'];

/**
 * Filter portfolio data based on selection configuration
 * @param {Object} data - The full data.json object
 * @param {Object} selection - The selection config for resume or cv
 * @returns {Object} Filtered data object
 */
export function filterData(data, selection) {
    const filtered = {};

    // 1. Handle Profile Information (Object)
    if (selection.profileInformation && selection.profileInformation.length > 0) {
        filtered.profileInformation = {};
        selection.profileInformation.forEach(index => {
            if (index < PROFILE_FIELDS.length) {
                const key = PROFILE_FIELDS[index];
                if (data.profileInformation && data.profileInformation[key] !== undefined) {
                    filtered.profileInformation[key] = data.profileInformation[key];
                }
            }
        });
    } else {
        // Fallback: If no selection defined (legacy), include everything
        filtered.profileInformation = { ...(data.profileInformation || data.basics || {}) };
    }

    // 2. Handle Social Profiles (special case: nested in profileInformation but selected separately)
    // We treat 'profiles' as a top-level selection key, but the data lives in profileInformation.profiles
    if (data.profileInformation && data.profileInformation.profiles) {
        if (selection.profiles) {
            filtered.profileInformation.profiles = selection.profiles
                .filter(index => index < data.profileInformation.profiles.length)
                .map(index => data.profileInformation.profiles[index]);
        } else if (!selection.profileInformation) {
            // If legacy (no selection keys), keep all profiles as they were copied in step 1
        } else {
            // New system, but no profiles selected -> empty array
            filtered.profileInformation.profiles = [];
        }
    }

    // 3. Handle Array Sections
    const sections = ['work', 'education', 'skills', 'projects', 'awards', 'certificates', 'publications', 'volunteer', 'languages', 'interests', 'references'];

    sections.forEach(section => {
        if (data[section] && selection[section]) {
            filtered[section] = selection[section]
                .filter(index => index < data[section].length)
                .map(index => data[section][index]);
        } else if (data[section]) {
            // If section exists in data but not in selection, include empty array
            filtered[section] = [];
        }
    });

    return filtered;
}

/**
 * Get the sections to display in order
 * @param {Object} selection - The selection config
 * @returns {Array} Array of section names in order
 */
export function getOrderedSections(selection) {
    return selection.sections || [];
}
