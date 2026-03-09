
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { resolveImage } from '../utils/imageHelper';
import { SocialIcon } from '../utils/iconHelper';

const About = ({ data }) => {
    const { summary, email, profiles, image, resumeUrl, cvUrl, location } = data?.profileInformation || {};
    const skills = data?.skills || [];

    return (
        <section className="section container" id="about">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }}
                variants={{
                    hidden: { opacity: 0, y: 50 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.2 } }
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
                    {image && (
                        <motion.div
                            variants={{ hidden: { scale: 0 }, visible: { scale: 1 } }}
                            style={{
                                width: '150px',
                                height: '150px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                border: '4px solid var(--color-accent)',
                                flexShrink: 0
                            }}>
                            <img
                                src={resolveImage(image)}
                                alt="Profile"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </motion.div>
                    )}
                    <motion.h2 variants={{ hidden: { x: -50, opacity: 0 }, visible: { x: 0, opacity: 1 } }} className="text-gradient" style={{ margin: 0 }}>About Me</motion.h2>
                </div>


                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'flex-start' }}>
                    <motion.div variants={{ hidden: { y: 30, opacity: 0 }, visible: { y: 0, opacity: 1 } }} style={{ flex: '1 1 400px' }}>
                        {summary && (
                            <p style={{ fontSize: '1.2rem', lineHeight: '1.8', color: 'var(--color-text)', opacity: 0.8 }}>
                                {summary}
                            </p>
                        )}

                        {location && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', color: '#60a5fa' }}>
                                <span>📍</span>
                                <span>
                                    {location.city}
                                    {location.region && `, ${location.region}`}
                                    {location.countryCode && `, ${location.countryCode}`}
                                </span>
                            </div>
                        )}

                        <div style={{ marginTop: '2rem' }}>
                            <h3 style={{ color: 'var(--color-text)' }}>Connect</h3>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {email && (
                                    <li style={{ marginBottom: '0.5rem' }}>
                                        <a href={'mailto:' + email} style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>
                                            {email}
                                        </a>
                                    </li>
                                )}
                                {profiles && profiles.map((profile, index) => (
                                    <li key={index} style={{ marginBottom: '0.5rem', display: 'inline-block', marginRight: '1rem' }}>
                                        <a
                                            href={profile.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title={profile.network}
                                            style={{ color: 'var(--color-accent)', textDecoration: 'none', fontSize: '1.5rem' }}
                                        >
                                            <SocialIcon network={profile.network} />
                                        </a>
                                    </li>
                                ))}
                            </ul>

                            {(resumeUrl || cvUrl) && (
                                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    {resumeUrl && (
                                        <a
                                            href={resolveImage(resumeUrl)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                padding: '0.75rem 1.5rem',
                                                backgroundColor: 'var(--color-accent)',
                                                color: 'var(--color-bg)',
                                                textDecoration: 'none',
                                                borderRadius: '8px',
                                                fontWeight: 'bold',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)'; }}
                                            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                                        >
                                            View Resume
                                        </a>
                                    )}
                                    {cvUrl && (
                                        <a
                                            href={resolveImage(cvUrl)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                padding: '0.75rem 1.5rem',
                                                backgroundColor: 'transparent',
                                                border: '2px solid var(--color-accent)',
                                                color: 'var(--color-accent)',
                                                textDecoration: 'none',
                                                borderRadius: '8px',
                                                fontWeight: 'bold',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.1)'; e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.05)'; }}
                                            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                                        >
                                            View CV
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {skills && skills.length > 0 && (
                        <motion.div variants={{ hidden: { x: 50, opacity: 0 }, visible: { x: 0, opacity: 1 } }} style={{ flex: '1 1 300px' }}>
                            <h3>Skills</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {skills.map((skillGroup, index) => (
                                    <div key={index}>
                                        <h4 style={{ color: 'var(--color-text)', marginBottom: '0.5rem', fontSize: '1rem' }}>
                                            {skillGroup.name}
                                        </h4>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {skillGroup.keywords.map((keyword, kIndex) => (
                                                <span key={kIndex} style={{
                                                    background: 'var(--color-surface)',
                                                    padding: '0.4rem 0.8rem',
                                                    borderRadius: '20px',
                                                    border: '1px solid var(--color-accent)',
                                                    fontSize: '0.85rem',
                                                    color: 'var(--color-text)'
                                                }}>
                                                    {keyword}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </section>
    );
};

export default About;
