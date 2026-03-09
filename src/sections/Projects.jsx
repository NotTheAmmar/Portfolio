import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, ExternalLink } from 'lucide-react';
import { resolveImage } from '../utils/imageHelper';

const Projects = ({ data }) => {
    const { projects } = data;
    const [selectedImage, setSelectedImage] = useState(null);

    // Don't render if no projects
    if (!projects || projects.length === 0) {
        return null;
    }

    return (
        <section className="section container" id="projects">
            <h2 className="text-gradient">Projects</h2>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem'
            }}>
                {projects.map((project, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        style={{
                            background: 'var(--color-surface)',
                            padding: '2rem',
                            borderRadius: '12px',
                            border: '1px solid var(--color-surface-hover)',
                            transition: 'transform 0.3s ease'
                        }}
                        whileHover={{ y: -5, borderColor: 'var(--color-accent)' }}
                    >
                        {project.images && project.images.length > 0 && (
                            <div style={{ marginBottom: '1.2rem', display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'thin' }}>
                                {project.images.map((img, imgIndex) => {
                                    const imgSrc = resolveImage(img);
                                    return (
                                        <div 
                                            key={imgIndex}
                                            style={{ 
                                                height: '140px', 
                                                minWidth: '200px', 
                                                flexShrink: 0,
                                                cursor: 'zoom-in',
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                border: '1px solid var(--color-surface-hover)',
                                                background: 'var(--color-bg)',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }}
                                            onClick={() => setSelectedImage(imgSrc)}
                                        >
                                            <img 
                                                src={imgSrc} 
                                                alt={`${project.name} - Image ${imgIndex + 1}`}
                                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <h3 style={{ marginTop: 0 }}>{project.name}</h3>
                        <p style={{ color: 'var(--color-text)', opacity: 0.8, lineHeight: '1.6', minHeight: '80px' }}>{project.description}</p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            {project.keywords && project.keywords.map((t, i) => (
                                <span key={i} style={{ fontSize: '0.8rem', color: 'var(--color-accent-2)' }}>#{t}</span>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {project.github && (
                                <a href={project.github} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                                    <Github size={18} /> Code
                                </a>
                            )}
                            {project.url && (
                                <a href={project.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                                    <ExternalLink size={18} /> Live
                                </a>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div 
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.85)',
                        zIndex: 9999,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '2rem',
                        cursor: 'zoom-out'
                    }}
                    onClick={() => setSelectedImage(null)}
                >
                    <img 
                        src={selectedImage} 
                        alt="Full size project view" 
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            borderRadius: '8px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                        }}
                    />
                    <button
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            background: 'rgba(0,0,0,0.5)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            transition: 'all 0.2s ease'
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(null);
                        }}
                    >
                        ×
                    </button>
                </div>
            )}
        </section>
    );
};

export default Projects;
