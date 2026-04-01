const express = require('express');
const router = express.Router();
const { upload, cloudinary } = require('../middleware/upload');

// Helper to extract Cloudinary public_id and resource_type from URL
const extractCloudinaryInfo = (url) => {
    try {
        if (!url.includes('cloudinary.com')) return null;
        
        const isRaw = url.includes('/raw/upload/');
        const resource_type = isRaw ? 'raw' : 'image';
        
        const parts = url.split('/upload/');
        if (parts.length < 2) return null;
        const pathAfterUpload = parts[1];
        
        // Remove version e.g. v123456789/
        let pathParts = pathAfterUpload.split('/');
        if (pathParts[0].startsWith('v') && !isNaN(pathParts[0].substring(1))) {
            pathParts.shift();
        }
        
        const fullPath = pathParts.join('/');
        
        let public_id;
        if (isRaw) {
            public_id = fullPath; // Raw requires extension
        } else {
            public_id = fullPath.substring(0, fullPath.lastIndexOf('.'));
            if (!public_id) public_id = fullPath;
        }
        
        return { public_id, resource_type };
    } catch (e) {
        return null;
    }
};

// POST /api/upload
// Upload a single file (image or pdf)
router.post('/', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // req.file.path contains the newly uploaded Cloudinary URL
        const cloudUrl = req.file.path;

        res.status(200).json({
            message: 'File uploaded successfully',
            filePath: cloudUrl
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: 'Server error during upload' });
    }
});

// DELETE /api/upload
// Delete a single file given its URL
router.delete('/', async (req, res) => {
    try {
        const { filePath } = req.body;
        
        if (!filePath) {
            return res.status(400).json({ message: 'No filePath provided' });
        }

        const cloudInfo = extractCloudinaryInfo(filePath);
        
        if (cloudInfo) {
            // It's a Cloudinary URL, delete from Cloudinary
            const { public_id, resource_type } = cloudInfo;
            try {
                await cloudinary.uploader.destroy(public_id, { resource_type });
                return res.status(200).json({ message: 'File deleted from Cloudinary successfully' });
            } catch (cloudErr) {
                console.error('Cloudinary delete error:', cloudErr);
                return res.status(500).json({ message: 'Failed to delete from Cloudinary' });
            }
        } else if (filePath.startsWith('/uploads/')) {
            // Legacy fallback for locally uploaded files
            const filename = filePath.replace('/uploads/', '');
            const absolutePath = require('path').join(__dirname, '../../public/uploads', filename);
            const fs = require('fs');

            if (fs.existsSync(absolutePath)) {
                fs.unlinkSync(absolutePath);
                return res.status(200).json({ message: 'Local file deleted successfully' });
            } else {
                return res.status(404).json({ message: 'File not found on server' });
            }
        } else {
             return res.status(400).json({ message: 'Invalid file path format' });
        }

    } catch (error) {
        console.error('Delete Upload Error:', error);
        res.status(500).json({ message: 'Server error during delete' });
    }
});

module.exports = router;
