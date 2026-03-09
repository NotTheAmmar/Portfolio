const express = require('express');
const router = express.Router();

// POST /api/auth/login - Verify password
router.post('/login', (req, res) => {
    const { password } = req.body;

    if (password === process.env.ADMIN_PASSWORD) {
        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'Invalid password' });
    }
});

module.exports = router;
