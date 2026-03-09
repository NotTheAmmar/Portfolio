import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const References = ({ data }) => {
    // Sort references by name
    const sortedReferences = useMemo(() => {
        if (!data?.references) return [];
        return [...data.references].sort((a, b) => a.name.localeCompare(b.name));
    }, [data]);

    if (!sortedReferences.length) return null;

    return (
        <section id="references" className="section">
            <div className="container">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    References
                </motion.h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '2rem'
                }}>
                    {sortedReferences.map((ref, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            style={{
                                background: 'var(--color-surface)',
                                padding: '2rem',
                                borderRadius: '12px',
                                border: '1px solid var(--color-surface-hover)',
                                position: 'relative'
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: '1.5rem',
                                left: '1.5rem',
                                fontSize: '4rem',
                                lineHeight: 1,
                                color: 'var(--color-accent)',
                                opacity: 0.2,
                                fontFamily: 'serif'
                            }}>
                                "
                            </div>
                            <p style={{
                                position: 'relative',
                                zIndex: 1,
                                fontStyle: 'italic',
                                margin: '0 0 1.5rem 0',
                                lineHeight: 1.6
                            }}>
                                "{ref.reference}"
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-accent)' }}>{ref.name}</h4>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default References;
