/**
 * Sorting utility for portfolio data
 * Implements specific sorting rules for each section type
 */

// Helper to parse dates safely
const parseDate = (dateStr) => {
    if (!dateStr || dateStr.toLowerCase() === 'present') return new Date();
    return new Date(dateStr);
};

// Helper for string comparison (case-insensitive)
const compareString = (a, b) => {
    return (a || '').toString().localeCompare((b || '').toString(), undefined, { sensitivity: 'base' });
};

// Helper for date comparison (newest first / descending)
const compareDate = (a, b) => {
    const dateA = parseDate(a);
    const dateB = parseDate(b);
    return dateB - dateA;
};


const comparators = {
    profiles: (a, b) => compareString(a.network, b.network),
    work: (a, b) => {
        const endDiff = compareDate(a.endDate, b.endDate);
        if (endDiff !== 0) return endDiff;

        const startDiff = compareDate(a.startDate, b.startDate);
        if (startDiff !== 0) return startDiff;

        return compareString(a.name || a.company, b.name || b.company);
    },
    education: (a, b) => {
        const endDiff = compareDate(a.endDate, b.endDate);
        if (endDiff !== 0) return endDiff;

        const startDiff = compareDate(a.startDate, b.startDate);
        if (startDiff !== 0) return startDiff;

        return compareString(a.institution, b.institution);
    },
    skills: (a, b) => {
        const levelDiff = compareString(a.level, b.level);
        if (levelDiff !== 0) return levelDiff;
        return compareString(a.name, b.name);
    },
    projects: (a, b) => {
        const dateA = a.endDate || a.startDate;
        const dateB = b.endDate || b.startDate;
        const dateDiff = compareDate(dateA, dateB);
        if (dateDiff !== 0) return dateDiff;
        return compareString(a.name, b.name);
    },
    awards: (a, b) => {
        const dateDiff = compareDate(a.date, b.date);
        if (dateDiff !== 0) return dateDiff;
        return compareString(a.title, b.title);
    },
    certificates: (a, b) => {
        const dateDiff = compareDate(a.date, b.date);
        if (dateDiff !== 0) return dateDiff;
        return compareString(a.name, b.name);
    },
    publications: (a, b) => {
        const dateDiff = compareDate(a.releaseDate, b.releaseDate);
        if (dateDiff !== 0) return dateDiff;
        return compareString(a.name, b.name);
    },
    languages: (a, b) => {
        const fluencyDiff = compareString(a.fluency, b.fluency);
        if (fluencyDiff !== 0) return fluencyDiff;
        return compareString(a.language, b.language);
    },
    volunteer: (a, b) => {
        const endDiff = compareDate(a.endDate, b.endDate);
        if (endDiff !== 0) return endDiff;

        const startDiff = compareDate(a.startDate, b.startDate);
        if (startDiff !== 0) return startDiff;

        return compareString(a.organization, b.organization);
    },
    interests: (a, b) => compareString(a.name, b.name),
    references: (a, b) => compareString(a.name, b.name)
};

export const sortPortfolioData = (data) => {
    if (!data) return data;

    const sorted = { ...data };

    // Handle sections present in comparators
    Object.keys(comparators).forEach(key => {
        if (key === 'profiles') {
            // Special handling for profiles nested in profileInformation
            if (sorted.profileInformation?.profiles) {
                sorted.profileInformation.profiles = [...sorted.profileInformation.profiles].sort(comparators.profiles);
            }
            // Legacy/fallback
            if (sorted.basics?.profiles) {
                sorted.basics.profiles = [...sorted.basics.profiles].sort(comparators.profiles);
            }
        } else if (sorted[key]) {
            sorted[key] = [...sorted[key]].sort(comparators[key]);

            // Special handling: Sort keywords within skills
            if (key === 'skills') {
                sorted.skills = sorted.skills.map(skill => ({
                    ...skill,
                    keywords: skill.keywords ? [...skill.keywords].sort((a, b) => compareString(a, b)) : []
                }));
            }
        }
    });

    return sorted;
};

export const getSectionComparator = (sectionKey) => {
    return comparators[sectionKey] || ((a, b) => 0);
};

// Deprecated but kept for backward compatibility if needed, though getSectionComparator is preferred
export const sortSectionItems = (sectionKey, items) => {
    const comparator = getSectionComparator(sectionKey);
    return [...items].sort(comparator);
};
