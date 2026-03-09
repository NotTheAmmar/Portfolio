import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

const Experience = ({ data }) => {
    const work = data?.work || [];

    // Don't render if no work experience
    if (work.length === 0) {
        return null;
    }
    const volunteer = data?.volunteer || [];

    // Combine work and volunteer for a unified timeline or separate them
    // For this design, let's keep them separate but consecutively
    const hasWork = work.length > 0;
    const hasVolunteer = volunteer.length > 0;

    if (!hasWork && !hasVolunteer) return null;

    const Card = ({ item, titlePrefix }) => (
        <div style={{
            background: 'var(--color-surface)',
            padding: '2rem',
            borderRadius: '16px',
            border: '1px solid var(--color-accent)',
            marginBottom: '1.5rem'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, color: 'var(--color-text)', fontSize: '1.3rem' }}>{item.position}</h3>
                <span style={{ color: 'var(--color-accent)', fontSize: '0.9rem' }}>
                    {item.startDate} - {item.endDate || 'Present'}
                </span>
            </div>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: 'var(--color-text)', opacity: 0.7, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {item.name || item.organization}
                {item.url && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text)', opacity: 0.8, display: 'inline-flex', alignItems: 'center', transition: 'color 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-accent)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-text)'}>
                        <ExternalLink size={16} />
                    </a>
                )}
            </h4>
            <p style={{ lineHeight: '1.6', color: 'var(--color-text)', opacity: 0.8, fontSize: '1rem' }}>
                {item.summary}
            </p>
            {item.highlights && item.highlights.length > 0 && (
                <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem', color: 'var(--color-text)', opacity: 0.7 }}>
                    {item.highlights.map((highlight, idx) => (
                        <li key={idx} style={{ marginBottom: '0.5rem' }}>{highlight}</li>
                    ))}
                </ul>
            )}
            {item.location && (
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text)', opacity: 0.5, marginTop: '1rem', fontStyle: 'italic' }}>
                    {item.location}
                </p>
            )}
        </div>
    );

    return (
        <section className="section container" id="experience">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.2 }}
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
                }}
            >
                <motion.h2
                    variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } }}
                    className="text-gradient"
                    style={{ marginBottom: '3rem' }}
                >
                    Experience
                </motion.h2>

                {hasWork && (
                    <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} style={{ marginBottom: '3rem' }}>
                        <h3 style={{ color: 'var(--color-text)', marginBottom: '1.5rem', borderLeft: '4px solid var(--color-accent)', paddingLeft: '1rem' }}>Work</h3>
                        {work.map((item, index) => (
                            <motion.div
                                key={`work-${index}`}
                                variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
                            >
                                <Card item={item} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {hasVolunteer && (
                    <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
                        <h3 style={{ color: 'var(--color-text)', marginBottom: '1.5rem', borderLeft: '4px solid var(--color-accent)', paddingLeft: '1rem' }}>Volunteer</h3>
                        {volunteer.map((item, index) => (
                            <motion.div
                                key={`vol-${index}`}
                                variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
                            >
                                <Card item={item} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </motion.div>
        </section>
    );
};

export default Experience;
