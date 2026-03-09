const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * API Client for Portfolio Backend with CRUD operations
 */

const api = {
    // ===== PORTFOLIO DATA =====
    getPortfolio: async () => {
        const response = await fetch(`${API_URL}/api/portfolio`);
        if (!response.ok) throw new Error('Failed to fetch portfolio data');
        return response.json();
    },

    // ===== BASICS =====
    updateBasics: async (data, password) => {
        const response = await fetch(`${API_URL}/api/portfolio/basics`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': password
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update basics');
        return response.json();
    },

    // ===== PROFILES (Social Media) =====
    addProfile: async (data, password) => {
        const response = await fetch(`${API_URL}/api/portfolio/profiles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': password
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to add profile');
        return response.json();
    },

    updateProfile: async (index, data, password) => {
        const response = await fetch(`${API_URL}/api/portfolio/profiles/${index}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': password
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update profile');
        return response.json();
    },

    deleteProfile: async (index, password) => {
        const response = await fetch(`${API_URL}/api/portfolio/profiles/${index}`, {
            method: 'DELETE',
            headers: {
                'x-admin-password': password
            }
        });
        if (!response.ok) throw new Error('Failed to delete profile');
        return response.json();
    },

    // ===== WORK EXPERIENCE =====
    addWork: async (data, password) => {
        const response = await fetch(`${API_URL}/api/portfolio/work`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': password
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to add work');
        return response.json();
    },

    updateWork: async (index, data, password) => {
        const response = await fetch(`${API_URL}/api/portfolio/work/${index}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': password
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update work');
        return response.json();
    },

    deleteWork: async (index, password) => {
        const response = await fetch(`${API_URL}/api/portfolio/work/${index}`, {
            method: 'DELETE',
            headers: {
                'x-admin-password': password
            }
        });
        if (!response.ok) throw new Error('Failed to delete work');
        return response.json();
    },

    // ===== EDUCATION =====
    addEducation: async (data, password) => {
        const response = await fetch(`${API_URL}/api/portfolio/education`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': password
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to add education');
        return response.json();
    },

    updateEducation: async (index, data, password) => {
        const response = await fetch(`${API_URL}/api/portfolio/education/${index}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': password
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update education');
        return response.json();
    },

    deleteEducation: async (index, password) => {
        const response = await fetch(`${API_URL}/api/portfolio/education/${index}`, {
            method: 'DELETE',
            headers: {
                'x-admin-password': password
            }
        });
        if (!response.ok) throw new Error('Failed to delete education');
        return response.json();
    },

    // ===== SKILLS =====
    addSkill: async (data, password) => {
        const response = await fetch(`${API_URL}/api/portfolio/skills`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': password
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to add skill');
        return response.json();
    },

    updateSkill: async (index, data, password) => {
        const response = await fetch(`${API_URL}/api/portfolio/skills/${index}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': password
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update skill');
        return response.json();
    },

    deleteSkill: async (index, password) => {
        const response = await fetch(`${API_URL}/api/portfolio/skills/${index}`, {
            method: 'DELETE',
            headers: {
                'x-admin-password': password
            }
        });
        if (!response.ok) throw new Error('Failed to delete skill');
        return response.json();
    },

    // ===== PROJECTS =====
    addProject: async (data, password) => {
        const response = await fetch(`${API_URL}/api/portfolio/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': password
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to add project');
        return response.json();
    },

    updateProject: async (index, data, password) => {
        const response = await fetch(`${API_URL}/api/portfolio/projects/${index}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': password
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update project');
        return response.json();
    },

    deleteProject: async (index, password) => {
        const response = await fetch(`${API_URL}/api/portfolio/projects/${index}`, {
            method: 'DELETE',
            headers: {
                'x-admin-password': password
            }
        });
        if (!response.ok) throw new Error('Failed to delete project');
        return response.json();
    },

    // ===== AWARDS =====
    addAward: async (data, password) => {
        const response = await fetch(`${API_URL}/api/portfolio/awards`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': password
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to add award');
        return response.json();
    },

    updateAward: async (index, data, password) => {
        const response = await fetch(`${API_URL}/api/portfolio/awards/${index}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': password
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update award');
        return response.json();
    },

    deleteAward: async (index, password) => {
        const response = await fetch(`${API_URL}/api/portfolio/awards/${index}`, {
            method: 'DELETE',
            headers: {
                'x-admin-password': password
            }
        });
        if (!response.ok) throw new Error('Failed to delete award');
        return response.json();
    },

    // ===== CERTIFICATES =====
    addCertificate: async (data, password) => {
        const response = await fetch(`${API_URL}/api/portfolio/certificates`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': password
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to add certificate');
        return response.json();
    },

    updateCertificate: async (index, data, password) => {
        const response = await fetch(`${API_URL}/api/portfolio/certificates/${index}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': password
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update certificate');
        return response.json();
    },

    deleteCertificate: async (index, password) => {
        const response = await fetch(`${API_URL}/api/portfolio/certificates/${index}`, {
            method: 'DELETE',
            headers: {
                'x-admin-password': password
            }
        });
        if (!response.ok) throw new Error('Failed to delete certificate');
        return response.json();
    },

    // ===== PUBLICATIONS =====
    addPublication: async (data, password) => {
        const response = await fetch(`${API_URL}/api/portfolio/publications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': password
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to add publication');
        return response.json();
    },

    updatePublication: async (index, data, password) => {
        const response = await fetch(`${API_URL}/api/portfolio/publications/${index}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': password
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update publication');
        return response.json();
    },

    deletePublication: async (index, password) => {
        const response = await fetch(`${API_URL}/api/portfolio/publications/${index}`, {
            method: 'DELETE',
            headers: {
                'x-admin-password': password
            }
        });
        if (!response.ok) throw new Error('Failed to delete publication');
        return response.json();
    },

    // ===== VOLUNTEER =====
    addVolunteer: async (data, password) => {
        const response = await fetch(`${API_URL}/api/portfolio/volunteer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': password
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to add volunteer');
        return response.json();
    },

    updateVolunteer: async (index, data, password) => {
        const response = await fetch(`${API_URL}/api/portfolio/volunteer/${index}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': password
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update volunteer');
        return response.json();
    },

    deleteVolunteer: async (index, password) => {
        const response = await fetch(`${API_URL}/api/portfolio/volunteer/${index}`, {
            method: 'DELETE',
            headers: {
                'x-admin-password': password
            }
        });
        if (!response.ok) throw new Error('Failed to delete volunteer');
        return response.json();
    },

    // ===== LANGUAGES =====
    addLanguage: async (data, password) => {
        const response = await fetch(`${API_URL}/api/portfolio/languages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': password
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to add language');
        return response.json();
    },

    updateLanguage: async (index, data, password) => {
        const response = await fetch(`${API_URL}/api/portfolio/languages/${index}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': password
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update language');
        return response.json();
    },

    deleteLanguage: async (index, password) => {
        const response = await fetch(`${API_URL}/api/portfolio/languages/${index}`, {
            method: 'DELETE',
            headers: {
                'x-admin-password': password
            }
        });
        if (!response.ok) throw new Error('Failed to delete language');
        return response.json();
    },

    // ===== INTERESTS =====
    addInterest: async (data, password) => {
        const response = await fetch(`${API_URL}/api/portfolio/interests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': password
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to add interest');
        return response.json();
    },

    updateInterest: async (index, data, password) => {
        const response = await fetch(`${API_URL}/api/portfolio/interests/${index}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': password
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update interest');
        return response.json();
    },

    deleteInterest: async (index, password) => {
        const response = await fetch(`${API_URL}/api/portfolio/interests/${index}`, {
            method: 'DELETE',
            headers: {
                'x-admin-password': password
            }
        });
        if (!response.ok) throw new Error('Failed to delete interest');
        return response.json();
    },

    // ===== REFERENCES =====
    addReference: async (data, password) => {
        const response = await fetch(`${API_URL}/api/portfolio/references`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': password
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to add reference');
        return response.json();
    },

    updateReference: async (index, data, password) => {
        const response = await fetch(`${API_URL}/api/portfolio/references/${index}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': password
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update reference');
        return response.json();
    },

    deleteReference: async (index, password) => {
        const response = await fetch(`${API_URL}/api/portfolio/references/${index}`, {
            method: 'DELETE',
            headers: {
                'x-admin-password': password
            }
        });
        if (!response.ok) throw new Error('Failed to delete reference');
        return response.json();
    },

    // ===== FILE UPLOAD =====
    uploadFile: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch(`${API_URL}/api/upload`, {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to upload file');
        }
        return response.json();
    },

    deleteFile: async (filePath) => {
        const response = await fetch(`${API_URL}/api/upload`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ filePath })
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to delete file');
        }
        return response.json();
    },

    // ===== AI GENERATION =====
    generateAIContent: async (data, password) => {
        const response = await fetch(`${API_URL}/api/ai/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': password
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to generate content');
        }
        return response.json();
    },

    // ===== AUTH =====
    login: async (password) => {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });
        if (!response.ok) throw new Error('Invalid password');
        return response.json();
    },

    healthCheck: async () => {
        const response = await fetch(`${API_URL}/api/health`);
        return response.json();
    }
};

export default api;
