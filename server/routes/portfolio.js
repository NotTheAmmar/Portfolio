const express = require('express');
const router = express.Router();
const Portfolio = require('../models/Portfolio');
const authMiddleware = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

// GET /api/portfolio - Get all portfolio data
router.get('/', async (req, res) => {
    try {
        let portfolio = await Portfolio.findOne();

        // If no portfolio exists, create empty one with default basics
        if (!portfolio) {
            portfolio = new Portfolio({
                profileInformation: {
                    name: 'Your Name',
                    label: 'Your Title',
                    email: 'you@example.com',
                    phone: '(123) 456-7890',
                    summary: 'Add your professional summary here. Go to /admin to edit.',
                    location: {
                        city: 'Your City',
                        region: 'Your State',
                        countryCode: 'US'
                    },
                    profiles: []
                },
                work: [],
                education: [],
                skills: [],
                projects: [],
                awards: [],
                certificates: [],
                publications: [],
                volunteer: [],
                languages: []
            });
            await portfolio.save();
        }

        res.json(portfolio);
    } catch (error) {
        console.error('Error fetching portfolio:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/portfolio/basics - Update basic info
// Note: Kept route as /basics for potential frontend compatibility, but updates profileInformation
router.put('/basics', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();
        if (!portfolio) {
            return res.status(404).json({ error: 'Portfolio not found' });
        }

        const updates = req.body;

        const deleteOldFile = (oldPath, newPath) => {
            if (oldPath && oldPath !== newPath) {
                let filename = null;
                if (oldPath.startsWith('/uploads/')) filename = oldPath.replace('/uploads/', '');
                if (oldPath.startsWith('/images/')) filename = oldPath.replace('/images/', '');
                
                if (filename) {
                    const absolutePath = path.join(__dirname, '../../public/uploads', filename);
                    if (fs.existsSync(absolutePath)) {
                        try {
                            fs.unlinkSync(absolutePath);
                        } catch (err) {
                            console.error('Failed to delete old file:', err);
                        }
                    }
                }
            }
        };

        if (updates.name !== undefined) portfolio.profileInformation.name = updates.name;
        if (updates.label !== undefined) portfolio.profileInformation.label = updates.label;
        
        if (updates.image !== undefined) {
            deleteOldFile(portfolio.profileInformation.image, updates.image);
            portfolio.profileInformation.image = updates.image;
        }
        if (updates.resumeUrl !== undefined) {
            deleteOldFile(portfolio.profileInformation.resumeUrl, updates.resumeUrl);
            portfolio.profileInformation.resumeUrl = updates.resumeUrl;
        }
        if (updates.cvUrl !== undefined) {
            deleteOldFile(portfolio.profileInformation.cvUrl, updates.cvUrl);
            portfolio.profileInformation.cvUrl = updates.cvUrl;
        }
        if (updates.email !== undefined) portfolio.profileInformation.email = updates.email;
        if (updates.phone !== undefined) portfolio.profileInformation.phone = updates.phone;
        if (updates.url !== undefined) portfolio.profileInformation.url = updates.url;
        if (updates.summary !== undefined) portfolio.profileInformation.summary = updates.summary;

        // Handle nested location carefully
        if (updates.location) {
            if (!portfolio.profileInformation.location) {
                portfolio.profileInformation.location = {};
            }
            if (updates.location.city !== undefined) portfolio.profileInformation.location.city = updates.location.city;
            if (updates.location.region !== undefined) portfolio.profileInformation.location.region = updates.location.region;
            if (updates.location.countryCode !== undefined) portfolio.profileInformation.location.countryCode = updates.location.countryCode;
            if (updates.location.postalCode !== undefined) portfolio.profileInformation.location.postalCode = updates.location.postalCode;
            if (updates.location.address !== undefined) portfolio.profileInformation.location.address = updates.location.address;
        }

        await portfolio.save();

        res.json(portfolio);
    } catch (error) {
        console.error('Error updating profile information:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// === PROFILES (Social Media) ===
router.post('/profiles', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();
        portfolio.profileInformation.profiles.push(req.body);
        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/profiles/:index', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();
        const index = parseInt(req.params.index);

        if (index < 0 || index >= portfolio.profileInformation.profiles.length) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        portfolio.profileInformation.profiles[index] = { ...portfolio.profileInformation.profiles[index].toObject(), ...req.body };
        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/profiles/:index', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();
        const index = parseInt(req.params.index);

        if (index < 0 || index >= portfolio.profileInformation.profiles.length) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        portfolio.profileInformation.profiles.splice(index, 1);
        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === WORK EXPERIENCE ===
router.post('/work', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();
        portfolio.work.push(req.body);
        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/work/:index', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();
        const index = parseInt(req.params.index);

        if (index < 0 || index >= portfolio.work.length) {
            return res.status(404).json({ error: 'Work item not found' });
        }

        portfolio.work[index] = { ...portfolio.work[index].toObject(), ...req.body };
        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/work/:index', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();
        const index = parseInt(req.params.index);

        if (index < 0 || index >= portfolio.work.length) {
            return res.status(404).json({ error: 'Work item not found' });
        }

        portfolio.work.splice(index, 1);
        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === EDUCATION ===
router.post('/education', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();
        portfolio.education.push(req.body);
        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/education/:index', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();
        const index = parseInt(req.params.index);

        if (index < 0 || index >= portfolio.education.length) {
            return res.status(404).json({ error: 'Education item not found' });
        }

        portfolio.education[index] = { ...portfolio.education[index].toObject(), ...req.body };
        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/education/:index', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();
        const index = parseInt(req.params.index);

        if (index < 0 || index >= portfolio.education.length) {
            return res.status(404).json({ error: 'Education item not found' });
        }

        portfolio.education.splice(index, 1);
        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === SKILLS ===
router.post('/skills', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();
        portfolio.skills.push(req.body);
        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/skills/:index', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();
        const index = parseInt(req.params.index);

        if (index < 0 || index >= portfolio.skills.length) {
            return res.status(404).json({ error: 'Skill item not found' });
        }

        portfolio.skills[index] = { ...portfolio.skills[index].toObject(), ...req.body };
        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/skills/:index', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();
        const index = parseInt(req.params.index);

        if (index < 0 || index >= portfolio.skills.length) {
            return res.status(404).json({ error: 'Skill item not found' });
        }

        portfolio.skills.splice(index, 1);
        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === PROJECTS ===
router.post('/projects', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();
        portfolio.projects.push(req.body);
        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/projects/:index', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();
        const index = parseInt(req.params.index);

        if (index < 0 || index >= portfolio.projects.length) {
            return res.status(404).json({ error: 'Project not found' });
        }

        portfolio.projects[index] = { ...portfolio.projects[index].toObject(), ...req.body };
        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/projects/:index', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();
        const index = parseInt(req.params.index);

        if (index < 0 || index >= portfolio.projects.length) {
            return res.status(404).json({ error: 'Project not found' });
        }

        portfolio.projects.splice(index, 1);
        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === AWARDS ===
router.post('/awards', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();
        portfolio.awards.push(req.body);
        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/awards/:index', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();
        const index = parseInt(req.params.index);

        if (index < 0 || index >= portfolio.awards.length) {
            return res.status(404).json({ error: 'Award not found' });
        }

        portfolio.awards[index] = { ...portfolio.awards[index].toObject(), ...req.body };
        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/awards/:index', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();
        const index = parseInt(req.params.index);

        if (index < 0 || index >= portfolio.awards.length) {
            return res.status(404).json({ error: 'Award not found' });
        }

        portfolio.awards.splice(index, 1);
        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === CERTIFICATES ===
router.post('/certificates', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();
        portfolio.certificates.push(req.body);
        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/certificates/:index', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();
        const index = parseInt(req.params.index);

        if (index < 0 || index >= portfolio.certificates.length) {
            return res.status(404).json({ error: 'Certificate not found' });
        }

        portfolio.certificates[index] = { ...portfolio.certificates[index].toObject(), ...req.body };
        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/certificates/:index', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();
        const index = parseInt(req.params.index);

        if (index < 0 || index >= portfolio.certificates.length) {
            return res.status(404).json({ error: 'Certificate not found' });
        }

        portfolio.certificates.splice(index, 1);
        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === PUBLICATIONS ===
router.post('/publications', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();
        portfolio.publications.push(req.body);
        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/publications/:index', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();
        const index = parseInt(req.params.index);

        if (index < 0 || index >= portfolio.publications.length) {
            return res.status(404).json({ error: 'Publication not found' });
        }

        portfolio.publications[index] = { ...portfolio.publications[index].toObject(), ...req.body };
        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/publications/:index', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();
        const index = parseInt(req.params.index);

        if (index < 0 || index >= portfolio.publications.length) {
            return res.status(404).json({ error: 'Publication not found' });
        }

        portfolio.publications.splice(index, 1);
        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === VOLUNTEER ===
router.post('/volunteer', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();
        portfolio.volunteer.push(req.body);
        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/volunteer/:index', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();
        const index = parseInt(req.params.index);

        if (index < 0 || index >= portfolio.volunteer.length) {
            return res.status(404).json({ error: 'Volunteer item not found' });
        }

        portfolio.volunteer[index] = { ...portfolio.volunteer[index].toObject(), ...req.body };
        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/volunteer/:index', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();
        const index = parseInt(req.params.index);

        if (index < 0 || index >= portfolio.volunteer.length) {
            return res.status(404).json({ error: 'Volunteer item not found' });
        }

        portfolio.volunteer.splice(index, 1);
        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === LANGUAGES ===
router.post('/languages', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();
        portfolio.languages.push(req.body);
        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/languages/:index', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();
        const index = parseInt(req.params.index);

        if (index < 0 || index >= portfolio.languages.length) {
            return res.status(404).json({ error: 'Language not found' });
        }

        portfolio.languages[index] = { ...portfolio.languages[index].toObject(), ...req.body };
        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/languages/:index', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();
        const index = parseInt(req.params.index);

        if (index < 0 || index >= portfolio.languages.length) {
            return res.status(404).json({ error: 'Language not found' });
        }

        portfolio.languages.splice(index, 1);
        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === INTERESTS ===
router.post('/interests', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();
        portfolio.interests.push(req.body);
        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/interests/:index', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();
        const index = parseInt(req.params.index);

        if (index < 0 || index >= portfolio.interests.length) {
            return res.status(404).json({ error: 'Interest not found' });
        }

        portfolio.interests[index] = { ...portfolio.interests[index].toObject(), ...req.body };
        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/interests/:index', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();
        const index = parseInt(req.params.index);

        if (index < 0 || index >= portfolio.interests.length) {
            return res.status(404).json({ error: 'Interest not found' });
        }

        portfolio.interests.splice(index, 1);
        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === REFERENCES ===
router.post('/references', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();
        portfolio.references.push(req.body);
        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/references/:index', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();
        const index = parseInt(req.params.index);

        if (index < 0 || index >= portfolio.references.length) {
            return res.status(404).json({ error: 'Reference not found' });
        }

        portfolio.references[index] = { ...portfolio.references[index].toObject(), ...req.body };
        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/references/:index', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();
        const index = parseInt(req.params.index);

        if (index < 0 || index >= portfolio.references.length) {
            return res.status(404).json({ error: 'Reference not found' });
        }

        portfolio.references.splice(index, 1);
        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
