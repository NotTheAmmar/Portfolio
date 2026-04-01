const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Middleware to verify admin password
const verifyAdmin = (req, res, next) => {
    const password = req.headers['x-admin-password'];
    if (!password || password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// POST /api/ai/generate
router.post('/generate', verifyAdmin, async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(400).json({ error: 'GEMINI_API_KEY is not configured in the .env file.' });
        }

        const { fieldType, sectionKey, context, globalContext, userContext } = req.body;

        if (!fieldType || !sectionKey) {
            return res.status(400).json({ error: 'Missing fieldType or sectionKey in request.' });
        }

        // Initialize Gemini API
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Helper function to build the prompt
        const buildPrompt = (fieldType, sectionKey, context, globalContext, userContext) => {
            let prompt = `You are a talented portfolio copywriter helping a professional present themselves. The user has the following background:\n${globalContext}\n\n`;
            prompt += `Write in a natural, conversational, and authentic human voice—as if the user is confidently yet humbly describing themselves. Avoid stiff corporate jargon, robotic phrasing, or overly formal buzzwords. Keep the tone warm, highly professional, and engaging.\n\n`;

            if (userContext && userContext.trim() !== '') {
                prompt += `User's Specific Instructions / Additional Context:\n"${userContext.trim()}"\n\nMake sure to incorporate this context while still following the general guidelines.\n\n`;
            }

            const itemContext = JSON.stringify(context, null, 2);

            switch (fieldType) {
                case 'summary':
                    if (sectionKey === 'profileInformation') {
                        return prompt + `Write a 3-4 sentence professional summary that captures the user's expertise and value proposition in this natural tone. Output ONLY the summary text, without quotes or extra formatting.`;
                    }
                    return prompt + `Write a 2-sentence summary for an item they are adding to their ${sectionKey} section. Here are the details of the item:\n${itemContext}\n\nOutput ONLY the summary text, without quotes or extra formatting.`;
                case 'description':
                    return prompt + `Write a concise 2-sentence description for an item they are adding to their ${sectionKey} section. Here are the details of the item:\n${itemContext}\n\nOutput ONLY the description text, without quotes or extra formatting.`;
                case 'highlights':
                    return prompt + `Write exactly 3 distinct, action-oriented bullet points for an item they are adding to their ${sectionKey} section. Frame these achievements naturally. Here are the details of the item:\n${itemContext}\n\n(Note: If the item details are completely blank or insufficient, rely purely on the global context to invent 3 highly generic but plausible bullet points). Output the bullet points as a JSON array of strings ONLY. Do not use markdown format blocks, just a raw JSON array. Ex: ["Point 1", "Point 2", "Point 3"]`;
                case 'keywords':
                    return prompt + `Generate a list of exactly 4-8 highly relevant technical keywords or short tags based on the item they are adding to their ${sectionKey} section. Here are the details of the item:\n${itemContext}\n\n(Note: If the item details are completely blank, rely purely on the global context to supply 4 to 8 plausible keywords). Output the keywords as a JSON array of strings ONLY. Do not use markdown format blocks, just a raw JSON array. Ex: ["React", "Node.js", "Team Leadership"]`;
                default:
                    throw new Error(`Unsupported fieldType: ${fieldType}`);
            }
        };

        let prompt;
        try {
            prompt = buildPrompt(fieldType, sectionKey, context, globalContext, userContext);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }

        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();

        // If an array output (highlights or keywords), parse JSON
        if (fieldType === 'highlights' || fieldType === 'keywords') {
            try {
                // Extract only the array part to aggressively ignore any surrounding text/markdown
                const match = text.match(/\[[\s\S]*\]/);
                if (match) {
                    text = match[0];
                }
                text = JSON.parse(text);
            } catch (e) {
                console.error("Failed to parse JSON for array outputs:", text);
                return res.status(500).json({ error: 'AI failed to format the underlying array. Please try typing a few initial details into the form first.' });
            }
        }

        res.json({ generatedContent: text });
    } catch (error) {
        console.error('AI Generation Error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate content.' });
    }
});

module.exports = router;
