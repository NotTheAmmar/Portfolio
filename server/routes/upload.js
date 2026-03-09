const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

// POST /api/upload
// Upload a single file (image or pdf)
router.post('/', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Return the relative path to be stored in the DB
        // The frontend can prepend the server URL (e.g. http://localhost:3001) or root domain
        const relativePath = `/uploads/${req.file.filename}`;

        res.status(200).json({
            message: 'File uploaded successfully',
            filePath: relativePath
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: 'Server error during upload' });
    }
});

// DELETE /api/upload
// Delete a single file given its relative path route like /uploads/123456.jpg
router.delete('/', async (req, res) => {
    try {
        const { filePath } = req.body;
        
        if (!filePath) {
            return res.status(400).json({ message: 'No filePath provided' });
        }

        // Expected filePath is typically `/uploads/filename.ext`
        const filename = filePath.startsWith('/uploads/') ? filePath.replace('/uploads/', '') : filePath;
        
        // Resolve the absolute path
        const absolutePath = require('path').join(__dirname, '../../public/uploads', filename);

        const fs = require('fs');

        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
            return res.status(200).json({ message: 'File deleted successfully' });
        } else {
            return res.status(404).json({ message: 'File not found on server' });
        }
    } catch (error) {
        console.error('Delete Upload Error:', error);
        res.status(500).json({ message: 'Server error during delete' });
    }
});

module.exports = router;
