import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const Interests = ({ data }) => {
    // Sort interests by name
    const sortedInterests = useMemo(() => {
        if (!data?.interests) return [];
        return [...data.interests].sort((a, b) => a.name.localeCompare(b.name));
    }, [data]);

    if (!sortedInterests.length) return null;

    return (
        <section id="interests" className="section">
            <div className="container">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    Interests
                </motion.h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {sortedInterests.map((interest, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            style={{
                                background: 'var(--color-surface)',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                border: '1px solid var(--color-surface-hover)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem',
                                transition: 'transform 0.3s ease, border-color 0.3s ease',
                                cursor: 'default'
                            }}
                            whileHover={{
                                y: -5,
                                borderColor: 'var(--color-accent)'
                            }}
                        >
                            <h3 style={{ margin: 0, color: 'var(--color-text)', fontSize: '1.2rem' }}>{interest.name}</h3>
                            {interest.keywords && interest.keywords.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    {interest.keywords.map((keyword, i) => (
                                        <span key={i} style={{
                                            fontSize: '0.8rem',
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '100px',
                                            background: 'var(--color-surface-hover)',
                                            color: 'var(--color-text)',
                                            border: '1px solid var(--color-surface-hover)'
                                        }}>
                                            {keyword}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Interests;
