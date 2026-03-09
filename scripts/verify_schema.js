const mongoose = require('mongoose');
const Portfolio = require('../server/models/Portfolio');
require('dotenv').config();

async function verify() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio';
        await mongoose.connect(uri);
        console.log('Connected to DB');

        // Test 1: Save minimal data
        const p1 = new Portfolio({
            profileInformation: {
                name: "Minimal User"
            }
        });
        await p1.save();
        console.log('✅ Test 1 Passed: Minimal document saved.');

        // Test 2: Save with empty sub-objects (simulating missing forms)
        const p2 = new Portfolio({
            profileInformation: { name: "Partial User" },
            work: [{}], // Empty work item
            skills: [{ name: "Skill without level" }]
        });
        await p2.save();
        console.log('✅ Test 2 Passed: Partial document saved.');

        // Clean up
        await Portfolio.deleteMany({ 'profileInformation.name': { $in: ["Minimal User", "Partial User"] } });
        console.log('Cleaned up test documents.');

    } catch (error) {
        console.error('❌ Verification failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

verify();
