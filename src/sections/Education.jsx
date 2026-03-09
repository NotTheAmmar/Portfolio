import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

const Education = ({ data }) => {
    const education = data?.education || [];

    // Don't render if no education
    if (education.length === 0) {
        return null;
    }

    if (education.length === 0) return null;

    return (
        <section className="section container" id="education">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.2 }}
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
                }}
            >
                <motion.h2
                    variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } }}
                    className="text-gradient"
                    style={{ marginBottom: '3rem' }}
                >
                    Education
                </motion.h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    {education.map((edu, index) => (
                        <motion.div
                            key={index}
                            variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
                            style={{
                                background: 'var(--color-surface)',
                                padding: '2rem',
                                borderRadius: '16px',
                                border: '1px solid var(--color-accent)',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                            <div style={{ marginBottom: 'auto' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <h3 style={{ margin: 0, color: 'var(--color-text)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {edu.institution}
                                        {edu.url && (
                                            <a href={edu.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text)', opacity: 0.8, display: 'inline-flex', alignItems: 'center', transition: 'color 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-accent)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-text)'}>
                                                <ExternalLink size={16} />
                                            </a>
                                        )}
                                    </h3>
                                    <span style={{ color: 'var(--color-accent)', fontSize: '0.9rem' }}>
                                        {edu.startDate} - {edu.endDate || 'Present'}
                                    </span>
                                </div>
                                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--color-text)', opacity: 0.7, fontWeight: 'normal' }}>
                                    {edu.studyType} in {edu.area}
                                </h4>
                                {edu.score && (
                                    <div style={{ marginBottom: '1rem', fontSize: '0.95rem', color: 'var(--color-text)' }}>
                                        Score: <span style={{ color: 'var(--color-accent)' }}>{edu.score}</span>
                                    </div>
                                )}
                                {edu.description && (
                                    <p style={{ lineHeight: '1.6', color: 'var(--color-text)', opacity: 0.8, fontSize: '0.95rem' }}>
                                        {edu.description}
                                    </p>
                                )}
                            </div>
                            {edu.courses && edu.courses.length > 0 && (
                                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-surface-hover)' }}>
                                    <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text)', opacity: 0.6, fontSize: '0.9rem' }}>Relevant Courses</h5>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {edu.courses.map((course, idx) => (
                                            <span key={idx} style={{
                                                background: 'var(--color-surface-hover)',
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: '12px',
                                                fontSize: '0.8rem',
                                                color: 'var(--color-text)'
                                            }}>
                                                {course}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
};

export default Education;
