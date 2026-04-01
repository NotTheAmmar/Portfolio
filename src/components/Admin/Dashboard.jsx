
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

    const handleAutoGenerate = async (fieldName, fieldType, currentFormData) => {
        try {
            const userContext = window.prompt("Optional: Provide any specific details, context, or instructions you'd like the AI to include (or leave blank).");
            if (userContext === null) return null; // User cancelled

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
        
        let contextText = `# My Professional Portfolio Context\n\n`;
        
        if (data.profileInformation) {
            contextText += `## Profile\n`;
            contextText += `- Name: ${data.profileInformation.name || ''}\n`;
            contextText += `- Title: ${data.profileInformation.label || ''}\n`;
            contextText += `- Summary: ${data.profileInformation.summary || ''}\n`;
            if (data.profileInformation.location) {
                contextText += `- Location: ${data.profileInformation.location.city || ''}, ${data.profileInformation.location.countryCode || ''}\n`;
            }
            contextText += `\n`;
        }

        if (data.skills && data.skills.length > 0) {
            contextText += `## Skills\n`;
            data.skills.forEach(skill => {
                contextText += `- ${skill.name} (${skill.level || 'Experienced'}): ${skill.keywords ? skill.keywords.join(', ') : ''}\n`;
            });
            contextText += `\n`;
        }

        if (data.work && data.work.length > 0) {
            contextText += `## Work Experience\n`;
            data.work.forEach(w => {
                contextText += `### ${w.position} at ${w.name}\n`;
                contextText += `- Duration: ${w.startDate} to ${w.endDate || 'Present'}\n`;
                if (w.summary) contextText += `- Summary: ${w.summary}\n`;
                if (w.highlights && w.highlights.length > 0) {
                    contextText += `- Highlights:\n`;
                    w.highlights.forEach(h => contextText += `  * ${h}\n`);
                }
                contextText += `\n`;
            });
        }

        if (data.education && data.education.length > 0) {
            contextText += `## Education\n`;
            data.education.forEach(e => {
                contextText += `### ${e.studyType} in ${e.area} at ${e.institution}\n`;
            });
            contextText += `\n`;
        }

        if (data.projects && data.projects.length > 0) {
            contextText += `## Projects\n`;
            data.projects.forEach(p => {
                contextText += `### ${p.name}\n`;
                if (p.description) contextText += `- Description: ${p.description}\n`;
                if (p.highlights && p.highlights.length > 0) {
                    contextText += `- Highlights:\n`;
                    p.highlights.forEach(h => contextText += `  * ${h}\n`);
                }
                contextText += `\n`;
            });
        }
        
        // Copy to clipboard
        navigator.clipboard.writeText(contextText)
            .then(() => {
                setSaveMessage('✓ Copied AI Context to Clipboard!');
                setTimeout(() => setSaveMessage(''), 3000);
            })
            .catch(err => {
                console.error("Failed to copy:", err);
                const textArea = document.createElement("textarea");
                textArea.value = contextText;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    setSaveMessage('✓ Copied AI Context to Clipboard!');
                } catch (err) {
                    setSaveMessage('✗ Failed to copy to clipboard.');
                }
                document.body.removeChild(textArea);
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
                        <button onClick={handleCopyContext} style={actionButtonStyle}>📋 Copy AI Context</button>
                        <button onClick={() => { logout(); navigate('/'); }} style={logoutButtonStyle}>Logout</button>
                    </div>
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
            return async () => await onAutoGenerate(field.name, field.type, formData);
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

const FormField = ({ field, value, onChange, onAutoGenerate }) => {
    const [generating, setGenerating] = React.useState(false);
    
    const handleGenerateClick = async () => {
        if (!onAutoGenerate) return;
        setGenerating(true);
        const result = await onAutoGenerate();
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
