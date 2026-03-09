
import React from 'react';
import { FaLinkedin, FaGithub, FaTwitter, FaFacebook, FaInstagram, FaYoutube, FaTwitch, FaDiscord, FaMedium, FaStackOverflow, FaGlobe } from 'react-icons/fa';
import { SiLeetcode, SiGeeksforgeeks, SiCodechef, SiCodeforces } from 'react-icons/si';

export const getSocialIcon = (network) => {
    if (!network) return <FaGlobe />;

    const lowerNetwork = network.toLowerCase().trim();

    switch (lowerNetwork) {
        case 'linkedin': return <FaLinkedin />;
        case 'github': return <FaGithub />;
        case 'twitter': return <FaTwitter />;
        case 'x': return <FaTwitter />; // Rebranding
        case 'facebook': return <FaFacebook />;
        case 'instagram': return <FaInstagram />;
        case 'youtube': return <FaYoutube />;
        case 'twitch': return <FaTwitch />;
        case 'discord': return <FaDiscord />;
        case 'medium': return <FaMedium />;
        case 'stackoverflow': return <FaStackOverflow />;
        case 'leetcode': return <SiLeetcode />;
        case 'geeksforgeeks': return <SiGeeksforgeeks />;
        case 'codechef': return <SiCodechef />;
        case 'codeforces': return <SiCodeforces />;
        default: return <FaGlobe />;
    }
};

export const SocialIcon = ({ network, style }) => {
    return (
        <span style={style}>
            {getSocialIcon(network)}
        </span>
    );
};
