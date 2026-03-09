import React from 'react';

/**
 * Reusable Modal Component
 */
const Modal = ({ isOpen, onClose, title, children, width = '600px' }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
        }} onClick={onClose}>
            <div style={{
                background: 'var(--color-bg)',
                borderRadius: '16px',
                padding: '2rem',
                width: '100%',
                maxWidth: width,
                maxHeight: '90vh',
                overflow: 'auto',
                border: '1px solid var(--color-surface-hover)',
                position: 'relative',
                zIndex: 1001
            }} onClick={(e) => e.stopPropagation()}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem'
                }}>
                    <h2 style={{
                        margin: 0,
                        color: 'var(--color-text)',
                        fontSize: '1.5rem'
                    }}>{title}</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-text)',
                            opacity: 0.6,
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            padding: '0.5rem'
                        }}
                    >
                        ×
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

export default Modal;
