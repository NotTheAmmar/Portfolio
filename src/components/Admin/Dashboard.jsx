
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { config } from '../../config';
import Modal from '../Modal';
import { PROFILE_FIELDS } from '../../utils/dataFilter';
import { sortPortfolioData, getSectionComparator } from '../../utils/sorter';

const getItemLabel = (section, item) => {
    switch (section) {
        case 'profileInformation':
            if (typeof item.value === 'object' && item.value !== null) {
                const loc = item.value;
                return `${item.name}: ${loc.city || ''}, ${loc.countryCode || ''}`;
            }
            return `${item.name}: ${item.value || ''}`;
        case 'work': return `${item.position} at ${item.name} `;
        case 'profiles': return `${item.network} (${item.username})`;
        case 'education': return `${item.studyType} - ${item.institution} `;
        case 'skills': return item.name;
        case 'projects': return item.name;
        case 'awards': return item.title;
        case 'certificates': return `${item.name} (${item.issuer})`;
        case 'publications': return item.name;
        case 'volunteer': return `${item.position} at ${item.organization} `;
        case 'languages': return `${item.language} (${item.fluency})`;
        case 'interests': return item.name;
        case 'references': return `${item.name} - "${item.reference?.slice(0, 20)}..."`;
        default: return JSON.stringify(item).slice(0, 50);
    }
};

/**
 * Admin Dashboard with Two Tabs:
 * 1. Manage Data - CRUD operations on all portfolio data
 * 2. Configure Resume/CV - Selection and ordering
 */
const Dashboard = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null); // 'work', 'education', etc.
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [editIndex, setEditIndex] = useState(null);
    const [formData, setFormData] = useState({});

    const password = localStorage.getItem('admin_password') || config.ADMIN_PASSWORD;

    // Load data
    const refreshData = async () => {
        try {
            setLoading(true);
                const portfolioData = await api.getPortfolio();
                setData(portfolioData);
            } catch (error) {
                console.error('Error fetching data:', error);
                setSaveMessage('✗ Error loading data: ' + error.message);
            } finally {
                setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    // ... (rest of CRUD operations unchanged)

    // === CRUD OPERATIONS ===
    const handleAdd = (type) => {
        setModalType(type);
        setModalMode('add');
        setFormData(getEmptyFormData(type));
        setModalOpen(true);
    };

    const handleEdit = (type, index) => {
        // Special handling for profileInformation (object) vs others (arrays)
        if (type === 'profileInformation') {
            if (!data || !data.profileInformation) return;
            setModalType(type);
            setModalMode('edit');
            setEditIndex(0);

            // UX: Strip /uploads/ prefix for display
            const displayData = { ...data.profileInformation };
            if (displayData.image && displayData.image.startsWith('/uploads/')) {
                displayData.image = displayData.image.replace('/uploads/', '');
            }

            // Flatten nested location for form fields
            if (displayData.location) {
                displayData['location.city'] = displayData.location.city;
                displayData['location.region'] = displayData.location.region;
                displayData['location.countryCode'] = displayData.location.countryCode;
                displayData['location.address'] = displayData.location.address;
                displayData['location.postalCode'] = displayData.location.postalCode;
            }

            // JSON stringify profiles for editing (REMOVED - now handled separately)

            setFormData(displayData);
            setModalOpen(true);
        } else {
            let itemData;
            if (type === 'profiles') {
                if (!data || !data.profileInformation || !data.profileInformation.profiles || !data.profileInformation.profiles[index]) return;
                itemData = data.profileInformation.profiles[index];
            } else {
                if (!data || !data[type] || !data[type][index]) return;
                itemData = data[type][index];
            }
            
            setModalType(type);
            setModalMode('edit');
            setEditIndex(index);
            setFormData(itemData);
            setModalOpen(true);
        }
    };

    const handleDelete = async (type, index) => {
        if (!confirm(`Are you sure you want to delete this ${type} item ? `)) return;

        try {
            setSaving(true);
            const apiMethod = getApiMethod(type, 'delete');
            await apiMethod(index, password);
            await refreshData();
            setSaveMessage(`✓ ${capitalize(type)} item deleted`);
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (error) {
            setSaveMessage(`✗ Error: ${error.message} `);
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);

            // Special handling for profileInformation (always update, never add)
            if (modalType === 'profileInformation') {
                // Auto-prepend /uploads/ to image if it's just a filename
                const dataToSubmit = { ...formData };
                if (dataToSubmit.image && !dataToSubmit.image.startsWith('http') && !dataToSubmit.image.startsWith('/') && !dataToSubmit.image.startsWith('Artifacts')) {
                    dataToSubmit.image = '/uploads/' + dataToSubmit.image;
                }

                // Unflatten nested keys (location.city -> location: { city: ... })
                const nestedData = {};
                Object.keys(dataToSubmit).forEach(key => {
                    if (key.includes('.')) {
                        const [parent, child] = key.split('.');
                        if (!nestedData[parent]) nestedData[parent] = {};
                        nestedData[parent][child] = dataToSubmit[key];
                    } else {
                        nestedData[key] = dataToSubmit[key];
                    }
                });

                // Parse profiles JSON back to object
                if (nestedData.profiles && typeof nestedData.profiles === 'string') {
                    try {
                        nestedData.profiles = JSON.parse(nestedData.profiles);
                    } catch (e) {
                        alert("Invalid JSON for profiles. Please correct it.");
                        setSaving(false);
                        return;
                    }
                }

                await api.updateBasics(nestedData, password); // API route is still /basics
            } else {
                const apiMethod = getApiMethod(modalType, modalMode === 'add' ? 'add' : 'update');

                // Auto-prepend /uploads/ to specific fields
                let dataToSubmit = { ...formData };

                // Handle image arrays (projects)
                if (dataToSubmit.images && Array.isArray(dataToSubmit.images)) {
                    dataToSubmit.images = dataToSubmit.images.map(img => {
                        if (img && !img.startsWith('http') && !img.startsWith('/') && !img.startsWith('Artifacts')) {
                            return '/uploads/' + img;
                        }
                        return img;
                    });
                }

                // Handle certificate URL (often a file)
                if (modalType === 'certificates' && dataToSubmit.url && !dataToSubmit.url.startsWith('http') && !dataToSubmit.url.startsWith('/') && !dataToSubmit.url.startsWith('Artifacts')) {
                    dataToSubmit.url = '/uploads/' + dataToSubmit.url;
                }

                if (modalMode === 'add') {
                    await apiMethod(dataToSubmit, password);
                } else {
                    await apiMethod(editIndex, dataToSubmit, password);
                }
            }

            await refreshData();
            setModalOpen(false);
            setSaveMessage(`✓ ${capitalize(modalType)} ${modalMode === 'add' ? 'added' : 'updated'} `);
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (error) {
            setSaveMessage(`✗ Error: ${error.message} `);
        } finally {
            setSaving(false);
        }
    };

    const handleAutoGenerate = async (fieldName, fieldType, currentFormData, userContext = "") => {
        try {
            // Build limited global context from existing data
            const globalContext = data && data.profileInformation 
                ? `${data.profileInformation.name}, ${data.profileInformation.label} with skills in: ${data.skills ? data.skills.map(s => s.name).join(', ') : ''}` 
                : "";
            
            const payload = {
                fieldType: fieldName, // Use fieldName directly ('highlights', 'keywords', 'summary', or 'description')
                sectionKey: modalType,
                context: currentFormData,
                globalContext,
                userContext
            };
            const response = await api.generateAIContent(payload, password);
            return response.generatedContent;
        } catch (error) {
            alert("AI Generation failed: " + error.message);
            return null;
        }
    };

    const handleCopyContext = () => {
        if (!data) return;

        let ctx = `# Portfolio Context\n\n`;

        // ── Profile ─────────────────────────────────────────────────
        if (data.profileInformation) {
            const p = data.profileInformation;
            ctx += `## Profile\n`;
            if (p.name)    ctx += `- **Name:** ${p.name}\n`;
            if (p.label)   ctx += `- **Title:** ${p.label}\n`;
            if (p.email)   ctx += `- **Email:** ${p.email}\n`;
            if (p.phone)   ctx += `- **Phone:** ${p.phone}\n`;
            if (p.url)     ctx += `- **Website:** ${p.url}\n`;
            if (p.location) {
                const loc = [p.location.address, p.location.city, p.location.region, p.location.postalCode, p.location.countryCode].filter(Boolean).join(', ');
                if (loc) ctx += `- **Location:** ${loc}\n`;
            }
            if (p.summary) ctx += `- **Summary:** ${p.summary}\n`;
            if (p.profiles && p.profiles.length > 0) {
                ctx += `- **Social Profiles:**\n`;
                p.profiles.forEach(pr => {
                    ctx += `  - ${pr.network}: ${pr.url || pr.username || ''}\n`;
                });
            }
            ctx += `\n`;
        }

        // ── Skills ───────────────────────────────────────────────────
        if (data.skills && data.skills.length > 0) {
            ctx += `## Skills\n`;
            data.skills.forEach(s => {
                ctx += `### ${s.name}`;
                if (s.level) ctx += ` (${s.level})`;
                ctx += `\n`;
                if (s.description) ctx += `${s.description}\n`;
                if (s.keywords && s.keywords.length > 0) ctx += `Keywords: ${s.keywords.join(', ')}\n`;
                ctx += `\n`;
            });
        }

        // ── Work Experience ──────────────────────────────────────────
        if (data.work && data.work.length > 0) {
            ctx += `## Work Experience\n`;
            data.work.forEach(w => {
                ctx += `### ${w.position} at ${w.name}\n`;
                const dur = [w.startDate, w.endDate || 'Present'].filter(Boolean).join(' – ');
                if (dur) ctx += `- **Duration:** ${dur}\n`;
                if (w.location) ctx += `- **Location:** ${w.location}\n`;
                if (w.url) ctx += `- **URL:** ${w.url}\n`;
                if (w.summary) ctx += `- **Summary:** ${w.summary}\n`;
                if (w.highlights && w.highlights.length > 0) {
                    ctx += `- **Highlights:**\n`;
                    w.highlights.forEach(h => ctx += `  * ${h}\n`);
                }
                ctx += `\n`;
            });
        }

        // ── Education ────────────────────────────────────────────────
        if (data.education && data.education.length > 0) {
            ctx += `## Education\n`;
            data.education.forEach(e => {
                ctx += `### ${e.studyType || ''} in ${e.area || ''} — ${e.institution || ''}\n`;
                const dur = [e.startDate, e.endDate].filter(Boolean).join(' – ');
                if (dur) ctx += `- **Duration:** ${dur}\n`;
                if (e.score) ctx += `- **Score / GPA:** ${e.score}\n`;
                if (e.location) ctx += `- **Location:** ${e.location}\n`;
                if (e.url) ctx += `- **URL:** ${e.url}\n`;
                if (e.description) ctx += `- **Description:** ${e.description}\n`;
                if (e.courses && e.courses.length > 0) ctx += `- **Courses:** ${e.courses.join(', ')}\n`;
                ctx += `\n`;
            });
        }

        // ── Projects ─────────────────────────────────────────────────
        if (data.projects && data.projects.length > 0) {
            ctx += `## Projects\n`;
            data.projects.forEach(p => {
                ctx += `### ${p.name}\n`;
                if (p.type) ctx += `- **Type:** ${p.type}\n`;
                const dur = [p.startDate, p.endDate].filter(Boolean).join(' – ');
                if (dur) ctx += `- **Duration:** ${dur}\n`;
                if (p.url) ctx += `- **Live URL:** ${p.url}\n`;
                if (p.github) ctx += `- **GitHub:** ${p.github}\n`;
                if (p.description) ctx += `- **Description:** ${p.description}\n`;
                if (p.roles && p.roles.length > 0) ctx += `- **Roles:** ${p.roles.join(', ')}\n`;
                if (p.keywords && p.keywords.length > 0) ctx += `- **Technologies:** ${p.keywords.join(', ')}\n`;
                if (p.highlights && p.highlights.length > 0) {
                    ctx += `- **Highlights:**\n`;
                    p.highlights.forEach(h => ctx += `  * ${h}\n`);
                }
                ctx += `\n`;
            });
        }

        // ── Volunteer ────────────────────────────────────────────────
        if (data.volunteer && data.volunteer.length > 0) {
            ctx += `## Volunteer Experience\n`;
            data.volunteer.forEach(v => {
                ctx += `### ${v.position} at ${v.organization}\n`;
                const dur = [v.startDate, v.endDate || 'Present'].filter(Boolean).join(' – ');
                if (dur) ctx += `- **Duration:** ${dur}\n`;
                if (v.location) ctx += `- **Location:** ${v.location}\n`;
                if (v.url) ctx += `- **URL:** ${v.url}\n`;
                if (v.summary) ctx += `- **Summary:** ${v.summary}\n`;
                if (v.highlights && v.highlights.length > 0) {
                    ctx += `- **Highlights:**\n`;
                    v.highlights.forEach(h => ctx += `  * ${h}\n`);
                }
                ctx += `\n`;
            });
        }

        // ── Awards ───────────────────────────────────────────────────
        if (data.awards && data.awards.length > 0) {
            ctx += `## Awards\n`;
            data.awards.forEach(a => {
                ctx += `### ${a.title}\n`;
                if (a.date) ctx += `- **Date:** ${a.date}\n`;
                if (a.awarder) ctx += `- **Awarder:** ${a.awarder}\n`;
                if (a.summary) ctx += `- **Summary:** ${a.summary}\n`;
                ctx += `\n`;
            });
        }

        // ── Certificates ─────────────────────────────────────────────
        if (data.certificates && data.certificates.length > 0) {
            ctx += `## Certificates\n`;
            data.certificates.forEach(c => {
                ctx += `### ${c.name}\n`;
                if (c.issuer) ctx += `- **Issuer:** ${c.issuer}\n`;
                if (c.date) ctx += `- **Date:** ${c.date}\n`;
                if (c.url) ctx += `- **URL:** ${c.url}\n`;
                ctx += `\n`;
            });
        }

        // ── Publications ─────────────────────────────────────────────
        if (data.publications && data.publications.length > 0) {
            ctx += `## Publications\n`;
            data.publications.forEach(p => {
                ctx += `### ${p.name}\n`;
                if (p.publisher) ctx += `- **Publisher:** ${p.publisher}\n`;
                if (p.releaseDate) ctx += `- **Release Date:** ${p.releaseDate}\n`;
                if (p.url) ctx += `- **URL:** ${p.url}\n`;
                if (p.summary) ctx += `- **Summary:** ${p.summary}\n`;
                ctx += `\n`;
            });
        }

        // ── Languages ────────────────────────────────────────────────
        if (data.languages && data.languages.length > 0) {
            ctx += `## Languages\n`;
            data.languages.forEach(l => {
                ctx += `- ${l.language}: ${l.fluency || ''}\n`;
            });
            ctx += `\n`;
        }

        // ── Interests ────────────────────────────────────────────────
        if (data.interests && data.interests.length > 0) {
            ctx += `## Interests\n`;
            data.interests.forEach(i => {
                ctx += `- **${i.name}**`;
                if (i.keywords && i.keywords.length > 0) ctx += `: ${i.keywords.join(', ')}`;
                ctx += `\n`;
            });
            ctx += `\n`;
        }

        // ── References ───────────────────────────────────────────────
        if (data.references && data.references.length > 0) {
            ctx += `## References\n`;
            data.references.forEach(r => {
                ctx += `### ${r.name}\n`;
                if (r.reference) ctx += `"${r.reference}"\n`;
                ctx += `\n`;
            });
        }

        // ── Copy to clipboard ────────────────────────────────────────
        navigator.clipboard.writeText(ctx)
            .then(() => {
                setSaveMessage('✓ Copied full portfolio context to clipboard!');
                setTimeout(() => setSaveMessage(''), 3000);
            })
            .catch(() => {
                // Fallback for environments that block clipboard API
                const el = document.createElement('textarea');
                el.value = ctx;
                el.style.position = 'fixed';
                el.style.opacity = '0';
                document.body.appendChild(el);
                el.focus();
                el.select();
                try {
                    document.execCommand('copy');
                    setSaveMessage('✓ Copied full portfolio context to clipboard!');
                } catch {
                    setSaveMessage('✗ Failed to copy – please copy manually.');
                }
                document.body.removeChild(el);
                setTimeout(() => setSaveMessage(''), 3000);
            });
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'var(--color-bg)',
                color: 'var(--color-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: '4px solid var(--color-surface)',
                        borderTop: '4px solid var(--color-accent)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }} />
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
            padding: '2rem',
            position: 'relative',
            zIndex: 1
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem'
                }}>
                    <h1 style={{
                        fontSize: '2rem',
                        margin: 0,
                        background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-2) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Admin Dashboard
                    </h1>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => { logout(); navigate('/'); }} style={logoutButtonStyle}>Logout</button>
                    </div>
                </div>

                {/* AI Banner Component */}
                <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--color-surface-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: '1 1 300px' }}>
                        <h2 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🤖 AI Portfolio Assistant</h2>
                        <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem', lineHeight: '1.5' }}>
                            Extract all your meticulously entered details below into a structured markdown document. Perfect for pasting directly into ChatGPT or Claude to generate tailor-made cover letters and resumes.
                        </p>
                    </div>
                    <button onClick={handleCopyContext} style={{ ...saveButtonStyle, background: '#3b82f6', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>📋</span> Copy All Context
                    </button>
                </div>

                {/* Content */}
                <ManageDataTab
                    data={data}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    saving={saving}
                />

                {/* Save Message */}
                {saveMessage && (
                    <div style={{
                        position: 'fixed',
                        bottom: '2rem',
                        right: '2rem',
                        padding: '1rem 2rem',
                        background: saveMessage.includes('✗') ? '#ef4444' : '#22c55e',
                        color: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                        zIndex: 1000
                    }}>
                        {saveMessage}
                    </div>
                )}
            </div>

            {/* Modal for Add/Edit Forms */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={`${modalMode === 'add' ? 'Add' : 'Edit'} ${capitalize(modalType)} `}
                width="700px"
            >
                <FormContent
                    type={modalType}
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleSubmit}
                    saving={saving}
                    mode={modalMode}
                    onAutoGenerate={handleAutoGenerate}
                />
            </Modal>
        </div>
    );
};

// === SUB COMPONENTS ===

const ManageDataTab = ({ data, onAdd, onEdit, onDelete, saving }) => {
    const sections = [
        { key: 'profileInformation', label: 'Profile Info', icon: '👤' },
        { key: 'work', label: 'Work Experience', icon: '💼' },
        { key: 'profiles', label: 'Social Profiles', icon: '🔗' },
        { key: 'education', label: 'Education', icon: '🎓' },
        { key: 'skills', label: 'Skills', icon: '🛠️' },
        { key: 'projects', label: 'Projects', icon: '🚀' },
        { key: 'awards', label: 'Awards', icon: '🏆' },
        { key: 'certificates', label: 'Certificates', icon: '📜' },
        { key: 'publications', label: 'Publications', icon: '📚' },
        { key: 'volunteer', label: 'Volunteer', icon: '🤝' },
        { key: 'languages', label: 'Languages', icon: '🌍' },
        { key: 'interests', label: 'Interests', icon: '❤️' },
        { key: 'references', label: 'References', icon: '🗣️' }
    ];

    return (
        <div>
            {sections.map(section => {
                // Special handling for profileInformation (object) vs others (arrays)
                const isProfileInfo = section.key === 'profileInformation';

                // Special handling for profiles (nested in profileInformation but managed as list)
                let items = [];
                if (isProfileInfo) {
                    items = [data.profileInformation];
                } else if (section.key === 'profiles') {
                    items = data.profileInformation?.profiles || [];
                } else {
                    items = data[section.key] || [];
                }

                const count = isProfileInfo ? 1 : items.length;

                // Create a list of items with their original indices for display sorting
                const displayItems = items.map((item, index) => ({ item, index }));

                // Sort if it's not profile info (which is a single object)
                if (!isProfileInfo) {
                    const comparator = getSectionComparator(section.key);
                    displayItems.sort((a, b) => comparator(a.item, b.item));
                }

                return (
                    <div key={section.key} style={sectionCardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, color: 'var(--color-accent)', fontSize: '1.2rem' }}>
                                {section.icon} {section.label} {!isProfileInfo && <span style={{ opacity: 0.6, fontSize: '0.875rem' }}>({count})</span>}
                            </h3>
                            {isProfileInfo ? (
                                <button onClick={() => onEdit(section.key, 0)} style={addButtonStyle} disabled={saving}>
                                    ✏️ Edit Profile
                                </button>
                            ) : (
                                <button onClick={() => onAdd(section.key)} style={addButtonStyle} disabled={saving}>
                                    + Add {section.label}
                                </button>
                            )}
                        </div>

                        {items.length > 0 && !isProfileInfo ? (
                            <div>
                                {displayItems.map(({ item, index }) => (
                                    <div key={index} style={itemRowStyle}>
                                        <span style={{ flex: 1 }}>{getItemLabel(section.key, item)}</span>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => onEdit(section.key, index)} style={editButtonStyle} disabled={saving}>Edit</button>
                                            <button onClick={() => onDelete(section.key, index)} style={deleteButtonStyle} disabled={saving}>Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : !isProfileInfo ? (
                            <p style={{ color: '#888', fontStyle: 'italic' }}>No items yet. Click &quot;Add {section.label}&quot; to create one.</p>
                        ) : (
                            <p style={{ color: '#888', fontStyle: 'italic' }}>
                                Click &quot;Edit Profile&quot; to update your name, email, summary, and other profile information.
                            </p>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

const FormContent = ({ type, formData, setFormData, onSubmit, saving, mode, onAutoGenerate }) => {
    // This would be a large component with all form fields for each type
    // For now, creating a flexible generic form
    const formFields = getFormFields(type);

    // Filter which fields get the auto generate button
    const getAutoGenerateFn = (field) => {
        if (!onAutoGenerate) return undefined;
        if (field.name === 'summary' || field.name === 'description' || (field.type === 'array' && (field.name === 'highlights' || field.name === 'keywords'))) {
            return async (userContext) => await onAutoGenerate(field.name, field.type, formData, userContext);
        }
        return undefined;
    };

    return (
        <form onSubmit={onSubmit}>
            {formFields.map(field => (
                <FormField
                    key={field.name}
                    field={field}
                    value={formData[field.name] || ''}
                    onChange={(value) => setFormData({ ...formData, [field.name]: value })}
                    onAutoGenerate={getAutoGenerateFn(field)}
                />
            ))}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" disabled={saving} style={saveButtonStyle}>
                    {saving ? 'Saving...' : mode === 'add' ? 'Add' : 'Update'}
                </button>
            </div>
        </form>
    );
};

const ContextPromptModal = ({ isOpen, onClose, onSubmit }) => {
    const [context, setContext] = React.useState('');

    // Reset textarea whenever the modal is closed/re-opened
    React.useEffect(() => {
        if (!isOpen) setContext('');
    }, [isOpen]);

    if (!isOpen) return null;

    const handleClose = () => {
        setContext('');
        onClose();
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100000 }}>
            <div style={{ background: 'var(--color-surface)', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px', border: '1px solid var(--color-surface-hover)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
                <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>✨ Auto-Generate Content</h3>
                <p style={{ opacity: 0.8, fontSize: '0.9rem', lineHeight: '1.5' }}>
                    Provide any specific context, details, or instructions you'd like the AI to follow (e.g., "Keep it under 3 sentences", or "Focus on leadership skills"). Leave blank for a standard generation.
                </p>
                <textarea
                    autoFocus
                    value={context}
                    onChange={e => setContext(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { onSubmit(context); setContext(''); } }}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-surface-hover)', background: 'var(--color-bg)', color: 'var(--color-text)', minHeight: '120px', margin: '1rem 0', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' }}
                    placeholder="Optional: Enter specific context here... (Ctrl+Enter to generate)"
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button type="button" onClick={handleClose} style={{ padding: '0.5rem 1rem', borderRadius: '6px', background: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-surface-hover)', cursor: 'pointer' }}>Cancel</button>
                    <button type="button" onClick={() => { onSubmit(context); setContext(''); }} style={{ padding: '0.5rem 1.5rem', borderRadius: '6px', background: 'var(--color-accent)', color: 'var(--color-bg)', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✨ Generate</button>
                </div>
            </div>
        </div>
    );
};

const FormField = ({ field, value, onChange, onAutoGenerate }) => {
    const [generating, setGenerating] = React.useState(false);
    const [promptOpen, setPromptOpen] = React.useState(false);
    
    const handleGenerateClick = () => {
        if (!onAutoGenerate) return;
        setPromptOpen(true);
    };

    const handlePromptSubmit = async (userContext) => {
        setPromptOpen(false);
        setGenerating(true);
        const result = await onAutoGenerate(userContext);
        if (result) onChange(result);
        setGenerating(false);
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        borderRadius: '6px',
        border: '1px solid var(--color-surface-hover)',
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        fontSize: '1rem',
        marginTop: '0.5rem',
        boxSizing: 'border-box'
    };

    if (field.type === 'textarea') {
        return (
            <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ opacity: 0.7, fontSize: '0.875rem' }}>{field.label}</label>
                    {onAutoGenerate && (
                        <button 
                            type="button" 
                            onClick={handleGenerateClick}
                            disabled={generating}
                            style={{ ...addButtonStyle, padding: '0.2rem 0.6rem', fontSize: '0.8rem', marginTop: 0 }}
                        >
                            {generating ? '✨ Generating...' : '✨ Auto-Generate'}
                        </button>
                    )}
                </div>
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    rows={field.rows || 4}
                    style={inputStyle}
                    placeholder={field.placeholder}
                />
                <ContextPromptModal isOpen={promptOpen} onClose={() => setPromptOpen(false)} onSubmit={handlePromptSubmit} />
            </div>
        );
    }

    if (field.type === 'array') {
        const items = Array.isArray(value) ? value : [];
        return (
            <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ opacity: 0.7, fontSize: '0.875rem' }}>{field.label}</label>
                    {onAutoGenerate && (
                        <button 
                            type="button" 
                            onClick={handleGenerateClick}
                            disabled={generating}
                            style={{ ...addButtonStyle, padding: '0.2rem 0.6rem', fontSize: '0.8rem', marginTop: 0 }}
                        >
                            {generating ? '✨ Generating...' : '✨ Auto-Generate'}
                        </button>
                    )}
                </div>
                {items.map((item, index) => (

                    <div key={index} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <input
                            value={item}
                            onChange={(e) => {
                                const newItems = [...items];
                                newItems[index] = e.target.value;
                                onChange(newItems);
                            }}
                            style={{ ...inputStyle, marginTop: 0 }}
                            placeholder={`${field.label} ${index + 1} `}
                        />
                        <button
                            type="button"
                            onClick={() => {
                                const newItems = items.filter((_, i) => i !== index);
                                onChange(newItems);
                            }}
                            style={{ ...deleteButtonStyle, marginTop: 0 }}
                        >
                            ×
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={() => onChange([...items, ''])}
                    style={{ ...addButtonStyle, marginTop: '0.5rem' }}
                >
                    + Add {field.label}
                </button>
                <ContextPromptModal isOpen={promptOpen} onClose={() => setPromptOpen(false)} onSubmit={handlePromptSubmit} />
            </div>
        );
    }

    if (field.type === 'fileArray') {
        const items = Array.isArray(value) ? value : [];
        const [uploading, setUploading] = React.useState(false);
        const fileInputRef = React.useRef(null);

        const handleFileChange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            setUploading(true);
            try {
                const response = await api.uploadFile(file);
                onChange([...items, response.filePath]);
            } catch (error) {
                alert('Upload failed: ' + error.message);
            } finally {
                setUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };

        const handleRemoveFile = async (indexToRemove) => {
            if (!confirm('Are you sure you want to delete this file from the server?')) return;
            const fileToRemove = items[indexToRemove];
            try {
                if (fileToRemove.startsWith('/uploads/') || fileToRemove.includes('cloudinary.com')) {
                    await api.deleteFile(fileToRemove);
                }
                onChange(items.filter((_, i) => i !== indexToRemove));
            } catch (error) {
                alert('Deletion failed: ' + error.message);
            }
        };

        return (
            <div style={{ marginBottom: '1rem' }}>
                <label style={{ opacity: 0.7, fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>{field.label}</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--color-surface)', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-surface-hover)' }}>
                    {items.map((item, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--color-bg)', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-surface-hover)' }}>
                            <span style={{ flex: 1, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item}
                            </span>
                            <button
                                type="button"
                                onClick={() => handleRemoveFile(index)}
                                style={{
                                    padding: '0.3rem 0.6rem',
                                    borderRadius: '4px',
                                    background: 'rgba(239, 68, 68, 0.2)',
                                    color: '#ef4444',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem'
                                }}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                    <div style={{ marginTop: '0.5rem' }}>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            style={{ ...addButtonStyle, padding: '0.5rem 1rem' }}
                        >
                            {uploading ? 'Uploading... ⏳' : '+ Upload Image'}
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            disabled={uploading}
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    if (field.type === 'file') {
        const [uploading, setUploading] = React.useState(false);
        const [deleting, setDeleting] = React.useState(false);
        const fileInputRef = React.useRef(null);
        
        const handleFileChange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            setUploading(true);
            try {
                // Remove the old file if existing before we swap the new one to prevent orphaned files
                if (value) {
                     try {
                          await api.deleteFile(value);
                     } catch (err) {
                          console.warn('Could not cleanly delete previous file before override.', err);
                     }
                }
                const response = await api.uploadFile(file);
                onChange(response.filePath);
            } catch (error) {
                alert('Upload failed: ' + error.message);
            } finally {
                setUploading(false);
            }
        };

        const handleRemoveFile = async () => {
             if (!confirm('Are you sure you want to delete this file from the server?')) return;
             
             setDeleting(true);
             try {
                 await api.deleteFile(value);
                 onChange(''); // Clear the selected file from the frontend formData
             } catch (error) {
                 alert('Deletion failed: ' + error.message);
             } finally {
                 setDeleting(false);
             }
        };

        return (
            <div style={{ marginBottom: '1rem' }}>
                <label style={{ opacity: 0.7, fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>{field.label}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--color-surface)', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-surface-hover)' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading || deleting}
                            style={{
                                padding: '0.4rem 1rem',
                                backgroundColor: 'var(--color-text)',
                                color: 'var(--color-bg)',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: uploading || deleting ? 'not-allowed' : 'pointer',
                                fontWeight: '600',
                                transition: 'all 0.2s ease',
                                opacity: uploading || deleting ? 0.7 : 1
                            }}
                        >
                            {uploading ? 'Uploading... ⏳' : (value ? 'Change File' : 'Upload File')}
                        </button>
                        {value && (
                            <button
                                type="button"
                                onClick={handleRemoveFile}
                                disabled={uploading || deleting}
                                style={{
                                    padding: '0.4rem 1rem',
                                    backgroundColor: 'transparent',
                                    color: '#ef4444',
                                    border: '1px solid #ef4444',
                                    borderRadius: '4px',
                                    cursor: uploading || deleting ? 'not-allowed' : 'pointer',
                                    fontWeight: '600',
                                    transition: 'all 0.2s ease',
                                    opacity: uploading || deleting ? 0.7 : 1
                                }}
                            >
                                {deleting ? 'Deleting... ⏳' : 'Remove File'}
                            </button>
                        )}
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        disabled={uploading || deleting}
                        accept={field.accept}
                        style={{ display: 'none' }}
                    />
                    
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        {value ? (
                            <span style={{ color: '#22c55e', fontSize: '0.9rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                ✓ Uploaded
                            </span>
                        ) : (
                            <span style={{ color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic' }}>
                                Not uploaded
                            </span>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ marginBottom: '1rem' }}>
            <label style={{ opacity: 0.7, fontSize: '0.875rem' }}>{field.label}</label>
            <input
                type={field.type || 'text'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={inputStyle}
                placeholder={field.placeholder}
            />
        </div>
    );
};

// === HELPER FUNCTIONS ===

const getFormFields = (type) => {
    const fields = {
        profileInformation: [
            { name: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
            { name: 'label', label: 'Professional Title', type: 'text', placeholder: 'Full Stack Developer' },
            { name: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com' },
            { name: 'phone', label: 'Phone', type: 'tel', placeholder: '(123) 456-7890' },
            { name: 'url', label: 'Website/Portfolio URL', type: 'url', placeholder: 'https://yourwebsite.com' },
            { name: 'image', label: 'Profile Photo', type: 'file', accept: 'image/*' },
            { name: 'resumeUrl', label: 'Resume PDF', type: 'file', accept: '.pdf' },
            { name: 'cvUrl', label: 'CV PDF', type: 'file', accept: '.pdf' },
            { name: 'summary', label: 'Professional Summary', type: 'textarea', placeholder: 'A brief summary of your professional background...' },
            { name: 'location.city', label: 'City', type: 'text', placeholder: 'San Francisco' },
            { name: 'location.region', label: 'State/Region', type: 'text', placeholder: 'CA' },
            { name: 'location.countryCode', label: 'Country Code', type: 'text', placeholder: 'US' },
            { name: 'location.address', label: 'Address', type: 'text' },
            { name: 'location.postalCode', label: 'Postal Code', type: 'text' }
        ],
        profiles: [
            { name: 'network', label: 'Network', type: 'text', placeholder: 'LinkedIn' },
            { name: 'username', label: 'Username', type: 'text', placeholder: 'johndoe' },
            { name: 'url', label: 'Profile URL', type: 'url', placeholder: 'https://linkedin.com/in/...' }
        ],
        work: [
            { name: 'name', label: 'Company Name', type: 'text', placeholder: 'Google' },
            { name: 'position', label: 'Position', type: 'text', placeholder: 'Software Engineer' },
            { name: 'location', label: 'Location', type: 'text', placeholder: 'San Francisco, CA' },
            { name: 'startDate', label: 'Start Date', type: 'date' },
            { name: 'endDate', label: 'End Date (leave empty if current)', type: 'date' },
            { name: 'url', label: 'Company URL', type: 'url', placeholder: 'https://company.com' },
            { name: 'summary', label: 'Summary', type: 'textarea', placeholder: 'Brief overview of your role...' },
            { name: 'highlights', label: 'Highlights', type: 'array' }
        ],
        education: [
            { name: 'institution', label: 'Institution', type: 'text', placeholder: 'MIT' },
            { name: 'studyType', label: 'Degree', type: 'text', placeholder: 'Bachelor of Science' },
            { name: 'area', label: 'Field of Study', type: 'text', placeholder: 'Computer Science' },
            { name: 'location', label: 'Location', type: 'text', placeholder: 'Cambridge, MA' },
            { name: 'startDate', label: 'Start Date', type: 'date' },
            { name: 'endDate', label: 'End Date', type: 'date' },
            { name: 'score', label: 'GPA/Score', type: 'text', placeholder: '3.9/4.0' },
            { name: 'url', label: 'Institution URL', type: 'url' },
            { name: 'description', label: 'Description', type: 'textarea' }
        ],
        skills: [
            { name: 'name', label: 'Skill Category', type: 'text', placeholder: 'Programming Languages' },
            { name: 'level', label: 'Level', type: 'text', placeholder: 'Expert' },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'keywords', label: 'Skills', type: 'array' }
        ],
        projects: [
            { name: 'name', label: 'Project Name', type: 'text', placeholder: 'My Awesome Project' },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'startDate', label: 'Start Date', type: 'date' },
            { name: 'endDate', label: 'End Date', type: 'date' },
            { name: 'url', label: 'Project URL', type: 'url' },
            { name: 'github', label: 'GitHub URL', type: 'url' },
            { name: 'type', label: 'Project Type', type: 'text', placeholder: 'Web Application' },
            { name: 'location', label: 'Location', type: 'text' },
            { name: 'roles', label: 'Roles', type: 'array' },
            { name: 'highlights', label: 'Highlights', type: 'array' },
            { name: 'keywords', label: 'Technologies', type: 'array' },
            { name: 'images', label: 'Images', type: 'fileArray' }
        ],
        awards: [
            { name: 'title', label: 'Award Title', type: 'text', placeholder: 'Best Developer Award' },
            { name: 'date', label: 'Date', type: 'date' },
            { name: 'awarder', label: 'Awarder', type: 'text', placeholder: 'Tech Conference 2023' },
            { name: 'summary', label: 'Summary', type: 'textarea' }
        ],
        certificates: [
            { name: 'name', label: 'Certificate Name', type: 'text', placeholder: 'AWS Certified Solutions Architect' },
            { name: 'issuer', label: 'Issuer', type: 'text', placeholder: 'Amazon Web Services' },
            { name: 'date', label: 'Issue Date', type: 'date' },
            { name: 'url', label: 'Certificate URL', type: 'url' }
        ],
        publications: [
            { name: 'name', label: 'Publication Title', type: 'text' },
            { name: 'publisher', label: 'Publisher', type: 'text' },
            { name: 'releaseDate', label: 'Release Date', type: 'date' },
            { name: 'url', label: 'URL', type: 'url' },
            { name: 'summary', label: 'Summary', type: 'textarea' }
        ],
        volunteer: [
            { name: 'organization', label: 'Organization', type: 'text' },
            { name: 'position', label: 'Position', type: 'text' },
            { name: 'startDate', label: 'Start Date', type: 'date' },
            { name: 'endDate', label: 'End Date', type: 'date' },
            { name: 'url', label: 'Organization URL', type: 'url' },
            { name: 'summary', label: 'Summary', type: 'textarea' },
            { name: 'highlights', label: 'Highlights', type: 'array' }
        ],
        languages: [
            { name: 'language', label: 'Language', type: 'text', placeholder: 'English' },
            { name: 'fluency', label: 'Fluency', type: 'text', placeholder: 'Native' }
        ],
        interests: [
            { name: 'name', label: 'Interest Name', type: 'text', placeholder: 'Coding' },
            { name: 'keywords', label: 'Keywords', type: 'array' }
        ],
        references: [
            { name: 'name', label: 'Reference Name', type: 'text', placeholder: 'Jane Doe' },
            { name: 'reference', label: 'Reference Text', type: 'textarea' }
        ]
    };

    return fields[type] || [];
};

const getEmptyFormData = (type) => {
    const fields = getFormFields(type);
    const data = {};
    fields.forEach(field => {
        data[field.name] = field.type === 'array' ? [] : '';
    });
    return data;
};

const getApiMethod = (type, operation) => {
    const mapping = {
        work: { add: api.addWork, update: api.updateWork, delete: api.deleteWork },
        profiles: { add: api.addProfile, update: api.updateProfile, delete: api.deleteProfile },
        education: { add: api.addEducation, update: api.updateEducation, delete: api.deleteEducation },
        skills: { add: api.addSkill, update: api.updateSkill, delete: api.deleteSkill },
        projects: { add: api.addProject, update: api.updateProject, delete: api.deleteProject },
        awards: { add: api.addAward, update: api.updateAward, delete: api.deleteAward },
        certificates: { add: api.addCertificate, update: api.updateCertificate, delete: api.deleteCertificate },
        publications: { add: api.addPublication, update: api.updatePublication, delete: api.deletePublication },
        volunteer: { add: api.addVolunteer, update: api.updateVolunteer, delete: api.deleteVolunteer },
        languages: { add: api.addLanguage, update: api.updateLanguage, delete: api.deleteLanguage },
        interests: { add: api.addInterest, update: api.updateInterest, delete: api.deleteInterest },
        references: { add: api.addReference, update: api.updateReference, delete: api.deleteReference }
    };
    return mapping[type][operation];
};

const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

// === STYLES ===
const buttonStyle = {
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    background: 'var(--color-surface-hover)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-surface-hover)',
    cursor: 'pointer'
};

const logoutButtonStyle = {
    ...buttonStyle,
    background: 'rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.5)'
};

const actionButtonStyle = {
    ...buttonStyle,
    background: 'rgba(59, 130, 246, 0.2)',
    color: '#3b82f6',
    border: '1px solid rgba(59, 130, 246, 0.5)'
};

const sectionCardStyle = {
    background: 'var(--color-surface)',
    borderRadius: '12px',
    border: '1px solid var(--color-surface-hover)',
    padding: '1.5rem',
    marginBottom: '1rem',
    position: 'relative',
    zIndex: 3
};

const itemRowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1rem',
    background: 'var(--color-surface)',
    borderRadius: '8px',
    marginBottom: '0.5rem',
    border: '1px solid var(--color-surface-hover)'
};

const addButtonStyle = {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    background: 'var(--color-surface-hover)',
    color: 'var(--color-accent)',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem'
};

const editButtonStyle = {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    background: 'var(--color-surface-hover)',
    color: 'var(--color-text)',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem'
};

const deleteButtonStyle = {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    background: 'rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem'
};

const selectButtonStyle = {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    background: 'var(--color-surface-hover)',
    color: 'var(--color-accent)',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.75rem'
};

const deselectButtonStyle = {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    background: 'rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.75rem'
};

const saveButtonStyle = {
    padding: '1rem 3rem',
    borderRadius: '8px',
    background: 'var(--color-accent)',
    color: 'var(--color-bg)',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
};

const arrowButtonStyle = (disabled) => ({
    background: disabled ? 'var(--color-surface)' : 'var(--color-surface-hover)',
    color: disabled ? 'var(--color-text)' : 'var(--color-accent)',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    opacity: disabled ? 0.3 : 1
});

export default Dashboard;
