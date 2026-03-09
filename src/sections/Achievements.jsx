import React from 'react';
import { motion } from 'framer-motion';

const Achievements = ({ data }) => {
    const { awards = [], certificates = [] } = data;
    const publications = data?.publications || [];

    // Don't render if no achievements
    if (awards.length === 0 && certificates.length === 0) {
        return null;
    }

    const hasCerts = certificates.length > 0;
    const hasAwards = awards.length > 0;
    const hasPubs = publications.length > 0;

    if (!hasCerts && !hasAwards && !hasPubs) return null;

    const SectionBlock = ({ title, bg = false }) => (
        <h3 style={{
            color: 'var(--color-text)',
            marginBottom: '1.5rem',
            fontSize: '1.4rem',
            marginTop: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        }}>
            {title}
        </h3>
    );

    return (
        <section className="section container" id="achievements">
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
                    Achievements
                </motion.h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>

                    {/* Certificates & Awards Column */}
                    <div>
                        {hasAwards && (
                            <motion.div variants={{ hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0 } }} style={{ marginBottom: '3rem' }}>
                                <SectionBlock title="Awards" />
                                {awards.map((award, index) => (
                                    <div key={index} style={{ marginBottom: '1.5rem', paddingLeft: '1rem', borderLeft: '2px solid var(--color-accent)' }}>
                                        <h4 style={{ margin: '0 0 0.3rem 0', color: 'var(--color-text)', fontSize: '1.1rem' }}>{award.title}</h4>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--color-text)', opacity: 0.6, marginBottom: '0.5rem' }}>
                                            <span>{award.awarder}</span>
                                            <span>{award.date}</span>
                                        </div>
                                        <p style={{ margin: 0, color: 'var(--color-text)', opacity: 0.7, fontSize: '0.95rem', lineHeight: '1.5' }}>
                                            {award.summary}
                                        </p>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {hasCerts && (
                            <motion.div variants={{ hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0 } }}>
                                <SectionBlock title="Certifications" />
                                {certificates.map((cert, index) => (
                                    <div key={index} style={{
                                        marginBottom: '1rem',
                                        padding: '1rem',
                                        background: 'var(--color-surface)',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 0.2rem 0', color: 'var(--color-text)', opacity: 0.9, fontSize: '1rem' }}>{cert.name}</h4>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text)', opacity: 0.5 }}>{cert.issuer} • {cert.date}</span>
                                        </div>
                                        {cert.url && (
                                            <a href={cert.url} target="_blank" rel="noopener noreferrer" className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', minWidth: 'auto' }}>
                                                Verify
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </div>

                    {/* Publications Column */}
                    {hasPubs && (
                        <motion.div variants={{ hidden: { opacity: 0, x: 30 }, visible: { opacity: 1, x: 0 } }}>
                            <SectionBlock title="Publications" />
                            {publications.map((pub, index) => (
                                <div key={index} style={{
                                    background: 'var(--color-surface)',
                                    padding: '2rem',
                                    borderRadius: '16px',
                                    border: '1px solid var(--color-accent)',
                                    marginBottom: '1.5rem'
                                }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text)', fontSize: '1.1rem' }}>{pub.name}</h4>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--color-accent)', marginBottom: '1rem' }}>
                                        {pub.publisher} • {pub.releaseDate}
                                    </p>
                                    <p style={{ lineHeight: '1.6', color: 'var(--color-text)', opacity: 0.8, fontSize: '0.95rem', marginBottom: '1rem' }}>
                                        {pub.summary}
                                    </p>
                                    {pub.url && (
                                        <a href={pub.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text)', textDecoration: 'underline', fontSize: '0.9rem' }}>
                                            Read Publication
                                        </a>
                                    )}
                                </div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </section>
    );
};

export default Achievements;
