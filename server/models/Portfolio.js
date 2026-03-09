const mongoose = require('mongoose');

// --- Sub-Schemas ---

const LocationSchema = new mongoose.Schema({
    address: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    city: { type: String, trim: true },
    countryCode: { type: String, trim: true }, // e.g., 'IN', 'US'
    region: { type: String, trim: true }        // State/Province
}, { _id: false });

const ProfileSchema = new mongoose.Schema({
    network: { type: String, trim: true },
    username: { type: String, trim: true },
    url: { type: String, trim: true }
}, { _id: false });

const WorkSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    position: { type: String, trim: true },
    url: { type: String, trim: true },
    startDate: { type: String }, // YYYY-MM-DD
    endDate: { type: String }, // YYYY-MM-DD or empty for current
    summary: { type: String, trim: true },
    highlights: [{ type: String, trim: true }],
    location: { type: String, trim: true }
});

const VolunteerSchema = new mongoose.Schema({
    organization: { type: String, trim: true },
    position: { type: String, trim: true },
    url: { type: String, trim: true },
    startDate: { type: String },
    endDate: { type: String },
    summary: { type: String, trim: true },
    highlights: [{ type: String, trim: true }],
    location: { type: String, trim: true }
});

const EducationSchema = new mongoose.Schema({
    institution: { type: String, trim: true },
    url: { type: String, trim: true },
    area: { type: String, trim: true },
    studyType: { type: String, trim: true }, // e.g., 'Bachelor'
    startDate: { type: String },
    endDate: { type: String },
    score: { type: String, trim: true },
    courses: [{ type: String, trim: true }],
    location: { type: String, trim: true },
    description: { type: String, trim: true }
});

const AwardSchema = new mongoose.Schema({
    title: { type: String, trim: true },
    date: { type: String },
    awarder: { type: String, trim: true },
    summary: { type: String, trim: true }
});

const CertificateSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    date: { type: String },
    issuer: { type: String, trim: true },
    url: { type: String, trim: true } // Can be external link or local upload path
});

const PublicationSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    publisher: { type: String, trim: true },
    releaseDate: { type: String },
    url: { type: String, trim: true },
    summary: { type: String, trim: true }
});

const SkillSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    level: { type: String, trim: true }, // e.g. 'Advanced', 'Intermediate'
    keywords: [{ type: String, trim: true }],
    description: { type: String, trim: true }
});

const LanguageSchema = new mongoose.Schema({
    language: { type: String, trim: true },
    fluency: { type: String, trim: true }
});

const InterestSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    keywords: [{ type: String, trim: true }]
});

const ReferenceSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    reference: { type: String, trim: true }
});

const ProjectSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    description: { type: String, trim: true },
    highlights: [{ type: String, trim: true }],
    keywords: [{ type: String, trim: true }],
    startDate: { type: String },
    endDate: { type: String },
    url: { type: String, trim: true }, // Live demo
    github: { type: String, trim: true }, // Source code
    roles: [{ type: String, trim: true }],
    type: { type: String, trim: true }, // e.g. 'Mobile Application'
    images: [{ type: String, trim: true }], // Upload paths or URLs
    location: { type: String, trim: true }
});

// --- Main Portfolio Schema ---

const portfolioSchema = new mongoose.Schema({
    // RENAMED from 'basics' to 'profileInformation'
    profileInformation: {
        name: { type: String, trim: true },
        label: { type: String, trim: true },
        image: { type: String, trim: true }, // Path to uploaded image
        email: { type: String, trim: true },
        phone: { type: String, trim: true },
        url: { type: String, trim: true },
        resumeUrl: { type: String, trim: true },
        cvUrl: { type: String, trim: true },
        summary: { type: String, trim: true },
        location: LocationSchema,
        profiles: [ProfileSchema]
    },
    work: [WorkSchema],
    volunteer: [VolunteerSchema],
    education: [EducationSchema],
    awards: [AwardSchema],
    certificates: [CertificateSchema],
    publications: [PublicationSchema],
    skills: [SkillSchema],
    languages: [LanguageSchema],
    interests: [InterestSchema],
    references: [ReferenceSchema],
    projects: [ProjectSchema]
}, {
    timestamps: true,
    collection: 'portfolios' // Explicit collection name
});

module.exports = mongoose.model('Portfolio', portfolioSchema);
